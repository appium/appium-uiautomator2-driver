---
title: Testing in Parallel
---

The UiAutomator2 driver supports running multiple sessions in parallel. This can be implemented in
two ways:

* Multiple Appium server processes with a single session each
* Single Appium server process with multiple sessions (uses less resources and ensures better
  control over running sessions)

Note that a single device under test should only be used in one session at a time.

!!! tip

    If testing in parallel is _not_ required, consider enabling the [`--session-override`](https://appium.io/docs/en/latest/reference/cli/server/)
    Appium server flag, which ensures deletion of all existing sessions when a new one is started.

## Important Capabilities

In order to avoid issues when running parallel sessions, several capabilities should be explicitly
specified in each session, and must have a unique value among all parallel sessions: 

* [`appium:udid`](../reference/capabilities.md#udid) - for real devices
* [`appium:avd`](../reference/capabilities.md#avd) - for emulators
* [`appium:systemPort`](../reference/capabilities.md#systemport)
* [`appium:chromedriverPort`](../reference/capabilities.md#chromedriverport) - if using hybrid/webview mode
* [`appium:mjpegServerPort`](../reference/capabilities.md#mjpegserverport) - if using MJPEG streams
