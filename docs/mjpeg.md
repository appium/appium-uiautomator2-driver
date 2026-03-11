# MJPEG Screen Streaming Guide

This document describes the MJPEG (Motion JPEG) screen streaming support in the UiAutomator2 driver.

## Overview

The UiAutomator2 **server** (running on the Android device) includes a built-in MJPEG broadcaster. It captures the device screen at a configurable rate, encodes frames as JPEG, and serves them over TCP using the `multipart/x-mixed-replace` format. This allows:

- **Live viewing** of the device screen by connecting to the stream (e.g. in a browser or a custom client).
- **Screenshot from stream**: if the driver is configured to use the MJPEG URL, the standard screenshot command returns the latest frame from the stream instead of calling the server’s screenshot API.

The MJPEG server on the device is started automatically when the UiAutomator2 instrumentation starts and listens on a fixed port on the device (default `7810`). No extra process or GStreamer is required on the device.

## Capabilities

### `appium:mjpegServerPort`

- **Type:** integer (port number on the **host**)
- **Description:** The port on the host machine to which the device MJPEG server port is forwarded via ADB. If not set, no port forwarding is done, so the device MJPEG service is not reachable from the host.
- **Use case:** Set this when you want to connect to the device MJPEG stream from the host (e.g. `http://localhost:<mjpegServerPort>`) or when using [screen recording](#screen-recording) so the host can receive the stream.
- **Parallel sessions:** Use a **unique** `mjpegServerPort` per session when running multiple devices or parallel tests to avoid port conflicts.

### `appium:mjpegScreenshotUrl`

- **Type:** string (URL)
- **Description:** URL of a service that provides real-time device screenshots in MJPEG format. If set, the driver creates an MJPEG client that consumes this URL; the standard **screenshot** command then returns the latest frame from that stream instead of calling the UiAutomator2 server’s `/screenshot` endpoint.
- **Typical value:** When you forward the device MJPEG port with `appium:mjpegServerPort`, you can set this to `http://localhost:<mjpegServerPort>` (or the same host/port your client uses to reach the stream) so that screenshot uses the MJPEG stream.
- **Note:** The driver starts the MJPEG stream client after the session is created and stops it on session end. If the stream has not yet produced a frame, the screenshot command may fall back to the regular server screenshot.

## Settings (MJPEG broadcaster on the device)

These settings control the MJPEG broadcaster that runs **on the device** (in the UiAutomator2 server). They can be changed at runtime via the [Settings API](https://appium.io/docs/en/latest/guides/settings/) (e.g. `driver.update_settings({...})`).

| Setting | Type | Range / values | Default | Description |
|--------|------|----------------|---------|-------------|
| `mjpegServerPort` | int | 1024..65535 | 7810 | Port on the **device** where the MJPEG server listens. The driver forwards this to the host when `appium:mjpegServerPort` capability is set. |
| `mjpegServerFramerate` | int | 1..60 | 10 | Maximum frames per second. Higher values increase CPU load on the device. |
| `mjpegScalingFactor` | int | 1..100 | 50 | Scale factor in percent (100 = no scaling). Lower values reduce size and CPU use. |
| `mjpegServerScreenshotQuality` | int | 1..100 | 50 | JPEG quality (100 = best). Higher values improve quality but use more CPU. |
| `mjpegBilinearFiltering` | boolean | true / false | false | Use bilinear filtering when scaling. Can improve scaled image quality with a small performance cost. |

## How the device MJPEG server works

1. When the UiAutomator2 server starts on the device, it starts an **MJPEG server** thread that listens on the configured device port (default 7810).
2. For each TCP client that connects, the server sends an HTTP-like response with `Content-Type: multipart/x-mixed-replace; boundary=--BoundaryString` and then a continuous stream of JPEG frames (each frame preceded by a boundary and `Content-Length`).
3. Frames are produced by the device at the configured framerate; each frame is taken via `UiAutomation.takeScreenshot()`, optionally scaled and compressed according to the settings above, then sent to all connected clients.
4. If no clients are connected, the server does not capture at full rate (it sleeps) to save CPU.

## Port forwarding and connecting to the stream

1. Set the capability **`appium:mjpegServerPort`** to a free port on the host (e.g. `7810` or any port you choose).
2. The driver will run `adb forward <host port> 7810` (or the device port you set via the `mjpegServerPort` setting) so that the device MJPEG server is reachable at `http://localhost:<host port>` (or your host IP if you need remote access).
3. Open that URL in a browser or use any MJPEG-capable client; you should see the live device screen.
4. Optionally set **`appium:mjpegScreenshotUrl`** to the same URL (e.g. `http://localhost:7810`) so that the driver’s screenshot command uses the latest frame from this stream.

## Screenshot command behavior

- **Without `appium:mjpegScreenshotUrl`:** The screenshot command is sent to the UiAutomator2 server (`GET /screenshot`), which takes a single screenshot on demand.
- **With `appium:mjpegScreenshotUrl`:** The driver keeps an MJPEG client connected to the given URL. The screenshot command returns the latest frame received from that stream (as base64 PNG). If no frame is available yet, the driver falls back to the regular server screenshot and logs a warning.

## Screen streaming (host-side: `mobile: startScreenStreaming` / `stopScreenStreaming`)

The driver also supports **`mobile: startScreenStreaming`** and **`mobile: stopScreenStreaming`**. These are **different** from the built-in device MJPEG server:

- They start or stop a **host-side** MJPEG server that uses **GStreamer** (and optionally ADB) to capture and broadcast the device screen. They require the `adb_screen_streaming` feature and GStreamer with `gst-plugins-base`, `gst-plugins-good`, and `gst-plugins-bad` on the **host**.
- The **device MJPEG server** described in this guide runs entirely on the device, is built into the UiAutomator2 server, and does not require GStreamer.

Use the **device MJPEG server** (with `appium:mjpegServerPort` and optionally `appium:mjpegScreenshotUrl`) when you only need a simple TCP MJPEG stream from the device. Use **`mobile: startScreenStreaming`** when you need the host-based GStreamer pipeline (e.g. for specific encoding or network options).

## Parallel sessions

When running multiple sessions (e.g. parallel tests or multiple devices):

- Set a **unique** `appium:mjpegServerPort` per session so each device’s MJPEG port is forwarded to a different host port.
- This is especially important if you use screen recording or any tool that connects to the MJPEG stream.

## Summary

| What you want | What to use |
|---------------|-------------|
| Expose device screen as MJPEG on the host | Set `appium:mjpegServerPort` to a host port; connect to `http://localhost:<port>`. |
| Screenshot from the MJPEG stream | Also set `appium:mjpegScreenshotUrl` to that URL (e.g. `http://localhost:<port>`). |
| Tune framerate, size, or quality on the device | Use Settings API: `mjpegServerFramerate`, `mjpegScalingFactor`, `mjpegServerScreenshotQuality`, `mjpegBilinearFiltering`. |
| Host-side GStreamer-based streaming | Use `mobile: startScreenStreaming` / `mobile: stopScreenStreaming` (see README). |
