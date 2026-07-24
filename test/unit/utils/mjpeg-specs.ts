import http, {type Server} from 'node:http';
import {describe, it, before, beforeEach, afterEach} from 'node:test';

import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sharp from 'sharp';

import {MJpegStream} from '../../../lib/utils/mjpeg.js';

use(chaiAsPromised);

function buildMultipartFrame(jpeg: Buffer): Buffer {
  const header = `--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`;
  return Buffer.concat([Buffer.from(header), jpeg, Buffer.from('\r\n')]);
}

describe('MJpegStream', function () {
  let jpeg: Buffer;
  let jpeg2: Buffer;
  let server: Server;
  let serverUrl: string;
  let framesToSend: Buffer[];
  let frameIntervalMs: number;
  let stream: MJpegStream | null;

  before(async function () {
    jpeg = await sharp({
      create: {width: 2, height: 2, channels: 3, background: {r: 255, g: 0, b: 0}},
    })
      .jpeg()
      .toBuffer();
    jpeg2 = await sharp({
      create: {width: 2, height: 2, channels: 3, background: {r: 0, g: 0, b: 255}},
    })
      .jpeg()
      .toBuffer();
  });

  beforeEach(async function () {
    framesToSend = [jpeg];
    frameIntervalMs = 10;
    stream = null;
    server = http.createServer((_req, res) => {
      res.writeHead(200, {'Content-Type': 'multipart/x-mixed-replace; boundary=frame'});
      res.flushHeaders();
      let sent = 0;
      const timer = setInterval(() => {
        if (sent >= framesToSend.length) {
          clearInterval(timer);
          return;
        }
        res.write(buildMultipartFrame(framesToSend[sent]));
        sent++;
      }, frameIntervalMs);
      res.on('close', () => clearInterval(timer));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 0;
    serverUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async function () {
    stream?.stop();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('should have no last chunk before start() is called', function () {
    stream = new MJpegStream(serverUrl);
    expect(stream.lastChunkBase64).to.be.null;
  });

  it('should capture the first JPEG frame once started', {timeout: 20000}, async function () {
    stream = new MJpegStream(serverUrl);
    await stream.start();
    expect(stream.lastChunkBase64).to.equal(jpeg.toString('base64'));
  });

  it('should convert the last chunk to a PNG', {timeout: 20000}, async function () {
    stream = new MJpegStream(serverUrl);
    await stream.start();
    const pngBase64 = await stream.lastChunkPNGBase64();
    expect(pngBase64).to.not.be.null;
    const png = Buffer.from(pngBase64 as string, 'base64');
    // PNG signature
    expect(png.subarray(0, 8).toString('hex')).to.equal('89504e470d0a1a0a');
  });

  it('should keep track of newer frames as they arrive', {timeout: 20000}, async function () {
    framesToSend = [jpeg, jpeg2];
    frameIntervalMs = 20;
    stream = new MJpegStream(serverUrl);
    await stream.start();
    expect(stream.lastChunkBase64).to.equal(jpeg.toString('base64'));
    await new Promise((resolve) => setTimeout(resolve, frameIntervalMs * framesToSend.length + 50));
    expect(stream.lastChunkBase64).to.equal(jpeg2.toString('base64'));
  });

  it('should clear the last chunk on stop()', {timeout: 20000}, async function () {
    stream = new MJpegStream(serverUrl);
    await stream.start();
    expect(stream.lastChunkBase64).to.not.be.null;
    stream.stop();
    expect(stream.lastChunkBase64).to.be.null;
  });

  it('should reject if the server cannot be reached', async function () {
    stream = new MJpegStream('http://127.0.0.1:1');
    await expect(stream.start(200)).to.be.rejectedWith(/Cannot connect to the MJPEG stream/);
  });

  it('should reject if no frame arrives before the timeout', {timeout: 20000}, async function () {
    framesToSend = [];
    stream = new MJpegStream(serverUrl);
    // The server flushes headers immediately, so axios resolves well within the deadline;
    // the rejection comes from MJpegStream's own "no frame yet" guard.
    await expect(stream.start(300)).to.be.rejectedWith(/never sent any images/);
  });
});
