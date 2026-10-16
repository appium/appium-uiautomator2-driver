---
title: Capabilities
---

This page lists various capabilities used and implemented by the UiAutomator2 driver. To learn more
about capabilities, refer to the [Appium documentation](https://appium.io/docs/en/latest/guides/caps/).

For other capabilities recognized by the Appium server, see
[their Appium docs reference page](https://appium.io/docs/en/latest/reference/session/caps/).

## Standard

Refer to [the W3C WebDriver documentation](https://w3c.github.io/webdriver/#capabilities)
for more information about these capabilities.

### platformName

| Name | Type | Default |
| -- | -- | -- |
| `platformName` | `string` | Not specified |

May be set to `android`. Appium is not strict about this value if the [`appium:automationName`](#automationname)
capability is provided, so feel free to assign it to any platform name required, for example, for
Selenium Grid compatibility.

### browserName

| Name | Type | Default |
| -- | -- | -- |
| `browserName` | `string` | Not specified |

If provided, the driver will try to start the test in web context mode, instead of the default
native mode. Refer to the [Hybrid Mode guide](../guides/hybrid.md) for more details. Can usually be
set to `chrome`.

Do not set this capability in combination with either [`appium:app`](#app) or [`appium:appPackage`](#apppackage).

### pageLoadStrategy

| Name | Type | Default |
| -- | -- | -- |
| `pageLoadStrategy` | `string` | `normal` |

## General

### automationName

| Name | Type | Default |
| -- | -- | -- |
| `appium:automationName` | `string` | Not specified |

Specifies the Appium driver to use. Must be set to `UiAutomator2` (case-insensitive)

## Device Under Test

### deviceName

| Name | Type | Default |
| -- | -- | -- |
| `appium:deviceName` | `string` | Not specified |

The name of the device under test. Not used to select a device under test - use [`appium:udid`](#udid)
for real devices and [`appium:avd`](#avd) for emulators.

### platformVersion

| Name | Type | Default |
| -- | -- | -- |
| `appium:platformVersion` | `string` | Not specified |

The platform version of the device under test. Used for device selection if [`appium:udid`](#udid)
or [`appium:avd`](#avd) is not provided.

### udid

| Name | Type | Default |
| -- | -- | -- |
| `appium:udid` | `string` | Not specified |

UDID of the device under test. Can be retrieved by running `adb devices`. If neither this capability
nor [`appium:avd`](#avd) is set, the driver will automatically try to use the first connected
device. Always set this capability when running parallel tests.

### skipDeviceInitialization

| Name | Type | Default |
| -- | -- | -- |
| `appium:skipDeviceInitialization` | `boolean` | `false` |

Whether to skip the device initialization phase of session creation, such as checking if the device
is available, installing the Appium Settings helper, adjusting permissions, etc... Can be useful if
a session had already been previously started, and all the device setup steps were already
completed.

### skipSettingsAppReinstall

| Name | Type | Default |
| -- | -- | -- |
| `appium:skipSettingsAppReinstall` | `boolean` | `false` |

Whether to skip installation of the Appium Settings helper application (`io.appium.settings`) upon
session start. Can be useful for environments where this application is provisioned separately.

Available since driver version 8.1.1.

### skipLogcatCapture

| Name | Type | Default |
| -- | -- | -- |
| `appium:skipLogcatCapture` | `boolean` | `false` |

Whether to skip collecting device logcat logs.

### clearDeviceLogsOnStart

| Name | Type | Default |
| -- | -- | -- |
| `appium:clearDeviceLogsOnStart` | `boolean` | `false` |

Whether device logs should be cleared upon session start. Maps to the `-c` flag of `adb logcat`.

### logcatFormat

| Name | Type | Default |
| -- | -- | -- |
| `appium:logcatFormat` | `string` | `threadtime` |

The output format of device logcat logs. Maps to the `-v` flag of `adb logcat`. Refer to
[the `logcat` documentation](https://developer.android.com/tools/logcat#outputFormat) for
supported values.

### logcatFilterSpecs

| Name | Type | Default |
| -- | -- | -- |
| `appium:logcatFilterSpecs` | `string` or `Array<string>` | Not specified |

One or more filter expressions to use for filtering device logcat output. Refer to
[the `logcat` documentation](https://developer.android.com/tools/logcat#filteringOutput)
for the format of a filter expression.

### ignoreHiddenApiPolicyError

| Name | Type | Default |
| -- | -- | -- |
| `appium:ignoreHiddenApiPolicyError` | `boolean` | `false` |

Whether to ignore failures caused by the driver automatically relaxing Android's hidden API access
policies, in order to enable access to non-SDK interfaces (such as logging). May be useful on
devices where access to these policies has been locked by its vendor.

### disableSuppressAccessibilityService

| Name | Type | Default |
| -- | -- | -- |
| `appium:disableSuppressAccessibilityService` | `boolean` | `false` |

Whether the instrumentation process should avoid suppressing accessibility services during the
session. Useful if your automated test needs these services.

### disableWindowAnimation

| Name | Type | Default |
| -- | -- | -- |
| `appium:disableWindowAnimation` | `boolean` | `true` |

Whether to disable window animations. [Google recommends disabling animations when running automated tests](https://developer.android.com/training/testing/espresso/setup#set-up-environment),
in order to avoid flakiness. The animation state is automatically restored after the session is
stopped, unless the session is ended unexpectedly, for Android 7 (Nougat / API level 25) or older.

### language

| Name | Type | Default |
| -- | -- | -- |
| `appium:language` | `string` | Not specified |

Language code to use for setting the locale of the device under test. The code should match the
`language` field for Android's [`Locale` class](https://developer.android.com/reference/java/util/Locale.html).
Must be provided together with [`appium:locale`](#locale).

The language set by this capability is also used by the [`mobile: getAppStrings`](./execute-methods.md#mobile-getappstrings)
execute method, unless explicitly overridden.

### locale

| Name | Type | Default |
| -- | -- | -- |
| `appium:locale` | `string` | Not specified |

Country code to use for setting the locale of the device under test. The code should match the
`country` field for Android's [`Locale` class](https://developer.android.com/reference/java/util/Locale.html).
Must be provided together with [`appium:language`](#language).

### localeScript

| Name | Type | Default |
| -- | -- | -- |
| `appium:localeScript` | `string` | Not specified |

Script code to use for setting the locale of the device under test. The code should match the
`script` field for Android's [`Locale` class](https://developer.android.com/reference/java/util/Locale.html).
If specified, [`appium:language`](#language) and [`appium:locale`](#locale) must also be provided.

### timeZone

| Name | Type | Default |
| -- | -- | -- |
| `appium:timeZone` | `string` | Not specified |

Value used to override the current timezone of the device. Persists until the next override. Must
be [a valid TZ identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).

Available since driver version 3.1.0.

### hideKeyboard

| Name | Type | Default |
| -- | -- | -- |
| `appium:hideKeyboard` | `boolean` | Not specified |

Whether to hide the on-screen keyboard during the session. This is achieved by [creating a custom "artificial" input method](https://developer.android.com/develop/ui/views/touch-and-input/creating-input-method).
It is recommended to use this feature only for special/exploratory cases, as it violates the way a
user normally interacts with the application under test.

If explicitly set to `false`, `adb shell ime reset` is run on session startup, which resets the
currently selected/enabled IMEs to the default ones, as if the device was initially booted with the
current locale.

Available since driver version 2.33.0.

### orientation

| Name | Type | Default |
| -- | -- | -- |
| `appium:orientation` | `string` | Not specified |

Orientation to set for the device under test upon session start. Supported values are `PORTRAIT`
and `LANDSCAPE`. Using this capability is equivalent to calling the [setAppiumOrientation](https://appium.io/docs/en/latest/reference/api/appium/#setappiumorientation) endpoint.

### gpsEnabled

| Name | Type | Default |
| -- | -- | -- |
| `appium:gpsEnabled` | `boolean` | Not specified |

Whether to enable or disable location services (GPS) upon session start. This functionality only
works reliably starting from Android 12 (S / API level 31).

### mockLocationApp

| Name | Type | Default |
| -- | -- | -- |
| `appium:mockLocationApp` | `string` | `io.appium.settings` |

Package identifier of the app to use for mocking device location. Has no effect on emulators. If
set to `null` or an empty string, Appium will skip the setup of the location mocking feature.

### skipUnlock

| Name | Type | Default |
| -- | -- | -- |
| `appium:skipUnlock` | `boolean` | Not specified |

Whether to skip automatically unlocking the device lockscreen on session startup, if one is present.
Since the unlocking process takes time, it is recommended to set this capability to `true` and
disable screen locking on the device(s) under test.

### unlockType

| Name | Type | Default |
| -- | -- | -- |
| `appium:unlockType` | `string` | Not specified |

The type of lockscreen security on the device, which can be used to unlock it. If omitted, the
driver assumes no security is used, and the screen can be unlocked without additional details.

Supported values are `pin`, `password`, and `pattern`. Must be provided together with
[`appium:unlockKey`](#unlockkey), whose value depends on the lockscreen type.

Refer to [the Device Lock/Unlock guide](../guides/unlock.md) for more details.

### unlockKey

| Name | Type | Default |
| -- | -- | -- |
| `appium:unlockKey` | `string` | Not specified |

The key used to unlock the lockscreen. The expected format depends on the value of
[`appium:unlockType`](#unlocktype), which must be provided together with this capability. If
omitted, the driver assumes no security is used, and the screen can be unlocked without additional
details.

Refer to [the Device Lock/Unlock guide](../guides/unlock.md) for more details.

### unlockStrategy

| Name | Type | Default |
| -- | -- | -- |
| `appium:unlockStrategy` | `string` | Not specified |

The approach to use for unlocking the screen. Supported values are `locksettings` and
`uiautomator`. The [`appium:unlockKey`](#unlockkey) and [`appium:unlockType`](#unlocktype) must
be provided in order for this capability to take effect.

By default, or if set to `locksettings`, unlocking is done using `adb`-based fast unlock. If set to
`uiautomator`, the unlock approach depends on the [`appium:unlockType`](#unlocktype) capability.

### unlockSuccessTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:unlockSuccessTimeout` | `integer` | `2000` |

Maximum number of milliseconds to wait until the device is unlocked.

## Emulator (AVD)

### avd

| Name | Type | Default |
| -- | -- | -- |
| `appium:avd` | `string` | Not specified |

The name of Android emulator to run the test on. The names of currently installed emulators can
be listed by running `avdmanager list avd`. If the specified emulator is not running upon starting
a session, the driver will automatically launch it.

### avdLaunchTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:avdLaunchTimeout` | `integer` | `60000` |

Maximum number in milliseconds to wait until the Android emulator has started.

### avdReadyTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:avdReadyTimeout` | `integer` | `60000` |

Maximum number of milliseconds to wait until the Android emulator has fully booted and is ready for
usage.

### avdArgs

| Name | Type | Default |
| -- | -- | -- |
| `appium:avdArgs` | `string` or `Array<string>` | Not specified |

One or more [supported command-line arguments](https://developer.android.com/studio/run/emulator-commandline)
to apply when starting the emulator. Only applied if the emulator is not already running.

### avdEnv

| Name | Type | Default |
| -- | -- | -- |
| `appium:avdEnv` | `Record<string, any>` | Not specified |

One or more [environment variables](https://developer.android.com/tools/variables) to set when
starting the emulator. Only applied if the emulator is not already running.

### isHeadless

| Name | Type | Default |
| -- | -- | -- |
| `appium:isHeadless` | `boolean` | `false` |

Whether to start the emulator in headless mode. Maps to the [`-no-window`](https://developer.android.com/studio/run/emulator-commandline)
emulator command-line argument. Only applied if the emulator is not already running.

### allowDelayAdb

| Name | Type | Default |
| -- | -- | -- |
| `appium:allowDelayAdb` | `boolean` | `true` |

Whether to wait until the emulator has finished booting before processing ADB packets. Maps to the
`-delay-adb` flag of `adb`. Requires emulator version `29.0.7` or later, running Android 9
(Pie / API level 28) or later.

Refer to [this issue](https://github.com/appium/appium/issues/14773) for more details.

### networkSpeed

| Name | Type | Default |
| -- | -- | -- |
| `appium:networkSpeed` | `string` | Not specified |

The network speed to apply to the emulator. Maps to the [`-netspeed`](https://developer.android.com/studio/run/emulator-commandline)
emulator command-line argument. Only applied if the emulator is not already running.

### injectedImageProperties

| Name | Type | Default |
| -- | -- | -- |
| `appium:injectedImageProperties` | `Record<string, Record<string, number>>` | Not specified |

Adjusts properties of the image injected using the [`mobile: injectEmulatorCameraImage`](./execute-methods.md#mobile-injectemulatorcameraimage)
execute method. If the emulator is already running, it will be restarted in order to apply the
properties.

The value of this capability is an object with the following keys. All keys and sub-keys are
optional, with the given defaults used for absent keys.

| Key | Description | Default |
| -- | -- | -- |
| `size` | Scale multipliers for X and Y axes | `{scaleX: 1, scaleY: 1}` |
| `position` | Offset coefficients for X/Y/Z axes, where 0 means centered | `{x: 0, y: 0, z: -1.5}` |
| `rotation` | Degrees of rotation for X/Y/Z axes | `{x: 0, y: 0, z: 0}` |

Available since driver version 3.6.0.

## ADB

### adbPort

| Name | Type | Default |
| -- | -- | -- |
| `appium:adbPort` | `integer` | `5037` |

Number of the port to use for starting ADB. Maps to the `-P` flag of `adb`.

### remoteAdbHost

| Name | Type | Default |
| -- | -- | -- |
| `appium:remoteAdbHost` | `string` | `localhost` |

Name of the ADB server host.  Maps to the `-H` flag of `adb`.

### adbExecTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:adbExecTimeout` | `integer` | `20000` |

Maximum number of milliseconds to wait for the execution of any single ADB command.

### buildToolsVersion

| Name | Type | Default |
| -- | -- | -- |
| `appium:buildToolsVersion` | `string` | Not specified |

The version of Android build tools to use (name of a directory located at `$ANDROID_HOME/build-tools`).
By default, the driver uses the most recent available version, but it may be useful to explicitly
change this in case of any known bugs.

### allowOfflineDevices

| Name | Type | Default |
| -- | -- | -- |
| `appium:allowOfflineDevices` | `boolean` | `false` |

Whether to include offline devices in the list of devices returned by ADB.

### suppressKillServer

| Name | Type | Default |
| -- | -- | -- |
| `appium:suppressKillServer` | `boolean` | `false` |

Whether to prevent the driver from ever killing the ADB server. Can be useful if ADB is connected
wirelessly.

### adbListenAllNetwork

| Name | Type | Default |
| -- | -- | -- |
| `appium:adbListenAllNetwork` | `boolean` | `false` |

Whether to listen on all network interfaces, not only `localhost`. Maps to the `-a` flag of `adb`.
The [`adb_listen_all_network` insecure feature](./insecure-features.md#adb_listen_all_network) must
be enabled.

Available since driver version 6.7.0.

## UiAutomator2 Server

### systemPort

| Name | Type | Default |
| -- | -- | -- |
| `appium:systemPort` | `integer` | `8200` |

The port on the host machine where the UiAutomator2 server should be listening. Must be unique for
each session - see the [Testing in Parallel guide](../guides/parallel-tests.md) for details. If not
provided, Appium will try the first available port in the range `[8200, 8299]`.

On the device under test, the UiAutomator2 server port can be configured using the
[`serverPort`](./settings.md#serverport) setting.

### uiautomator2ServerInstallTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:uiautomator2ServerInstallTimeout` | `integer` | `20000` |

Maximum number of milliseconds to wait until the UiAutomator2 server application is installed on
the device under test.

### uiautomator2ServerLaunchTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:uiautomator2ServerLaunchTimeout` | `integer` | `30000` |

Maximum number of milliseconds to wait until the UiAutomator2 server application on the device
under test has started.

### uiautomator2ServerReadTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:uiautomator2ServerReadTimeout` | `integer` | `240000` |

Maximum number of milliseconds to wait for a response for a request to the UiAutomator2 server.
Must be greater than 0.

### skipServerInstallation

| Name | Type | Default |
| -- | -- | -- |
| `appium:skipServerInstallation` | `boolean` | `false` |

Whether to skip installation of the UiAutomator2 server on the device under test, along with all
other related checks. Useful for speeding up session startup if the device already has a compatible
UiAutomator2 server app installed. Note that unexpected errors may occur if the UiAutomator2 server
app is not compatible with the driver or the app under test.

### mjpegServerPort

| Name | Type | Default |
| -- | -- | -- |
| `appium:mjpegServerPort` | `integer` | Not specified |

The port on the host machine where the MJPEG screenshot streaming server should be listening. If
not specified, the MJPEG stream from the device under test is not forwarded. Can be used to connect
to the device MJPEG stream outside of the session.

On the device under test, the MJPEG server port can be configured using the
[`mjpegServerPort`](./settings.md#mjpegserverport) setting.

Refer to [the MJPEG guide](../guides/mjpeg.md) for more details.

### mjpegScreenshotUrl

| Name | Type | Default |
| -- | -- | -- |
| `appium:mjpegScreenshotUrl` | `string` | Not specified |

URL of a service that provides realtime device screenshots in MJPEG format. If provided, screenshot
retrieval will request images from this service rather than using the default screenshot mechanism.

Refer to [the MJPEG guide](../guides/mjpeg.md) for more details.

## App Management

### app

| Name | Type | Default |
| -- | -- | -- |
| `appium:app` | `string` | Not specified |

Full path to a file on the host machine, or URL to a remote location, that contains the application
under test. The app file must have either the `.apk` or `.apks` extension.

Do not set this capability in combination with [`browserName`](#browsername).

This capability is always required for driver versions 2.31.2 or earlier.

### appPackage

| Name | Type | Default |
| -- | -- | -- |
| `appium:appPackage` | `string` | Not specified |

Package identifier of the application under test. Can be provided in combination with
[`appium:app`](#app), but if only `appium:app` is provided, the package identifier is automatically
detected from the app manifest.

Do not set this capability in combination with [`browserName`](#browsername).

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### appActivity

| Name | Type | Default |
| -- | -- | -- |
| `appium:appActivity` | `string` | Not specified |

Launchable activity identifier of the application under test. If not provided, the activity is
automatically detected from either [`appium:app`](#app) or [`appium:appPackage`](#apppackage), in
that order.

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### appWaitPackage

| Name | Type | Default |
| -- | -- | -- |
| `appium:appWaitPackage` | `string` | Matches the package identifier (see [`appium:appPackage`](#apppackage)) |

Identifier of the first app package to be launched.

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### appWaitActivity

| Name | Type | Default |
| -- | -- | -- |
| `appium:appWaitActivity` | `string` | Matches the app main activity (see [`appium:appActivity`](#appactivity)) |

Identifier of the first app activity to be launched.

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### appWaitForLaunch

| Name | Type | Default |
| -- | -- | -- |
| `appium:appWaitForLaunch` | `boolean` | `true` |

When launching the app under test, whether to wait until the app has started (specifically, once
Android's Activity Manager returns control to the driver). By default, the driver always waits
up to the amount of time specified by [`appium:appWaitDuration`](#appwaitduration). Setting this
capability to `false` returns control as soon as Activity Manager successfully triggers the
activity start command.

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### appWaitDuration

| Name | Type | Default |
| -- | -- | -- |
| `appium:appWaitDuration` | `integer` | `20000` |

Maximum number of milliseconds to wait until the activity specified by [`appium:appWaitPackage`](#appwaitpackage)
and [`appium:appWaitActivity`](#appwaitactivity) has started.

Refer to the [Activity Startup guide](../guides/activity-startup.md) for more details.

### intentCategory

| Name | Type | Default |
| -- | -- | -- |
| `appium:intentCategory` | `string` | `android.intent.category.LAUNCHER` (`CATEGORY_LAUNCHER`) |

Intent category to apply when launching the app. Refer to [the Android Intent documentation](https://developer.android.com/reference/android/content/Intent)
for a list of possible values (prefixed with `CATEGORY_`).

Can also be specified using the [`mobile: startActivity`](./execute-methods.md#mobile-startactivity)
execute method.

### intentAction

| Name | Type | Default |
| -- | -- | -- |
| `appium:intentAction` | `string` | `android.intent.action.MAIN` (`ACTION_MAIN`) |

Intent action to apply when launching the app. Refer to [the Android Intent documentation](https://developer.android.com/reference/android/content/Intent)
for a list of possible values (prefixed with `ACTION_`).

Can also be specified using the [`mobile: startActivity`](./execute-methods.md#mobile-startactivity)
execute method.

### intentFlags

| <div style="width:10em">Name</div> | Type | Default |
| -- | -- | -- |
| `appium:intentFlags` | `string` | `0x10200000` (`FLAG_ACTIVITY_NEW_TASK` and `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED`) |

Intent flags to apply when launching the app. Refer to [the Android Intent documentation](https://developer.android.com/reference/android/content/Intent)
for a list of possible values (prefixed with `FLAG_`).

Can also be specified using the [`mobile: startActivity`](./execute-methods.md#mobile-startactivity)
execute method.

### optionalIntentArguments

| Name | Type | Default |
| -- | -- | -- |
| `appium:optionalIntentArguments` | `string` | Not specified |

Space-separated string of one or more intent arguments to apply to the launchable activity. The
format should be `-flag1 key1`, `-flag2 key2 value2`, or a combination like
`-flag1 key1 -flag2 key2 value2`.

### androidInstallTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:androidInstallTimeout` | `integer` | `90000` |

Maximum amount of milliseconds to wait until the application under test is installed.

### enforceAppInstall

| Name | Type | Default |
| -- | -- | -- |
| `appium:enforceAppInstall` | `boolean` | Not specified |

Whether to always reinstall the application under test, even if a newer version already exists
on the device under test.

Has no effect if either [`appium:noReset`](#noreset) or [`appium:fullReset`](#fullreset) is set.

### noReset

| Name | Type | Default |
| -- | -- | -- |
| `appium:noReset` | `boolean` | Not specified |

Whether to prevent the app from being automatically relaunched and its data cleaned before session
startup.

Mutually exclusive with [`appium:fullReset`](#fullreset).

### fullReset

| Name | Type | Default |
| -- | -- | -- |
| `appium:fullReset` | `boolean` | `false` |

Whether to always reinstall the app before session startup, and uninstall it after deleting the
session.

Mutually exclusive with [`appium:noReset`](#noreset).

### dontStopAppOnReset

| Name | Type | Default |
| -- | -- | -- |
| `appium:dontStopAppOnReset` | `boolean` | Not specified |

Whether to skip termination of the app under test upon session deletion, as well as upon session
start, in case the app is already running.

### autoLaunch

| Name | Type | Default |
| -- | -- | -- |
| `appium:autoLaunch` | `boolean` | `true` |

Whether to launch the application under test on session start, and wait until it is ready.

### forceAppLaunch

| Name | Type | Default |
| -- | -- | -- |
| `appium:forceAppLaunch` | `boolean` | Not specified |

Whether to relaunch the app upon session startup even if [`appium:noReset`](#noreset) is set.

Available since driver version 2.12.0.

### shouldTerminateApp

| Name | Type | Default |
| -- | -- | -- |
| `appium:shouldTerminateApp` | `boolean` | Not specified |

Whether to stop the app upon session deletion even if [`appium:noReset`](#noreset) is set.

Available since driver version 2.14.0.

### autoGrantPermissions

| Name | Type | Default |
| -- | -- | -- |
| `appium:autoGrantPermissions` | `boolean` | Not specified |

Whether to automatically grant all requested application permissions upon session startup.

If the `targetSdk` of the application under test is below `23`, or the device under test is running
Android 5 (Lollipop / API level 22), granting permissions requires the application to be
reinstalled, for example, using the [`appium:fullReset`](#fullreset) capability.

If the application requires some special security permissions (e.g. access to notifications or
media recording), they can be changed using the [`mobile: changePermissions`](./execute-methods.md#mobile-changepermissions)
execute method with `appops` target.

### userProfile

| Name | Type | Default |
| -- | -- | -- |
| `appium:userProfile` | `integer` | Not specified |

Identifier of a [user profile](https://source.android.com/devices/tech/admin/multi-user) used when
launching the app under test. By default, the app is launched using the currently active user.

### otherApps

| Name | Type | Default |
| -- | -- | -- |
| `appium:otherApps` | `string` or `Array<string>` | Not specified |

One or more application packages (either filepaths on the host machine, or URLs to remote locations)
that should be installed on the device along with the application under test. The app files must
have either the `.apk` or `.apks` extension.

### uninstallOtherPackages

| Name | Type | Default |
| -- | -- | -- |
| `appium:uninstallOtherPackages` | `string` or `Array<string>` | Not specified |

One or more package identifiers to be uninstalled from the device upon session startup. Always
excludes packages required by the driver (`io.appium.settings`, `io.appium.uiautomator2.server`,
and `io.appium.uiautomator2.server.test`).

### allowTestPackages

| Name | Type | Default |
| -- | -- | -- |
| `appium:allowTestPackages` | `boolean` | Not specified |

Whether to allow installation of test-only versions of the application under test. Maps to the `-t`
flag of `adb install`. Only applied if the application is to be installed or reinstalled.

### remoteAppsCacheLimit

| Name | Type | Default |
| -- | -- | -- |
| `appium:remoteAppsCacheLimit` | `integer` | `10` |

Maximum number of application packages to be cached on the device under test. Primarily needed for
devices that don't support streamed installs (Android 7 and below), which require `adb` to push
each installable package to the device first, requiring additional time.

If set to `0`, the cache is disabled.

## App Signing

### useKeystore

| Name | Type | Default |
| -- | -- | -- |
| `appium:useKeystore` | `boolean` | Not specified |

Whether to use a custom [keystore](https://developer.android.com/studio/publish/app-signing#certificates-keystores)
to sign the app under test. By default, apps are signed with the default Appium debug certificate,
unless [`appium:noSign`](#nosign) is used.

Used in combination with [`appium:keystorePath`](#keystorepath), [`appium:keystorePassword`](#keystorepassword),
[`appium:keyAlias`](#keyalias) and [`appium:keyPassword`](#keypassword).

### keystorePath

| Name | Type | Default |
| -- | -- | -- |
| `appium:keystorePath` | `string` | Not specified |

Full path to the keystore file on the server filesystem.

Used in combination with [`appium:useKeystore`](#usekeystore), [`appium:keystorePassword`](#keystorepassword),
[`appium:keyAlias`](#keyalias) and [`appium:keyPassword`](#keypassword).

### keystorePassword

| Name | Type | Default |
| -- | -- | -- |
| `appium:keystorePassword` | `string` | Not specified |

Password of the keystore file specified by [`appium:keystorePath`](#keystorepath).

Used in combination with [`appium:useKeystore`](#usekeystore), [`appium:keystorePath`](#keystorepath),
[`appium:keyAlias`](#keyalias) and [`appium:keyPassword`](#keypassword).

### keyAlias

| Name | Type | Default |
| -- | -- | -- |
| `appium:keyAlias` | `string` | Not specified |

Alias of the key in the keystore file specified by [`appium:keystorePath`](#keystorepath).

Used in combination with [`appium:useKeystore`](#usekeystore), [`appium:keystorePath`](#keystorepath),
[`appium:keystorePassword`](#keystorepassword) and [`appium:keyPassword`](#keypassword).

### keyPassword

| Name | Type | Default |
| -- | -- | -- |
| `appium:keyAlias` | `string` | Not specified |

Password of the key in the keystore file specified by [`appium:keystorePath`](#keystorepath).

Used in combination with [`appium:useKeystore`](#usekeystore), [`appium:keystorePath`](#keystorepath),
[`appium:keystorePassword`](#keystorepassword) and [`appium:keyAlias`](#keyalias).

### noSign

| Name | Type | Default |
| -- | -- | -- |
| `appium:noSign` | `boolean` | `false` |

Whether to skip signing of the application under test, and use it as-is. By default, all apps are
signed with the default Appium debug signature.

This capability does not affect `.apks` packages, as they are expected to be already signed.

## Web Context

### autoWebview

| Name | Type | Default |
| -- | -- | -- |
| `appium:autoWebview` | `boolean` | Not specified |

Whether to automatically switch to a webview context upon session start. The name of the selected
context is derived from the application package, prefixed by `WEBVIEW_`, but can be changed using
the [`appium:autoWebviewName`](#autowebviewname) capability. 

### autoWebviewName

| Name | Type | Default |
| -- | -- | -- |
| `appium:autoWebviewName` | `string` | Not specified |

Custom name of a webview context, used to replace the application package part of the initial
webview name used by [`appium:autoWebview`](#autowebview).

Available since driver version 2.10.0.

### autoWebviewTimeout

| Name | Type | Default |
| -- | -- | -- |
| `appium:autoWebviewTimeout` | `integer` | `2000` |

Maximum number of milliseconds to wait until a webview is available before switching to it.
Has no effect unless [`appium:autoWebview`](#autowebview) is set.

### androidDeviceSocket

| Name | Type | Default |
| -- | -- | -- |
| `appium:androidDeviceSocket` | `string` | Not specified |

Name of a Chromium DevTools socket on the device under test. If set, webview discovery will only
return webviews running on this socket.

### webviewDevtoolsPort

| Name | Type | Default |
| -- | -- | -- |
| `appium:webviewDevtoolsPort` | `integer` | `10900` |

The port to use for communicating with webviews over the DevTools protocol. Must be unique for
each session - see the [Testing in Parallel guide](../guides/parallel-tests.md) for details. If not
provided, Appium will try the first available port in the range `[10900, 11000]`.

### ensureWebviewsHavePages

| Name | Type | Default |
| -- | -- | -- |
| `appium:ensureWebviewsHavePages` | `boolean` | `true` |

Whether to skip web views that have no pages from being included in the list of available contexts.
The driver uses the DevTools connection to retrieve information about existing pages.

### enableWebviewDetailsCollection

| Name | Type | Default |
| -- | -- | -- |
| `appium:enableWebviewDetailsCollection` | `boolean` | `true` |

Whether to retrieve extended webview information via DevTools. Enabling this capability improves
detection of the required ChromeDriver version.

### chromeOptions

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromeOptions` | `Record<string, any>` | Not specified |

Map of ChromeDriver options to apply. Refer to Google's [`ChromeOptions` documentation](https://developer.chrome.com/docs/chromedriver/capabilities#chromeoptions_object)
for supported values.

### chromeLoggingPrefs

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromeLoggingPrefs` | `Record<string, string>` | `{"browser": "ALL"}` |

Map of logging types to their levels that should be applied. Refer to Selenium's [Logging documentation](https://github.com/SeleniumHQ/selenium/wiki/Logging)
for supported type and level values.

### chromedriverPort

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverPort` | `integer` | Random |

The port to use for ChromeDriver communication. Must be unique for each session - see the
[Testing in Parallel guide](../guides/parallel-tests.md) for details. By default, a random free
port is used. 

### chromedriverPorts

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverPort` | `Array<number | Array<number>>` | Not specified |

List of possible ports and/or port ranges to use for ChromeDriver communication, for example,
`[5600, 5610, [5650, 5660]]`. An error is thrown if all specified ports are busy. 

### chromedriverArgs

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverArgs` | `Array<string>` | Not specified |

List of command line switches to apply to ChromeDriver. Refer to the links in
[Selenium's Chrome documentation](https://www.selenium.dev/documentation/webdriver/browsers/chrome/#arguments)
for more details on supported switches. Note that not all desktop Chrome switches are available on
mobile.

### chromedriverExecutable

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverExecutable` | `string` | Not specified |

Custom path to a ChromeDriver executable on the host file system. Takes priority over
[`appium:chromedriverExecutableDir`](#chromedriverexecutabledir).

Refer to the [Managing ChromeDriver guide](../guides/hybrid.md#managing-chromedriver) for more
details.

### chromedriverExecutableDir

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverExecutableDir` | `string` | See below |

Custom path to a directory on the host file system, containing ChromeDriver executables. If
automatic ChromeDriver download is enabled, this folder is also used to store the downloaded
executables.

The default value is `node_modules/appium-chromedriver/chromedriver/<host os>` in the driver's
installation directory.

Refer to the [Managing ChromeDriver guide](../guides/hybrid.md#managing-chromedriver) for more
details.

### chromedriverChromeMappingFile

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverExecutableDir` | `string` | See below |

Custom path to a JSON file containing a mapping of webview/browser versions to the ChromeDriver
versions that are capable of automating them, similarly to the following:

```json
{
  "2.42": "63.0.3239",
  "2.41": "62.0.3202"
}
```

The default value is `node_modules/appium-chromedriver/config/mapping.json` in the driver's
installation directory.

Refer to the [Managing ChromeDriver guide](../guides/hybrid.md#managing-chromedriver) for more
details.

### chromedriverUseSystemExecutable

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverUseSystemExecutable` | `boolean` | `false` |

Whether to use the ChromeDriver binary bundled with the driver.

This capability is primarily relevant for driver versions 3.7.11 or earlier, which automatically
downloaded ChromeDriver upon installation.

### chromedriverDisableBuildCheck

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverDisableBuildCheck` | `boolean` | `false` |

Whether to disable the check that requires ChromeDriver and the browser executable to have matching
versions. Maps to the `--disable-build-check` flag of the ChromeDriver binary.

### chromedriverForwardBiDi

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverForwardBiDi` | `boolean` | `false` |

Whether to automatically forward the ChromeDriver BiDi web socket to the UiAutomator2 driver web
socket. This allows sending browser-specific BiDi commands in a webview context. Switching the
session context terminates this connection. Requires the BiDi protocol to be enabled
(`webSocketUrl` capability must be `true`).

Note that older ChromeDriver versions may only have partial to no support for the BiDi protocol.

Available since driver version 6.1.0.

### chromedriverGrantPermissions

| Name | Type | Default |
| -- | -- | -- |
| `appium:chromedriverGrantPermissions` | `boolean` | `false` |

Whether to automatically grant all requested runtime permissions for the Chrome/webview package,
so that the session is not interrupted by any native runtime permission dialogs.

Available since driver version 8.1.0.

### recreateChromeDriverSessions

| Name | Type | Default |
| -- | -- | -- |
| `appium:recreateChromeDriverSessions` | `boolean` | `false` |

Whether the driver should kill the ChromeDriver session upon switching to native context and
recreate it upon switching back, instead of merely suspending it.

### nativeWebScreenshot

| Name | Type | Default |
| -- | -- | -- |
| `appium:nativeWebScreenshot` | `boolean` | `false` |

Whether to use the screenshoting endpoint provided by the UI Automator framework instead of the one
provided by ChromeDriver. Can be useful if experiencing issues with the latter.

### extractChromeAndroidPackageFromContextName

| Name | Type | Default |
| -- | -- | -- |
| `appium:extractChromeAndroidPackageFromContextName` | `boolean` | `false` |

Whether to instruct ChromeDriver to attach to the Android package included in the context name,
rather than the package of the application under test.

### showChromedriverLog

| Name | Type | Default |
| -- | -- | -- |
| `appium:showChromedriverLog` | `boolean` | `false` |

Whether to include ChromeDriver logs in Appium server logs.
