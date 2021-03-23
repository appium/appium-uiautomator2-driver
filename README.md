# Appium UiAutomator2 Driver

Appium UiAutomator2 Driver is a test automation framework for Android devices. Appium UiAutomator2 Driver automates native, hybrid and mobile web apps, tested on emulators and real devices. Appium UiAutomator2 Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool. The driver operates in scope of [W3C WebDriver protocol](https://www.w3.org/TR/webdriver/) with several custom extensions to cover operating-system specific scenarios.

UiAutomator2 Driver proxies most of the commands to [UiAutomator2 server](https://github.com/appium/appium-uiautomator2-server), which uses Google's [UiAutomator](https://developer.android.com/training/testing/ui-automator) framework under the hood. Some commands are proxied directly to [appium-adb](https://github.com/appium/appium-adb) and other helpers built on top of Android platform tools.

*Note*: Issue tracking for this repo has been disabled. Please use the [main Appium issue tracker](https://github.com/appium/appium/issues) instead.

## Requirements

On top of standard Appium requirements UiAutomator2 driver also expects the following prerequisites:

- Windows, Linux and macOS are supported as hosts
- [Android SDK Platform tools](https://developer.android.com/studio/releases/platform-tools) must be installed. [Android Studio IDE](https://developer.android.com/studio) also provides a convenient UI to install and manage the tools.
- ANDROID_HOME or ANDROID_SDK_ROOT [environment variable](https://developer.android.com/studio/command-line/variables) must be set
- Java JDK must be installed and [JAVA_HOME](https://www.baeldung.com/java-home-on-windows-7-8-10-mac-os-x-linux) environment variable must be set. Android SDK below API 30 requires Java 8. Android SDK 30 and above requires Java 9 or newer.
- [Emulator](https://developer.android.com/studio/run/managing-avds) platform image must be installed if you plan to run your tests on it. [Android Studio IDE](https://developer.android.com/studio) also provides a convenient UI to install and manage emulators.
- Real Android devices must have [USB debugging enabled](https://developer.android.com/studio/debug/dev-options) and should be visible as `online` in `adb devices -l` output.
- The minimum version of Android API must be 5.0 (API level 21) (6.0 is recommended as version 5 has some known compatibility issues).


## Capabilities

### General

Capability Name | Description
--- | ---
platformName | Could be set to `android`. Appium itself is not strict about this capability value if `automationName` is provided, so feel free to assign it to any supported platform name if this is needed, for example, to make Selenium Grid working.
appium:automationName | Must always be set to `uiautomator2`. Values of `automationName` are compared case-insensitively.
appium:deviceName | The name of the device under test (actually, it is not used to select a device under test). Consider setting `udid` for real devices and `avd` for emulators instead
appium:platformVersion | The platform version of an emulator or a real device. This capability is used for device autodetection if `udid` is not provided
appium:udid | UDID of the device to be tested. Could ve retrieved from `adb devices -l` output. If unset then the driver will try to use the first connected device. Always set this capability if you run parallel tests.
appium:noReset | Prevents the device to be reset before the session startup if set to `true`. This means that the application under test is not going to be terminated neither its data cleaned. `false` by default
appium:fullReset | Being set to `true` always enforces the application under test to be fully uninstalled before starting a new session. `false` by default
appium:printPageSourceOnFindFailure | Enforces the server to dump the actual XML page source into the log if any error happens. `false` by default.

### Driver/Server

Capability Name | Description
--- | ---
appium:systemPort | The number of the port the UiAutomator2 server is listening on. By default the first free port from 8200..8299 range is selected. It is recommended to set this value if you are running [parallel tests](https://github.com/appium/appium/blob/master/docs/en/advanced-concepts/parallel-tests.md) on the same machine.
appium:skipServerInstallation | Skip the UiAutomator2 Server component installation on the device under test and all the related checks if set to `true`. This could help to speed up the session startup if you know for sure the correct server version is installed on the device. In case the server is not installed or an incorrect version of it is installed then you may get an unexpected error later. `false` by default
appium:uiautomator2ServerLaunchTimeout | The maximum number of milliseconds to wait util UiAutomator2Server is listening on the device. `30000` ms by default
appium:uiautomator2ServerInstallTimeout | The maximum number of milliseconds to wait util UiAutomator2Server is installed on the device. `20000` ms by default
appium:uiautomator2ServerReadTimeout | The maximum number of milliseconds to wait for a HTTP response from UiAutomator2Server. Only values greater than zero are accepted. If the given value is too low then expect driver commands to fail with `timeout of Xms exceeded` error. `240000` ms by default
appium:disableWindowAnimation | Whether to disable window animations when starting the instrumentation process. `false` by default
appium:skipDeviceInitialization | If set to `true` then device startup checks (whether it is ready and whether Settings app is installed) will be canceled on session creation. Could speed up the session creation if you know what you are doing. `false` by default

### App

Capability Name | Description
--- | ---
appium:app | Full path to the application to be tested (the app must be located on the same machine where the server is running). Both `.apk` and `.apks` application extensions are supported. Could also be an URL to a remote location. If neither of the `app`, `appPackage` or `browserName` capabilities are provided then the driver starts from the Dashboard and expects the test knows what to do next. Do not provide both `app` and `browserName` capabilities at once.
browserName | The name of the browser to run the test on. If this capability is provided then the driver will try to start the test in Web context mode (Native mode is applied by default). Read [Automating hybrid apps](https://appium.io/docs/en/writing-running-appium/web/hybrid/) for more details. Usually equals to `chrome`.
appium:appPackage | Application package identifier to be started. If not provided then UiAutomator2 will try to detect it automatically from the package provided by the `app` capability. Read [How To Troubleshoot Activities Startup](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md) for more details
appium:appActivity | Main application activity identifier. If not provided then UiAutomator2 will try to detect it automatically from the package provided by the `app` capability. Read [How To Troubleshoot Activities Startup](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md) for more details
appium:appWaitActivity | Identifier of the first activity that the application invokes. If not provided then equals to `appium:appActivity`. Read [How To Troubleshoot Activities Startup](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md) for more details
appium:appWaitPackage | Identifier of the first package that is invoked first. If not provided then equals to `appium:appPackage`. Read [How To Troubleshoot Activities Startup](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md) for more details
appium:appWaitDuration | Maximum amount of milliseconds to wait until the application under test is started (e. g. an activity returns the control to the caller). `20000` ms by default. Read [How To Troubleshoot Activities Startup](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md) for more details
appium:androidInstallTimeout | Maximum amount of milliseconds to wait until the application under test is installed. `90000` ms by default
appium:appWaitForLaunch | Whether to block until the app under test returns the control to the caller after its activity has been started by Activity Manager (`true`, the default value) or to continue the test without waiting for that (`false`).
appium:intentCategory | Set an optional intent category to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am)
appium:intentAction | Set an optional intent action to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am)
appium:intentFlags | Set an optional intent flags to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am)
appium:optionalIntentArguments | Set an optional intent arguments to be applied when starting the given appActivity by [Activity Manager](https://developer.android.com/studio/command-line/adb#am)
appium:dontStopAppOnReset | Set it to `true` if you don't want the application to be restarted if it was already running. `false` by default
appium:autoLaunch | Whether to launch the application under test automatically (`true`, the default value) after a test starts
appium:autoGrantPermissions | Whether to grant all the requested application permissions automatically when a test starts(`true`). `false` by default
appium:otherApps | Allows to set one or more comma-separated paths to Android packages that are going to be installed along with the main application under test. This might be useful if the tested app has dependencies
appium:uninstallOtherPackages | Allows to set one or more comma-separated package identifiers to be uninstalled from the device before a test starts
appium:allowTestPackages | If set to `true` then it would be possible to use packages built with the test flag for the automated testing (literally adds `-t` flag to the `adb install` command). `false` by default
appium:remoteAppsCacheLimit | Sets the maximum amount of application packages to be cached on the device under test. This is needed for devices that don't support streamed installs (Android 7 and below), because ADB must push app packages to the device first in order to install them, which takes some time. Setting this capability to zero disables apps caching. `10` by default.
appium:enforceAppInstall | If set to `true` then the application under test is always reinstalled even if a newer version of it already exists on the device under test. `false` by default

### App Localization

Capability Name | Description
--- | ---
appium:localeScript | Canonical name of the locale to be set for the app under test, for example `zh-Hans-CN`. See https://developer.android.com/reference/java/util/Locale.html for more details.
appium:language | Name of the language to extract application strings for. Strings are extracted for the current system language by default. Also sets the language for the app under test. See https://developer.android.com/reference/java/util/Locale.html for more details. Example: en, ja
appium:locale | Sets the locale for the app under test. See https://developer.android.com/reference/java/util/Locale.html for more details. Example: EN, JA

### ADB

Capability Name | Description
--- | ---
appium:adbPort | Number of the port where ADB is running. `5037` by default
appium:remoteAdbHost | Address of the host where ADB is running (the value of `-H` ADB command line option). Unset by default
appium:adbExecTimeout | Maximum number of milliseconds to wait until single ADB command is executed. `20000` ms by default
appium:clearDeviceLogsOnStart | If set to `true` then UiAutomator2 deletes all the existing logs in the device buffer before starting a new test
appium:buildToolsVersion | The version of Android build tools to use. By default UiAutomator2 driver uses the most recent version of build tools installed on the machine, but sometimes it might be necessary to give it a hint (let say if there is a known bug in the most recent tools version). Example: `28.0.3`
appium:skipLogcatCapture | Being set to `true` disables automatic logcat output collection during the test run. `false` by default
appium:suppressKillServer | Being set to `true` prevents the driver from ever killing the ADB server explicitly. Could be useful if ADB is connected wirelessly. `false` by default
appium:ignoreHiddenApiPolicyError | Being set to `true` ignores a failure while changing hidden API access policies. Could be useful on some devices, where access to these policies has been locked by its vendor. `false` by default.
appium:mockLocationApp | If set to `true` then location mocking app gets assigned to Appium Settings (the default behavior), so Appium could mock GPS location. The `false` value prevents that from happening.
appium:logcatFormat | The log print format, where `format` is one of: `brief` `process` `tag` `thread` `raw` `time` `threadtime` `long`. `threadtime` is the default value.
appium:logcatFilterSpecs | Series of `tag[:priority]` where `tag` is a log component tag (or * for all) and priority is: `V    Verbose`, `D    Debug`, `I    Info`, `W    Warn`, `E    Error`, `F    Fatal`, `S    Silent (supress all output)`. '*' means '*:d' and `tag` by itself means `tag:v`. If not specified on the commandline, filterspec is set from ANDROID_LOG_TAGS. If no filterspec is found, filter defaults to '*:I'.
appium:allowDelayAdb | Being set to `false` prevents emulator to use `-delay-adb` feature to detect its startup. See https://github.com/appium/appium/issues/14773 for more details.

### Emulator (Android Virtual Device)

Capability Name | Description
--- | ---
appium:avd | The name of Android emulator to run the test on. The names of currently installed emulators could be listed using `avdmanager list avd` command. If the emulator with the given name is not running then it is going to be started before a test
appium:avdLaunchTimeout | Maximum number of milliseconds to wait until Android Emulator is started. `60000` ms by default
appium:avdReadyTimeout | Maximum number of milliseconds to wait until Android Emulator is fully booted and is ready for usage. `60000` ms by default
appium:avdArgs | Either a string or an array of emulator [command line arguments](https://developer.android.com/studio/run/emulator-commandline).
appium:avdEnv | Mapping of emulator [environment variables](https://developer.android.com/studio/command-line/variables).
appium:networkSpeed | Sets the desired network speed limit for the emulator. It is only applied if the emulator is not running before the test starts. See emulator [command line arguments](https://developer.android.com/studio/run/emulator-commandline) description for more details.
appium:gpsEnabled | Sets whether to enable (`true`) or disable (`false`) GPS service in the Emulator. Unset by default, which means to not change the current value
appium:isHeadless | If set to `true` then emulator starts in headless mode (e.g. no UI is shown). It is only applied if the emulator is not running before the test starts. `false` by default.

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
appium:skipUnlock | Whether to skip the check for lock screen presence (`true`). By default UiAutomator2 driver tries to detect if the device's screen is locked before starting the test and to unlock that (which sometimes might be unstable). Note, that this operation takes some time, so it is highly recommended to set this capability to `false` and disable screen locking on devices under test.
appium:unlockType | Set one of the possible types of Android lock screens to unlock. Read the [Unlock tutorial](https://github.com/appium/appium-android-driver/blob/master/docs/UNLOCK.md) for more details.
appium:unlockKey | Allows to set an unlock key. Read the [Unlock tutorial](https://github.com/appium/appium-android-driver/blob/master/docs/UNLOCK.md) for more details.
appium:unlockSuccessTimeout | Maximum number of milliseconds to wait until the device is unlocked. `2000` ms by default

### MJPEG

Capability Name | Description
--- | ---
appium:mjpegServerPort | The number of the port UiAutomator2 server starts the MJPEG server on. If not provided then the screenshots broadcasting service on the remote device does not get exposed to a local port (e.g. no adb port forwarding is happening)
appium:mjpegScreenshotUrl | The URL of a service that provides realtime device screenshots in MJPEG format. If provided then the actual command to retrieve a screenshot will be requesting pictures from this service rather than directly from the server

### Web Context

Capability Name | Description
--- | ---
appium:autoWebview | If set to `true` then UiAutomator2 driver will try to switch to the first available web view after the session is started. `false` by default.
appium:webviewDevtoolsPort | The local port number to use for devtools communication. By default the first free port from 10900..11000 range is selected. Consider setting the custom value if you are running parallel tests.
appium:ensureWebviewsHavePages | Whether to skip web views that have no pages from being shown in `getContexts` output. The driver uses devtools connection to retrieve the information about existing pages. `true` by default.
appium:enableWebviewDetailsCollection | Whether to retrieve extended web views information using devtools protocol. Enabling this capability helps to detect the necessary chromedriver version more precisely. `false` by default.
appium:chromedriverPort | The port number to use for Chromedriver communication. Any free port number is selected by default if unset.
appium:chromedriverPorts | Array of possible port numbers to assign for Chromedriver communication. If none of the port in this array is free then an error is thrown.
appium:chromedriverArgs | Array of chromedriver [command line arguments](http://www.assertselenium.com/java/list-of-chrome-driver-command-line-arguments/). Note, that not all command line arguments that are available for the desktop browser are also available for the mobile one.
appium:chromedriverExecutable | Full path to the chromedriver executable on the server file system.
appium:chromedriverExecutableDir | Full path to the folder where chromedriver executables are located. This folder is used then to store the downloaded chromedriver executables if automatic download is enabled. Read [Automatic Chromedriver Discovery article](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/web/chromedriver.md#automatic-discovery-of-compatible-chromedriver) for more details.
appium:chromedriverChromeMappingFile | Full path to the chromedrivers mapping file. This file is used to statically map webview/browser versions to the chromedriver versions that are capable of automating them. Read [Automatic Chromedriver Discovery article](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/web/chromedriver.md#automatic-discovery-of-compatible-chromedriver) for more details.
appium:chromedriverUseSystemExecutable | Set it to `true` in order to enforce the usage of chromedriver, which gets downloaded by Appium automatically upon installation. This driver might not be compatible with the destination browser or a web view. `false` by default.
appium:chromedriverDisableBuildCheck | Being set to `true` disables the compatibility validation between the current chromedriver and the destination browser/web view. Use it with care.
appium:autoWebviewTimeout | Set the maximum number of milliseconds to wait until a web view is available if `autoWebview` capability is set to `true`. `2000` ms by default
appium:recreateChromeDriverSessions | If this capability is set to `true` then chromedriver session is always going to be killed and then recreated instead of just suspending it on context switching. `false` by default
appium:nativeWebScreenshot | Whether to use screenshoting endpoint provided by UiAutomator framework (`true`) rather than the one provided by chromedriver (`false`, the default value). Use it when you experience issues with the latter.
appium:extractChromeAndroidPackageFromContextName | If set to `true`, tell chromedriver to attach to the android package we have associated with the context name, rather than the package of the application under test. `false` by default.
appium:showChromedriverLog | If set to `true` then all the output from chromedriver binary will be forwarded to the Appium server log. `false` by default.
pageLoadStrategy | One of the available page load strategies. See https://www.w3.org/TR/webdriver/#capabilities
appium:chromeOptions | A mapping, that allows to customize chromedriver options. See https://chromedriver.chromium.org/capabilities for the list of available entries.

### Other

Capability Name | Description
--- | ---
appium:disableSuppressAccessibilityService | Being set to `true` tells the instrumentation process to not suppress accessibility services during the automated test. This might be useful if your automated test needs these services. `false` by default
appium:userProfile | Integer identifier of a [user profile](https://source.android.com/devices/tech/admin/multi-user). By default the app under test is installed for the currently active user, but in case it is necessary to test how the app performs while being installed for a user profile, which is different from the current one, then this capability might come in handy.
appium:newCommandTimeout | How long (in seconds) the driver should wait for a new command from the client before assuming the client has stopped sending requests. After the timeout the session is going to be deleted. `60` seconds by default. Setting it to zero disables the timer.
appium:skipLogCapture | Skips to start capturing logs such as logcat. It might improve network performance. Log-related commands won't work if the capability is enabled. Defaults to `false`.


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
bounds | The element's visible frame (`[left, top][right, bottom]`) | `[0,0][100,100]`
displayed | Whether the element is visible to the user | 'true'
contentSize | The dimensions of the element's content area | `{"left": 0, "top":0, "width": 100, "height": 100, "scrollableOffset": 10, "touchPadding": 0}`


## Element Location

UiAutomator2 driver supports the following location strategies:

Name | Description | Example
--- | --- | ---
id | This strategy is mapped to the native UiAutomator's `By.res` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#res(java.lang.String)) (exact match of element's resource name). Package identifier prefix is added automatically if unset and is equal to the identifier of the current application under test. | 'com.mycompany:id/resourceId'
accessibilityId | This strategy is mapped to the native UiAutomator's `By.desc` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#desc(java.lang.String)) (exact match of element's content description). | 'my description'
className | This strategy is mapped to the native UiAutomator's `By.clazz` [locator](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#clazz(java.lang.String)) (exact match of element's class). | 'android.view.View'
android uiautomator | This strategy is mapped to the native UiAutomator's `UiSelector` [locator](https://developer.android.com/reference/androidx/test/uiautomator/UiSelector)). It is even possible to perform some advanced operations, like scrolling, with this locator type | `new UiScrollable(new UiSelector().resourceId(\"android:id/list\")).scrollIntoView(new UiSelector().text(\"Radio Group\"))`
xpath | For elements lookup Xpath strategy the driver uses the same XML tree that is generated by page source API. Only Xpath 1.0 is supported. | `By.xpath("//android.view.View[@text=\"Regular\" and @checkable=\"true\"]")`


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

UiAutomator2 driver supports Appium [Settings API](https://appium.io/docs/en/advanced-concepts/settings/).
Along with the common settings the following driver-specific settings are currently available:

Name | Type | Description
--- | --- | ---
actionAcknowledgmentTimeout | long | Maximum number of milliseconds to wait for an acknowledgment of generic uiautomator actions, such as clicks, text setting, and menu presses. The acknowledgment is an[AccessibilityEvent](http://developer.android.com/reference/android/view/accessibility/AccessibilityEvent.html") corresponding to an action, that lets the framework determine if the action was successful. Generally, this timeout should not be modified. `3000` ms by default
allowInvisibleElements | boolean | Whether to include elements that are not visible to the user (e. g. whose `displayed` attribute is `false`) to the XML source tree. `false` by default
ignoreUnimportantViews | boolean | Enables or disables layout hierarchy compression. If compression is enabled, the layout hierarchy derived from the Acessibility framework will only contain nodes that are important for uiautomator testing. Any unnecessary surrounding layout nodes that make viewing and searching the hierarchy inefficient are removed. `true` by default
elementResponseAttributes | string | Comma-separated list of element attribute names to be included into findElement response. By default only element UUID is present there, but it is also possible to add the following items: `name`, `text`, `rect`, `enabled`, `displayed`, `selected`, `attribute/<element_attribute_name>`. It is required that `shouldUseCompactResponses` setting is set to `false` in order for this one to apply.
enableMultiWindows | boolean | Whether to include all windows that the user can interact with (for example an on-screen keyboard) while building the XML page source (`true`). By default it is `false` and only the single active application window is included to the page source.
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
serverPort | int | The port number to start UiAutomator2 server on. Do not mix this with the `systemPort`, because this port is being acquired on the remote device under test rather than on the host machine. Must be in range 1024..65535. `6790` by default
mjpegServerPort | int | The port number on the remote device to start MJPEG screenshots broadcaster on. Must be in range 1024..65535. `7810` by default
mjpegServerFramerate | int | The maximum count of screenshots per second taken by the MJPEG screenshots broadcaster. Must be in range 1..60. `10` by default
mjpegScalingFactor | int | The percentage value used to apply downscaling on the screenshots generated by the MJPEG screenshots broadcaster. Must be in range 1..100. `50` is by default, which means that screenshots are downscaled to the half of their original size keeping their original proportions.
mjpegServerScreenshotQuality | int | The percentage value used to apply lossy JPEG compression on the screenshots generated by the MJPEG screenshots broadcaster. Must be in range 1..100. `50` is by default, which means that screenshots are compressed to the half of their original quality.
mjpegBilinearFiltering | boolean | Controls whether (`true`) or not (`false`, the default value) to apply bilinear filtering to MJPEG screenshots broadcaster resize algorithm. Enabling this flag may improve the quality of the resulting scaled bitmap, but may introduce a small performance hit.
useResourcesForOrientationDetection | boolean | Defines the strategy used by UiAutomator2 server to detect the original device orientation. By default (`false` value) the server uses device rotation value for this purpose. Although, this approach may not work for some devices and a portrait orientation may erroneously be detected as the landscape one (and vice versa). In such case it makes sense to play with this setting.


## Platform-Specific Extensions

Beside of standard W3C APIs the driver provides the following custom command extensions to execute platform specific scenarios:

### mobile: shell

Executes the given shell command on the device under test via ADB connection. This extension exposes a potential security risk and thus is only enabled when explicitly activated by the `adb_shell` server [command line feature specifier](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/security.md)

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
command | string | yes | Shell command name to execute, for example `echo` or `rm` | echo
args | `Array<string>` | no | Array of command arguments | `['-f', '/sdcard/myfile.txt']`
timeout | number | no | Command timeout in milliseconds. If the command blocks for longer than this timeout then an exception is going to be thrown. The default timeout is `20000` ms | 100000
includeStderr | boolean | no | Whether to include stderr stream into the returned result. `false` by default | true

#### Returned Result

Depending on the `includeStderr` value this API could either return a string, which is equal to the `stdout` stream content of the given command or a dictionary whose elements are `stdout` and `stderr` and values are contents of the corresponding outgoing streams. If the command exits with a non-zero return code then an exception is going to be thrown. The exception message will be equal to the command stderr.

### mobile: execEmuConsoleCommand

Executes a command through emulator telnet console interface and returns its output.
The `emulator_console` server [feature](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/security.md) must be enabled in order to use this method.

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
- mobile: longClickGesture
- mobile: pinchCloseGesture
- mobile: pinchOpenGesture
- mobile: swipeGesture
- mobile: scrollGesture

These gestures are documented in the [Automating Mobile Gestures](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/android-mobile-gestures.md) tutorial. Refer [W3C Actions API](https://appiumpro.com/editions/29-automating-complex-gestures-with-the-w3c-actions-api) if you need to automate more complicated gestures.

### mobile: scroll

Scrolls the given scrollable element until an element identified by `strategy` and `selector` becomes visible. This function returns immediately if the destination element is already visible in the view port. Otherwise it would scroll to the very beginning of the scrollable control and tries to reach the destination element by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal) is detected automatically.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
element | string | no | The identifier of the scrollable element. It is required this element is a valid scrollable container and it was located by `-android uiautomator` strategy. If this property is not provided then the first currently available scrollable view is selected for the interaction. | 123456-3456-3435-3453453
strategy | string | yes | The following strategies are supported: `accessibility id` (UiSelector().description), `class name` (UiSelector().className), `-android uiautomator` (UiSelector) | 'accessibility id'
selector | string | yes | The corresponding lookup value for the selected strategy. | 'com.mycompany:id/table'
maxSwipes | number | no | The maximum number of swipes to perform on the target scrollable view in order to reach the destination element. In case this value is unset then it would be retrieved from the scrollable element itself (vua `getMaxSearchSwipes()` property). | 10

### mobile: deepLink

Start URI that may take users directly to the specific content in the app. Read [Reliably Opening Deep Links Across Platforms and Devices](https://appiumpro.com/editions/84-reliably-opening-deep-links-across-platforms-and-devices) for more details.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
url | string | yes | The URL to start | theapp://login/
package | string | yes | The name of the package to start the URI with | 'com.mycompany'
waitForLaunch | boolean | no | If `false` then ADB won't wait for the started activity to return the control. `true` by default | false

### mobile: startLogsBroadcast

Starts Android logcat broadcast websocket on the same host and port where Appium server is running at `/ws/session/:sessionId:/appium/logcat` endpoint. The method will return immediately if the web socket is already listening. Each connected webcoket listener will receive logcat log lines as soon as they are visible to Appium. Read [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://appiumpro.com/editions/55-using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium) for more details.

### mobile: stopLogsBroadcast

Stops the previously started logcat broadcasting websocket server. This method will return immediately if no server is running. Read [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://appiumpro.com/editions/55-using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium) for more details.

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
permissions | string or `Array<string>` | yes | The full name of the permission to be changed or a list of permissions. Mandatory argument. | `['android.permission.ACCESS_FINE_LOCATION', 'android.permission.BROADCAST_SMS']`
appPackage | string | no | The application package to set change permissions on. Defaults to the package name under test | com.mycompany.myapp
action | string | no | Either `grant` (the default action) or `revoke` | grant

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

Performs IME action on the focused edit element. Read [How To Emulate IME Actions Generation](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/android-ime.md) for more details.

### mobile: startScreenStreaming

Starts device screen broadcast by creating MJPEG server. Multiple calls to this method have no effect unless the previous streaming session is stopped. This method only works if the `adb_screen_streaming` [feature](https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/security.md) is enabled on the server side. It is also required that [GStreamer](https://gstreamer.freedesktop.org/) with `gst-plugins-base`, `gst-plugins-good` and `gst-plugins-bad` packages are installed and available in PATH on the server machine.

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

Retrieves Android notifications via Appium Settings helper. Appium Settings app itself must be *manually* granted to access notifications under device Settings in order to make this feature working. Appium Settings helper keeps all the active notifications plus notifications that appeared while it was running in the internal buffer, but no more than 100 items altogether. Newly appeared notifications are always added to the head of the notifications array. The `isRemoved` flag is set to `true` for notifications that have been removed.
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

Emulate sensors values on the connected emulator.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
sensorType | string | yes | Supported sensor types are: `acceleration`, `light`, `proximity`, `temperature`, `pressure` and `humidity` | light
value | string | yes | value to set to the sensor | 50

### mobile: deleteFile

Deletes a file on the remote device.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
remotePath | string | yes | The full path to the remote file or a file inside an application bundle | `/sdcard/myfile.txt` or `@my.app.id/path/in/bundle`

### mobile: startService

Starts the given service intent.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | yes | The name of the service intent to start | `com.some.package.name/.YourServiceSubClassName`
user | number or string | no | The user ID for which the service is started. The `current` user id is used by default | 1006
foreground | boolean | no | Set it to `true` if your service must be started as foreground service. | false

### mobile: stopService

Stops the given service intent.

#### Arguments

Name | Type | Required | Description | Example
--- | --- | --- | --- | ---
intent | string | yes | The name of the service intent to stop | `com.some.package.name/.YourServiceSubClassName`
user | number or string | no | The user ID for which the service is started. The `current` user id is used by default | 1006

### mobile: getContexts

Retrieves a webviews mapping based on CDP endpoints

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
apks | array<string> | yes | The path to APKs. Each path should be the full path to the apk to be installed, or an URL to a remote location. | `['/path/to/local.apk', 'https://github.com/appium/ruby_lib_core/blob/master/test/functional/app/api.apk.zip?raw=true']`
options | object | no | Installation options. If you want enable `-g` option, you could specify that `{grantPermissions: true}`. `allowTestPackages` corresponds `-t`, `useSdcard` corresponds `-s`, `replace` corresponds `-r` (`-r` is enabled by default), `partialInstall` corresponds `-p`. | `{grantPermissions: true, partialInstall: true}`

## Applications Management

UiAutomator2 driver supports Appium endpoints for applications management:
- Check if app is installed (`POST /appium/device/app_installed`)
- Install/upgrade app (`POST /appium/device/install_app`)
- Active app (`POST /appium/device/activate_app`)
- Uninstall app (`POST /appium/device/remove_app`)
- Terminate app (`POST /appium/device/terminate_app`)
- Start app activity (`POST /appium/device/start_activity`)
- Query the current app state (`POST /appium/device/app_state`)

Refer to the corresponding Appium client tutorial to find out the names of the corresponding wrappers for these APIs.

Useful links:
- https://appiumpro.com/editions/9-testing-android-app-upgrades
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/applications.py
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/InteractsWithApps.java


## Files Management

UiAutomator2 driver supports Appium endpoints for files management:
- Push file (`POST /appium/device/push_file`)
- Pull file (`POST /appium/device/pull_file`)
- Pull folder (`POST /appium/device/pull_folder`)

Refer to the corresponding Appium client tutorial to find out the names of the corresponding wrappers for these APIs.

Useful links:
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/InteractsWithFiles.java
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/remote_fs.py


## Clipboard Management

UiAutomator2 driver supports Appium endpoints for clipboard management:
- Set clipboard content (`POST /appium/device/set_clipboard'`)
- Get clipboard content (`POST /appium/device/get_clipboard`)

Useful links:
- https://github.com/appium/python-client/blob/master/appium/webdriver/extensions/clipboard.py
- https://github.com/appium/java-client/blob/master/src/main/java/io/appium/java_client/clipboard/HasClipboard.java
- https://appiumpro.com/editions/16-automating-the-clipboard-on-ios-and-android


## Usage Examples

```python
# Python3 + PyTest
import pytest

from appium import webdriver


def generate_caps():
    common_caps = {
        # automationName capability presence is mandatory for this UiAutomator2 Driver to be selected
        'appium:automationName': 'UiAutomator2',
        'platformName': 'linux',
        # The real device udid could be retrieved from `adb devices -l` output
        # If it is omitted then the first available device will be used
        'appium:udid': '123456',
        # Or run the test on the emulator
        # 'appium:avd': 'emulator-5554',
    }
    app_caps = {
        **common_caps,
        'appium:app': '/Projects/myapp.apk',
        # It might also be necessary to provide more info about app activities
        # Read https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/android/activity-startup.md
        # for more details
        # 'appium:appPackage': 'com.mypackage',
        # 'appium:appActivity': '.myMainActivity',
        # 'appium:appWaitActivity': '.mySplashScreenActivity',
    }
    browser_caps = {
        **common_caps,
        'browserName': 'chrome',
        # Read https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/web/chromedriver.md
        # Read https://github.com/appium/appium/blob/master/docs/en/writing-running-appium/web/hybrid.md
        'appium:chromedriverExecutable': '/Project/chromedriver_linux64',
    }
    return [app_caps, browser_caps]


@pytest.fixture(params=generate_caps())
def driver(request):
    drv = webdriver.Remote('http://localhost:4723/wd/hub', request.param)
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
