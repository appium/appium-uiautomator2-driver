---
hide:
    - toc

title: Media Streaming over BiDi
---

[`mobile: startMediaStream`](../reference/execute-methods.md#mobile-startmediastream) sends the screen to the
client as [WebDriver BiDi events](../reference/bidi.md#appiummediastreamstarted) instead of serving it over a
host port. It supports both `jpeg` frames (an MJPEG-like stream) and H.264/HEVC `video` with optional AAC audio,
needs no extra host tools, and works on Android 10 (API level 29) and newer.

1. Start a session with BiDi enabled (`webSocketUrl: true`) and subscribe to the `appium:mediaStream` module.
2. Call `mobile: startMediaStream` with `kind` set to `jpeg` or `video`.
3. Handle the `appium:mediaStream.units` events. JPEG units are complete images. Video units are Annex-B and
   start with the codec configuration at every keyframe, so decoding can begin at any keyframe.
4. Call `mobile: stopMediaStream` when done. Streams are also stopped when the session ends.

Since every frame is base64-encoded into a JSON message, this costs more CPU and bandwidth than the plain
[device MJPEG server](mjpeg.md). Prefer `video` for long or high resolution streams. A client that needs an HTTP MJPEG URL
(for example a browser or `ffmpeg`) can run a small local bridge that unwraps the `jpeg` units and serves them.

## Example client

The script below is a complete Node.js client that unwraps the events of a stream and sends the data to either of:

- `mjpeg`: a local HTTP server that serves the `jpeg` units as `multipart/x-mixed-replace` (MJPEG). Open
  `http://127.0.0.1:8093` in a browser, or use it as a source for `ffmpeg` and other tools. A new viewer gets the
  last frame right away, and a slow viewer skips frames instead of making the script buffer them.
- `mp4`: an `.mp4` file written by `ffmpeg`, which only remuxes the `video` (and optionally `audio`) units without
  re-encoding them. The codec configuration is part of every keyframe, so `ffmpeg` can parse the stream from the
  first unit.

```bash
npm install ws tsx                         # a WebSocket client and a TypeScript runner
npx tsx media-stream-client.mts mjpeg 8093  # MJPEG at http://127.0.0.1:8093
npx tsx media-stream-client.mts mp4 screen.mp4 --audio
```

It needs a running Appium server with a device, and `ffmpeg` on the `PATH` for the `mp4` mode. Press `Ctrl+C`
to stop the stream and finish the file. The file uses the `.mts` extension so that it is an ES module, which
the top-level `await` needs. Node.js 22.18 or newer can also run it without `tsx`: `node media-stream-client.mts ...`.

`media-stream-client.mts`:

```ts
// Usage: npx tsx media-stream-client.mts mjpeg [port]  |  npx tsx media-stream-client.mts mp4 [file] [--audio]
import {spawn} from 'node:child_process';
import {createServer, type ServerResponse} from 'node:http';
import type {Writable} from 'node:stream';

import WebSocket from 'ws';

const APPIUM_URL = process.env.APPIUM_URL ?? 'http://127.0.0.1:4723';
const MEDIA_STREAM_MODULE = 'appium:mediaStream';

type Track = 'video' | 'audio' | 'jpeg';

interface Options {
  mode: 'mjpeg' | 'mp4';
  port: number;
  file: string;
  audio: boolean;
}

/** Where the decoded units of the stream go */
interface Output {
  onUnit(track: Track, data: Buffer, key: boolean): void;
  /** Resolves if the output stops working on its own */
  readonly failure?: Promise<void>;
  /** Finishes the output, and rejects if it has failed */
  close(): Promise<void>;
}

function parseArgs(argv: string[]): Options {
  const audio = argv.includes('--audio');
  const [mode, arg] = argv.filter((a) => !a.startsWith('--'));
  if (mode !== 'mjpeg' && mode !== 'mp4') {
    throw new Error('Usage: media-stream-client.mts mjpeg [port] | mp4 [file] [--audio]');
  }
  return {
    mode,
    port: mode === 'mjpeg' && arg ? Number(arg) : 8093,
    file: mode === 'mp4' && arg ? arg : 'screen.mp4',
    audio,
  };
}

/** Sends a WebDriver command to Appium and returns its value */
async function wd(method: string, path: string, body?: object): Promise<any> {
  const res = await fetch(APPIUM_URL + path, {
    method,
    headers: {'content-type': 'application/json'},
    body: body && JSON.stringify(body),
  });
  const {value} = (await res.json()) as {value: any};
  if (value?.error) {
    throw new Error(`${value.error}: ${value.message}`);
  }
  return value;
}

/** Serves the JPEG units as MJPEG (multipart/x-mixed-replace over HTTP) */
function createMjpegServer(port: number): Output {
  const viewers = new Set<ServerResponse>();
  let lastFrame: Buffer | undefined;

  const toPart = (jpeg: Buffer) =>
    Buffer.concat([
      Buffer.from(`--frame\r\nContent-Type: image/jpeg\r\nContent-Length: ${jpeg.length}\r\n\r\n`),
      jpeg,
      Buffer.from('\r\n'),
    ]);

  const server = createServer((req, res) => {
    res.writeHead(200, {
      'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
      'Cache-Control': 'no-cache',
      Connection: 'close',
    });
    viewers.add(res);
    req.on('close', () => viewers.delete(res));
    if (lastFrame) {
      // A new viewer gets a picture right away
      res.write(toPart(lastFrame));
    }
  });
  server.listen(port, '127.0.0.1');
  console.log(`MJPEG: http://127.0.0.1:${port}`);

  return {
    onUnit(track, data) {
      if (track !== 'jpeg') {
        return;
      }
      lastFrame = data;
      const part = toPart(data);
      for (const res of viewers) {
        // Skip frames for a slow viewer instead of buffering them
        if (!res.writableNeedDrain) {
          res.write(part);
        }
      }
    },
    async close() {
      viewers.forEach((res) => res.end());
      server.close();
    },
  };
}

/** Remuxes the video (and audio) units into an .mp4 file with ffmpeg, without re-encoding */
function createMp4Recorder(file: string, codec: 'h264' | 'hevc', audio: boolean): Output {
  const ffmpegArgs = [
    '-y',
    // The raw stream has no timestamps, so use the arrival time of the units
    ...['-use_wallclock_as_timestamps', '1', '-f', codec, '-i', 'pipe:0'],
    ...(audio ? ['-f', 'aac', '-i', 'pipe:3'] : []),
    ...['-c', 'copy'],
    // The audio arrives as ADTS, mp4 needs the plain AAC frames
    ...(audio ? ['-bsf:a', 'aac_adtstoasc'] : []),
    // Keeps the file playable even if ffmpeg is killed before it finishes the file
    ...['-movflags', '+frag_keyframe+empty_moov'],
    file,
  ];
  const ffmpeg = spawn('ffmpeg', ffmpegArgs, {
    // Own process group: Ctrl+C must not stop ffmpeg before it has finished the file
    detached: true,
    windowsHide: true,
    stdio: ['pipe', 'inherit', 'inherit', ...(audio ? ['pipe' as const] : [])],
  });
  let spawnError: Error | undefined;
  ffmpeg.once('error', (e) => (spawnError = e));
  const exited = new Promise<number | null>((resolve) => ffmpeg.once('close', resolve));
  let closing = false;
  // Resolves if ffmpeg exits before close() was called
  const failure = new Promise<void>((resolve) => void exited.then(() => closing || resolve()));
  const inputs = {
    video: ffmpeg.stdin as Writable,
    audio: audio ? (ffmpeg.stdio[3] as Writable) : null,
  };
  // A broken pipe means that ffmpeg has exited, which is reported through its exit code
  Object.values(inputs).forEach((input) => input?.on('error', () => {}));
  console.log(`Recording to ${file}`);

  // An ffmpeg input that is full skips units instead of buffering them in memory, and pausing
  // the connection could starve the other input. Video resumes at the next keyframe.
  let videoSynced = false;
  return {
    failure,
    onUnit(track, data, key) {
      if (track === 'video') {
        if (inputs.video.writableNeedDrain) {
          videoSynced = false;
          return;
        }
        videoSynced ||= key;
        if (videoSynced) {
          inputs.video.write(data);
        }
      } else if (track === 'audio' && inputs.audio && !inputs.audio.writableNeedDrain) {
        inputs.audio.write(data);
      }
    },
    async close() {
      closing = true;
      inputs.video.end();
      inputs.audio?.end();
      const code = await exited;
      if (spawnError) {
        throw new Error(`Cannot run ffmpeg: ${spawnError.message}`);
      }
      if (code !== 0) {
        throw new Error(`ffmpeg failed with exit code ${code}`);
      }
    },
  };
}

/** Subscribes to the events and resolves once Appium has confirmed it */
function subscribe(ws: WebSocket, events: string[]): Promise<void> {
  const id = 1;
  return new Promise((resolve, reject) => {
    const onMessage = (raw: WebSocket.RawData) => {
      const msg = JSON.parse(raw.toString());
      if (msg.id !== id) {
        return;
      }
      ws.off('message', onMessage);
      if (msg.type === 'error') {
        reject(new Error(`${msg.error}: ${msg.message}`));
      } else {
        resolve();
      }
    };
    ws.on('message', onMessage);
    ws.send(JSON.stringify({id, method: 'session.subscribe', params: {events}}));
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const codec = 'h264';
  const output =
    options.mode === 'mjpeg' ? createMjpegServer(options.port) : createMp4Recorder(options.file, codec, options.audio);

  const {sessionId, capabilities} = await wd('POST', '/session', {
    capabilities: {
      alwaysMatch: {
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        webSocketUrl: true,
      },
    },
  });
  const socket = new WebSocket(capabilities.webSocketUrl);
  await new Promise((resolve, reject) => socket.once('open', resolve).once('error', reject));

  let streamId: string | undefined;
  let closing: Promise<void> | undefined;
  const shutdown = () =>
    (closing ??= (async () => {
      if (streamId) {
        await wd('POST', `/session/${sessionId}/execute/sync`, {
          script: 'mobile: stopMediaStream',
          args: [{streamId}],
        }).catch(() => {});
      }
      socket.close();
      try {
        await output.close();
      } finally {
        await wd('DELETE', `/session/${sessionId}`).catch(() => {});
      }
    })());
  const shutdownAndExit = (code: number) =>
    void shutdown()
      .then(
        () => code,
        (e: Error) => (console.error(e.message), 1),
      )
      .then((exitCode) => process.exit(exitCode));

  process.once('SIGINT', () => shutdownAndExit(0));
  void output.failure?.then(() => shutdownAndExit(1));
  socket.on('close', (code) => {
    // Appium closes the connection with 1013 if this client cannot keep up with the stream
    if (!closing) {
      console.log(`BiDi connection closed (${code})`);
      shutdownAndExit(1);
    }
  });
  socket.on('message', (raw) => {
    const {type, method, params} = JSON.parse(raw.toString());
    if (type !== 'event' || closing) {
      return;
    }
    if (method === 'appium:mediaStream.units') {
      for (const unit of params.units) {
        output.onUnit(unit.track, Buffer.from(unit.data, 'base64'), unit.key);
      }
    } else {
      // started, formatChanged (the frame size) and ended
      console.log(method, JSON.stringify(params));
    }
  });

  try {
    // Events are only emitted while a client is subscribed, so subscribe first
    await subscribe(socket, [MEDIA_STREAM_MODULE]);
    const stream = await wd('POST', `/session/${sessionId}/execute/sync`, {
      script: 'mobile: startMediaStream',
      args: [options.mode === 'mjpeg' ? {kind: 'jpeg', quality: 70} : {kind: 'video', codec, audio: options.audio}],
    });
    streamId = stream.streamId;
    console.log('Stream started', JSON.stringify(stream));
  } catch (e) {
    await shutdown().catch(() => {});
    throw e;
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
```

Notes:

- The client subscribes first and only then starts the stream, since events are only emitted while a client is subscribed.
- Appium closes the connection with code `1013` if the client cannot keep up with the stream. This script then stops;
  a real client could reconnect, subscribe again and restart the stream.
- If an `ffmpeg` input cannot keep up, the script skips units for it instead of buffering the recording in memory;
  video resumes at the next keyframe. If `ffmpeg` fails or exits, the script stops the stream, ends the session and exits with a nonzero code.
- A raw H.264/HEVC stream has no timestamps, so `ffmpeg` timestamps the units by the time they arrive. The result
  is accurate to about the batching window (`batchMs`), and the audio is not aligned to the video. If you need
  exact timing, use the `ts` of the units (microseconds, one clock for all the tracks).
- The script was tested on macOS. It uses no platform-specific code, but the audio goes to `ffmpeg` through an extra
  pipe (`pipe:3`), which may not work on Windows. If it does not, record without `--audio`.
- To record HEVC, pass `codec: 'hevc'` to `mobile: startMediaStream` and use `hevc` instead of `h264` as the input format of `ffmpeg`.
