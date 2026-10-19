---
title: Insecure Features
---

Some [insecure driver features](https://appium.io/docs/en/latest/guides/security/) are disabled by
default. They can be enabled upon launching Appium as follows:
```
appium --allow-insecure uiautomator2:<feature-name>
```
or
```
appium --relaxed-security
```

For other insecure feature names recognized by the Appium server, see
[their Appium docs reference page](https://appium.io/docs/en/latest/reference/cli/insecure-features/).

## `adb_listen_all_network`

Allows enabling the underlying `adb` instance to listen on all network interfaces using the
[`appium:adbListenAllNetwork`](./capabilities.md#adblistenallnetwork) capability.

Available since driver version 6.7.0.

## `adb_screen_streaming`

Enables broadcasting the device screen over MJPEG using the [`mobile: startScreenStreaming`](./execute-methods.md#mobile-startscreenstreaming)
execute method.

## `adb_shell`

Enables shell-related functionality for the underlying `adb` instance. Can be used in execute
methods like [`mobile: shell`](./execute-methods.md#mobile-shell).

## `chromedriver_autodownload`

Enables automatic download of a ChromeDriver binary compatible with the active webview. Only
relevant in a webview context.

Refer to the [Hybrid Mode guide](../guides/hybrid.md) for more details.

## `emulator_console`

Enables execution of Android emulator telnet console interface commands using the
[`mobile: execEmuConsoleCommand`](./execute-methods.md#mobile-execemuconsolecommand) execute
method. Not relevant for real devices.

## `get_server_logs`

Enables retrieval of Appium server logs using the [getLogEvents](https://appium.io/docs/en/latest/reference/api/appium/#getlogevents)
endpoint and the [`log.entryAdded`](./bidi.md#logentryadded) BiDi event.

## `set_stylus_handwriting`

Enables toggling the Android stylus handwriting feature using the [`mobile: setStylusHandwriting`](./execute-methods.md#mobile-setstylushandwriting)
execute method.

Available since driver version 7.1.0.
