## Basic Examples of Session Capability Sets

This article describes necessary capabilities that must be provided in order
to implement some common automation testing scenarios.
It only describes very minimum sets of capabilities required to
be included. For refined setups more of them might need to be provided. Check the
[Capabilities](../README.md#capabilities) section in README for more details
on each option available for the fine-tuning of UIAutomator2 driver sessions.

### Application File (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:platformVersion": "<Android_Version>",
  "appium:udid": "<Phone_ID>",
  "appium:app": "/path/to/local/package.apk"
}
```

`appium:app` could also be a remote app or an archive:

```
  "appium:app": "https://example.com/package.apk"
  "appium:app": "https://example.com/package.zip"
```

Sometimes it might also be necessary to explicitly provide
`appium:appPackage` and `appium:appActivity` capability values
if the driver is unable to autodetect them from the provided app package manifest.
Check the [How To Troubleshoot Activities Startup](./activity-startup.md) article
for more details.

### Application File (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>",
  "appium:platformVersion": "<Android_Version>",
  "appium:app": "/path/to/local/package.apk"
}
```

`appium:app` could also be a remote app or an archive:

```
  "appium:app": "https://example.com/package.apk"
```

### Chrome (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "browserName": "Chrome",
  "appium:platformVersion": "<Android_Version>",
  "appium:udid": "<Phone_ID>"
}
```

### Chrome (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "browserName": "Chrome",
  "appium:avd": "<Emulator_Name>",
  "appium:platformVersion": "<Android_Version>"
}
```

### Pre-Installed App (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:platformVersion": "<Android_Version>",
  "appium:udid": "<Phone_ID>",
  "appium:appPackage": "<App_Package_Id>",
  "appium:appActivity": "<App_Activity_Id>",
  "appium:noReset": true
}
```

The `appium:noReset` capability is set to `true` in order to tell the driver
the app identified by `appium:appPackage` is already preinstalled and must not be reset.

### Pre-Installed App (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>",
  "appium:platformVersion": "<Android_Version>",
  "appium:appPackage": "<App_Package_Id>",
  "appium:appActivity": "<App_Activity_Id>",
  "appium:noReset": true
}
```

### Custom Launch (Real Device)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:platformVersion": "<Android_Version>",
  "appium:udid": "<Phone_ID>"
}
```

This will start your test at the Home screen.
Afterwards you may use any of the application management
methods, like [mobile: installApp](../README.md#mobile-installapp)
or [mobile: activateApp](../README.md#mobile-activateapp)
to manage the life cycle of your app or switch between contexts to
manage web pages. Check the full list of
[mobile: execute methods](../README.md#platform-specific-extensions) for more details.

### Custom Launch (Emulator)

```json
{
  "platformName": "Android",
  "appium:automationName": "uiautomator2",
  "appium:avd": "<Emulator_Name>",
  "appium:platformVersion": "<Android_Version>"
}
```
