import {
  Transform,
  Writable,
  type Readable,
  type TransformCallback,
  type WritableOptions,
} from 'node:stream';

import {logger} from 'appium/support.js';
import axios from 'axios';
import type sharp from 'sharp';

const log = logger.getLogger('MJPEG');

const DEFAULT_SERVER_TIMEOUT_MS = 10000;
const JPEG_SOI = Buffer.from([0xff, 0xd8]);
const JPEG_EOI = Buffer.from([0xff, 0xd9]);
const CONTENT_LENGTH_RE = /Content-Length:\s*(\d+)/i;

/**
 * Extracts individual JPEG frames out of a multipart MJPEG-over-HTTP byte stream by
 * scanning for JPEG start/end-of-image markers and the multipart `Content-Length` header.
 */
class MjpegFrameParser extends Transform {
  private buffer: Buffer | null = null;
  private expectedLength = 0;
  private bytesWritten = 0;
  private isReading = false;

  /* eslint-disable promise/prefer-await-to-callbacks -- Transform._transform is callback-based */
  override _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    const startIdx = chunk.indexOf(JPEG_SOI);
    const endIdx = chunk.indexOf(JPEG_EOI);
    const lengthMatch = CONTENT_LENGTH_RE.exec(chunk.toString('latin1'));

    if (this.buffer && (this.isReading || startIdx > -1)) {
      this.appendChunk(chunk, startIdx, endIdx);
    }
    if (lengthMatch) {
      this.startFrame(Number(lengthMatch[1]), chunk, startIdx, endIdx);
    }
    callback();
  }
  /* eslint-enable promise/prefer-await-to-callbacks */

  private startFrame(length: number, chunk: Buffer, start: number, end: number): void {
    this.expectedLength = length;
    this.buffer = Buffer.alloc(length);
    this.bytesWritten = 0;
    this.isReading = false;

    if (start < 0) {
      return;
    }
    const hasEnd = end > start;
    const copyEnd = hasEnd ? end + JPEG_EOI.length : chunk.length;
    // Buffer.copy() silently truncates if the destination has less room than requested,
    // so bytesWritten must track what was actually copied, not the requested range size.
    this.bytesWritten = chunk.copy(this.buffer, 0, start, copyEnd);

    if (hasEnd) {
      this.emitFrame();
    } else {
      this.isReading = true;
    }
  }

  private appendChunk(chunk: Buffer, start: number, end: number): void {
    if (!this.buffer) {
      return;
    }
    const copyStart = start > -1 ? start : 0;
    const copyEnd = end > -1 ? end + JPEG_EOI.length : chunk.length;
    // Buffer.copy() silently truncates if the destination has less room than requested,
    // so bytesWritten must track what was actually copied, not the requested range size.
    this.bytesWritten += chunk.copy(this.buffer, this.bytesWritten, copyStart, copyEnd);

    if (end > -1 || this.bytesWritten === this.expectedLength) {
      this.emitFrame();
    } else {
      this.isReading = true;
    }
  }

  private emitFrame(): void {
    this.isReading = false;
    if (this.buffer) {
      this.push(this.buffer);
    }
  }
}

let sharpModule: typeof sharp | null = null;

async function requireSharp(): Promise<typeof sharp> {
  if (sharpModule) {
    return sharpModule;
  }
  try {
    sharpModule = (await import('sharp')).default;
    return sharpModule;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot load the 'sharp' module needed for MJPEG frame processing. ` +
        `Consider visiting https://sharp.pixelplumbing.com/install for troubleshooting. ` +
        `Original error: ${message}`,
      {cause: err},
    );
  }
}

const noop = () => {};

/**
 * Connects to an MJPEG-over-HTTP stream and keeps track of the last JPEG frame received,
 * so that it can be used as a cheap, low-latency screenshot source.
 */
export class MJpegStream extends Writable {
  readonly errorHandler: (err: Error) => void;
  readonly url: string;
  private updateCount = 0;
  private lastChunk: Buffer | null = null;
  private registerStartSuccess: (() => void) | null = null;
  private registerStartFailure: ((err: Error) => void) | null = null;
  private responseStream: Readable | null = null;
  private consumer: MjpegFrameParser | null = null;

  /**
   * @param mJpegUrl - URL of the MJPEG-over-HTTP stream
   * @param errorHandler - additional function that will be called in the case of any errors
   * @param options - Options to pass to the Writable constructor
   */
  constructor(
    mJpegUrl: string,
    errorHandler: (err: Error) => void = noop,
    options: WritableOptions = {},
  ) {
    super(options);
    this.errorHandler = errorHandler;
    this.url = mJpegUrl;
    this.clear();
  }

  get lastChunkBase64(): string | null {
    const lastChunk = this.lastChunk;
    return lastChunk && lastChunk.length > 0 ? lastChunk.toString('base64') : null;
  }

  async lastChunkPNG(): Promise<Buffer | null> {
    const chunk = this.lastChunk;
    if (!chunk || chunk.length === 0) {
      return null;
    }
    try {
      const sharp = await requireSharp();
      return await sharp(chunk).png().toBuffer();
    } catch (err: any) {
      log.warn(`Cannot convert MJPEG chunk to PNG: ${err.message}`);
      return null;
    }
  }

  async lastChunkPNGBase64(): Promise<string | null> {
    const png = await this.lastChunkPNG();
    return png ? png.toString('base64') : null;
  }

  clear(): void {
    this.registerStartSuccess = null;
    this.registerStartFailure = null;
    this.responseStream = null;
    this.consumer = null;
    this.lastChunk = null;
    this.updateCount = 0;
  }

  async start(serverTimeout = DEFAULT_SERVER_TIMEOUT_MS): Promise<void> {
    this.stop();

    this.consumer = new MjpegFrameParser();
    const url = this.url;
    // Bound only the connect phase with an abort signal; axios's own `timeout` option would
    // otherwise keep ticking for the whole request lifetime and race with the "first frame"
    // watchdog below, since both would share the same deadline.
    const connectController = new AbortController();
    const connectTimeoutId = setTimeout(() => connectController.abort(), serverTimeout);
    try {
      try {
        this.responseStream = (
          await axios({
            url,
            responseType: 'stream',
            signal: connectController.signal,
          })
        ).data as Readable;
      } catch (e) {
        let message: string;
        if (e && typeof e === 'object' && 'response' in e) {
          message = JSON.stringify((e as {response: unknown}).response);
        } else if (e instanceof Error) {
          message = e.message;
        } else {
          message = String(e);
        }
        throw new Error(
          `Cannot connect to the MJPEG stream at ${url}. Original error: ${message}`,
          {
            cause: e,
          },
        );
      }
    } finally {
      clearTimeout(connectTimeoutId);
    }

    const onErr = (err: Error) => {
      this.lastChunk = null;
      log.error(`Error getting MJPEG screenshot chunk: ${err.message}`);
      this.errorHandler(err);
      this.registerStartFailure?.(err);
    };
    const onClose = () => {
      log.debug(`The connection to MJPEG server at ${url} has been closed`);
      this.lastChunk = null;
    };

    let timeoutId: NodeJS.Timeout | undefined;
    const startPromise = new Promise<void>((resolve, reject) => {
      this.registerStartSuccess = resolve;
      this.registerStartFailure = reject;
      timeoutId = setTimeout(
        () =>
          reject(new Error(`Waited ${serverTimeout}ms but the MJPEG server never sent any images`)),
        serverTimeout,
      );
    });

    (this.responseStream as Readable & {pipe<T extends Writable>(dest: T): T})
      .once('close', onClose)
      .on('error', onErr)
      .pipe(this.consumer)
      .pipe(this);

    try {
      await startPromise;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  stop(): void {
    if (this.consumer) {
      this.consumer.unpipe(this);
    }
    if (this.responseStream) {
      if (this.consumer) {
        this.responseStream.unpipe(this.consumer);
      }
      this.responseStream.destroy();
    }
    this.clear();
  }

  /* eslint-disable promise/prefer-await-to-callbacks -- Writable._write is callback-based */
  override _write(
    chunk: Buffer | string,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    this.lastChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.updateCount++;
    if (this.registerStartSuccess) {
      this.registerStartSuccess();
      this.registerStartSuccess = null;
    }
    callback();
  }
  /* eslint-enable promise/prefer-await-to-callbacks */
}
