---
title: Activity Startup
---

> The `Activity` class is a crucial component of an Android app, and the way activities are launched and put together is a fundamental part of the platform's application model. Unlike programming paradigms in which apps are launched with a `main` method, the Android system initiates code in an `Activity` instance by invoking specific callback methods that correspond to specific stages of its lifecycle.
>
> &copy; [Android Developer Documentation](https://developer.android.com/guide/components/activities/intro-activities)

The UiAutomator2 driver needs to know package and activity names in order to properly initialize the
application under test. This information is expected to be provided in session capabilities.

## Startup Capabilities

The driver supports multiple activity startup-related capabilities:

- [`appium:appActivity`](../reference/capabilities.md#appactivity): main application activity name
- [`appium:appPackage`](../reference/capabilities.md#apppackage): application package ID
- [`appium:appWaitActivity`](../reference/capabilities.md#appwaitactivity): application activity
  name to wait for/which starts the first
- [`appium:appWaitPackage`](../reference/capabilities.md#appwaitpackage): application package ID to
  wait for/which starts the first
- [`appium:appWaitDuration`](../reference/capabilities.md#appwaitduration): maximum duration to wait
  until `appWaitActivity` is focused
- [`appium:appWaitForLaunch`](../reference/capabilities.md#appwaitforlaunch): whether to wait until Activity Manager returns the control to the calling process

All of these capabilities are optional. If they are not set explicitly, the driver tries to
auto-detect them by reading their values from the manifest of the APK file specified using the
[`appium:app`](../reference/capabilities.md#app) capability.

If the application under test is supposed to be already installed on the device, then at least the
`appium:appActivity` and `appium:appPackage` capabilities must be set, since no package manifest is
available in such case.

For more details, check the implementation of the `packageAndLaunchActivityFromManifest` method in
the [`appium-adb`](https://github.com/appium/appium-android/blob/main/packages/adb/lib/tools/android-manifest.ts)
package.

## How UiAutomator2 Starts Activities

1. Activities are started by [Call Activity Manager](https://developer.android.com/tools/adb#am)
2. UiAutomator2 tries to start the specified `appium:appPackage`/`appium:appActivity` combination
3. UiAutomator2 waits until the `appWaitPackage`/`appWaitActivity` is focused (or the `appWaitDuration`
   timeout expires)
4. The currently focused activity name is parsed from `adb shell dumpsys window windows` command
   output (`mFocusedApp` or `mCurrentFocus` entries)

For more details, check the implementation of the `getFocusedPackageAndActivity` method in the
[`appium-adb`](https://github.com/appium/appium-android/blob/main/packages/adb/lib/tools/apk-utils.ts) package.

## Troubleshooting

Refer to the [Session Startup Issues](../troubleshooting/startup.md) guide for handling potential
issues.
