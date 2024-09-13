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
