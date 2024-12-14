# Supported BiDi Commands And Events

Only events and commands mentioned below are supported.
All other entities described in the spec throw not implemented errors.

# Supported Events

## log.entryAdded

This event is emitted if the driver retrieves a new entry for any of the below log types.

### syslog

Events are emitted for both emulator and real devices. Each event contains a single device logcat line.
Events are always emitted with the `NATIVE_APP` context.
These events might be disabled if the `appium:skipLogcatCapture` capability is enabled.

### server

Events are emitted for both emulator and real devices. Each event contains a single Appium server log line.
Events are always emitted with the `NATIVE_APP` context.
Events are only emitted if the `get_server_logs` server security feature is enabled.

## appium:uiautomator2.contextUpdate

This event is emitted upon the context change, either explicit or implicit.
The event is always emitted upon new session initialization.
See the [GitHub feature ticket](https://github.com/appium/appium/issues/20741) for more details.

### CDDL

```cddl
appium:uiautomator2.contextUpdated = {
  method: "appium:uiautomator2.contextUpdated",
  params: {
    name: text,
    type: "NATIVE" / "WEB",
  },
}
```

The event contains the following params:

### name

Contains the actual name of the new context, for example `NATIVE_APP`.

### type

Either `NATIVE` or `WEB` depending on which context is currently active in the driver session.
