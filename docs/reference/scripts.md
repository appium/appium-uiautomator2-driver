---
title: Scripts
---

Appium drivers can include scripts for executing specific actions. The scripts included in the
UiAutomator2 driver can be run as follows:

```
appium driver run uiautomator2 <script-name>
```

For more information about the `appium driver run` command, refer to [the Appium docs](https://appium.io/docs/en/latest/reference/cli/extensions/#run).

## `reset`

Uninstalls all driver-related packages (UiAutomator2 Server and Appium Settings) from all connected
devices. This can be useful after a driver update, if the packages installed on the test device(s)
remain cached with their older versions.

Available since driver version 2.12.5.

### Usage

```
appium driver run uiautomator2 reset
```
