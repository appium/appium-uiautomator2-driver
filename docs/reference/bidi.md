---
title: BiDi Commands and Events
---

The UiAutomator2 driver has partial support of the [WebDriver BiDi Protocol](https://w3c.github.io/webdriver-bidi/).
It inherits [the BiDi commands and events supported by the Appium base driver](https://appium.io/docs/en/latest/reference/api/bidi/),
and additionally defines the events and commands listed below.

## Events

### `log.entryAdded`

> WebDriver BiDi documentation: [log.entryAdded](https://w3c.github.io/webdriver-bidi/#event-log-entryAdded)

Indicates that a new log entry is available for consumption.

This event is emitted when the driver retrieves a new entry for any of the log types listed below.

Available since driver version 3.7.10.

#### Event Type (CDDL)

```cddl
log.entryAded = (
  context: text,
  method: "log.entryAdded",
  params: {
    type: text,
    level: "debug" / "info" / "warn" / "error",
    source: {
      realm: '',
      context: text,
    },
    text: text,
    timestamp: js-uint,
  },
)
```

| Parameter | Description |
| -- | -- |
| `context` | The context in which the log was created, usually either native or webview |
| `type` | One of the supported log types listed below |
| `text` | Contents of the log entry |
| `timestamp` | Timestamp of the log entry |

#### Supported Types

Event emission of all of these log types is supported for both real devices and emulators.

* `syslog`
    * Each event contains a single device `adb logcat` line
    * `level` is derived from the logcat priority of the line: `V` and `D` are reported as `debug`, `I` as `info`,
      `W` as `warn`, `E` and `F` as `error`. This works for the `brief`, `process`, `tag`, `thread`, `time`
      and `threadtime` values of the [`appium:logcatFormat`](./capabilities.md#logcatformat) capability. Lines of
      the `raw` and `long` formats, and lines without a recognizable priority, are reported as `info`
    * `context` is always set to `NATIVE_APP`
    * Event emission can be disabled by setting the [`appium:skipLogcatCapture`](./capabilities.md#skiplogcatcapture)
      capability
* `server`
    * Each event contains a single Appium server log line
    * `context` is always set to `NATIVE_APP`
    * Events are only emitted if the [`get_server_logs`](./insecure-features.md#get_server_logs)
      insecure feature is enabled

#### Usage

Start the session with the `webSocketUrl` capability set to `true` and subscribe to the `log.entryAdded` event
(or to the whole `log` module). The driver only emits the event while a client is subscribed to it. The events
arrive over the BiDi connection of the session, so there is no need for direct access to the host and port of
the Appium server.

=== "Java"

    ```java
    // Requires the java-client-selenium-bridge artifact, see
    // https://github.com/appium/java-client/blob/master/docs/selenium-bridge.md
    var driver = new AndroidDriver(serverUrl, options.enableBiDi());
    var selenium = SeleniumBridge.asRemoteWebDriver(driver);
    try (var logInspector = new LogInspector(selenium)) {
        logInspector.onLog(entry -> System.out.println(entry.getText()));
        // ... run the test
    } finally {
        selenium.closeBiDi();
    }
    ```

### `appium:mediaStream.started`

Indicates that a stream started by [`mobile: startMediaStream`](./execute-methods.md#mobile-startmediastream)
is producing output. All the `appium:mediaStream.*` events are only emitted while a client is subscribed
to the event or to the whole `appium:mediaStream` module. They are not emitted at all for a stream that
fails to start.

A video stream sends this event when the encoder reports its configuration, just before the execute
method returns. A JPEG stream sends it right after it starts.

Available since driver version 9.2.0.

```cddl
appium:mediaStream.started = (
  context: text,
  method: "appium:mediaStream.started",
  params: {
    streamId: text,
    kind: "video" / "jpeg",
    tracks: [+ ("video" / "audio" / "jpeg")],
    codec: "h264" / "hevc" / "jpeg",
    event: "appium:mediaStream",
    ? width: js-uint,
    ? height: js-uint,
    ? audio: {sampleRate: js-uint, channels: js-uint},
  },
)
```

### `appium:mediaStream.units`

Carries the media data of a stream.

Available since driver version 9.2.0.

```cddl
appium:mediaStream.units = (
  context: text,
  method: "appium:mediaStream.units",
  params: {
    streamId: text,
    units: [+ {
      track: "video" / "audio" / "jpeg",
      seq: js-uint,
      ts: js-uint,
      key: bool,
      data: text,
    }],
    dropped: js-uint,
  },
)
```

| Parameter | Description |
| -- | -- |
| `track` | `video`, `audio` or `jpeg`. Each event holds units of a single track. |
| `seq` | Sequence number of the unit, counted per track |
| `ts` | Timestamp in microseconds, on one clock shared by all the tracks of a stream |
| `key` | Whether this is a video keyframe. Always `true` for audio and JPEG units |
| `data` | Base64-encoded data of the unit |
| `dropped` | The number of units that were skipped for a slow client before this event. It is advisory. |

Video units are Annex-B H.264/HEVC. The codec configuration (SPS/PPS/VPS) is prepended to every keyframe
and is never sent separately, so a client can start decoding at any keyframe. A keyframe always starts a
new event. Audio units are ADTS AAC-LC frames (44.1 kHz, mono), and a JPEG unit is a complete frame.

Video units are held back until a keyframe arrives after the subscription started, and the driver asks the
device for one when a client subscribes late (if the Settings app supports it). If a client cannot keep up with the stream, Appium skips video
units until the next keyframe and delivers audio units reliably.

### `appium:mediaStream.formatChanged`

Indicates that the frame size of a stream has changed. For a video stream this happens after the device
rotates, and the events with the units of the previous size are always delivered before it. A JPEG stream
sends it with the first frame and whenever the size changes. The `width` and `height` are omitted if the size
is not known.

Available since driver version 9.2.0.

```cddl
appium:mediaStream.formatChanged = (
  context: text,
  method: "appium:mediaStream.formatChanged",
  params: {
    streamId: text,
    ? width: js-uint,
    ? height: js-uint,
  },
)
```

### `appium:mediaStream.ended`

Indicates that a stream has ended, for any reason.

Available since driver version 9.2.0.

```cddl
appium:mediaStream.ended = (
  context: text,
  method: "appium:mediaStream.ended",
  params: {
    streamId: text,
    reason: text,
  },
)
```

The `reason` is `stopped` if the stream was stopped by [`mobile: stopMediaStream`](./execute-methods.md#mobile-stopmediastream),
`session ended` if the session was deleted, `ended` if the device ended the stream, or `error: <message>`.

### `appium:uiautomator2.contextUpdated`

Indicates a change in the current Appium context.

This event is emitted upon context change, either explicit or implicit. It is also emitted at the
start of a new session.

See the [GitHub feature ticket](https://github.com/appium/appium/issues/20741) for more details.

Available since driver version 3.9.5.

#### Event Type (CDDL)

```cddl
appium:uiautomator2.contextUpdated = (
  method: "appium:uiautomator2.contextUpdated",
  params: {
    name: text,
    type: "NATIVE" / "WEB",
  },
)
```

| Parameter | Description |
| -- | -- |
| `name` | The name of the new context |
| `type` | The type of the currently active context. Supported values are `NATIVE` or `WEB`. |
