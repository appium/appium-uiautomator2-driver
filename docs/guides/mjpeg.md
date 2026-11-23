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

These capabilities configure ADB forwarding and how the driver receives the device's MJPEG stream.

#### [`appium:mjpegServerPort`](../reference/capabilities.md#mjpegserverport)

- **Type:** integer (port number on the **ADB server host**)
- **Description:** The port on the ADB server host to which the device MJPEG server port is forwarded. If omitted, the driver does not create an MJPEG forward.
- **Use case:** Set this to connect to the stream or to use screen recording. See [Port forwarding and connecting](#port-forwarding-and-connecting) for the stream URL.
- **Parallel sessions:** Use a **unique** `mjpegServerPort` per session when running multiple devices or parallel tests to avoid port conflicts.

#### [`appium:mjpegScreenshotUrl`](../reference/capabilities.md#mjpegscreenshoturl)

- **Type:** string (URL)
- **Description:** URL of a service that provides real-time device screenshots in MJPEG format. If set, the driver creates an MJPEG client that consumes this URL; the standard **screenshot** command then returns the latest frame from that stream instead of calling the UiAutomator2 server’s `/screenshot` endpoint.
- **Typical value:** When you forward the device MJPEG port with `appium:mjpegServerPort`, set this to the same URL used to connect to the stream.
- **Note:** The driver starts the MJPEG stream client after the session is created and stops it on session end. If the stream has not yet produced a frame, the screenshot command may fall back to the regular server screenshot.

### Settings

These settings control the MJPEG broadcaster that runs **on the device under test** (in the UiAutomator2 server).

| <div style="width:15em">Setting</div> | Range / values | Default | Description |
|--------|----------------|---------|-------------|
| [`mjpegServerPort`](../reference/settings.md#mjpegserverport) | 1024..65535 | 7810 | Port on the device where the MJPEG server listens. The driver creates a forward on the ADB server host when `appium:mjpegServerPort` is set. |
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

1. Set `appium:mjpegServerPort` to a free port on the ADB server host.
2. The driver reserves the port with `adb forward --no-rebind tcp:<port> tcp:7810`.
3. For a local ADB server, connect to `http://localhost:<port>`. With `appium:remoteAdbHost` set,
   connect to the forwarded port on that host, provided the port is reachable from the client.
4. Optionally set `appium:mjpegScreenshotUrl` to the same URL so that the driver's screenshot
   command uses the latest frame from the stream.

### Recovering a Stale Forward

The driver refuses to replace an existing forward. If a session ends without releasing its
forward, the next session explicitly requesting that `appium:systemPort` or `appium:mjpegServerPort`
will fail to start. Use a free port or run
`adb forward --list` against the same ADB server. After confirming the mapping is no longer in use,
run `adb forward --remove tcp:<port>` for that device on the same ADB server. If the server is
remote, use the same ADB host and port, and select the device by serial if necessary.

A timeout or dropped connection while creating either forward may leave a mapping on the ADB
server. The driver leaves an unconfirmed mapping alone because ADB does not identify the client
that owns it. Use the same checks before removing that mapping.

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

To receive the screen on the client as JPEG frames or H.264/HEVC video (with optional audio) over WebDriver BiDi,
instead of serving it from a host port, use [`mobile: startMediaStream`](../reference/execute-methods.md#mobile-startmediastream).
See the [Media Streaming over BiDi guide](media-stream.md) for details and an example client.

## Requirements

- For **device-side MJPEG streaming** itself, no extra tools are required beyond a compatible Android device and the UiAutomator2 server; the broadcaster runs entirely on the device.
- For **tools that consume the stream** (for example, screen recording on the host), you must ensure whatever tool you use (such as `ffmpeg` or a custom recorder) understands MJPEG over HTTP and can connect to the forwarded MJPEG URL.
- For **`mobile: startScreenStreaming` / `stopScreenStreaming`**, which are host-side and GStreamer-based, you must have GStreamer with `gst-plugins-base`, `gst-plugins-good`, and `gst-plugins-bad` installed and available on the host `PATH`.

## Summary

| What you want | What to use |
|---------------|-------------|
| Expose the device screen as MJPEG | Set `appium:mjpegServerPort` to a free port on the ADB server host and connect to the stream on that host. |
| Screenshot from the MJPEG stream | Also set `appium:mjpegScreenshotUrl` to the stream URL. |
| Tune framerate, size, or quality on the device | Use Settings API: `mjpegServerFramerate`, `mjpegScalingFactor`, `mjpegServerScreenshotQuality`, `mjpegBilinearFiltering`. |
| Stream the screen to the client over BiDi, as JPEG or H.264/HEVC video with audio | Use [`mobile: startMediaStream`](../reference/execute-methods.md#mobile-startmediastream), see the [Media Streaming guide](media-stream.md). |
| Host-side GStreamer-based streaming | Use `mobile: startScreenStreaming` / `mobile: stopScreenStreaming`. |
