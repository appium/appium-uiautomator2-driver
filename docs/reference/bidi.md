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
    * `context` is always set to `NATIVE_APP`
    * Event emission can be disabled by setting the [`appium:skipLogcatCapture`](./capabilities.md#skiplogcatcapture)
      capability
* `server`
    * Each event contains a single Appium server log line
    * `context` is always set to `NATIVE_APP`
    * Events are only emitted if the [`get_server_logs`](./insecure-features.md#get_server_logs)
      insecure feature is enabled

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
