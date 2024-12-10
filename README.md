# Appium UiAutomator2 Driver

[![NPM version](http://img.shields.io/npm/v/appium-uiautomator2-driver.svg)](https://npmjs.org/package/appium-uiautomator2-driver)
[![Downloads](http://img.shields.io/npm/dm/appium-uiautomator2-driver.svg)](https://npmjs.org/package/appium-uiautomator2-driver)

[![Release](https://github.com/appium/appium-uiautomator2-driver/actions/workflows/publish.js.yml/badge.svg)](https://github.com/appium/appium-uiautomator2-driver/actions/workflows/publish.js.yml)


Appium UiAutomator2 Driver is a test automation framework for Android devices. Appium UiAutomator2 Driver automates native, hybrid and mobile web apps, tested on emulators and real devices. Appium UiAutomator2 Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool. The driver operates in scope of [W3C WebDriver protocol](https://www.w3.org/TR/webdriver/) with several custom extensions to cover operating-system specific scenarios.

UiAutomator2 Driver proxies most of the commands to [UiAutomator2 server](https://github.com/appium/appium-uiautomator2-server), which uses Google's [UiAutomator](https://developer.android.com/training/testing/ui-automator) framework under the hood. Some commands are proxied directly to [appium-adb](https://github.com/appium/appium-adb) and other helpers built on top of Android platform tools.

> **Note**
>
> Since version 2.0.0 UiAutomator2 driver has dropped the support of Appium 1, and is only compatible to Appium 2.
> Use the `appium driver install uiautomator2` command to add it to your Appium 2 dist.


## Requirements

On top of standard Appium requirements UiAutomator2 driver also expects the following prerequisites:

- Windows, Linux and macOS are supported as hosts
- [Android SDK Platform tools](https://developer.android.com/studio/releases/platform-tools) must be installed. [Android Studio IDE](https://developer.android.com/studio) also provides a convenient UI to install and manage the tools.
- ANDROID_HOME or ANDROID_SDK_ROOT [environment variable](https://developer.android.com/studio/command-line/variables) must be set
- Java JDK must be installed and [JAVA_HOME](https://www.baeldung.com/java-home-on-windows-7-8-10-mac-os-x-linux) environment variable must be set. Android SDK below API 30 requires Java 8. Android SDK 30 and above requires Java 9 or newer.
- [Emulator](https://developer.android.com/studio/run/managing-avds) platform image must be installed if you plan to run your tests on it. [Android Studio IDE](https://developer.android.com/studio) also provides a convenient UI to install and manage emulators.
- Real Android devices must have [USB debugging enabled](https://developer.android.com/studio/debug/dev-options) and should be visible as `online` in `adb devices -l` output.
- The minimum version of Android API must be 5.0 (API level 21) (6.0 is recommended as version 5 has some known compatibility issues).

### Doctor

Since driver version 2.39.0 you can automate the validation for the most of the above
requirements as well as various optional ones needed by driver extensions by running the
`appium driver doctor uiautomator2` server command.

## Capabilities

### General

Capability Name | Description
--- | ---
platformName | Could be set to `android`. Appium itself is not strict about this capability value if `automationName` is provided, so feel free to assign it to any supported platform name if this is needed, for example, to make Selenium Grid working.
appium:automationName | Must always be set to `uiautomator2`. Values of `automationName` are compared case-insensitively.
appium:deviceName | The name of the device under test (actually, it is not used to select a device under test). Consider setting `udid` for real devices and `avd` for emulators instead
appium:platformVersion | The platform version of an emulator or a real device. This capability is used for device autodetection if `udid` is not provided
appium:udid | UDID of the device to be tested. Could be retrieved from `adb devices -l` output. If unset then the driver will try to use the first connected device. Always set this capability if you run parallel tests.
appium:noReset | Prevents the device to be reset before the session startup if set to `true`. This means that the application under test is not going to be terminated neither its data cleaned. `false` by default
appium:fullReset | Being set to `true` always enforces the application under test to be fully uninstalled before starting a new session. `false` by default
appium:printPageSourceOnFindFailure | Enforces the server to dump the actual XML page source into the log if any error happens. `false` by default.

### Driver/Server

Capability Name | Description
--- | ---
appium:systemPort | The number of the port on the host machine used for the UiAutomator2 server. By default the first free port from 8200..8299 range is selected. It is recommended to set this value if you are running [parallel tests](#parallel-tests) on the same machine.
appium:skipServerInstallation | Skip the UiAutomator2 Server component installation on the device under test and all the related checks if set to `true`. This could help to speed up the session startup if you know for sure the correct server version is installed on the device. In case the server is not installed or an incorrect version of it is installed then you may get an unexpected error later. `false` by default
appium:uiautomator2ServerLaunchTimeout | The maximum number of milliseconds to wait util UiAutomator2Server is listening on the device. `30000` ms by default
appium:uiautomator2ServerInstallTimeout | The maximum number of milliseconds to wait util UiAutomator2Server is installed on the device. `20000` ms by default
appium:uiautomator2ServerReadTimeout | The maximum number of milliseconds to wait for a HTTP response from UiAutomator2Server. Only values greater than zero are accepted. If the given value is too low then expect driver commands to fail with `timeout of Xms exceeded` error. `240000` ms by default
appium:disableWindowAnimation | Whether to disable window animations when starting the instrumentation process. The animation scale will be restored automatically after the instrumentation process ends for API level 26 and higher. The animation scale could remain if the session ends unexpectedly for API level 25 and lower. `false` by default
appium:skipDeviceInitialization | If set to `true` then device startup checks (whether it is ready and whether Settings app is installed) will be canceled on session creation. Could speed up the session creation if you know what you are doing. `false` by default

### App

Capability Name | Description
--- | ---
appium:app | Full path to the application to be tested (the app must be located on the same machine where the server is running). Both `.apk` and `.apks` application extensions are supported. Could also be an URL to a remote location. If neither of the `app`, `appPackage` or `browserName` capabilities are provided then the driver starts from the Dashboard and expects the test knows what to do next. Do not provide both `app` and `browserName` capabilities at once.
browserName | The name of the browser to run the test on. If this capability is provided then the driver will try to start the test in Web context mode (Native mode is applied by default). Read [Automating hybrid apps](#hybrid-mode) for more details. Usually equals to `chrome`.
appium:appPackage | Application package identifier to be started. If not provided then UiAutomator2 will try to detect it automatically from the package provided by the `app` capability. Read [How To Troubleshoot Activities Startup](docs/activity-startup.md) for more details
appium:appActivity | Main application activity identifier. If not provided then UiAutomator2 will try to detect it automatically from the package provided by the `app` capability. Read [How To Troubleshoot Activities Startup](docs/activity-startup.md) for more details
appium:appWaitActivity | Identifier of the first activity that the application invokes. If not provided then equals to `appium:appActivity`. Read [How To Troubleshoot Activities Startup](docs/activity-startup.md) for more details
appium:appWaitPackage | Identifier of the first package that is invoked first. If not provided then equals to `appium:appPackage`. Read [How To Troubleshoot Activities Startup](docs/activity-startup.md) for more details
appium:appWaitDuration | Maximum amount of milliseconds to wait until the application under test is started (e. g. an activity returns the control to the caller). `20000` ms by default. Read [How To Troubleshoot Activities Startup](docs/activity-startup.md) for more details
appium:androidInstallTimeout | Maximum amount of milliseconds to wait until the application under test is installed. `90000` ms by default
appium:appWaitForLaunch | Whether to block until the app under test returns the control to the caller after its activity has been started by Activity Manager (`true`, the default value) or to continue the test without waiting for that (`false`).
appium:intentCategory | Set an optional intent category to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am). Defaults to `android.intent.category.LAUNCHER`. Please use [mobile:startActivity](#mobile-startactivity) in case you don't set an explicit value.
appium:intentAction | Set an optional intent action to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am). Dfaults to `android.intent.action.MAIN`. Please use [mobile:startActivity](#mobile-startactivity) in case you don't set an explicit value.
appium:intentFlags | Set an optional intent flags to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am). Defaults to `0x10200000` (FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_RESET_TASK_IF_NEEDED flags). Please use [mobile:startActivity](#mobile-startactivity) in case you don't set an explicit value.
appium:optionalIntentArguments | Set an optional intent arguments to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am)
appium:dontStopAppOnReset | Set it to `true` if you don't want the application to be restarted if it was already running. If `appium:noReset` is falsy, then the app under test is going to be restarted if either this capability is falsy (the default behavior) or `appium:forceAppLaunch` is set to `true`. `false` by default
appium:forceAppLaunch | Set it to `true` if you want the application under test to be always forcefully restarted on session startup even if `appium:noReset` is `true`, and the app was already running. If `noReset` is falsy, then the app under test is going to be restarted if either this capability set to `true` or `appium:dontStopAppOnReset` is falsy (the default behavior). `false` by default. Available since driver version 2.12
appium:shouldTerminateApp | Set it to `true` if you want the application under test to be always terminated on session end even if `appium:noReset` is `true`. If `noReset` is falsy, then the app under test is going to be terminated if `appium:dontStopAppOnReset` is also falsy (the default behavior). `false` by default
appium:autoLaunch | Whether to launch the application under test automatically (`true`, the default value) after a test starts
appium:autoGrantPermissions | Whether to grant all the requested application permissions automatically when a test starts(`true`). The targetSdkVersion in the application manifest must be greater or equal to 23 and the Android version on the device under test must be greater or equal to Android 6 (API level 23) to grant permissions. Applications whose targetSdkVersion is lower than or equal to 22 must be reinstalled to grant permissions, for example, by setting the `appium:fullReset` capability as `true` for Android 6+ devices. If your app needs some special security permissions, like access to notifications or media recording, consider using [mobile: changePermissions](#mobile-changepermissions) extension with `appops` target. `false` by default
appium:otherApps | Allows to set one or more comma-separated paths to Android packages that are going to be installed along with the main application under test. This might be useful if the tested app has dependencies
appium:uninstallOtherPackages | Allows to set one or more comma-separated package identifiers to be uninstalled from the device before a test starts
appium:allowTestPackages | If set to `true` then it would be possible to use packages built with the test flag for the automated testing (literally adds `-t` flag to the `adb install` command). `false` by default
appium:remoteAppsCacheLimit | Sets the maximum amount of application packages to be cached on the device under test. This is needed for devices that don't support streamed installs (Android 7 and below), because ADB must push app packages to the device first in order to install them, which takes some time. Setting this capability to zero disables apps caching. `10` by default.
appium:enforceAppInstall | If set to `true` then the application under test is always reinstalled even if a newer version of it already exists on the device under test. This capability has no effect if `appium:noReset` is set to `true`. `false` by default

### App Localization

Capability Name | Description
--- | ---
appium:localeScript | Canonical name of the locale to be set for the app under test, for example `Hans` in `zh-Hans-CN`. See https://developer.android.com/reference/java/util/Locale.html for more details.
appium:language | Name of the language to extract application strings for. Strings are extracted for the current system language by default. Also sets the language for the app under test. See https://developer.android.com/reference/java/util/Locale.html for more details. If `language` is provided then `locale` is also required to be set. The combination of both capability values must be a known locale and should be present in the list of available locales returned by the ICU's [getAvailableULocales()](https://unicode-org.github.io/icu/userguide/locale/#usage-retrieving-locales) method. The full list of supported locales is also dumped into the logcat output on failure. Example: `en`, `ja`
appium:locale | Sets the locale for the app under test. See https://developer.android.com/reference/java/util/Locale.html for more details. If `locale` is provided then `language` is also required to be set. The combination of both capability values must be a known locale and should be present in the list of available locales returned by the ICU's [getAvailableULocales()](https://unicode-org.github.io/icu/userguide/locale/#usage-retrieving-locales) method. The full list of supported locales is also dumped into the logcat output on failure. Example: `US`, `JP`

### ADB

Capability Name | Description
--- | ---
appium:adbPort | Number of the port on the host machine where ADB is running. `5037` by default
appium:remoteAdbHost | Address of the host where ADB is running (the value of `-H` ADB command line option). Unset by default
appium:adbExecTimeout | Maximum number of milliseconds to wait until single ADB command is executed. `20000` ms by default
appium:clearDeviceLogsOnStart | If set to `true` then UiAutomator2 deletes all the existing logs in the device buffer before starting a new test
appium:buildToolsVersion | The version of Android build tools to use. By default UiAutomator2 driver uses the most recent version of build tools installed on the machine, but sometimes it might be necessary to give it a hint (let say if there is a known bug in the most recent tools version). Example: `28.0.3`
appium:skipLogcatCapture | Being set to `true` disables automatic logcat output collection during the test run. `false` by default
appium:suppressKillServer | Being set to `true` prevents the driver from ever killing the ADB server explicitly. Could be useful if ADB is connected wirelessly. `false` by default
appium:ignoreHiddenApiPolicyError | Being set to `true` ignores a failure while changing hidden API access policies to [enable access to non-SDK interfaces](https://developer.android.com/guide/app-compatibility/restrictions-non-sdk-interfaces#how_can_i_enable_access_to_non-sdk_interfaces). Could be useful on some devices, where access to these policies has been locked by its vendor. `false` by default.
appium:hideKeyboard | Being set to `true` hides the on-screen keyboard while the session is running. Use it instead of the legacy `appium:unicodeKeyboard` one (which will be dropped in the future). This effect is achieved by assigning a custom "artificial" [input method](https://developer.android.com/develop/ui/views/touch-and-input/creating-input-method). Only use this feature for special/exploratory cases as it violates the way your application under test is normally interacted with by a human. Setting this capability explicitly to `false` enforces `adb shell ime reset` call on session startup, which resets the currently selected/enabled IMEs to the default ones as if the device is initially booted with the current locale. `undefined` by default.
appium:mockLocationApp | Sets the package identifier of the app, which is used as a system mock location provider since Appium 1.18.0+. This capability has no effect on emulators. If the value is set to `null` or an empty string, then the driver will reset the mocked location provider, e.g. the location won't be mocked anymore. Defaults to Appium Setting package identifier (`io.appium.settings`). Termination of a mock location provider application resets the mocked location data.
appium:logcatFormat | The log print format, where `format` is one of: `brief` `process` `tag` `thread` `raw` `time` `threadtime` `long`. `threadtime` is the default value.
appium:logcatFilterSpecs | Series of `tag[:priority]` where `tag` is a log component tag (or * for all) and priority is: `V    Verbose`, `D    Debug`, `I    Info`, `W    Warn`, `E    Error`, `F    Fatal`, `S    Silent (supress all output)`. '*' means '*:d' and `tag` by itself means `tag:v`. If not specified on the commandline, filterspec is set from ANDROID_LOG_TAGS. If no filterspec is found, filter defaults to '*:I'.
appium:allowDelayAdb | Being set to `false` prevents emulator to use `-delay-adb` feature to detect its startup. See https://github.com/appium/appium/issues/14773 for more details.

### Emulator (Android Virtual Device)

Capability Name | Description
--- | ---
appium:avd | The name of Android emulator to run the test on. The names of currently installed emulators could be listed using `avdmanager list avd` command. If the emulator with the given name is not running then it is going to be launched on automated session startup.
appium:avdLaunchTimeout | Maximum number of milliseconds to wait until Android Emulator is started. `60000` ms by default
appium:avdReadyTimeout | Maximum number of milliseconds to wait until Android Emulator is fully booted and is ready for usage. `60000` ms by default
appium:avdArgs | Either a string or an array of emulator [command line arguments](https://developer.android.com/studio/run/emulator-commandline). If arguments contain the `-wipe-data` one then the emulator is going to be killed on automated session startup in order to wipe its data.
appium:avdEnv | Mapping of emulator [environment variables](https://developer.android.com/studio/command-line/variables).
appium:networkSpeed | Sets the desired network speed limit for the emulator. It is only applied if the emulator is not running before the test starts. See emulator [command line arguments](https://developer.android.com/studio/run/emulator-commandline) description for more details.
appium:gpsEnabled | Sets whether to enable (`true`) or disable (`false`) GPS service in the Emulator. Unset by default, which means to not change the current value
appium:isHeadless | If set to `true` then emulator starts in headless mode (e.g. no UI is shown). It is only applied if the emulator is not running before the test starts. `false` by default.
appium:injectedImageProperties | Allows adjusting of injected image properties, like size, position or rotation. The image itself is expected to be injected by [mobile: injectEmulatorCameraImage](#mobile-injectemulatorcameraimage) extension. It is also mandatory to provide this capability if you are going to use the injection feature on a newly created/resetted emulator as it __enforces emulator restart__, so it could properly reload the modified image properties. The value itself is a map, where possible keys are `size`, `position` and `rotation`. All of them are optional. If any of values is not provided then the following defaults are used: `{size: {scaleX: 1, scaleY: 1}, position: {x: 0, y: 0, z: -1.5}, rotation: {x: 0, y: 0, z: 0}}`. The `size` value contains scale multipliers for X and Y axes. The `position` contains normalized coefficients for X/Y/Z axes, where `0` means it should be centered in the viewport. Values in the `rotation` are measured in degrees respectively for X, Y and Z axis. The capability is available since the driver version 3.6.0.

### App Signing

Capability Name | Description
--- | ---
appium:useKeystore | Whether to use a custom keystore to sign the app under test. `false` by default, which means apps are always signed with the default Appium debug certificate (unless canceled by `noSign` capability). This capability is used in combination with `keystorePath`, `keystorePassword`, `keyAlias` and `keyPassword` capabilities.
appium:keystorePath | The full path to the keystore file on the server filesystem. This capability is used in combination with `useKeystore`, `keystorePath`, `keystorePassword`, `keyAlias` and `keyPassword` capabilities. Unset by default
appium:keystorePassword | The password to the keystore file provided in `keystorePath` capability. This capability is used in combination with `useKeystore`, `keystorePath`, `keystorePassword`, `keyAlias` and `keyPassword` capabilities. Unset by default
appium:keyAlias | The alias of the key in the keystore file provided in `keystorePath` capability. This capability is used in combination with `useKeystore`, `keystorePath`, `keystorePassword`, `keyAlias` and `keyPassword` capabilities. Unset by default
appium:keyPassword | The password of the key in the keystore file provided in `keystorePath` capability. This capability is used in combination with `useKeystore`, `keystorePath`, `keystorePassword`, `keyAlias` and `keyPassword` capabilities. Unset by default
appium:noSign | Set it to `true` in order to skip application signing. By default all apps are always signed with the default Appium debug signature if they don't have any. This capability cancels all the signing checks and makes the driver to use the application package as is. This capability does not affect `.apks` packages as these are expected to be already signed.

### Device Locking

Capability Name | Description
--- | ---
appium:skipUnlock | Whether to skip the check for lock screen presence (`true`). The default driver behaviour is to verify the presence of the screen lock (e.g. 'false' value of the capability) before starting the test and to unlock that (which sometimes might be unstable). Note, that this operation takes some time, so it is highly recommended to set this capability to `true` and disable screen locking on device(s) under test. Read the [Unlock tutorial](./docs/unlock/main.md) for more details.
appium:unlockType | Set one of the possible types of Android lock screens to unlock. Read the [Unlock tutorial](./docs/unlock/main.md) for more details.
appium:unlockKey | Allows to set an unlock key. Read the [Unlock tutorial](./docs/unlock/main.md) for more details.
appium:unlockStrategy | Either 'locksettings' (default) or 'uiautomator'. Read the [Unlock tutorial](./docs/unlock/main.md) for more details.
appium:unlockSuccessTimeout | Maximum number of milliseconds to wait until the device is unlocked. `2000` ms by default. Read the [Unlock tutorial](./docs/unlock/main.md) for more details.

### MJPEG

Capability Name | Description
--- | ---
appium:mjpegServerPort | The number of the port on the host machine that UiAutomator2 server starts the MJPEG server on. If not provided then the screenshots broadcasting service on the remote device does not get exposed to a local port (e.g. no adb port forwarding is happening)
appium:mjpegScreenshotUrl | The URL of a service that provides realtime device screenshots in MJPEG format. If provided then the actual command to retrieve a screenshot will be requesting pictures from this service rather than directly from the server

### Web Context

Capability Name | Description
--- | ---
appium:autoWebview | If set to `true` then UiAutomator2 driver will try to switch to the web view with name `WEBVIEW_ + appium:appPackage` after the session is started. For example, if `appium:appPackage` capability is set to `com.mypackage` then `WEBVIEW_com.mypackage` will be used. `false` by default.
appium:autoWebviewName | Set the name of webview context in which UiAutomator2 driver will try to switch if `autoWebview` capability is set to `true` (available since driver version 2.9.1). Has priority over using the `appium:appPackage` value in webview name. For example, if `appium:autoWebviewName` capability is set to `myWebviewName` then `WEBVIEW_myWebviewName` will be used. Unset by default.
appium:autoWebviewTimeout | Set the maximum number of milliseconds to wait until a web view is available if `autoWebview` capability is set to `true`. `2000` ms by default.
appium:webviewDevtoolsPort | The local port number to use for devtools communication. By default the first free port from 10900..11000 range is selected. Consider setting the custom value if you are running parallel tests.
appium:ensureWebviewsHavePages | Whether to skip web views that have no pages from being shown in `getContexts` output. The driver uses devtools connection to retrieve the information about existing pages. `true` by default since Appium 1.19.0, `false` if lower than 1.19.0.
appium:enableWebviewDetailsCollection | Whether to retrieve extended web views information using devtools protocol. Enabling this capability helps to detect the necessary chromedriver version more precisely. `true` by default since Appium 1.22.0, `false` if lower than 1.22.0.
appium:chromedriverPort | The port number to use for Chromedriver communication. Any free port number is selected by default if unset.
appium:chromedriverPorts | Array of possible port numbers to assign for Chromedriver communication. If none of the port in this array is free then an error is thrown.
appium:chromedriverArgs | Array of chromedriver [command line arguments](http://www.assertselenium.com/java/list-of-chrome-driver-command-line-arguments/). Note, that not all command line arguments that are available for the desktop browser are also available for the mobile one.
appium:chromedriverExecutable | Full path to the chromedriver executable on the server file system.
appium:chromedriverExecutableDir | Full path to the folder where chromedriver executables are located. This folder is used then to store the downloaded chromedriver executables if automatic download is enabled. Read [Automatic Chromedriver Discovery article](#automatic-discovery-of-compatible-chromedriver) for more details.
appium:chromedriverChromeMappingFile | Full path to the chromedrivers mapping file. This file is used to statically map webview/browser versions to the chromedriver versions that are capable of automating them. Read [Automatic Chromedriver Discovery article](#automatic-discovery-of-compatible-chromedriver) for more details.
appium:chromedriverUseSystemExecutable | Set it to `true` in order to enforce the usage of chromedriver, which gets downloaded by Appium automatically upon installation. This driver might not be compatible with the destination browser or a web view. `false` by default.
appium:chromedriverDisableBuildCheck | Being set to `true` disables the compatibility validation between the current chromedriver and the destination browser/web view. Use it with care.
appium:recreateChromeDriverSessions | If this capability is set to `true` then chromedriver session is always going to be killed and then recreated instead of just suspending it on context switching. `false` by default
appium:nativeWebScreenshot | Whether to use screenshoting endpoint provided by UiAutomator framework (`true`) rather than the one provided by chromedriver (`false`, the default value). Use it when you experience issues with the latter.
appium:extractChromeAndroidPackageFromContextName | If set to `true`, tell chromedriver to attach to the android package we have associated with the context name, rather than the package of the application under test. `false` by default.
appium:showChromedriverLog | If set to `true` then all the output from chromedriver binary will be forwarded to the Appium server log. `false` by default.
pageLoadStrategy | One of the available page load strategies. See https://www.w3.org/TR/webdriver/#capabilities
appium:chromeOptions | A mapping, that allows to customize chromedriver options. See https://chromedriver.chromium.org/capabilities for the list of available entries.
appium:chromeLoggingPrefs | Chrome logging preferences mapping. Basically the same as [goog:loggingPrefs](https://newbedev.com/getting-console-log-output-from-chrome-with-selenium-python-api-bindings). It is set to `{"browser": "ALL"}` by default.

### Other

Capability Name | Description
--- | ---
appium:disableSuppressAccessibilityService | Being set to `true` tells the instrumentation process to not suppress accessibility services during the automated test. This might be useful if your automated test needs these services. `false` by default
appium:userProfile | Integer identifier of a [user profile](https://source.android.com/devices/tech/admin/multi-user). By default the app under test is installed for the currently active user, but in case it is necessary to test how the app performs while being installed for a user profile, which is different from the current one, then this capability might come in handy.
appium:newCommandTimeout | How long (in seconds) the driver should wait for a new command from the client before assuming the client has stopped sending requests. After the timeout the session is going to be deleted. `60` seconds by default. Setting it to zero disables the timer.
appium:skipLogcatCapture | Skips to start capturing logs such as logcat. It might improve network performance. Log-related commands won't work if the capability is enabled. Defaults to `false`.
appium:timeZone | Overrides the current device's time zone since the driver version 3.1.0. This change is preserved until the next override. The time zone identifier must be a valid name from the list of [available time zone identifiers](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones), for example `Europe/Kyiv`


## Element Attributes

UiAutomator2 driver supports the following element attributes:

Name | Description | Example
--- | --- | ---
checkable | Whether the element is checkable or not | 'true'
checked | Whether the element is checked. Always `false` if the element is not checkable | 'false'
class or className | The full name of the element's class. Could be `null` for some elements | 'android.view.View'
clickable | Whether the element could be clicked | 'false'
content-desc or contentDescription | The content-description attribute of the accessible element | 'foo'
enabled | Whether the element could be clicked | 'true'
focusable | Whether the element could be focused | 'true'
focused | Whether the element could is focused. Always `false` if the element is not focusable | 'false'
long-clickable or longClickable | Whether the element accepts long clicks | 'false'
package | Identifier of the package the element belongs to | 'com.mycompany'
password | Whether the element is a password input field | 'true'
resource-id or resourceId | Element's resource identifier. Could be `null` | 'com.mycompany:id/resId'
scrollable | Whether the element is scrollable | 'true'
selection-start | Contains the index of the char where the selection starts. Could be `null` if the element provides no range info | '5'
selection-end | Contains the index of the char where the selection ends. Could be `null` if the element provides no range info | '8'
selected | Whether the element is selected | 'false'
text or name | The element's text. It never equals to null | 'my text'
hint | Element's hint text. On Android versions below Oreo it always equals to `null`. | 'my hint text'
bounds | The element's visible frame (`[left, top][right, bottom]`) | `[0,0][100,100]`
displayed | Whether the element is visible to the user | 'true'
contentSize | The dimensions of the element's content area | `{"left": 0, "top":0, "width": 100, "height": 100, "scrollableOffset": 10, "touchPadding": 0}`
extras | The result of [getExtras](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getExtras()). The value includes all key-value pairs as `key=value` separated by a semicolon (`;`). If the value is empty, then only key part ending with the equal sign will be present. | Part of extras in chrome browser:<br> `AccessibilityNodeInfo.roleDescription=;`<br>`AccessibilityNodeInfo.chromeRole=rootWebArea;`<br> `ACTION_ARGUMENT_HTML_ELEMENT_STRING_VALUES=`<br> `ARTICLE,BLOCKQUOTE,BUTTON,CHECKBOX`


## Element Location

UiAutomator2 driver supports the following location strategies:

Name | Description | Speed Ranking | Example
--- | --- | --- | ---
id | This strategy is mapped to the native UiAutomator's `By.res` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#res(java.lang.String)) (exact match of element's resource name). Package identifier prefix is added automatically if unset and is equal to the identifier of the current application under test. | `⭐⭐⭐⭐⭐` | 'com.mycompany:id/resourceId'
accessibilityId | This strategy is mapped to the native UiAutomator's `By.desc` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#desc(java.lang.String)) (exact match of element's content description). In applications written using [ReactNative](https://reactnative.dev/) framework this attribute reflects the value of the `accessibilityLabel` property. | `⭐⭐⭐⭐⭐` | 'my description'
className | This strategy is mapped to the native UiAutomator's `By.clazz` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#clazz(java.lang.String)) (exact match of element's class). | `⭐⭐⭐⭐⭐` | 'android.view.View'
-android uiautomator | This strategy is mapped to the native UiAutomator's `UiSelector` [locator](https://developer.android.com/reference/androidx/test/uiautomator/UiSelector)). It is even possible to perform some advanced operations, like scrolling, with this locator type. Check [Guide on UiAutomator Locator Types](docs/uiautomator-uiselector.md) | `⭐⭐⭐⭐` | new UiScrollable(new UiSelector().resourceId(\"android:id/list\")).scrollIntoView(new UiSelector().text(\"Radio Group\"))
xpath | For elements lookup Xpath strategy the driver uses the same XML tree that is generated by page source API. Only Xpath 1.0 is supported for appium-uiatomator2-server versions below 4.25.0. All server versions starting from 4.25.0 support both Xpath 1.0 and 2.0 | `⭐⭐⭐` | By.xpath("//android.view.View[@text=\"Regular\" and @checkable=\"true\"]")

> [!WARNING]
> Google is going to [deprecate](https://developer.android.com/training/testing/other-components/ui-automator#ui-automator)
> and remove `UiCollection`, `UiObject`, `UiScrollable`, and `UiSelector` support from the UiAutomator framework.
> This will render all `-android uiautomator`-based locators invalid, so please keep it in mind while
> using them or plan to use them in the future.


## BiDi Protocol Support

UIAutomator2 driver has partial support of the [BiDi Protocol](https://w3c.github.io/webdriver-bidi/) since version 3.7.10. Check the [Supported BiDi Commands And Events](./docs/bidi.md) document for more details.


## Parallel Tests

It is possible to execute tests in parallel using UiAutomator2 driver.
Appium allows to do this on per-process (multiple server processes running on different ports managing single session)
or per-request basis (single server process managing multiple sessions, more preferable, uses less resources and ensures better control over running sessions).

_Note_: If you are not going to run your tests in parallel then consider enabling the `--session-override` Appium server argument.
It forces the server to close all pending sessions before a new one could be opened,
which allows you to avoid possible issues with such sessions silently running/expiring in the background.

### Important Real Device Capabilities

- `udid`: The unique device id.
- `systemPort`: Set a unique system port number for each parallel session. Otherwise you might get a port conflict such as in [this issue](https://github.com/appium/appium/issues/7745).
- `chromedriverPort`: The unique chromedriver port if testing web views or Chrome.
- `mjpegServerPort`: Set a unique MJPEG server port for each parallel session if you are going to record a video.

### Important Emulator Capabilities

- `avd`: The unique emulator name.
- `systemPort`: Set a unique system port number for each parallel session.
- `chromedriverPort`: The unique chromedriver port (if testing web views or Chrome).
- `mjpegServerPort`: Set a unique MJPEG server port for each parallel session if you are going to record a video.


## Settings API

UiAutomator2 driver supports Appium [Settings API](https://appium.io/docs/en/latest/guides/settings/).
Along with the common settings the following driver-specific settings are currently available:

Name | Type | Description
--- | --- | ---
actionAcknowledgmentTimeout | long | Maximum number of milliseconds to wait for an acknowledgment of generic uiautomator actions, such as clicks, text setting, and menu presses. The acknowledgment is an[AccessibilityEvent](http://developer.android.com/reference/android/view/accessibility/AccessibilityEvent.html") corresponding to an action, that lets the framework determine if the action was successful. Generally, this timeout should not be modified. `3000` ms by default
allowInvisibleElements | boolean | Whether to include elements that are not visible to the user (e. g. whose `displayed` attribute is `false`) to the XML source tree. `false` by default
ignoreUnimportantViews | boolean | Enables or disables layout hierarchy compression. If compression is enabled, the layout hierarchy derived from the Acessibility framework will only contain nodes that are important for uiautomator testing. Any unnecessary surrounding layout nodes that make viewing and searching the hierarchy inefficient are removed. `false` by default
elementResponseAttributes | string | Comma-separated list of element attribute names to be included into findElement response. By default only element UUID is present there, but it is also possible to add the following items: `name`, `text`, `rect`, `enabled`, `displayed`, `selected`, `attribute/<element_attribute_name>`. It is required that `shouldUseCompactResponses` setting is set to `false` in order for this one to apply.
enableMultiWindows | boolean | Whether to include all windows that the user can interact with (for example an on-screen keyboard) while building the XML page source (`true`). By default it is `false` and only the single active application window is included to the page source.
enableTopmostWindowFromActivePackage | boolean | Whether to limit the window with the highest Z-order from the active package for interactions and page source retrieval. By default it is `false` and the active application window, which may not necessarily have this order, is included to the page source.
enableNotificationListener | boolean | Whether to enable (`true`) toast notifications listener to listen for new toast notifications. By default this listener is enabled and UiAutomator2 server includes the text of toast messages to the generated XML page source, but not for longer than `3500` ms after the corresponding notification expires.
keyInjectionDelay | long | Delay in milliseconds between key presses when injecting text input. 0 ms by default
scrollAcknowledgmentTimeout | long | Timeout for waiting for an acknowledgement of an uiautomator scroll swipe action. The acknowledgment is an [AccessibilityEvent](http://developer.android.com/reference/android/view/accessibility/AccessibilityEvent.html), corresponding to the scroll action, that lets the framework determine if the scroll action was successful. Generally, this timeout should not be modified. `200` ms by default
shouldUseCompactResponses | boolean | Used in combination with `elementResponseAttributes` setting. If set to `false` then the findElement response is going to include the items enumerated in `elementResponseAttributes` setting. `true` by default
waitForIdleTimeout | long | Timeout used for waiting for the user interface to go into an idle state. By default, all core uiautomator objects except UiDevice will perform this wait before starting to search for the widget specified by the object's locator. Once the idle state is detected or the timeout elapses (whichever occurs first), the object will start to wait for the selector to find a match. Consider lowering the value of this setting if you experience long delays while interacting with accessibility elements in your test. `10000` ms by default.
waitForSelectorTimeout | long | Timeout for waiting for a widget to become visible in the user interface so that it can be matched by a selector. Because user interface content is dynamic, sometimes a widget may not be visible immediately and won't be detected by a selector. This timeout allows the uiautomator framework to wait for a match to be found, up until the timeout elapses. This timeout is only applied to `android uiautomator` location strategy. `10000` ms by default
normalizeTagNames | boolean | Being set to `true` applies unicode-to-ascii normalization of element class names used as tag names in the page source XML document. This is necessary if the application under test has some Unicode class names, which cannot be used as XML tag names by default due to known bugs in Android's XML DOM parser implementation. `false` by default
shutdownOnPowerDisconnect | boolean | Whether to shutdown the server if the device under test is disconnected from a power source (e. g. stays on battery power). `true` by default.
simpleBoundsCalculation | boolean | Whether to calculate element bounds as absolute values (`true`) or check if the element is covered by other elements and thus partially hidden (`false`, the default behaviour). Setting this setting to `true` helps to improve the performance of XML page source generation, but decreases bounds preciseness. Use with care.
trackScrollEvents | boolean | Whether to apply scroll events tracking (`true`, the default value), so the server could calculate the value of `contentSize` attribute. Having this setting enabled may add delays to all scrolling actions.
wakeLockTimeout | long | The timeout in milliseconds of wake lock that UiAutomator2 server acquires by default to prevent the device under test going to sleep while an automated test is running. By default the server acquires the lock for 24 hours. Setting this value to zero forces the server to release the wake lock.
serverPort | int | The number of the port on the remote device to start UiAutomator2 server on. Do not mix this with `systemPort`, which is acquired on the host machine. Must be in range 1024..65535. `6790` by default
mjpegServerPort | int | The number of the port on the remote device to start MJPEG screenshots broadcaster on. Must be in range 1024..65535. `7810` by default
mjpegServerFramerate | int | The maximum count of screenshots per second taken by the MJPEG screenshots broadcaster. Must be in range 1..60. `10` by default
mjpegScalingFactor | int | The percentage value used to apply downscaling on the screenshots generated by the MJPEG screenshots broadcaster. Must be in range 1..100. `50` is by default, which means that screenshots are downscaled to the half of their original size keeping their original proportions.
mjpegServerScreenshotQuality | int | The percentage value used to apply lossy JPEG compression on the screenshots generated by the MJPEG screenshots broadcaster. Must be in range 1..100. `50` is by default, which means that screenshots are compressed to the half of their original quality.
mjpegBilinearFiltering | boolean | Controls whether (`true`) or not (`false`, the default value) to apply bilinear filtering to MJPEG screenshots broadcaster resize algorithm. Enabling this flag may improve the quality of the resulting scaled bitmap, but may introduce a small performance hit.
useResourcesForOrientationDetection | boolean | Defines the strategy used by UiAutomator2 server to detect the original device orientation. By default (`false` value) the server uses device rotation value for this purpose. Although, this approach may not work for some devices and a portrait orientation may erroneously be detected as the landscape one (and vice versa). In such case it makes sense to play with this setting.
enforceXPath1 | boolean | Since UiAutomator2 driver version `4.25.0` XPath2 is set as the default and the recommended interpreter for the corresponding element locators. This interpreter is based on [Psychopath XPath2](https://wiki.eclipse.org/PsychoPathXPathProcessor) implementation, which is now a part of the Eclipse foundation. In most of the cases XPath1 locators are also valid XPath2 locators, so there should be no issues while locating elements. Although, since the XPath2 standard is much more advanced in comparison to the previous version, some [issues](https://github.com/appium/appium/issues/16142) are possible for more sophisticated locators, which cannot be fixed easily, as we depend on the third-party library mentioned above. Then try to workaround such issues by enforcing XPath1 usage (whose implementation is a part of the Android platform itself) and assigning this setting to `true`. Note, this setting is actually applied at the time when the element lookup by XPath is executed, so you could switch it on or off whenever needed throughout your automated testing session.
limitXPathContextScope | boolean | Due to historical reasons UiAutomator2 driver limits scopes of element context-based searches to the parent element. This means a request like `findElement(By.xpath, "//root").findElement(By.xpath, "./..")` would always fail, because the driver only collects descendants of the `root` element for the destination XML source. The `limitXPathContextScope` setting being set to `false` changes that default behavior, so the collected page source includes the whole page source XML where `root` node is set as the search context. With that setting disabled the search query above should not fail anymore. Although, you must still be careful while building XPath requests for context-based searches with the `limitXPathContextScope` setting set to `false`. A request like `findElement(By.xpath, "//root").findElement(By.xpath, "//element")` would ignore the current context and search for `element` trough the whole page source. Use `.` notation to correct that behavior and only find `element` nodes which are descendants of the `root` node: `findElement(By.xpath, "//root").findElement(By.xpath, ".//element")`.
disableIdLocatorAutocompletion | boolean | According to internal Android standards it is expected that each resource identifier is prefixed with `<packageName>:id/` string. This should guarantee uniqueness of each identifier. Although some application development frameworks ignore this rule and don't add such prefix automatically or, rather, let it up to the developer to decide how to represent their application identifiers. For example, [testTag modifier attribute in the Jetpack Compose](https://developer.android.com/reference/kotlin/androidx/compose/ui/platform/package-summary#(androidx.compose.ui.Modifier).testTag(kotlin.String)) with [testTagsAsResourceId](https://developer.android.com/reference/kotlin/androidx/compose/ui/semantics/package-summary#(androidx.compose.ui.semantics.SemanticsPropertyReceiver).testTagsAsResourceId()) allows developers to set an arbitrary string without the prefix rule. [Interoperability with UiAutomator](https://developer.android.com/jetpack/compose/testing) also explains how to set it. By default UIA2 driver adds the above prefixes automatically to all resource id locators if they are not prefixed, but in case of such "special" apps this feature might be disabled by assigning the setting to `true`.
includeExtrasInPageSource | boolean | Whether to include `extras` element attribute in the XML page source result. Then, XPath locator can find the element by the extras. Its value consists of combined [getExtras](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getExtras()) as `keys=value` pair separated by a semicolon (`;`), thus you may need to find the element with partial matching like `contains` e.g. `driver.find_element :xpath, '//*[contains(@extras, "AccessibilityNodeInfo.roleDescription=")]'`. The value could be huge if elements in the XML page source have large `extras`. It could affect the performance of XML page source generation.
snapshotMaxDepth | int | The number of maximum depth for the source tree snapshot. The default value is `70`. This number should be in range [1, 500]. A part of the elements source tree might be lost if the value is too low. Also, StackOverflowError might be caused if the value is too high (Issues [12545](https://github.com/appium/appium/issues/12545), [12892](https://github.com/appium/appium/issues/12892)). The available driver version is `2.27.0` or higher.


## Platform-Specific Extensions

Beside of standard W3C APIs the driver provides the below custom command extensions to execute platform specific scenarios. Use the following source code examples in order to invoke them from your client code:

```java
// Java 11+
var result = driver.executeScript("mobile: <methodName>", Map.ofEntries(
    Map.entry("arg1", "value1"),
    Map.entry("arg2", "value2")
    // you may add more pairs if needed or skip providing the map completely
    // if all arguments are defined as optional
));
```

```js
// WebdriverIO
const result = await driver.executeScript('mobile: <methodName>', [{
    arg1: "value1",
    arg2: "value2",
}]);
```

```python
# Python
result = driver.execute_script('mobile: <methodName>', {
    'arg1': 'value1',
    'arg2': 'value2',
})
```

```ruby
# Ruby
result = @driver.execute_script 'mobile: <methodName>', {
    arg1: 'value1',
    arg2: 'value2',
}
```

```csharp
// Dotnet
object result = driver.ExecuteScript("mobile: <methodName>", new Dictionary<string, object>() {
    {"arg1", "value1"},
    {"arg2", "value2"}
});
```

### mobile: shell

Executes the given shell command on the device under test via ADB connection. This extension exposes a potential security risk and thus is only enabled when explicitly activated by the `adb_shell` server command line feature specifier.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
command | string | yes | Shell command name to execute, for example `echo` or `rm` | echo
args | Array&lt;string&gt; | no | Array of command arguments | `['-f', '/sdcard/myfile.txt']`
timeout | number | no | Command timeout in milliseconds. If the command blocks for longer than this timeout then an exception is going to be thrown. The default timeout is `20000` ms | 100000
includeStderr | boolean | no | Whether to include stderr stream into the returned result. `false` by default | true

#### Returned Result

Depending on the `includeStderr` value this API could either return a string, which is equal to the `stdout` stream content of the given command or a dictionary whose elements are `stdout` and `stderr` and values are contents of the corresponding outgoing streams. If the command exits with a non-zero return code then an exception is going to be thrown. The exception message will be equal to the command stderr.

### mobile: execEmuConsoleCommand

Executes a command through emulator telnet console interface and returns its output.
The `emulator_console` server feature must be enabled in order to use this method.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
command | string | yes | The actual command to execute. See [Android Emulator Console Guide](https://developer.android.com/studio/run/emulator-console) for more details on available commands | help-verbose
execTimeout | number | no | Timeout used to wait for a server reply to the given command in milliseconds. `60000` ms by default | 100000
connTimeout | boolean | no | Console connection timeout in milliseconds. `5000` ms by default | 10000
initTimeout | boolean | no | Telnet console initialization timeout in milliseconds (the time between the connection happens and the command prompt). `5000` ms by default | 10000

#### Returned Result

The actual command output. An error is thrown if command execution fails.

### Mobile Gesture Commands

UiAutomator2 provides several extensions that allow to automate popular mobile gesture shortcuts:

- mobile: dragGesture
- mobile: flingGesture
- mobile: doubleClickGesture
- mobile: clickGesture
- mobile: longClickGesture
- mobile: pinchCloseGesture
- mobile: pinchOpenGesture
- mobile: swipeGesture
- mobile: scrollGesture

These gestures are documented in the [Automating Mobile Gestures](docs/android-mobile-gestures.md) tutorial. Check [W3C Actions API](https://appiumpro.com/editions/29-automating-complex-gestures-with-the-w3c-actions-api) and
[Low-Level Insights on Android Input Events](docs/actions.md) if you need to automate more complicated gestures.

### mobile: scroll

Scrolls the given scrollable element until an element identified by `strategy` and `selector` becomes visible. This function returns immediately if the destination element is already visible in the view port. Otherwise it would scroll to the very beginning of the scrollable control and tries to reach the destination element by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal) is detected automatically.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
elementId | string | no | The identifier of the scrollable element. It is required this element is a valid scrollable container and it was located by `-android uiautomator` strategy. If this property is not provided then the first currently available scrollable view is selected for the interaction. | 123456-3456-3435-3453453
strategy | string | yes | The following strategies are supported: `accessibility id` (UiSelector().description), `class name` (UiSelector().className), `-android uiautomator` (UiSelector) | 'accessibility id'
selector | string | yes | The corresponding lookup value for the selected strategy. | 'com.mycompany:id/table'
maxSwipes | number | no | The maximum number of swipes to perform on the target scrollable view in order to reach the destination element. In case this value is unset then it would be retrieved from the scrollable element itself (vua `getMaxSearchSwipes()` property). | 10

### mobile: deepLink

Start URI that may take users directly to the specific content in the app. Read [Reliably Opening Deep Links Across Platforms and Devices](https://appiumpro.com/editions/84-reliably-opening-deep-links-across-platforms-and-devices) for more details.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
url | string | yes | The URL to start | theapp://login/
package | string | no | The name of the package to start the URI with. This argument was required previously but became optional since version 3.9.3 | 'com.mycompany'
waitForLaunch | boolean | no | If `false` then ADB won't wait for the started activity to return the control. `true` by default | false

### mobile: startLogsBroadcast

Starts Android logcat broadcast websocket on the same host and port where Appium server is running at `/ws/session/:sessionId:/appium/logcat` endpoint. The method will return immediately if the web socket is already listening. Each connected webcoket listener will receive logcat log lines as soon as they are visible to Appium. Read [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://appiumpro.com/editions/55-using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium) for more details.

### mobile: stopLogsBroadcast

Stops the previously started logcat broadcasting websocket server. This method will return immediately if no server is running. Read [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://appiumpro.com/editions/55-using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium) for more details.

### mobile: deviceidle

This is a wrapper to 'adb shell dumpsys deviceidle' interface.
Read [Diving Into Android 'M' Doze](https://www.protechtraining.com/blog/post/diving-into-android-m-doze-875) for more details.
This API only exists since Android 6.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
action | whitelistAdd or whitelistRemove | yes | The name of the action to perform | whitelistAdd
packages | string or string[] | yes | One or more package names to perfom the above action on | 'com.mycompany'

### mobile: acceptAlert

Tries to accept an Android alert. This method might not always be reliable as there is no single standard for how Android alerts should look like within the Accessibility representation.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
buttonLabel | string | no | The name/text of the alert button to click in order to accept it. If not provided then the driver will try to autodetect it | Accept

### mobile: dismissAlert

Tries to dismiss an Android alert. This method might not always be reliable as there is no single standard for how Android alerts should look like within the Accessibility representation.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
buttonLabel | string | no | The name/text of the alert button to click in order to dismiss it. If not provided then the driver will try to autodetect it | Dismiss

### mobile: batteryInfo

Retrieves the battery information from the device under test.

#### Returned Result

The extension returns a dictionary whose entries are:

Name | Type | Description | Example
--- | --- | --- | ---
level | number | Battery level in range [0.0, 1.0], where 1.0 means 100% charge. -1 is returned if the actual value cannot be retrieved from the system. | 0.5
state | number| Battery state. The following values are possible: BATTERY_STATUS_UNKNOWN = 1; BATTERY_STATUS_CHARGING = 2; BATTERY_STATUS_DISCHARGING = 3; BATTERY_STATUS_NOT_CHARGING = 4; BATTERY_STATUS_FULL = 5. -1 is returned if the actual value cannot be retrieved from the system. | 4

### mobile: deviceInfo

Retrieves the information about the device under test, like the device model, serial number, network connectivity info, etc.

#### Returned Result

The extension returns a dictionary whose entries are the device properties. Check https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/main/java/io/appium/uiautomator2/handler/GetDeviceInfo.java to get the full list of returned keys and their corresponding values.

### mobile: getDeviceTime

Retrieves the current device's timestamp.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
format | string | no | The set of format specifiers. Read https://momentjs.com/docs/ to get the full list of supported datetime format specifiers. The default format is `YYYY-MM-DDTHH:mm:ssZ`, which complies to ISO-8601 | YYYY-MM-DDTHH:mm:ssZ

#### Returned Result

The device timestamp string formatted according to the given specifiers

### mobile: changePermissions

Changes package permissions in runtime.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
permissions | string or Array&lt;string&gt; | yes | The full name of the permission to be changed or a list of permissions. Consider checking [the full list](https://developer.android.com/reference/android/Manifest.permission) of standard Android permission names. If `all` magic string is passed (available since driver version 2.8.0) and `target` equals `pm` (the default value) then the chosen action is going to be applied to all permissions requested/granted by the 'appPackage'. If `target` is set to `appops` (available since v2.11.0) then check [AppOpsManager.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/app/AppOpsManager.java) sources to get the full list of supported appops permission names for the given Android platform. The `all` magic string is unsupported for the `appops` target. | `['android.permission.ACCESS_FINE_LOCATION', 'android.permission.BROADCAST_SMS']` `all` `['READ_SMS', 'ACCESS_NOTIFICATIONS']`
appPackage | string | no | The application package to set change permissions on. Defaults to the package name under test | com.mycompany.myapp
action | string | no | Either `grant` (the default action) or `revoke` if `target` is set to `pm`, otherwise one of: `allow` (default), `deny`, `ignore`, `default`. | allow
target | string | no | Either `pm` (default) or `appops` (available since v2.11.0). The `appops` one requires *adb_shell* server security option to be enabled | appops

### mobile: getPermissions

Gets runtime permissions list for the given application package.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
type | string | no | One of possible permission types to get. Can be one of: `denied`, `granted` or `requested` (the default value). | granted
appPackage | string | no | The application package to get permissions from. Defaults to the package name under test | com.mycompany.myapp

#### Returned Result

Array of strings, where each string is a permission name. the array could be empty.

### mobile: performEditorAction

Performs IME action on the _currently focused_ edit element.

Very often Android developers use [onEditorAction](https://developer.android.com/reference/android/widget/TextView.OnEditorActionListener.html#onEditorAction(android.widget.TextView,%20int,%20android.view.KeyEvent)) callback with `actionId` argument to implement actions handling, for example, when `Search` or `Done` button is pressed on the on-screen keyboard. This mobile extension is supposed to emulate the invokation of such callback on the focused element.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
action | string | yes | The name or an integer code of the editor action to be executed. The following action names are supported: `normal, unspecified, none, go, search, send, next, done, previous`. Read [EditorInfo](https://developer.android.com/reference/android/view/inputmethod/EditorInfo) for more details on this topic. | search

### mobile: startScreenStreaming

Starts device screen broadcast by creating MJPEG server. Multiple calls to this method have no effect unless the previous streaming session is stopped. This method only works if the `adb_screen_streaming` feature is enabled on the server side. It is also required that [GStreamer](https://gstreamer.freedesktop.org/) with `gst-plugins-base`, `gst-plugins-good` and `gst-plugins-bad` packages are installed and available in PATH on the server machine.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
width | number | no | The scaled width of the device's screen. If unset then the script will assign it to the actual screen width measured in pixels. | 768
height | number | no | The scaled height of the device's screen. If unset then the script will assign it to the actual screen height measured in pixels. | 1024
bitRate | number | no | The video bit rate for the video, in bits per second. The default value is 4000000 (4 Mb/s). You can increase the bit rate to improve video quality, but doing so results in larger movie files. | 1024000
host | string | no | The IP address/host name to start the MJPEG server on. You can set it to `0.0.0.0` to trigger the broadcast on all available network interfaces. `127.0.0.1` by default | 0.0.0.0
pathname | string | no | The HTTP request path the MJPEG server should be available on. If unset then any pathname on the given `host`/`port` combination will work. Note that the value should always start with a single slash: `/` | /myserver
tcpPort | number | no | The port number to start the internal TCP MJPEG broadcast on. This type of broadcast always starts on the loopback interface (`127.0.0.1`). `8094` by default | 5024
port | number | no | The port number to start the MJPEG server on. `8093` by default | 5023
quality | number | no | The quality value for the streamed JPEG images. This number should be in range [1, 100], where 100 is the best quality. `70` by default | 80
considerRotation | boolean | no | If set to `true` then GStreamer pipeline will increase the dimensions of the resulting images to properly fit images in both landscape and portrait orientations. Set it to `true` if the device rotation is not going to be the same during the broadcasting session. `false` by default | false
logPipelineDetails | boolean | no | Whether to log GStreamer pipeline events into the standard log output. Might be useful for debugging purposes. `false` by default | true

### mobile: stopScreenStreaming

Stop the previously started screen streaming. If no screen streaming server has been started then nothing is done.

### mobile: getNotifications

Retrieves Android notifications via Appium Settings helper. Appium Settings app itself must be *manually* granted to access notifications under device Settings in order to make this feature working. Different vendors [might](https://github.com/appium/io.appium.settings/issues/147#issue-2130780990) require more than just the normal Notification permissions at the usual Apps menu. Try to look in places like Privacy menus if you are getting zero items retrieved while expecting some results.

Appium Settings helper keeps all the active notifications plus notifications that appeared while it was running in the internal buffer, but no more than 100 items altogether. Newly appeared notifications are always added to the head of the notifications array. The `isRemoved` flag is set to `true` for notifications that have been removed.
See https://developer.android.com/reference/android/service/notification/StatusBarNotification and https://developer.android.com/reference/android/app/Notification.html for more information on available notification properties and their values.

#### Returned Result

The example output is:
```json
{
   "statusBarNotifications":[
     {
       "isGroup":false,
       "packageName":"io.appium.settings",
       "isClearable":false,
       "isOngoing":true,
       "id":1,
       "tag":null,
       "notification":{
         "title":null,
         "bigTitle":"Appium Settings",
         "text":null,
         "bigText":"Keep this service running, so Appium for Android can properly interact with several system APIs",
         "tickerText":null,
         "subText":null,
         "infoText":null,
         "template":"android.app.Notification$BigTextStyle"
       },
       "userHandle":0,
       "groupKey":"0|io.appium.settings|1|null|10133",
       "overrideGroupKey":null,
       "postTime":1576853518850,
       "key":"0|io.appium.settings|1|null|10133",
       "isRemoved":false
     }
   ]
}
```

### mobile: openNotifications

Opens notifications drawer on the device under test. Does nothing if the drawer is already opened. Available since driver version 2.23

### mobile: listSms

Retrieves the list of the most recent SMS properties list via Appium Settings helper. Messages are sorted by date in descending order.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
max | number | no | The maximum count of recent messages to retrieve. `100` by default | 10

#### Returned Result

The example output is:
```json
 {
   "items":[
     {
       "id":"2",
       "address":"+123456789",
       "person":null,
       "date":"1581936422203",
       "read":"0",
       "status":"-1",
       "type":"1",
       "subject":null,
       "body":"\"text message2\"",
       "serviceCenter":null
     },
     {
       "id":"1",
       "address":"+123456789",
       "person":null,
       "date":"1581936382740",
       "read":"0",
       "status":"-1",
       "type":"1",
       "subject":null,
       "body":"\"text message\"",
       "serviceCenter":null
     }
   ],
   "total":2
 }
```

### mobile: type

Types the given Unicode string. It is expected that the focus is already put to the destination input field before this method is called. The main difference between this method and the sendKeys one is that it emulates `true` typing like it was done from an on-screen keyboard. It also properly supports Unicode input characters.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
text | string | yes | The text to type | testing

### mobile: sensorSet

Emulate changing of sensor values on the connected emulator.
This extension does not work on real devices.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
sensorType | string | yes | The set of all supported sensor types could be found in [adb-emu-commands.js](https://github.com/appium/appium-adb/blob/master/lib/tools/adb-emu-commands.js) (look for *SENSORS* object values). Check the output of `sensor status` command in the [emulator console](https://developer.android.com/studio/run/emulator-console) to see more details on the available sensor types | light
value | string | yes | Check the output of `sensor get <sensorType>` command in the [emulator console](https://developer.android.com/studio/run/emulator-console) to see the acceptable value format for the given sensor type | 50

### mobile: pullFile

Pulls a remote file from the device.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | yes | The full path to the remote file or a specially formatted path, which points to an item inside an app bundle, for example `@my.app.id/my/path`. It is mandatory for the app bundle to have [debugging enabled](https://developer.android.com/studio/debug) in order to use the latter remotePath format. If the file with the given name does not exist then an exception will be thrown. | /sdcard/foo.bar

#### Returned Result

Base64-encoded string, which represents the content of the remote file.

### mobile: pushFile

Pushes a local file to the device.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | yes | The path on the device to where the payload should be written. The value format is similar to the one used in [pullFile](#mobile-pullfile) extension. If the file with the same name already exists then it will be silently overridden. | /sdcard/foo.bar
payload | string | yes | Base64-encoded content of the file to be pushed. | QXBwaXVt

### mobile: pullFolder

Pulls a remote folder from the device.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | yes | Same as for [pullFile](#mobile-pullfile) extension, but should be pointing to a remote folder | /sdcard/yolo/

#### Returned Result

Base64-encoded string, which represents the zipped content of the remote folder.

### mobile: deleteFile

Deletes a file on the remote device.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | yes | The full path to the remote file or a file inside an application bundle | `/sdcard/myfile.txt` or `@my.app.id/path/in/bundle`

### mobile: isAppInstalled

Verify whether an application is installed on the device under test.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be checked | `my.app.id`
user | number or string | no | The user ID for which the package is installed.. The `current` user is used by default | 1006

#### Returned Result

True or false

### mobile: queryAppState

Queries the current state of the app.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be checked | `my.app.id`

#### Returned Result

The following numbers could returned:
- The app is not installed: `0`
- The app is installed and is not running: `1`
- The app is running in background: `3`
- The app is running in foreground: `4`

### mobile: activateApp

Activates the given application or launches it if necessary.
The action literally simulates
clicking the corresponding application icon on the dashboard.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be activated | `my.app.id`

### mobile: removeApp

Remove the corresponding application if is installed.
The call is ignored if the app is not installed.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be removed | `my.app.id`
timeout | number | no | The count of milliseconds to wait until the app is terminated. 20000ms by default. | 1500, 0
keepData | boolean | no | Set to true in order to keep the application data and cache folders after uninstall. | true

#### Returned Result

True is the app has been found on the device and successfully removed. Otherwise false.

### mobile: terminateApp

Terminates the app and waits until the app is terminated up to the given timeout
by checking the app state to ensure if the app process is actually stopped.

The app state check can be skipped if the given timeout is lower or equal to zero since UIAutomator driver 2.9.0.
The skip helps when you want to terminate the app process but do not want to check the process existence
because the app under test may, for example, restart it automatically.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be terminated | `my.app.id`
timeout | number | no | The count of milliseconds to wait until the app is terminated. 500ms by default. | 1500, 0

#### Returned Result

True if the app has been successfully terminated.

### mobile: installApp

Installs the given application package to the device under test.
It might raise the `INSTALL_FAILED_VERSION_DOWNGRADE` error if the installation was a version downgrade.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appPath | string | yes | The local .apk(s) path on the server filesystem or a remote url. | `/app/path.apk`
timeout | number | no | The count of milliseconds to wait until the app is installed.. 6000ms by default. | 120000
allowTestPackages | boolean | no | Set to true in order to allow test packages installation. false by default | true
useSdcard | boolean | no | Set to true to install the app on sdcard instead of the device memory. false by default | true
grantPermissions | boolean | no | Set to true in order to grant all the permissions requested in the application's manifest automatically after the installation is completed under Android 6+. The targetSdkVersion in the application manifest must be greater or equal to 23 and the Android version on the device under test must be greater or equal to Android 6 (API level 23) to grant permissions. Applications whose targetSdkVersion is lower than or equal to 22 must be reisntalled to grant permissions for Android 6+ devices. false by default | true
replace | boolean | no | Set it to false if you don't want the application to be upgraded/reinstalled if it is already present on the device, but throw an error instead. true by default | false
checkVersion | boolean | no | Set to true, in order to skip the application installation if the device under test has a greater or equal to the application version. It may help to avoid `INSTALL_FAILED_VERSION_DOWNGRADE` error and unnecessary installation. | true

### mobile: clearApp

Deletes all data associated with a package. Calls `adb shell pm clear` under the hood.
The app should be accessible, should not be running,
and should exist on the device under test for this extension to work properly.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
appId | string | yes | The identifier of the application package to be cleared | `my.app.id`

#### Returned Result

Stdout of the corresponding adb command.

### mobile: startActivity

Starts the given activity intent. Invokes `am start`/`am start-activity` command under the hood.
This method extends the functionality of the [Start Activity](#applications-management) app management API.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | yes | The full name of the activity intent to start | `com.some.package.name/.YourActivityClassName`
user | number or string | no | The user ID for which the service is started. The `current` user is used by default | 1006
wait | boolean | no | Set it to `true` if you want to block the method call until the Activity Manager's process returns the control to the system. | false
stop | boolean | no | Set it to `true` to force stop the target app before starting the activity. | false
windowingMode | integer | no | The windowing mode to launch the activity into. Check [WindowConfiguration.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/app/WindowConfiguration.java) for more details on possible windowing modes (constants starting with `WINDOWING_MODE_`). | 1
activityType | integer | no | The activity type to launch the activity as. Check [WindowConfiguration.java](https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/app/WindowConfiguration.java) for more details on possible activity types (constants starting with `ACTIVITY_TYPE_`). | 1
action | string | no | Action name. The actual value for the Activity Manager's `-a` argument. | android.intent.action.MAIN
uri | string | no | Unified resource identifier. The actual value for the Activity Manager's `-d` argument. | https://appium.io
mimeType | string | no | Mime type. The actual value for the Activity Manager's `-t` argument. | application/json
identifier | string | no | Optional identifier. The actual value for the Activity Manager's `-i` argument. | my_identifier
categories | string or Array&lt;string&gt; | no | One or more category names. The actual value(s) for the Activity Manager's `-c` argument. | android.intent.category.LAUNCHER
component | string | no | Component name. The actual value for the Activity Manager's `-n` argument. | com.myapp/com.myapp.SplashActivity
package | string | no | Package name. The actual value for the Activity Manager's `-p` argument. | com.myapp
extras | Array&lt;Array&lt;string&gt;&gt; | no | Optional intent arguments. Must be represented as an array of arrays, where each subarray item contains two (only in case it no value is required for the given type) or three string items: value type, key (variable name) and the value itself. Supported value types are: `s`: string. Value must be a valid string; `sn`: null. Value is ignored for this type; `z`: boolean. Value must be either `true` or `false`; `i`: integer. Value must be a valid 4-byte integer number; `l`: long. Value must be a valid 8-byte long number; `f`: float: Value must be a valid float number; `u`: uri. Value must be a valid uniform resource identifier string; `cn`: component name. Value must be a valid component name string; `ia`: Integer[]. Value must be a string of comma-separated integers; `ial`: List&lt;Integer&gt;. Value must be a string of comma-separated integers; `la`: Long[]. Value must be a string of comma-separated long numbers; `lal`: List&lt;Long&gt;. Value must be a string of comma-separated long numbers; `fa`: Float[]. Value must be a string of comma-separated float numbers; `fal`: List&lt;Float&gt;. Value must be a string of comma-separated float numbers; `sa`: String[]. Value must be comma-separated strings. To embed a comma into a string escape it using "\,"; `sal`: List&lt;String&gt;. Value must be comma-separated strings. To embed a comma into a string, escape it using "\," | [['s', 'varName1', 'My String1'], ['s', 'varName2', 'My String2'], ['ia', 'arrName', '1,2,3,4']]
flags | string | no | Intent startup-specific flags as a hexadecimal string. Check [Intent documentation](https://developer.android.com/reference/android/content/Intent.html) for the list of available flag values (constants starting with `FLAG_ACTIVITY_`). Flag values could be merged using the logical 'or' operation. | 0x10200000 is the combination of two flags: 0x10000000 `FLAG_ACTIVITY_NEW_TASK` `|` 0x00200000 `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED`

#### Returned Result

The actual stdout of the downstream `am` command.

#### Example

Use the code snippet below to represent the following shell command: `shell am start-activity -W -n io.appium.android.apis/io.appium.android.apis.ApiDemos -S -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -f 0x10200000'`, which is usually similar to what is called in a new session request.
If you replace `'io.appium.android.apis/io.appium.android.apis.ApiDemos'` with your expected launchable activity, it would be the alternative method to start the activity in session.

Please check [how appium adds flags](https://github.com/appium/appium-android-driver/blob/master/lib/commands/intent.js) for more details to understand how Appium builds flags.

```ruby
# Ruby
driver.execute_script 'mobile: startActivity', {
    wait: true,
    stop: true,
    action: 'android.intent.action.MAIN',
    component: 'io.appium.android.apis/io.appium.android.apis.ApiDemos',
    categories: ['android.intent.category.LAUNCHER'],
    flags: '0x10200000'
}
```

### mobile: startService

Starts the given service intent. Invokes `am startservice` or `am start-service` command under the hood.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | no | The full name of the service intent to start | `com.some.package.name/.YourServiceSubClassName`
user | number or string | no | The user ID for which the service is started. The `current` user id is used by default | 1006
foreground | boolean | no | Set it to `true` if your service must be started as a foreground service. The argument only works for Android 8 and above. | false
action | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | android.intent.action.MAIN
uri | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | https://appium.io
mimeType | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | application/json
identifier | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | my_identifier
categories | string or Array&lt;string&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp/com.myapp.SplashActivity
component | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | android.intent.category.LAUNCHER
package | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp
extras | Array&lt;Array&lt;string&gt;&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | [['s', 'varName1', 'My String1'], ['s', 'varName2', 'My String2'], ['ia', 'arrName', '1,2,3,4']]
flags | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | 0x10200000 is the combination of two flags: 0x10000000 `FLAG_ACTIVITY_NEW_TASK` `|` 0x00200000 `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED`

#### Returned Result

The actual stdout of the downstream `am` command.

### mobile: stopService

Stops the given service intent. Invokes `am stopservice` or `am stop-service` command under the hood.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | no | The full name of the service intent to stop | `com.some.package.name/.YourServiceSubClassName`
user | number or string | no | The user ID for which the service is started. The `current` user id is used by default | 1006
action | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | android.intent.action.MAIN
uri | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | https://appium.io
mimeType | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | application/json
identifier | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | my_identifier
categories | string or Array&lt;string&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp/com.myapp.SplashActivity
component | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | android.intent.category.LAUNCHER
package | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp
extras | Array&lt;Array&lt;string&gt;&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | [['s', 'varName1', 'My String1'], ['s', 'varName2', 'My String2'], ['ia', 'arrName', '1,2,3,4']]
flags | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | 0x10200000 is the combination of two flags: 0x10000000 `FLAG_ACTIVITY_NEW_TASK` `|` 0x00200000 `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED`

### mobile: broadcast

Send a broadcast Intent. Invokes `am broadcast` command under the hood.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | no | The full name of the intent to broadcast | `com.some.package.name/.YourIntentClassName`
user | number or string | no | Specify which user to send to; if not specified then send to all users. Possible values are `all`/`current`/`<numeric user id>` | current
receiverPermission | string | no | Require receiver to hold the given permission | android.permission.READ_PROFILE
allowBackgroundActivityStarts | boolean | no | The receiver may start activities even if in the background if set to `true` | false
action | string | no | See the documentation for [startActivity extension](#mobile-startactivity)  | android.intent.action.MAIN
uri | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | https://appium.io
mimeType | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | application/json
identifier | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | my_identifier
categories | string or Array&lt;string&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp/com.myapp.SplashActivity
component | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | android.intent.category.LAUNCHER
package | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | com.myapp
extras | Array&lt;Array&lt;string&gt;&gt; | no | See the documentation for [startActivity extension](#mobile-startactivity) | [['s', 'varName1', 'My String1'], ['s', 'varName2', 'My String2'], ['ia', 'arrName', '1,2,3,4']]
flags | string | no | See the documentation for [startActivity extension](#mobile-startactivity) | 0x10200000 is the combination of two flags: 0x10000000 `FLAG_ACTIVITY_NEW_TASK` `|` 0x00200000 `FLAG_ACTIVITY_RESET_TASK_IF_NEEDED`

#### Returned Result

The actual stdout of the downstream `am` command.

### mobile: getContexts

Retrieves a WebViews mapping based on CDP endpoints

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
waitForWebviewMs | number | no | Tells UiAutomator2 driver for how long (in milliseconds) to wait for web view(s) to appear since UiAutomator2 driver v2.53.0. If a Chrome process running on the device under test fails to create a connection to the devtools socket, then the chromedriver will rise an error similar to `failed to connect to socket 'localabstract:chrome_devtools_remote'` in UiAutomator2 driver. It could cause no WebViews found result, although a couple of retrials may fix it. This argument helps to keep trying to get WebView(s) up to the given time milliseconds as one command call. This issue tends to occur Chrome v115 and over so far. [issues#19251](https://github.com/appium/appium/issues/19251) contains more details. If set to `0`ms (the default value), then UiAutomator2 driver only checks the WebView(s) availability once. | 10000

#### Returned Result

The following json demonstrates the example of WebviewsMapping object.
Note that `description` in `page` can be an empty string most likely when it comes to Mobile Chrome)

```json
 {
   "proc": "@webview_devtools_remote_22138",
   "webview": "WEBVIEW_22138",
   "info": {
     "Android-Package": "io.appium.settings",
     "Browser": "Chrome/74.0.3729.185",
     "Protocol-Version": "1.3",
     "User-Agent": "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86 Build/QSR1.190920.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/74.0.3729.185 Mobile Safari/537.36",
     "V8-Version": "7.4.288.28",
     "WebKit-Version": "537.36 (@22955682f94ce09336197bfb8dffea991fa32f0d)",
     "webSocketDebuggerUrl": "ws://127.0.0.1:10900/devtools/browser"
   },
   "pages": [
     {
       "description": "{\"attached\":true,\"empty\":false,\"height\":1458,\"screenX\":0,\"screenY\":336,\"visible\":true,\"width\":1080}",
       "devtoolsFrontendUrl": "http://chrome-devtools-frontend.appspot.com/serve_rev/@22955682f94ce09336197bfb8dffea991fa32f0d/inspector.html?ws=127.0.0.1:10900/devtools/page/27325CC50B600D31B233F45E09487B1F",
       "id": "27325CC50B600D31B233F45E09487B1F",
       "title": "Releases · appium/appium · GitHub",
       "type": "page",
       "url": "https://github.com/appium/appium/releases",
       "webSocketDebuggerUrl": "ws://127.0.0.1:10900/devtools/page/27325CC50B600D31B233F45E09487B1F"
     }
   ],
   "webviewName": "WEBVIEW_com.io.appium.setting"
 }
```

### mobile: installMultipleApks

Install applications via `install-multiple` option.
Please read more details in the corresponding section of the `adb --help` command output.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
apks | Array&lt;string&gt; | yes | The path to APKs. Each path should be the full path to the apk to be installed, or an URL to a remote location. | `['/path/to/local.apk', 'https://github.com/appium/ruby_lib_core/blob/master/test/functional/app/api.apk.zip?raw=true']`
options | object | no | Installation options. If you want enable `-g` option, you could specify that `{grantPermissions: true}`. `allowTestPackages` corresponds `-t`, `useSdcard` corresponds `-s`, `replace` corresponds `-r` (`-r` is enabled by default), `partialInstall` corresponds `-p`. | `{grantPermissions: true, partialInstall: true}`

### mobile: lock

Lock the device (and optionally unlock it after a certain amount of time). Only simple (e.g. without a password) locks are supported.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
seconds | number|string | no | The number of seconds after which to unlock the device. Set to `0` or leave it empty to require manual unlock (e.g. do not block and automatically unlock afterwards). | 5

### mobile: unlock

Unlocks the device if it is locked. Noop if the device's screen is not locked.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
key | string | yes | The unlock key. See the documentation on [appium:unlockKey](#device-locking) capability for more details | 12345
type | string | yes | The unlock type. See the documentation on [appium:unlockType](#device-locking) capability for more details | password
strategy | string | no | Unlock strategy. See the documentation on [appium:unlockStrategy](#device-locking) capability for more details | uiautomator
timeoutMs | number | no | Unlock timeout. See the documentation on [appium:unlockSuccessTimeout](#device-locking) capability for more details | 5000

### mobile: isLocked

Determine whether the device is locked.

#### Returned Result

Either `true` or `false`

### mobile: setGeolocation

Sets emulated geolocation coordinates on the device under test.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
latitude | number | yes | [Latitude](https://en.wikipedia.org/wiki/Latitude) value | 32.456
longitude | number | yes | [longitude](https://en.wikipedia.org/wiki/Longitude) value | 32.456
altitude | number | no | [Altitude](https://en.wikipedia.org/wiki/Altitude) value. Zero by default | 5.678

### mobile: getGeolocation

Retrieves current geolocation coordinates from the device under test. If coordinates are mocked/emulated
then these coordinates would be returned.

#### Returned Result

A map with the following entries:

Name | Type | Description | Example
--- | --- | --- | ---
latitude | number | [Latitude](https://en.wikipedia.org/wiki/Latitude) value | 32.456
longitude | number | [longitude](https://en.wikipedia.org/wiki/Longitude) value | 32.456
altitude | number | [Altitude](https://en.wikipedia.org/wiki/Altitude) value | 5.678

### mobile: resetGeolocation

Resets mocked geolocation provider to the default/system one. Only works for real devices.

### mobile: refreshGpsCache

Sends a request to refresh the GPS cache on the device under test.
By default the location tracking is configured for
[low battery consumption](https://github.com/appium/io.appium.settings/blob/master/app/src/main/java/io/appium/settings/LocationTracker.java),
so you might need to call this extension periodically to get the updated geo
location if the actual (or mocked) device location is changed too frequently.
The feature only works if the device under test has Google Play Services installed.
In case the vanilla
[LocationManager](https://developer.android.com/reference/android/location/LocationManager)
is used the device API level must be at version 30 (Android R) or higher.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
timeoutMs | number | no | The maximum number of milliseconds to block until GPS cache is refreshed. If the API call does not receive a confirmation about successful cache refresh within this timeout then an error is thrown. Providing zero or a negative value to it skips waiting completely and does not check for any errors. 20000 ms by default. | 60000

### mobile: startMediaProjectionRecording

Starts a new recording of the device activity using [Media Projection](https://developer.android.com/reference/android/media/projection/MediaProjection) API. This API is available since Android 10 (API level 29) and allows to record device screen and audio in high quality. Video and audio encoding is done by Android itself.
The recording is done by [Appium Settings helper](https://github.com/appium/io.appium.settings#internal-audio--video-recording).

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
resolution | string | no | The resolution of the resulting video, which usually equals to Full HD 1920x1080 on most phones, however you could change it to one of the following supported resolutions: "1920x1080", "1280x720", "720x480", "320x240", "176x144" | 1280x720
maxDurationSec | number | no | The maximum number of seconds allowed for the recording to run. 900 seconds by default (15 minutes) | 300
priority | string | no | Recording thread priority is set to maximum (`high`) by default. However if you face performance drops during testing with recording enabled, you could reduce the recording priority to `normal` or `low`. | low
filename | string | no | You can type recording video file name as you want, but recording currently supports only "mp4" format so your filename must end with ".mp4". An invalid file name will fail to start the recording. If not provided then the current timestamp will be used as file name. | screen.mp4

#### Returned Result

`true` if a new recording has successfully started. `false` if another recording is currently running.

### mobile: isMediaProjectionRecordingRunning

Check if a media projection recording is currently running

#### Returned Result

`true` if a recording is running.

### mobile: stopMediaProjectionRecording

Stops a recording and retrieves the recently recorded media. If no recording has been started before then an error is thrown. If the recording has been already finished before this API has been called then the most recent recorded media is returned.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | no | The path to the remote location, where the resulting video should be uploaded. The following protocols are supported: http/https, ftp. Null or empty string value (the default setting) means the content of resulting file should be encoded as Base64 and passed as the endpoont response value. An exception will be thrown if the generated media file is too big to fit into the available process memory. | https://myserver.com/upload
user | string | no | The name of the user for the remote authentication. | admin
pass | string | no | The password for the remote authentication. | pa$$w0rd
method | string | no | The http multipart upload method name. The 'PUT' one is used by default. | POST
headers | Map&lt;string, string&gt; | no | Additional headers mapping for multipart http(s) uploads | {'Agent': '007'}
fileFieldName | string | no | The name of the form field, where the file content BLOB should be stored for http(s) uploads. `file` by default | blob
formFields | Map&lt;string, string&gt; or Array&lt;Pair&gt; | no | Additional form fields for multipart http(s) uploads. | {'name': 'yolo.mp4'}
uploadTimeout | number | no | The maximum number of milliseconds to wait until the media file is uploaded to the remote location. 240000 ms by default. | 30000

#### Returned Result

Base64-encoded content of the recorded media file if `remotePath` argument is falsy or an empty string.

### mobile: getConnectivity

Returns connectivity states for different services

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
services | string or string[] | no | One or more services to get the connectivity for. Supported service names are: wifi, data, airplaneMode. If no service names are provided then all supported names are assumed by default. | [wifi, data]

#### Returned Result

A map is returned containing the following possible items (depending on which values have been passed to `services` argument):

Name | Type | Description
--- | --- | ---
wifi | boolean | True if wifi is enabled
data | boolean | True if mobile data connection is enabled
airplaneMode | boolean | True if Airplane Mode is enabled

### mobile: setConnectivity

Set the connectivity state for different services. At least one valid service name must be provided in arguments.
Missing values tell the driver to not change the corresponding service's state.

> **Note**
>
> Switching Wi-Fi and mobile data states reliably work on emulators for all Android versions.
> Real devices support proper state switching only since Android 11.

> **Note**
>
> UiAutomator2 REST server app is running on the device under test and might be terminated/disconnected by Android
> thus failing the driver session as a result of using this API. The only way to restore the session would be to quit it
> after the network state is changed and then reopen it with `noReset` capability being set to `true` when the connectivity
> is restored.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
wifi | booolean | no | Either to enable or disable Wi-Fi. | false
data | booolean | no | Either to enable or disable mobile data. | false
airplaneMode | booolean | no | Either to enable or disable Airplane Mode. | false

### mobile: getAppStrings

Retrieves string resources for the given app language. An error is thrown if strings cannot be fetched or no strings exist
for the given language abbreviation. Available since driver version 2.15.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
language | string | no | The language abbreviation to fetch app strings mapping for. If no language is provided then strings for the default language on the device under test would be returned | fr

#### Returned Result

App strings map, where keys are resource identifiers.

### mobile: hideKeyboard

Tries to hide the on-screen keyboard. Throws an exception if the keyboard cannot be hidden.
Does nothing if the keyboard is already hidden.

#### Returned Result

`true` if the keyboard was successfully hidden or `false` if it was already invisible.

### mobile: isKeyboardShown

Checks if the system on-screen keyboard is visible.

#### Returned Result

`true` if the keyboard is visible

### mobile: pressKey

Emulates single key press on the key with the given code. Available since driver version 2.17.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
keycode | number | yes | A valid Android key code. See [KeyEvent documentation](https://developer.android.com/reference/android/view/KeyEvent) for the list of available key codes | 0x00000099 (which is KEYCODE_NUMPAD_9)
metastate | number | no | An integer in which each bit set to 1 represents a pressed meta key. See [KeyEvent documentation](https://developer.android.com/reference/android/view/KeyEvent) for more details. | 0x00000010 (which is META_ALT_LEFT_ON)
flags | number | no | Flags for the particular key event. See [KeyEvent documentation](https://developer.android.com/reference/android/view/KeyEvent) for more details. | 0x00000001 (which is FLAG_WOKE_HERE)
isLongPress | boolean | no | Whether to emulate long key press. `false` by default. | true

### mobile: backgroundApp

Puts the app to the background and waits the given number of seconds. Then restores the app
if necessary. The call is blocking. Available since driver version 2.19.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
seconds | number | no | The amount of seconds to wait between putting the app to background and restoring it. Any negative value means to not restore the app after putting it to background (the default behavior). | 5

### mobile: getCurrentActivity

Returns the name of the currently focused app activity. Available since driver version 2.20

#### Returned Result

The activity class name. Could be `null`

### mobile: getCurrentPackage

Returns the name of the currently focused app package identifier. Available since driver version 2.20

#### Returned Result

The package class name. Could be `null`

### mobile: getDisplayDensity

Returns the display density value measured in DPI. Available since driver version 2.21

#### Returned Result

The actual DPI value as integer number

### mobile: getSystemBars

Returns properties of various system bars. Available since driver version 2.21

#### Returned Result

A dictionary whose entries are:
- `statusBar`
- `navigationBar`

Values are dictionaries with the following properties:
- `visible`: Whether the bar is visible (equals to `false` if the bar is not present in the system info output)
- `x`: Bar x coordinate (might be zero if the bar is not present in the system info output)
- `y`: Bar y coordinate (might be zero if the bar is not present in the system info output)
- `width`: Bar width (might be zero if the bar is not present in the system info output)
- `height`: Bar height (might be zero if the bar is not present in the system info output)

### mobile: fingerprint

Emulate [fingerprint](https://learn.microsoft.com/en-us/xamarin/android/platform/fingerprint-authentication/enrolling-fingerprint) on Android Emulator. Only works on API 23+. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
fingerprintId | number | yes | The value is the id for the finger that was "scanned". It is a unique integer that you assign for each virtual fingerprint. When the app is running you can run this same command each time the emulator prompts you for a fingerprint, you can run the adb command and pass it the fingerprintId to simulate the fingerprint scan. | 1

### mobile: sendSms

Emulate sending an SMS to the given phone number. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
phoneNumber | string | yes | The phone number to send SMS to | 0123456789
message | string | yes | The SMS message payload | Hello

### mobile: gsmCall

Emulate a GSM call to the given phone number. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
phoneNumber | string | yes | The phone number to call to | 0123456789
action | call or accept or cancel or hold | yes | One of possible actions to take | accept

### mobile: gsmSignal

Emulate GSM signal strength change event. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
strength | 0 or 1 or 2 or 3 or 4 | yes | One of possible signal strength values, where 4 is the best signal. | 3

### mobile: gsmVoice

Emulate GSM voice state change event. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
state | on or off or denied or searching or roaming or home or unregistered | yes | Voice state | off

### mobile: powerAC

Emulate AC power state change. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
state | on or off | yes | AC Power state | off

### mobile: powerCapacity

Emulate power capacity change. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
percent | 0 to 100 | yes | Percentage value in range [0, 100] | 50

### mobile: networkSpeed

Emulate different network connection speed modes. Only works on emulators. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
speed | gsm or scsd or gprs or edge or umts or hsdpa or lte or evdo or full | yes | Mobile network speed mode name | edge

### mobile: replaceElementValue

Sends a text to the given element by replacing its previous content. Available since driver version 2.22

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
elementId | string | yes | Hexadecimal identifier of the destination text input | 123456-3456-3435-3453453
text | string | yes | The text to enter. It could also contain Unicode characters. If the text ends with `\\n` (the backslash must be escaped, so the char is NOT translated into `0x0A`) then the Enter key press is going to be emulated after it is entered (the `\\n` substring itself will be cut off from the typed text). | yolo

### mobile: toggleGps

Switches GPS setting state. This API only works reliably since Android 12 (API 31). Available since driver version 2.23

### mobile: isGpsEnabled

Returns `true` if GPS is enabled on the device under test. Available since driver version 2.23

### mobile: getPerformanceDataTypes

Fetches the list of supported performance data types that could be used as `dataType` argument value to [mobile: getPerformanceData](#mobile-getperformancedata) extension. Available since driver version 2.24

#### Returned Result

List of strings, where each item is data type name.

### mobile: getClipboard

Retrieves the plaintext content of the device's clipboard. Available since driver version 3.7

#### Returned Result

Base64-encoded content of the clipboard or an empty string if the clipboard is empty.

### mobile: setClipboard

Allows to set the plain text content of the device's clipboard. Available since driver version 3.7

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
content | string | yes | Base64-encoded clipboard payload. | YXBwaXVt
contentType | string | no | The only supported and the default value is `plaintext` | plaintext
lable | string | no | Optinal label to identify the current clipboard payload. | yolo

### mobile: getPerformanceData

Retrieves performance data about the given Android subsystem. The data is parsed from the output of the dumpsys utility. Available since driver version 2.24

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
packageName | string | yes | The name of the package identifier to fetch the data for | com.myapp
dataType | string | yes | One of supported subsystem names. The full list of supported values is returned by [mobile: getPerformanceDataTypes](#mobile-getperformancedatatypes) extension. | batteryinfo or cpuinfo or memoryinfo or networkinfo

#### Returned Result

The output depends on the selected subsystem. It is organized into a table, where the first row represents column names and the following rows represent the sampled data for each column.
Example output for different data types:

- batteryinfo:
```
[
  [power],
  [23]
]
```
- memoryinfo:
```
[
  [totalPrivateDirty, nativePrivateDirty, dalvikPrivateDirty, eglPrivateDirty, glPrivateDirty, totalPss, nativePss, dalvikPss, eglPss, glPss, nativeHeapAllocatedSize, nativeHeapSize],
  [18360, 8296, 6132, null, null, 42588, 8406, 7024, null, null, 26519, 10344]
]
```
- networkinfo:
```
// emulator
[
  [bucketStart, activeTime, rxBytes, rxPackets, txBytes, txPackets, operations, bucketDuration],
  [1478091600000, null, 1099075, 610947, 928, 114362, 769, 0, 3600000],
  [1478095200000, null, 1306300, 405997, 509, 46359, 370, 0, 3600000]
]
// real devices
[
  [st, activeTime, rb, rp, tb, tp, op, bucketDuration],
  [1478088000, null, null, 32115296, 34291, 2956805, 25705, 0, 3600],
  [1478091600, null, null, 2714683, 11821, 1420564, 12650, 0, 3600],
  [1478095200, null, null, 10079213, 19962, 2487705, 20015, 0, 3600],
  [1478098800, null, null, 4444433, 10227, 1430356, 10493, 0, 3600]
]
```
- cpuinfo:
```
[
  [user, kernel],
  [0.9, 1.3]
]
```

### mobile: statusBar

Performs commands on the system status bar. A thin wrapper over `adb shell cmd statusbar` CLI. Works on Android 8 (Oreo) and newer. Available since driver version 2.25

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
command | string | yes | One of [supported status bar commands](#status-bar-commands). | expandNotifications
component | string | no | The name of the tile component. It is only required for (add\|remove\|click)Tile commands. | com.package.name/.service.QuickSettingsTileComponent

#### Status Bar Commands

- expandNotifications: Open the notifications panel.
- expandSettings: Open the notifications panel and expand quick settings if present.
- collapse: Collapse the notifications and settings panel.
- addTile: Add a TileService of the specified component.
- removeTile: Remove a TileService of the specified component.
- clickTile: Click on a TileService of the specified component.
- getStatusIcons: Returns the list of status bar icons and the order they appear in. Each list item is separated with a new line character.

#### Returned Result

The actual downstream command output. It depends on the selected command and might be empty.

### mobile: scheduleAction
### mobile: unscheduleAction
### mobile: getActionHistory

These extensions allow to deal with short-living UI elements. Read [the documentation on Scheduled Actions](docs/scheduled-actions.md) for more details and code examples.

### mobile: screenshots

Retrieves a screenshot of each display available to Android.
This functionality is only supported since Android 10.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
displayId | number or string | no | Display identifier to take a screenshot for. If not provided then all display screenshots are going to be returned. If no matches were found then an error is thrown. Actual display identifiers could be retrived from the `adb shell dumpsys SurfaceFlinger --display-id` command output. | 1

#### Returns

A dictionary where each key is the display identifier and the value has the following keys:
- `id`: The same display identifier
- `name`: Display name
- `isDefault`: Whether this display is the default one
- `payload`: The actual PNG screenshot data encoded to base64 string

### mobile: setUiMode

Set the device UI appearance. A thin wrapper over `adb shell cmd uimode` CLI.
Works on Android 10 and newer. Available since driver version 2.34

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
mode | string | yes | One of the supported UI mode names: `night` or `car`. | night
value | string | yes | The actual mode value to set. Supported values for different UI modes are: `night`: yes,no,auto,custom_schedule,custom_bedtime, `car`: yes,no. For example, to switch the device UI to the dark mode you should set `mode` to `night` and `value` to `yes`, or to `no` in order to switch back to the light mode. | yes

### mobile: getUiMode

Gets the device UI appearance for the given mode. A thin wrapper over `adb shell cmd uimode` CLI. Works on Android 10 and newer. Available since driver version 2.34

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
mode | string | yes | One of the supported UI mode names: `night` or `car`. | night

#### Returned Result

The actual mode value. Supported values for different UI modes are:

- `night`: yes,no,auto,custom_schedule,custom_bedtime
- `car`: yes,no

### mobile: sendTrimMemory

Simulates the [onTrimMemory()](https://developer.android.com/reference/android/content/ComponentCallbacks2#onTrimMemory(int)) event for the given package, which allows to verify the app functinality under different RAM-related circumstances.
Read [Manage your app's memory](https://developer.android.com/topic/performance/memory) for more details.
Available since driver version 2.41

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
pkg | string | yes | The package name to send the `trimMemory` event to. | com.my.company
level | 'COMPLETE' or 'MODERATE' or 'BACKGROUND' or 'UI_HIDDEN' or 'RUNNING_CRITICAL' or 'RUNNING_LOW' or 'RUNNING_MODERATE' | yes | The actual memory trim level to simulate | RUNNING_CRITICAL

### mobile: injectEmulatorCameraImage

Simulates an image injection into the VirtualScene emulator camera background.
Calls to this extension should seamlessly change the foreground picture
in the VirtualScene emulator camera view to the supplied one.
This extension could, for example, be useful if you need to verify QR codes scanning
by the application under test.
Available since driver version 3.2.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
payload | string | yes | A valid base64-encoded .PNG image payload. Other image formats are not supported. This image will be shown on the virtual scene foreground as soon as you open a camera client app. | iVBORw0KGgoAAAANSUh...

#### Required Preconditions

This feature only works on Android emulators.
It is mandatory to provide a value (it could also be an empty map to use defaults) to
the [appium:injectedImageProperties capability](#emulator-android-virtual-device)
in order to prepare the emulator for image injection if this extension is used
on a newly created or resetted device.

There is also a possiblity to perform a manual configuration of the necessary preconditions
if you don't want to restart the emulator on session startup. For that replace the content
of the `Toren1BD.posters` file located in `$ANDROID_HOME/emulator/resources` folder with the
following text:

```
poster wall
size 2 2
position -0.807 0.320 5.316
rotation 0 -150 0
default poster.png

poster table
size 1 1
position 0 0 -1.5
rotation 0 0 0
```

Save the changed file and re(start) the emulator to pick up the changes.
You may also customize values for different image properties under `poster table` in the above
text snippet.

### mobile: bluetooth

Allows to control the bluetooth adapter in the device under test.
An error is thrown if the device has no default bluetooth adapter.
Available since driver version 3.4.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
action | string | yes | The action to execute on the bluetooth adapter. The following actions are supported: `enable`, `disable`, `unpairAll`. Calling the same action more than once is a noop. | disable

### mobile: nfc

Allows to control the NFC adapter in the device under test.
An error is thrown if the device has no default NFC adapter.
Available since driver version 3.4.0

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
action | string | yes | The action to execute on the NFC adapter. The following actions are supported: `enable`, `disable`. Calling the same action more than once is a noop. | disable

## Applications Management

UiAutomator2 driver supports Appium endpoints for applications management:
- Check if app is installed ([mobile: isAppInstalled](#mobile-isappinstalled))
- Install/upgrade app ([mobile: installApp](#mobile-installapp))
- Activate app ([mobile: activateApp](#mobile-activateapp))
    - Since UIAutomator2 driver v2.2.0, the server calls `am start`/`am start-activity` to start the application on devices with API level 24+. [monkey](https://developer.android.com/studio/test/other-testing-tools/monkey) tool is called on devices below API level 24.
    - UIAutomator2 driver v2.1.2 and lower versions call the `monkey` tool on all devices.
    - The `monkey` tool [turns on auto rotation](https://stackoverflow.com/questions/56684778/adb-shell-monkey-command-changing-device-orientation-lock), so please consider using [mobile: startActivity](#mobile-startactivity) if you would like to keep your current rotation preferences.
- Uninstall app ([mobile: removeApp](#mobile-removeapp))
- Terminate app ([mobile: terminateApp](#mobile-terminateapp))
- Start app activity ([mobile: startActivity](#mobile-startactivity))
- Query the current app state ([mobile: queryAppState](#mobile-queryappstate))
- Background app ([mobile: backgroundApp](#mobile-backgroundapp))

Refer to the corresponding Appium client tutorial to find out the names of the corresponding wrappers for these APIs.

Useful links:
- https://appiumpro.com/editions/9-testing-android-app-upgrades
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/applications.py
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/InteractsWithApps.java


## Files Management

UiAutomator2 driver supports Appium endpoints for files management:
- Push file ([mobile: pushFile](#mobile-pushfile))
- Pull file ([mobile: pullFile](#mobile-pullfile))
- Pull folder ([mobile: pullFolder](#mobile-pullfolder))

Refer to the corresponding Appium client tutorial to find out the names of the corresponding wrappers for these APIs.

Useful links:
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/InteractsWithFiles.java
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/remote_fs.py


## Clipboard Management

UiAutomator2 driver supports Appium endpoints for clipboard management:
- Set clipboard content (`POST /appium/device/set_clipboard'`)
- Get clipboard content (`POST /appium/device/get_clipboard`)
- [mobile: getClipboard](#mobile-getclipboard)
- [mobile: setClipboard](#mobile-setclipboard)

Useful links:
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/clipboard.py
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/clipboard/HasClipboard.java
- https://appiumpro.com/editions/16-automating-the-clipboard-on-ios-and-android


## Hybrid Mode

UIA2 driver supports automation of web pages opened in mobile Chrome or Chromium, and
hybrid apps that use Chrome-based web views, by managing a
[Chromedriver](https://sites.google.com/a/chromium.org/chromedriver/) instance and
proxying commands to it when necessary.

The following endpoints are used to control the current context:

- POST `/session/:sessionId/context`: To set the current context. The body contains a single mandatory `name` parameter, which has the name of the context to be set. The name of the default context is `NATIVE_APP`.
- GET `/session/:sessionId/context`: To retrieve the name of the current context
- GET `/session/:sessionId/contexts`: To retrieve the list of available context names
- [mobile: getContexts](#mobile-getcontexts)

By default, the driver starts in the native context, which means that most of REST API commands are being
forwarded to the downstream [appium-uiautomator2-server](https://github.com/appium/appium-uiautomator2-server).
This server is running on the device under test, and trasforms API commands to appropriate low-level UiAutomator framework calls. There is always only one native context, although multiple web contexts are possible.
Each web context could contain zero or more pages/windows. It is possible to start UIA2 driver session in web context by default by setting the `browserName` capability value or by enabling the `appium:autoWebview` capability.

Web context(s) could be detected if a browser or a web view is active on the device. If a context is switched to
a web one then UIA2 driver spins up a Chromedriver instance for it and forwards most of the commands
to that Chromedriver instance. Note that web views must be properly configured and
debuggable in order to connect to them or get their names in the list of available contexts.
The availability of a particular web view could be easily verified by using
[Chrome Remote Debugger](https://developer.chrome.com/docs/devtools/remote-debugging/).
You could switch between different contexts (and windows in them) at any time during the session.

The [appium-chromedriver](https://github.com/appium/appium-chromedriver) package bundled with UIA2 always
tries to download the most recent version of Chromedriver known to it. Google requires that the used Chromedriver version must always match to the version of the browser or a web view engine being automated. If these versions do not match then Chromedriver fails its creation, and context switch API shows a failure message
similar to:

```
An unknown server-side error occurred while processing the command.
Original error: unknown error: Chrome version must be >= 55.0.2883.0
```

To work around this issue it is necessary to provide UIA2 driver with a proper Chromedriver binary
that matches to the Chrome engine version running on the device under test.
Read the [Chromedriver/Chrome compatibility](#chromedriverchrome-compatibility) topic below to
know more about finding a matching Chromedriver executable.

There are several ways to provide a customized Chromedriver to UIA2 driver:

#### When installing the driver

_Note_: This only works for driver versions below 3.8.0

Specify the Chromedriver version in the `CHROMEDRIVER_VERSION` environment variable:

```bash
CHROMEDRIVER_VERSION=2.20 appium install driver uiautomator2
```

#### When starting a session (manual discovery)

Chromedriver version can be specified in session capabilities, by providing the
`appium:chromedriverExecutable` [capability](#web-context),
containing the full path to a matching Chromedriver executable, which must be manually
downloaded and put to the server file system.

#### When starting a session (automated discovery)

UIA2 driver could also try to detect the version of the target Chrome engine and
download matching chromedriver for it automatically if it does not exist on the local file system.
Read the [Automatic discovery of compatible Chromedriver](#automatic-discovery-of-compatible-chromedriver)
topic below for more details.

### Chromedriver/Chrome Compatibility

Since version *2.46* Google has changed their rules for Chromedriver versioning, so now the major Chromedriver version corresponds to the major web view/browser version, that it can automate. Follow the [Version Selection](https://chromedriver.chromium.org/downloads/version-selection) document in order to manually find the Chromedriver, that supports your current browser/web view if its major version is equal or above *73*.

To find the minimum supported browsers for older Chromedriver versions (below *73*), get the
[Chromium](https://www.chromium.org/Home)
[source code](https://chromium.googlesource.com/chromium/src/+/master/docs/get_the_code.md),
check out the release commit, and check the variable `kMinimumSupportedChromeVersion`
in the file `src/chrome/test/chromedriver/chrome/version.cc`. (To find the
release commits, you could use `git log --pretty=format:'%h | %s%d' | grep -i "Release Chromedriver version"`.)

The complete list of available Chromedriver releases and release notes is located at [Chromedriver Storage](https://chromedriver.storage.googleapis.com/index.html).

The list of Chromedriver versions and their matching minimum
Chrome versions known to appium-chromedriver package is stored at
https://raw.githubusercontent.com/appium/appium-chromedriver/master/config/mapping.json

### Automatic Discovery of Compatible Chromedriver

UIA2 driver is able to pick the correct Chromedriver for the
version of Chrome/web view under test. While appium-chromedriver only comes bundled with the Chromedriver
most recently released at the time of the corresponding package version's release, more Chromedriver
versions could be downloaded and placed into a custom location indicated to UIA2 driver via the `appium:chromedriverExecutableDir` [capability](#web-context).

A custom mapping of Chromedrivers to the minimum
Chrome/web view version they support could be given to UIA2 driver through the
`appium:chromedriverChromeMappingFile` [capability](#web-context). This should be the
absolute path to a file with the mapping
in it. The contents of the file needs to be parsable as a JSON object, like:

```json
{
  "2.42": "63.0.3239",
  "2.41": "62.0.3202"
}
```

There is a possibility to automatically download the necessary chromedriver(s) into `appium:chromedriverExecutableDir` from the official Google storage. The script will automatically search for the newest chromedriver version that supports the given browser/web view, download it (the hash sum is verified as well for the downloaded archive) and add to the `appium:chromedriverChromeMappingFile` mapping. Everything, which is needed to be done from your side is to execute the server with `chromedriver_autodownload` feature enabled (like `appium server --allow-insecure chromedriver_autodownload`).

### Troubleshooting Chromedriver Download Issues

Check the [Custom binaries url](https://github.com/appium/appium-chromedriver?tab=readme-ov-file#custom-binaries-url)
section of appium-chromedriver README for more details on how to customize the download CDN.

It may also be necessary to adjust network proxy and firewall settings for the above to work.

If you use a UIA2 driver below version 3.8.0, and you
would like skip the automated download of Chromedriver upon driver install, do it by
defining the `APPIUM_SKIP_CHROMEDRIVER_INSTALL` environment variable:

```bash
APPIUM_SKIP_CHROMEDRIVER_INSTALL=1 appium driver install uiautomator2
```

### W3C Support in Web Context

Chromedriver did not follow the W3C standard until version 75. If you encounter proxy command error like [this issue](https://github.com/appium/python-client/issues/234), please update your Chromedriver version.
Old Android devices can't use newer Chromedriver versions. You could avoid the error if you enforce
Mobile JSON Wire Protocol for Chromedriver. This could be done by providing `{'w3c': False}` item
to `appium:chromeOptions` capability value.
Since major version *75* W3C mode is the default one for Chromedriver, although it could be still switched to JSONWP one as described above (keep in mind that eventually Chromedriver will drop the support of
JSON Wire protocol completely).
The history of W3C support in Chromedriver is available for reading at
[downloads section](https://sites.google.com/a/chromium.org/chromedriver/downloads).


## Troubleshooting

### Activity Startup

If you experience issues with application activities being not found or not starting then consider checking [How To Troubleshoot Activities Startup](docs/activity-startup.md) article.

### Poor Elements Interaction Performance

If you observe automated tests need at least 10 seconds or more to locate/interact with a single element then consider changing the default value for [waitForIdleTimeout setting](#settings-api). By default, UiAutomator framework (and all other Accessibility-based frameworks) always waits for the accessibility event stream to become idle before interacting with it (the default timeout there is 10000ms). This is needed to make sure all animations/transitions are finished before you, for example, interact with an element by clicking it. In case the application under test constantly runs some background animations or hogs the accessibility event stream in some other way these waits may significantly slow down the automation flow.

Setting the value of `waitForIdleTimeout` to zero `0` ms should completely disable any waits, and enforce interactions to happen immediately ignoring the accessibility event stream state. The downside of that would be that all interactions are never going to be delayed, so clicks and other actions might happen at wrong places of the application UI. That is why is it important to check the app under test first and fix its source to get rid of activities hogging the event loop. Sometimes it makes sence to disable animations completely for the app build under test, which could speed up your flows significantly in some situations.

> **Warning**
> `waitForIdleTimeout` is a setting, not a capability.

### Session Startup Issues

Sometimes various legacy driver parts might be cached on the device under test (like settings.apk), which would prevent a new/upgraded driver version from starting a session. Run

```bash
appium driver run uiautomator2 reset
```

in order to cleanup the cached UIA2 driver binaries from all connected devices on the current machine.

### Socket Hangup Error

This type of error means the driver is unable to connect to the UiAutomator2 REST server, which is running on the device under test. There might be multiple causes to this issue:
- The automation session gets unexpectedly deleted if your test code sends the `DELETE /session/<id>` request to it, also the corresponding session and the server itself are terminated as a result. Sending further commands to the same server would create the error above because it is not listening anymore and must be newly started by the instrumentation first. Such issues usually happen if the session management is not configured properly in your code, so one starts a new session while an existing one is still running and has not been quit properly, or there is a timeout while waiting for a new command. Fixing session management logic (e.g. make sure each session is being properly created in the test setup section and is terminated in the test teardown) or changing/disabling the commands' timeout (check the [newCommandTimeout capability](#other)) might help to address such type of errors.
- The server has been unexpectedly killed by Android OS itself. There might be several reasons to that. Usually fetching the [logcat](https://developer.android.com/studio/command-line/logcat) output and finding occurrences of `io.appium.uiautomator2.server` traces with `error` or `exception` label might help to figure out what happens. Sometimes it is necessary to turn off some internal phone optimizations, sometimes the server crashes because of an internal UiAutomator framework bug, sometimes because of a bug in the server code itself. Each case should be investigated separately if the search over the internet shows no matches…
- The connectivity between the phone and the host is unstable. Nothing much to add on this one. Maybe the phone has a defect, or the USB cable is damaged, or the installed Android SDK is out of date…

### Element(s) Cannot be Found

All element location strategies in UIA2 driver work similarly under the hood except of the xpath one.
If some element is not found, but you see/assume it is present in the page source then make sure no race condition
happens. Add a timer and wait for a couple of seconds before giving up on the element location. In case the lookup
still fails after the timeout and your non-xpath locator is used then, most likely, it contains a typo, or the
destination element is not present. There is not much that could be done in UIA2 to change/influence that, since it passes such lookup calls directly to Google's UiAutomator framework.

In case of _xpath_ locators you could try to change values of the following settings:

1. [allowInvisibleElements](#settings-api)
2. [ignoreUnimportantViews](#settings-api)
3. [enableMultiWindows](#settings-api)

By default, the first setting is set to `false`, which hides
elements that are not visible from the page source and from the xpath location. Changing the setting value
to `true` would add such invisible elements to the page source and make them locatable.

The second one is enabled by default (e.g. `true`). By disabling it the page source could receive more elements
that are normally hidden, because of their unimportance.

The third setting being set to `true` extends the page source by adding the actual content of other windows that are currently present on the device's screen. For example, the on-screen keyboard in Android is not a part of the current app hierarchy, but rather belongs to a separate window.

In case of _id_ locators you could try to change the value of the following setting:

1. [disableIdLocatorAutocompletion](#settings-api)

The general resources naming convention for Android apps is `<app_id>:id/<resource_name>`. This should guarantee uniqueness of each identifier accross the user interface. Although, this is only a convention and it is still allowed to have various resource names that do not follow it. If you have gotten one of such applications for automated testing then consider assigning `disableIdLocatorAutocompletion` setting value to `true`, so UiAutomator2 driver does not automatically rewrite supplied id values by adding `<app_id>:id/` prefixes to them.

> **Warning**
> Default values for settings above have been selected to optimize xpath lookup and page source generation performance.
> Having these settings always different from their default values may sometimes significantly (especially in case of huge accessbility hierarchies) reduce xpath lookup and page source generation speed.

> **Warning**
> All items above are settings, not capabilities.

### ClassCastException: java.util.ArrayList$ListItr cannot be cast to org.eclipse.wst.xml.xpath2.processor

This exception happens due to a known bug in the [Eclipse's Psychopath](https://wiki.eclipse.org/PsychoPathXPathProcessor) library used by UiAutomator2 driver to support [XPath2](https://www.w3.org/TR/xpath20/) syntax. The issue has been observed while using `following::` or `preceding::` axes in xpath queries. Unfortunately, this library has not been maintained for quite a while, and there is no good open source alternative to it. The only known workaround would be to forcefully switch the driver's XPath processor to the standard Android's Apache Harmony-based XPath1, which does not have this issue (but also does not support XPath2 syntax). See the Appium issue [#16142](https://github.com/appium/appium/issues/16142#issuecomment-1003954166) for more details.

### A gesture, like scroll or swipe, does not have any effect / It is unclear how to do it

The UiAutomator2 driver provides multiple options for touch gestures automation.
For simple gestures, like swipe, scroll, drag, double click, fling or pinch use the corresponding
[gesture shortcuts](#mobile-gesture-commands).
You may also use [UiScrollable-based UiAutomator locators](./docs/uiautomator-uiselector.md)
to automate various scrolling behaviours.
For more sophisticated gestures
consider using [W3C actions](https://w3c.github.io/webdriver/#actions).


Make sure you don't use deprecated JWP touch actions APIs. They have been
removed from the UIA2 driver since version 3.

If the action code in the client source looks good and satisfies the above requirements,
but its execution still does not deliver the expected result then the following debugging
meassures might be applied:

- Enable `Show taps` and `Pointer location` Developer options in the device Settings. After running
  your automation code with the above options enabled you would be able to see the exact pointer trace path
  and check the velocity of the gesture. It also works for multi-touch gestures. Compare the trace
  to how the same gesture is usually done manually and apply the necessary updates to your code.
- Check the device [logcat](https://developer.android.com/studio/debug/logcat) output for possible
  error messages. Usually a single gesture consists of hundreds of atomic steps. If any of these steps
  receives incorrect/unsupported parameters then the whole gesture might fail. The log has details
  about each step being executed and arguments passed to it.
- Make sure the gesture has valid coordinates and respects pauses between pointer state changes.
  For example, it is always mandatory to provide a valid element or valid `absolute` coordinates
  to any gesture at the beginning. Android only registers
  a long touch/click if the pointer has been depressed for longer than 500ms. For shorter actions
  a simple click is registered instead.
- Do not mix webview and native elements in actions arguments. It simply won't work. Native
  actions could only consume native elements. A single possibility to perform a native action
  on a web element would be to traslate its coordinates into the native context and pass these
  coordinates as native action arguments.

Check the below tutorials for more details on how to build reliable action chains:

- [Automating Complex Gestures with the W3C Actions API](https://appiumpro.com/editions/29-automating-complex-gestures-with-the-w3c-actions-api)
- [Swiping your way through Appium by Wim Selles #AppiumConf2021](https://www.youtube.com/watch?v=oAJ7jwMNFVU)
- [Low-Level Insights on Android Input Events](./docs/actions.md)

### window/tab hanlding in WEBVIEW context implemented by chrome custom tabs

[Chrome custom tabs](https://developer.chrome.com/docs/android/custom-tabs/) could have its own window handlings as same as regular Selenium Web automation.

Appium lets you switch the context from `NATIVE_APP` to `WEBVIEW_xyz`, for example, to interact with the WEBVIEW contents over chromedriver. Then, if the WEBVIEW was chrome custom tabs implementation, the WEBVIEW context may require you to switch the window handler properly to interact with contents in a handler.
It is worth to try out this idea if `chrome://inspect` or [mobile: getContexts](#mobile-getcontexts) shows you available pages more than availale contexts.

```ruby
# Ruby
# Change the context to WebView (Attach to a chromedriver session)
driver.set_context('WEBVIEW_XYZ')

# Get available tabs/windows in the chrome instance
driver.window_handles

# Change the tab/window in the "chrome" instance
driver.switch_to.window('a window_handle name')

# interact with the tab/window
```

## Usage Examples

```python
# Python3 + PyTest
import pytest

from appium import webdriver
# Options are available in Python client since v2.6.0
from appium.options.android import UiAutomator2Options


def generate_options():
    common_caps = {
        # A real device udid could be retrieved from `adb devices -l` output
        # If it is ommitted then the first available device will be used
        'appium:udid': '123456',
        # ...or run the test on an emulator
        # 'appium:avd': 'emulator-5554',
    }
    app_options = UiAutomator2Options().load_capabilities(common_caps)
    app_options.app = '/Projects/myapp.apk'
    # It might also be necessary to provide more info about app activities
    # Read [How To Troubleshoot Activities Startup](docs/activity-startup.md)
    # for more details
    # app_options.appPackage = 'com.mypackage'
    # app_options.appActivity = '.myMainActivity'
    # app_options.appWaitActivity = '.mySplashScreenActivity'
    chrome_options = UiAutomator2Options().load_capabilities(common_caps)
    chrome_options.browser_name = 'chrome'
    # Read [Hybrid Mode](#hybrid-mode)
    chrome_options.chromedriver_executable = '/Project/chromedriver_linux64'
    return [app_options, chrome_options]


@pytest.fixture(params=generate_options())
def driver(request):
    # The default URL is http://127.0.0.1:4723/wd/hub in Appium1
    drv = webdriver.Remote('http://localhost:4723', options=request.param)
    yield drv
    drv.quit()


def test_edit_text(driver):
    locator = 'android.view.TextEdit' if driver.current_context == 'NATIVE_APP' else 'input'
    edit_field = driver.find_element_by_class_name(locator)
    edit_field.send_keys('hello world')
    assert edit_field.text == 'hello world'
    edit_field.clear()
    assert edit_field.text == ''

```


## API Notes

`lock` behaves differently in Android than it does in iOS. In Android it does not take any arguments, and locks the screen and returns immediately.


## Development

```
npm install appium-uiautomator2-driver
npm run watch
```

Unit tests:

```
npm run test
```

Functional tests:

```
npm run e2e-test
```
