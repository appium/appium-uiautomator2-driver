---
title: Capability Set Examples
---

This article describes necessary capabilities that must be provided in order to implement some
common automation testing scenarios. It only describes very minimum sets of capabilities required
to be included. For refined setups more of them might need to be provided. Check the
[Capabilities](../reference/capabilities.md) reference for more details on each option available for
the fine-tuning of UiAutomator2 driver sessions.

## Application File (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:udid": "<Phone_ID>",
  "appium:app": "/path/to/local/package.apk"
}
```

[`appium:app`](../reference/capabilities.md#app) can also be a remote app or an archive:

```
  "appium:app": "https://example.com/package.apk"
  "appium:app": "https://example.com/package.zip"
```

Sometimes it might also be necessary to explicitly provide the [`appium:appPackage`](../reference/capabilities.md#apppackage)
and [`appium:appActivity`](../reference/capabilities.md#appactivity) capabilities, in case the
driver is unable to autodetect them from the provided app package manifest. Refer to the
[Activity Startup](./activity-startup.md) guide for more details.

Similarly, some scenarios may require [`appium:platformVersion`](../reference/capabilities.md#platformname)
to be explicitly specified.

## Application File (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>",
  "appium:app": "/path/to/local/package.apk"
}
```

`appium:app` can also be a remote app or an archive:

```
  "appium:app": "https://example.com/package.apk"
```

## Chrome (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "browserName": "Chrome",
  "appium:udid": "<Phone_ID>"
}
```

## Chrome (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "browserName": "Chrome",
  "appium:avd": "<Emulator_Name>"
}
```

## Pre-Installed App (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:udid": "<Phone_ID>",
  "appium:appPackage": "<App_Package_Id>",
  "appium:appActivity": "<App_Activity_Id>",
  "appium:noReset": true
}
```

The [`appium:noReset`](../reference/capabilities.md#noreset) capability is set to `true` in order
to tell the driver that the app identified by `appium:appPackage` is already preinstalled and must
not be reset.

## Pre-Installed App (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>",
  "appium:appPackage": "<App_Package_Id>",
  "appium:appActivity": "<App_Activity_Id>",
  "appium:noReset": true
}
```

## Custom Launch (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:udid": "<Phone_ID>"
}
```

This will start the session at the Android Home screen. Afterwards it is possible to use
application management methods like [`mobile: installApp`](../reference/execute-methods.md#mobile-installapp)
or [`mobile: activateApp`](../reference/execute-methods.md#mobile-activateapp) to manage the app
lifecycle.

## Custom Launch (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>"
}
```
