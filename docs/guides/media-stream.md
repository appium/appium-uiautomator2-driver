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

[This script](https://github.com/appium/appium-android/blob/main/packages/driver-lib/examples/media-stream-client.mts) is a complete Node.js client that unwraps the events of a stream and sends the data to either of:

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
