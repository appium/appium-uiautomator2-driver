---
title: MJPEG Screenshot Stream
---

The UiAutomator2 driver supports streaming of screenshots over MJPEG. This feature allows real-time
broadcasting of the device screen as a continuous stream of JPEG frames over HTTP, which can be
used for screen recording, live viewing, or using the latest stream frame as the source for
screenshot commands.

## Overview

The UiAutomator2 server (running on the Android device) includes a built-in MJPEG broadcaster. It
captures the device screen at a configurable rate, encodes frames as JPEG, and serves them over TCP
using the `multipart/x-mixed-replace` format. This allows:

- Live viewing of the device screen by connecting to the stream (e.g. in a browser or a custom client).
- Screenshot from stream: if the driver is configured to use the MJPEG URL, the standard screenshot
  command returns the latest frame from the stream, instead of calling the server's screenshotting API.

The MJPEG server on the device is started automatically upon every session, and listens on a fixed
port on the device (default `7810`).

## Use Cases

| Use case | Description |
|----------|-------------|
| Screen recording | The driver can use the MJPEG stream as input for host-side screen recording tooling (for example, via `ffmpeg`) to produce MP4 (or other) video files. |
| Screenshots from stream | If the [`appium:mjpegScreenshotUrl`](../reference/capabilities.md#mjpegscreenshoturl) capability is set, the driver uses the latest frame from that MJPEG stream in the standard screenshot command, instead of calling the server's regular screenshot API. |
| Live viewing / custom tools | Any HTTP client (browser, script, or custom app) can connect to the MJPEG URL (after port forwarding, if needed) to view or process the live screen. |

## Configuration

### Capabilities

These capabilities control the MJPEG broadcaster that runs **on the host machine**.

#### [`appium:mjpegServerPort`](../reference/capabilities.md#mjpegserverport)

- **Type:** integer (port number on the **host**)
- **Description:** The port on the host machine to which the device MJPEG server port is forwarded via ADB. If not set, no port forwarding is done, so the device MJPEG service is not reachable from the host.
- **Use case:** Set this when you want to connect to the device MJPEG stream from the host (e.g. `http://localhost:<mjpegServerPort>`) or when using screen recording so the host can receive the stream.
- **Parallel sessions:** Use a **unique** `mjpegServerPort` per session when running multiple devices or parallel tests to avoid port conflicts.

#### [`appium:mjpegScreenshotUrl`](../reference/capabilities.md#mjpegscreenshoturl)

- **Type:** string (URL)
- **Description:** URL of a service that provides real-time device screenshots in MJPEG format. If set, the driver creates an MJPEG client that consumes this URL; the standard **screenshot** command then returns the latest frame from that stream instead of calling the UiAutomator2 server’s `/screenshot` endpoint.
- **Typical value:** When you forward the device MJPEG port with `appium:mjpegServerPort`, you can set this to `http://localhost:<mjpegServerPort>` (or the same host/port your client uses to reach the stream) so that screenshot uses the MJPEG stream.
- **Note:** The driver starts the MJPEG stream client after the session is created and stops it on session end. If the stream has not yet produced a frame, the screenshot command may fall back to the regular server screenshot.

### Settings

These settings control the MJPEG broadcaster that runs **on the device under test** (in the UiAutomator2 server).

| <div style="width:15em">Setting</div> | Range / values | Default | Description |
|--------|----------------|---------|-------------|
| [`mjpegServerPort`](../reference/settings.md#mjpegserverport) | 1024..65535 | 7810 | Port on the device where the MJPEG server listens. The driver forwards this to the host when `appium:mjpegServerPort` capability is set. |
| [`mjpegServerFramerate`](../reference/settings.md#mjpegserverframerate) | 1..60 | 10 | Maximum frames per second. Higher values increase CPU load on the device. |
| [`mjpegScalingFactor`](../reference/settings.md#mjpegscalingfactor) | 1..100 | 50 | Scale factor in percent (100 = no scaling). Lower values reduce size and CPU use. |
| [`mjpegServerScreenshotQuality`](../reference/settings.md#mjpegserverscreenshotquality) | 1..100 | 50 | JPEG quality (100 = best). Higher values improve quality but use more CPU. |
| [`mjpegBilinearFiltering`](../reference/settings.md#mjpegbilinearfiltering) | true / false | false | Use bilinear filtering when scaling. Can improve scaled image quality with a small performance cost. |

## How it Works

1. When the UiAutomator2 server starts on the device, it starts an **MJPEG server** thread that listens on the configured device port (default 7810).
2. For each TCP client that connects, the server sends an HTTP-like response with `Content-Type: multipart/x-mixed-replace; boundary=--BoundaryString` and then a continuous stream of JPEG frames (each frame preceded by a boundary and `Content-Length`).
3. Frames are produced by the device at the configured framerate; each frame is taken via `UiAutomation.takeScreenshot()`, optionally scaled and compressed according to the settings above, then sent to all connected clients.
4. If no clients are connected, the server does not capture at full rate (it sleeps) to save CPU.

## Using the Stream

### Port Forwarding and Connecting

1. Set the capability `appium:mjpegServerPort` to a free port on the host (e.g. `7810` or any port you choose).
2. The driver will run `adb forward <host port> 7810` (or the device port you set via the `mjpegServerPort` setting) so that the device MJPEG server is reachable at `http://localhost:<host port>` (or your host IP if you need remote access).
3. Open that URL in a browser or use any MJPEG-capable client; you should see the live device screen.
4. Optionally set `appium:mjpegScreenshotUrl` to the same URL (e.g. `http://localhost:7810`) so that the driver’s screenshot command uses the latest frame from this stream.

### Screenshot Behavior

- Without `appium:mjpegScreenshotUrl`: The screenshot command is sent to the UiAutomator2 server (`GET /screenshot`), which takes a single screenshot on demand.
- With `appium:mjpegScreenshotUrl`: The driver keeps an MJPEG client connected to the given URL. The screenshot command returns the latest frame received from that stream (as base64 PNG). If no frame is available yet, the driver falls back to the regular server screenshot and logs a warning.

## Parallel Testing

When running multiple sessions (e.g. parallel tests or multiple devices):

- Set a **unique** `appium:mjpegServerPort` per session so each device’s MJPEG port is forwarded to a different host port.
- This is especially important if you use screen recording or any tool that connects to the MJPEG stream.

## Performance Considerations

- Higher `mjpegServerFramerate` values increase the number of screenshots taken per second and therefore the CPU load.
- Higher `mjpegServerScreenshotQuality` values increase JPEG encoding cost and network bandwidth.
- Higher `mjpegScalingFactor` values (larger images) also increase encoding time and payload size.
- Enabling `mjpegBilinearFiltering` can improve scaled image quality with a small extra performance cost.

For long-running or parallel streaming, start with moderate defaults (for example, framerate `10`, scaling factor `50`, quality `50`) and then adjust as needed.

## Other Screen Streaming Approaches

The driver also supports [`mobile: startScreenStreaming`](../reference/execute-methods.md#mobile-startscreenstreaming)
and [`mobile: stopScreenStreaming`](../reference/execute-methods.md#mobile-stopscreenstreaming).
These are **different** from the built-in device MJPEG server:

- They start or stop a **host-side** MJPEG server that uses **GStreamer** (and optionally ADB) to capture and broadcast the device screen. They require the `adb_screen_streaming` feature and GStreamer with `gst-plugins-base`, `gst-plugins-good`, and `gst-plugins-bad` on the **host**.
- The **device MJPEG server** described in this guide runs entirely on the device, is built into the UiAutomator2 server, and does not require GStreamer.

Use the device MJPEG server (with `appium:mjpegServerPort` and optionally `appium:mjpegScreenshotUrl`) when you only need a simple TCP MJPEG stream from the device. Use `mobile: startScreenStreaming` when you need the host-based GStreamer pipeline (e.g. for specific encoding or network options).

## Streaming over BiDi

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
MJPEG server above. Prefer `video` for long or high resolution streams. A client that needs an HTTP MJPEG URL
(for example a browser or `ffmpeg`) can run a small local bridge that unwraps the `jpeg` units and serves them.

### Example client

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
import {spawn, type ChildProcess} from 'node:child_process';
import {createServer, type ServerResponse} from 'node:http';

import WebSocket from 'ws';

const APPIUM = process.env.APPIUM_URL ?? 'http://127.0.0.1:4723';
const [mode, arg] = process.argv.slice(2);
const withAudio = process.argv.includes('--audio');

async function wd<T = any>(method: string, path: string, body?: object): Promise<T> {
  const res = await fetch(APPIUM + path, {
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

/** Receives the units of the stream, decoded from base64 */
type UnitHandler = (track: 'video' | 'audio' | 'jpeg', data: Buffer, key: boolean) => void;

// --- Output 1: a local MJPEG server (multipart/x-mixed-replace over HTTP) ---
function mjpegServer(port: number): {onUnit: UnitHandler; close: () => void} {
  const viewers = new Set<ServerResponse>();
  let last: Buffer | undefined;
  const part = (jpeg: Buffer) =>
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
    if (last) {
      res.write(part(last)); // a new viewer gets a picture right away
    }
  }).listen(port, '127.0.0.1');
  console.log(`MJPEG: http://127.0.0.1:${port}`);
  return {
    onUnit(track, data) {
      if (track !== 'jpeg') {
        return;
      }
      last = data;
      const chunk = part(data);
      for (const res of viewers) {
        // Drop frames for a slow viewer instead of buffering them
        if (!res.writableNeedDrain) {
          res.write(chunk);
        }
      }
    },
    close: () => {
      viewers.forEach((res) => res.end());
      server.close();
    },
  };
}

// --- Output 2: an .mp4 file written by ffmpeg, which only remuxes (no re-encoding) ---
function mp4Recorder(file: string, codec: 'h264' | 'hevc', audio: boolean) {
  const args = [
    '-y',
    // The raw stream has no timestamps, so use the arrival time of the units
    ...['-use_wallclock_as_timestamps', '1', '-f', codec, '-i', 'pipe:0'],
    ...(audio ? ['-f', 'aac', '-i', 'pipe:3'] : []),
    '-c',
    'copy',
    // The audio arrives as ADTS, mp4 needs the plain AAC frames
    ...(audio ? ['-bsf:a', 'aac_adtstoasc'] : []),
    // Keeps the file playable even if ffmpeg is killed before it can finish the file
    '-movflags',
    '+frag_keyframe+empty_moov',
    file,
  ];
  const ffmpeg: ChildProcess = spawn('ffmpeg', args, {
    // Own process group: Ctrl+C must not stop ffmpeg before it has finished the file
    detached: true,
    stdio: ['pipe', 'inherit', 'inherit', ...(audio ? ['pipe' as const] : [])],
  });
  const exited = new Promise<number | null>((resolve) => ffmpeg.on('close', resolve));
  const audioPipe = (audio ? ffmpeg.stdio[3] : undefined) as NodeJS.WritableStream | undefined;
  for (const [name, pipe] of [
    ['video', ffmpeg.stdin],
    ['audio', audioPipe],
  ] as const) {
    pipe?.on('error', (e) => console.error(`ffmpeg ${name} input: ${e.message} (${Date.now()})`));
  }
  console.log(`Recording to ${file}`);
  return {
    onUnit: ((track, data) => {
      if (track === 'video') {
        ffmpeg.stdin?.write(data);
      } else if (track === 'audio') {
        audioPipe?.write(data);
      }
    }) as UnitHandler,
    async close() {
      ffmpeg.stdin?.end();
      audioPipe?.end();
      await exited;
    },
  };
}

// --- BiDi plumbing ---
let closing: Promise<void> | undefined;
const {sessionId, capabilities} = await wd('POST', '/session', {
  capabilities: {
    alwaysMatch: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      webSocketUrl: true,
    },
  },
});
const ws = new WebSocket(capabilities.webSocketUrl);
await new Promise((resolve, reject) => ws.once('open', resolve).once('error', reject));

const isJpeg = mode === 'mjpeg';
const codec = 'h264' as const;
const output = isJpeg
  ? mjpegServer(Number(arg ?? 8093))
  : mp4Recorder(arg && !arg.startsWith('--') ? arg : 'screen.mp4', codec, withAudio);

ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.type !== 'event') {
    return;
  }
  const {method, params} = msg;
  if (closing) {
    return;
  }
  if (method === 'appium:mediaStream.units') {
    for (const u of params.units) {
      output.onUnit(u.track, Buffer.from(u.data, 'base64'), u.key);
    }
  } else {
    // started / formatChanged (frame size) / ended
    console.log(method, JSON.stringify(params));
  }
});
// Appium closes the connection with 1013 if this client cannot keep up
ws.on('close', (code) => {
  console.log(`BiDi connection closed (${code})`);
  void shutdown();
});

// Subscribe first, then start: events are only emitted while someone is subscribed
ws.send(JSON.stringify({id: 1, method: 'session.subscribe', params: {events: ['appium:mediaStream']}}));
await new Promise<void>((resolve) =>
  ws.on('message', function onReply(raw) {
    if (JSON.parse(raw.toString()).id === 1) {
      ws.off('message', onReply);
      resolve();
    }
  }),
);
const stream = await wd('POST', `/session/${sessionId}/execute/sync`, {
  script: 'mobile: startMediaStream',
  args: [isJpeg ? {kind: 'jpeg', quality: 70} : {kind: 'video', codec, audio: withAudio}],
});
console.log('Stream started', JSON.stringify(stream));

function shutdown() {
  return (closing ??= (async () => {
    await wd('POST', `/session/${sessionId}/execute/sync`, {
      script: 'mobile: stopMediaStream',
      args: [{streamId: stream.streamId}],
    }).catch(() => {});
    ws.close();
    await output.close();
    await wd('DELETE', `/session/${sessionId}`).catch(() => {});
    process.exit(0);
  })());
}
process.on('SIGINT', shutdown);
```

Notes:

- The client subscribes first and only then starts the stream, since events are only emitted while a client is subscribed.
- Appium closes the connection with code `1013` if the client cannot keep up with the stream. This script then stops;
  a real client could reconnect, subscribe again and restart the stream.
- A raw H.264/HEVC stream has no timestamps, so `ffmpeg` timestamps the units by the time they arrive. The result
  is accurate to about the batching window (`batchMs`), and the audio is not aligned to the video. If you need
  exact timing, use the `ts` of the units (microseconds, one clock for all the tracks).
- To record HEVC, pass `codec: 'hevc'` to `mobile: startMediaStream` and use `hevc` instead of `h264` as the input format of `ffmpeg`.

## Requirements

- For **device-side MJPEG streaming** itself, no extra tools are required beyond a compatible Android device and the UiAutomator2 server; the broadcaster runs entirely on the device.
- For **tools that consume the stream** (for example, screen recording on the host), you must ensure whatever tool you use (such as `ffmpeg` or a custom recorder) understands MJPEG over HTTP and can connect to the forwarded MJPEG URL.
- For **`mobile: startScreenStreaming` / `stopScreenStreaming`**, which are host-side and GStreamer-based, you must have GStreamer with `gst-plugins-base`, `gst-plugins-good`, and `gst-plugins-bad` installed and available on the host `PATH`.

## Summary

| What you want | What to use |
|---------------|-------------|
| Expose device screen as MJPEG on the host | Set `appium:mjpegServerPort` to a host port; connect to `http://localhost:<port>`. |
| Screenshot from the MJPEG stream | Also set `appium:mjpegScreenshotUrl` to that URL (e.g. `http://localhost:<port>`). |
| Tune framerate, size, or quality on the device | Use Settings API: `mjpegServerFramerate`, `mjpegScalingFactor`, `mjpegServerScreenshotQuality`, `mjpegBilinearFiltering`. |
| Stream the screen to the client over BiDi, as JPEG or H.264/HEVC video with audio | Use [`mobile: startMediaStream`](../reference/execute-methods.md#mobile-startmediastream). |
| Host-side GStreamer-based streaming | Use `mobile: startScreenStreaming` / `mobile: stopScreenStreaming`. |
