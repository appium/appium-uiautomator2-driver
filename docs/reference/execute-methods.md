---
title: Execute Methods
---

The UiAutomator2 driver provides various [custom execute methods](https://appium.io/docs/en/latest/guides/execute-methods/)
based on the standard Execute Script endpoint. Use the following examples in order to invoke them
from your client code:

=== "Java"

    ```java
    var result = driver.executeScript("mobile: <methodName>", Map.ofEntries(
        Map.entry("arg1", "value1"),
        Map.entry("arg2", "value2")
        // you may add more pairs if needed or skip providing the map completely
        // if all arguments are defined as optional
    ));
    ```

=== "JS (WebdriverIO)"

    ```js
    const result = await driver.executeScript('mobile: <methodName>', [{
        arg1: "value1",
        arg2: "value2",
    }]);
    ```

=== "Python"

    ```python
    result = driver.execute_script('mobile: <methodName>', {
        'arg1': 'value1',
        'arg2': 'value2',
    })
    ```

=== "Ruby"

    ```ruby
    result = @driver.execute_script 'mobile: <methodName>', {
        arg1: 'value1',
        arg2: 'value2',
    }
    ```

=== "C#"

    ```csharp
    object result = driver.ExecuteScript("mobile: <methodName>", new Dictionary<string, object>() {
        {"arg1", "value1"},
        {"arg2", "value2"}
    }));
    ```

## Session

### `mobile: scheduleAction`

Adds a new action to the list of scheduled actions. Refer to [the Scheduled Actions guide](../guides/scheduled-actions.md)
for more details.

Available since driver version 2.26.0.

#### Parameters

|<div style="width:9em">Name</div>|<div style="width:10em">Type</div>|Description|
|---|---|---|
|`name`|`string`|Unique name of the action|
|`steps`|`Array<ActionStep>`|One or more action steps to execute. See below for a detailed structure. Steps are executed in sequential order. All steps are executed even if any of them fails. The execution is considered failed if at least one step fails.|
|`maxPass?`|`integer`|Number of successful action invocations after which it should automatically stop repeating|
|`maxFail?`|`integer`|Number of unsuccessful action invocations after which it should automatically stop repeating|
|`times?`|`integer`|Number of times the action should execute within a single invocation. Set to `1` by default|
|`intervalMs?`|`integer`|Interval in milliseconds between subsequent action invocations. Set to `1000` by default|
|`maxHistoryItems?`|`integer`|Maximum number of action invocation entries stored in history. All entries are sorted in descending order by action execution timestamp. If the number of entries exceeds this value, the oldest entry is deleted. Setting this parameter to a large value may cause out of memory issues. Set to `20` by default.|

Each item in the `steps` array (`ActionStep`) must be an object with the following properties:

|Name|<div style="width:11em">Type</div>|Description|
|---|---|---|
|`type`|`string`|Type of the step. Supported values are `gesture`, `source`, and `screenshot`.|
|`name`|`string`|Name of the step. Does not need to be unique.|
|`payload`|`Record<string, any>`|Payload of the step. See below for a detailed structure.|

The contents of `payload` must be an object, and its properties depend on the value of `type`:

=== "`gesture`"

    The object properties generally matches the property set for [`mobile: clickGesture`](#mobile-clickgesture),
    [`mobile: doubleClickGesture`](#mobile-doubleclickgesture), or [`mobile: longClickGesture`](#mobile-longclickgesture).

    |<div style="width:6em">Name</div>|<div style="width:12em">Type</div>|Description|
    |---|---|---|
    |`subtype`|`string`|Can be set to `click`, `longClick` or `doubleClick`|
    |`elementId?`|`string`|Element to use as the click origin|
    |`x?`|`float`|X offset from the element origin or screen|
    |`y?`|`float`|Y offset from the element origin or screen|
    |`locator?`|`Record<string, string>`|Object with the `strategy` and `selector` keys. Useful for clicking dynamic elements|
    |`duration?`|`float`|Click duration (only for `longClick` subtype)|

=== "`source`"

    |Name|Type|Description|
    |---|---|---|
    |`subtype`|`string`|Must be set to `xml`|

=== "`screenshot`"

    |Name|Type|Description|
    |---|---|---|
    |`subtype`|`string`|Must be set to `png`|

#### Response

`null`

### `mobile: getActionHistory`

Returns the execution history for an action. Refer to [the Scheduled Actions guide](../guides/scheduled-actions.md)
for more details.

Available since driver version 2.26.0.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`name`|`string`|Name of the action to retrieve history for|

#### Response

`ActionHistory` - an object with the following properties:

|<div style="width:7em">Name</div>|<div style="width:13em">Type</div>|Description|
|---|---|---|
|`repeats`|`integer`|Number of times this action has been repeated so far|
|`stepResults`|`Array<ActionInvocation>`|List of recorded action invocations, sorted by execution timestamp in descending order. See below for a detailed structure. The maximum length of the list is limited by [`maxHistoryItems`](#parameters).|

Each item in `stepResults` array (`ActionInvocation`) is itself an array of objects, where each object has the following properties:

|Name|<div style="width:8em">Type</div>|Description|
|---|---|---|
|`name`|`string`|Name of the step as per its original `ActionStep`|
|`type`|`string`|Type of step as per its original `ActionStep`|
|`timestamp`|`integer`|Unix timestamp in milliseconds of the step execution start time|
|`passed`|`boolean`|Whether the step passed|
|`result`|`any`|Result of the step. Depends on the step type and subtype, and can be `null`. Always `null` if `passed` is `false`.|
|`exception`|`Record<string, string>` or `null`|Object with the `name`, `message` and `stacktrace` properties of the raised exception. Always `null` if `passed` is `true`.|

### `mobile: unscheduleAction`

Removes an action from the list of scheduled actions and returns its execution history. Refer to
[the Scheduled Actions guide](../guides/scheduled-actions.md) for more details.

Available since driver version 2.26.0.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`name`|`string`|Name of the action to remove from scheduling|

#### Response

[`ActionHistory`](#response_1)

## Device Under Test

### `mobile: shell`

Executes the specified `adb shell` command on the device under test. The [`adb_shell`](./insecure-features.md#adb_shell)
insecure feature must be enabled.

#### Parameters

|<div style="width:8em">Name</div>|<div style="width:8em">Type</div>|Description|
|---|---|---|
|`command`|`string`|Shell command name to execute|
|`args?`|`Array<string>`|Additional arguments to pass to the command. Keys and values should be provided as separate strings.|
|`timeout?`|`integer`|Command timeout in milliseconds. An error is thrown if the command blocks for longer than this timeout. Set to `20000` by default|
|`includeStderr?`|`boolean`|Whether to include stderr stream into the returned result. Set to `false` by default|

#### Response

`string` or `Record<string, string>` - contents of the returned `stdout`, or if `includeStderr` is
true, an object with the `stdout` and `stderr` keys and their respective values.

An error is thrown if the command exits with a non-zero return code, with the error message
matching the command's `stderr`.

### `mobile: deviceInfo`

Retrieves information about the device under test.

#### Response

`Record<string, any>` - mapping of device properties to their values. The following properties are
included:

|<div style="width:9em">Name</div>|Description|
|--|--|
|`androidId`|Device identifier ([`ANDROID_ID`](https://developer.android.com/reference/android/provider/Settings.Secure.html#ANDROID_ID))|
|`manufacturer`|Device manufacturer ([`MANUFACTURER`](https://developer.android.com/reference/android/os/Build#MANUFACTURER))|
|`model`|Device model ([`MODEL`](https://developer.android.com/reference/android/os/Build#MODEL))|
|`brand`|Device brand ([`BRAND`](https://developer.android.com/reference/android/os/Build#BRAND))|
|`apiVersion`|Major Android version ([`VERSION.SDK_INT`](https://developer.android.com/reference/android/os/Build.VERSION#SDK_INT))|
|`platformVersion`|User-visible platform version ([`VERSION.RELEASE`](https://developer.android.com/reference/android/os/Build.VERSION#RELEASE))|
|`carrierName`|Network carrier name ([`TelephonyManager.getNetworkOperatorName()`](https://developer.android.com/reference/android/telephony/TelephonyManager#getNetworkOperatorName()))|
|`realDisplaySize`|Real size of the default display, in `<width>x<height>` format (based on [`Display.getRealSize()`](https://developer.android.com/reference/android/view/Display#getRealSize(android.graphics.Point)))|
|`displayDensity`|Display density in Density Independent Pixel units (based on [`DisplayMetrics.density`](https://developer.android.com/reference/android/util/DisplayMetrics#density))|
|`networks`|Array of objects, where each object contains information related to an available network type (based on [`ConnectivityManager.getAllNetworks()`](https://developer.android.com/reference/android/net/ConnectivityManager#getAllNetworks()), [`ConnectivityManager.getNetworkInfo(network)`](https://developer.android.com/reference/android/net/ConnectivityManager#getNetworkInfo(android.net.Network)), and [`ConnectivityManager.getNetworkCapabilities(network)`](https://developer.android.com/reference/android/net/ConnectivityManager#getNetworkCapabilities(android.net.Network)))|
|`locale`|System locale ([`Locale.getDefault()`](https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#getDefault--))|
|`timeZone`|System timezone ([`TimeZone.getDefault()`](https://docs.oracle.com/javase/8/docs/api/java/util/TimeZone.html#getDefault--))|
|`bluetooth`|Object with Bluetooth-related information, such as its state ([`BluetoothAdapter.getState()`](https://developer.android.com/reference/android/bluetooth/BluetoothAdapter#getState()))|

### `mobile: batteryInfo`

Retrieves battery-related information for the device under test.

#### Response

`Record<string, any>` - object with battery-related information, with the following properties:

|Name|Type|Description|
|--|--|--|
|`level`|`float`|Current battery level fraction in range `[0..1]`, where `1.0` means 100% charge. Set to `-1` if the actual value cannot be retrieved from the system. ([`BatteryManager.EXTRA_LEVEL`](https://developer.android.com/reference/android/os/BatteryManager#EXTRA_LEVEL) and [`BatteryManager.EXTRA_SCALE`](https://developer.android.com/reference/android/os/BatteryManager#EXTRA_SCALE))|
|`state`|`integer`|Current battery state, matching the value of a supported `BATTERY_STATUS` constant of the [`BatteryManager`](https://developer.android.com/reference/android/os/BatteryManager) class. Set to `-1` if the actual value cannot be retrieved from the system. ([`BatteryManager.EXTRA_STATE`](https://developer.android.com/reference/android/os/BatteryManager#EXTRA_STATE))|

### `mobile: getDeclaredOrientation`

Retrieves the manifest-declared screen orientation of the current foreground activity ([`ActivityInfo.screenOrientation`](https://developer.android.com/reference/android/content/pm/ActivityInfo#screenOrientation)).

This reflects the value set in the activity's `AndroidManifest.xml` file (`android:screenOrientation`),
which may differ from any runtime orientation overrides (e.g. `Activity.setRequestedOrientation()`)
or the current display orientation (`PORTRAIT`/`LANDSCAPE`) returned by
[the Get Orientation API](https://appium.io/docs/en/latest/reference/api/appium/#getappiumorientation).

Available since driver version 8.5.0.

#### Response

`string | null` - the name of the declared screen orientation constant (e.g. `SCREEN_ORIENTATION_PORTRAIT`),
or `null` if the current activity is unknown or its manifest orientation cannot be resolved

### `mobile: listDisplays`

Retrieves a list of all displays available on the device under test. Under the hood, calls [`DisplayManager.getDisplays()`](https://developer.android.com/reference/android/hardware/display/DisplayManager#getDisplays())
for physical displays, and `adb shell dumpsys SurfaceFlinger --displays` for virtual displays.

Refer to the [Multi-Window Testing guide](../guides/multiwindow.md) for detailed usage information.

#### Response

`Array<Record<string, any>>` - list of display information objects, where each object contains the
following properties:

|<div style="width:6em">Name</div>|<div style="width:11em">Type</div>|Description|
|--|--|--|
|`id`|`integer`|Logical identifier of the display. Used by the [`currentDisplayId`](./settings.md#currentdisplayid) setting.|
|`name`|`string` or `null`|Name of the display|
|`physicalId`|`string` or `null`|Physical identifier of the display. Returned as a string to avoid JavaScript number precision issues with large values. Can be used by the [`mobile: screenshots`](#mobile-screenshots) method.|
|`virtualId`|`string` or `null`|Virtual identifier of the display. Only set for virtual displays. Can be used by the [`mobile: screenshots`](#mobile-screenshots) method.|
|`metrics`|`Record<string, any>`|Display metrics such as size and density. See below for a detailed structure.|
|`isDefault`|`boolean`|Whether this is the default display|

The `metrics` item is an object with the following properties:

|<div style="width:8em">Name</div>|Type|Description|
|--|--|--|
|`widthPixels`|`integer`|Display width in pixels|
|`heightPixels`|`integer`|Display height in pixels|
|`density`|`float`|Display density (logical density factor). This is the scaling factor for the display.|
|`densityDpi`|`integer`|Display density in DPI (dots per inch)|
|`scaledDensity`|`float`|Scaled density factor for fonts. Usually the same as `density`, but may be adjusted by the user's font size preference.|
|`xdpi`|`integer`|Exact physical pixels per inch of the screen in the X dimension|
|`ydpi`|`integer`|Exact physical pixels per inch of the screen in the Y dimension|

### `mobile: listWindows`

Retrieves a list of all windows on the device under test.

For devices running Android 11 (R / API level 30) or newer, this method retrieves all windows on
all available displays (using [`UiAutomation.getWindowsOnAllDisplays()`](https://developer.android.com/reference/android/app/UiAutomation#getWindowsOnAllDisplays())).
For older devices, only windows from the default display are retrieved (using [`UiAutomation.getWindows()`](https://developer.android.com/reference/android/app/UiAutomation#getWindows())).

Refer to the [Multi-Window Testing guide](../guides/multiwindow.md) for detailed usage information.

#### Parameters

|<div style="width:9em">Name</div>|<div style="width:11em">Type</div>|Description|
|---|---|---|
|`filters?`|`Record<string, any>`|Conditions for filtering the returned list of windows. Specified conditions are applied using AND logic (all must match). See below for a detailed structure.|
|`skipScreenshots?`|`boolean`|Whether to skip taking screenshots for each window. Screenshots are only supported since Android 14 (U / API level 34). Set to `false` by default. Setting this to `true` can improve performance.|

The `filters` property is an object with the following properties:

|<div style="width:14em">Name</div>|Type|Description|
|---|---|---|
|`packageName?`|`string`|Name of the application package which the window should belong to. Can be specified as a glob pattern.|
|`windowId?`|`integer`|Window identifier|
|`displayId?`|`integer`|Logical display identifier|
|`physicalDisplayId?`|`string`|Physical display identifier|
|`type?`|`integer`|Window type, matching the value of a supported [`AccessibilityWindowInfo`](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo) `TYPE_` constant|
|`title?`|`string`|Window title. Can be specified as a glob pattern.|
|`layer?`|`number`|Z-order layer value of the window|
|`isAccessibilityFocused?`|`boolean`|Whether the window has accessibility focus|
|`isActive?`|`boolean`|Whether the window is active|
|`isFocused?`|`boolean`|Whether the window has input focus|
|`isInPictureInPictureMode?`|`boolean`|Whether the window is in picture-in-picture mode|

#### Response

`Array<Record<string, any>>` - list of window information objects, where each object contains the
following properties:

|<div style="width:13em">Name</div>|<div style="width:13em">Type</div>|Description|
|--|--|--|
|`windowId`|`integer` or `null`|Identifier of the window. Set to `null` if the identifier cannot be determined.|
|`displayId`|`integer`|Logical identifier of the display that owns this window|
|`physicalDisplayId`|`string` or `null`|Physical identifier of the display that owns this window. Returned as a string to avoid JavaScript number precision issues with large values.|
|`virtualDisplayId`|`string` or `null`|Virtual identifier of the display that owns this window. Only set for virtual displays.|
|`rect`|`Record<string, integer>`|Object with window bounds, containing the `left`, `top`, `right`, `bottom` properties|
|`packageName`|`string`|Name of the application package which the window belongs to|
|`screenshot`|`string` or `null`|Base64-encoded PNG screenshot of the window. Only supported since Android 14 (U / API level 34) if [`skipScreenshots`](#parameters_4) is set to `false`.|
|`type`|`integer`|Window type, matching the value of a supported [`AccessibilityWindowInfo`](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo) `TYPE_` constant|
|`title`|`string` or `null`|Window title|
|`layer`|`number`|Z-order layer value of the window|
|`isAccessibilityFocused`|`boolean`|Whether the window has accessibility focus|
|`isActive`|`boolean`|Whether the window is active|
|`isFocused`|`boolean`|Whether the window has input focus|
|`isInPictureInPictureMode`|`boolean`|Whether the window is in picture-in-picture mode|

### `mobile: viewportRect`

Retrieves the viewport bounds of the current window. This is equivalent to calling [the standard Get Window Rect endpoint](https://appium.io/docs/en/latest/reference/api/webdriver/#getwindowrect)
and subtracting the dimensions of the device status and navigation bars.

#### Response

`Record<string, integer>` - an object with the following properties:

|Name|Type|Description|
|--|--|--|
|`left`|`integer`|X-axis offset of the viewport|
|`top`|`integer`|Y-axis offset of the viewport|
|`width`|`integer`|Viewport width|
|`height`|`integer`|Viewport height|

### `mobile: getDisplayDensity`

Retrieves the density of the current display in DPI.

Available since driver version 2.21.0.

#### Response

`integer` - the display density in DPI

### `mobile: getSystemBars`

Retrieves properties of various bars in the system UI.

Available since driver version 2.21.0.

#### Response

`Record<string, Record<string, any>>` - mapping of system bar names to their properties. The
following system bar names are included:

* `statusBar`
* `navigationBar`

All system bars include the following properties:

|Name|Type|Description|
|--|--|--|
|`visible`|`boolean`|Whether the bar is visible|
|`x`|`integer`|Left X coordinate of the bar. Could be `0` if the bar is not visible|
|`y`|`integer`|Top Y coordinate of the bar. Could be `0` if the bar is not visible|
|`width`|`integer`|Bar width. Could be `0` if the bar is not visible|
|`height`|`integer`|Bar height. Could be `0` if the bar is not visible|

### `mobile: getPerformanceData`

Retrieves performance data about the given Android subsystem. The data is parsed from the output of
the `dumpsys` utility.

Available since driver version 2.24.0.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`packageName`|`string`|Name of the package identifier to fetch the data for|
|`dataType`|`string`|Subsystem name to return the data for. Supported values can be retrieved using the [`mobile: getPerformanceDataTypes`](#mobile-getperformancedatatypes) method.|

#### Response

`Array<Array<any>[]>` - table formatted as an array of arrays, where the first subarray represents
column names, and the following subarrays represent data for those columns. The returned columns
and their data depend on the specified `dataType`.

For example, a response for the `cpuinfo` datatype could look as follows:
```
[
  [user, kernel],
  [0.9, 1.3]
]
```

### `mobile: getPerformanceDataTypes`

Retrieves supported performance data types, which can be used as the `dataType` argument for the
[`mobile: getPerformanceData`](#mobile-getperformancedata) method.

Available since driver version 2.24.0.

#### Response

`Array<string>` - list of supported data types

### `mobile: startLogsBroadcast`

Starts a websocket server for broadcasting Android logcat logs, using the host and port of the
Appium server. The resulting endpoint is `/ws/session/:sessionId:/appium/logcat`. Broadcasting can
be stopped using the [`mobile: stopLogsBroadcast`](#mobile-stoplogsbroadcast) execute method.

The method will return immediately if the web socket is already listening. Each listener will
receive logcat log lines as soon as they are visible to Appium.

Refer to [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://www.headspin.io/blog/using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium)
for more details.

Consider using [log broadcast via BiDi](../reference/bidi.md#logentryadded) over this extension.

#### Response

`null`

### `mobile: stopLogsBroadcast`

Stops the logcat websocket server previously started using [`mobile: startLogsBroadcast`](#mobile-startlogsbroadcast).
The method will return immediately if no websocket server is running.

Refer to [Using Mobile Execution Commands to Continuously Stream Device Logs with Appium](https://www.headspin.io/blog/using-mobile-execution-commands-to-continuously-stream-device-logs-with-appium)
for more details.

Consider using [log broadcast via BiDi](../reference/bidi.md#logentryadded) over this extension.

#### Response

`null`

### `mobile: resetAccessibilityCache`

Resets the accessibility cache on the device under test. This method can be useful if the cache
becomes stale and needs to be refreshed in order to reflect the current UI state.

The driver automatically resets this cache before any element lookup, as well as before retrieving
the page source, but in case the application under test has highly dynamic elements, it may be
beneficial to explicitly call this method, in order to avoid stale reference errors or interaction
issues.

Note that this method also waits until the app under test becomes idle, so it may affect test
performance if called too often under dynamic circumstances.

Available since driver version 6.4.0.

#### Response

`null`

### `mobile: getUiMode`

Retrieves the value for the specified device appearance mode. Only supported since Android 10 (Q /
API level 29). Calls `adb shell cmd uimode` under the hood.

Available since driver version 2.34.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`mode`|`string`|Appearance mode to check. Supported values are `night` and `car`.|

#### Response

`string` - value of the specified appearance mode

### `mobile: setUiMode`

Sets the device appearance mode. Only supported since Android 10 (Q / API level 29). Calls
`adb shell cmd uimode` under the hood.

Available since driver version 2.34.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`mode`|`string`|Appearance mode to set. Supported values are `night` and `car`.|
|`value`|`string`|Value of the specified `mode`. Supported values are either `yes`, `no`, `auto`, `custom_schedule`, and `custom_bedtime` (for `night` mode), or `yes` and `no` (for `car` mode).|

#### Response

`null`

### `mobile: screenshots`

Retrieves a screenshot of all device displays. Only supported since Android 10 (Q / API level 29).

This method uses _physical or virtual_ display IDs, which are different from _logical_ display IDs
used by the [`currentDisplayId`](./settings.md#currentdisplayid) setting. Physical/virtual display
IDs can be obtained using the [`mobile: listDisplays`](#mobile-listdisplays) or [`mobile: listWindows`](#mobile-listwindows)
execute methods, or the `adb shell dumpsys SurfaceFlinger --display-id` command.

Available since driver version 2.29.0.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`displayId?`|`integer` or `string`|Physical or virtual display identifier to take a screenshot for. By default, all available displays are used. An error is thrown if a display with the specified ID does not exist.|

#### Response

`Record<string, Record<string, any>>` - a map of display identifiers to their properties. Each set
of properties contains the following:

|Name|Type|Description|
|--|--|--|
|`id`|`string`|Display identifier|
|`name`|`string`|Display name|
|`isDefault`|`boolean`|Whether this display is the default one|
|`payload`|`string`|Base64-encoded PNG screenshot of the display|

### `mobile: viewportScreenshot`

Retrieves a screenshot of the current viewport. This is equivalent to calling
[the standard Get Screenshot endpoint](https://appium.io/docs/en/latest/reference/api/webdriver/#getscreenshot)
and cropping it to the visible viewport (returned by [`mobile: viewportRect`](#mobile-viewportrect)).

#### Response

`string` - a base64-encoded PNG image of the current viewport

### `mobile: startScreenStreaming`

Starts an MJPEG server for broadcasting the screen of the device under test. The [`adb_screen_streaming`](./insecure-features.md#adb_screen_streaming)
insecure feature must be enabled, and the host machine must have [GStreamer](https://gstreamer.freedesktop.org/)
installed and available on `PATH`, along with the `gst-plugins-base`, `gst-plugins-good`,
`gst-plugins-bad` and `gst-libav` packages.

Broadcasting can be stopped using the [`mobile: stopScreenStreaming`](#mobile-stopscreenstreaming)
execute method. Repeated calls to this method have no effect unless the previous streaming session
is stopped.

For the built-in device MJPEG stream (no GStreamer), see the [MJPEG guide](../guides/mjpeg.md).

#### Parameters

|<div style="width:11em">Name</div>|Type|Description|
|---|---|---|
|`width?`|`integer`|Scaled width of the device screen. Set to the actual device screen width by default. |
|`height?`|`integer`|Scaled height of the device screen. Set to the actual device screen height by default. |
|`bitRate?`|`integer`|Bitrate of the video, in bits per second. Set to `4000000` (4 Mbps) by default.|
|`host?`|`string`|IP address/host name to start the MJPEG server on. Set to `127.0.0.1` by default. Can be set to `0.0.0.0` to broadcast on all available network interfaces.|
|`pathname?`|`string`|URL path on which the MJPEG server should be accessible. By default, all pathnames on the given `host`/`port` combination are accessible. Must begin with a forward slash (`/`).|
|`port?`|`integer`|Port number to start the MJPEG server on. Set to `8093` by default.|
|`tcpPort?`|`integer`|Port number to start the internal TCP MJPEG broadcast on. Always starts on the loopback interface (`127.0.0.1`). Set to `8094` by default.|
|`quality?`|`integer`|Quality of the broadcasted images. Must be in the range `[1, 100]`, where `100` indicates the best quality. Set to `70` by default.|
|`considerRotation?`|`boolean`|Whether to increase the broadcast dimensions to fit both landscape and portrait orientations. Should be set to `true` if the device orientation will be changed during the broadcast. Set to `false` by default.|
|`logPipelineDetails?`|`boolean`|Whether to include GStreamer pipeline event logs into the standard log output. Can be useful for debugging purposes. Set to `false` by default.|

#### Response

`null`

### `mobile: stopScreenStreaming`

Stops the MJPEG screen broadcasting server previously started using [`mobile: startScreenStreaming`](#mobile-startscreenstreaming).
The method will return immediately if no streaming server is running.

For the built-in device MJPEG stream (no GStreamer), see the [MJPEG guide](../guides/mjpeg.md).

#### Response

`null`

### `mobile: startMediaProjectionRecording`

Starts recording the device screen and audio using Android's [Media Projection](https://developer.android.com/reference/android/media/projection/MediaProjection)
API. Only supported since Android 10 (Q / API level 29). Recording can be stopped using the
[`mobile: stopMediaProjectionRecording`](#mobile-stopmediaprojectionrecording)
execute method.

Available since driver version 2.4.0.

#### Parameters

|<div style="width:9em">Name</div>|Type|Description|
|--|--|--|
|`resolution?`|`string`|Resolution of the resulting video, formatted as `<width>x<height>`. Supported values are `1920x1080`, `1280x720`, `720x480`, `320x240` and `176x144`. Set to the greatest supported device resolution by default (usually `1920x1080`).|
|`priority?`|`string`|Priority of the recorder process, which could be adjusted in case of performance drops. Supported values are `high`, `normal` and `low`. Set to `high` by default.|
|`maxDurationSec?`|`integer`|Maximum recording time in seconds. Set to `900` (15 minutes) by default. |
|`filename?`|`string`|Name of the resulting video file. The `.mp4` extension is added automatically if absent. Set to the current timestamp by default.|

#### Response

`boolean` - `true` if a new recording has successfully started, otherwise `false`

### `mobile: stopMediaProjectionRecording`

Stops the active screen recording process started by [`mobile: startMediaProjectionRecording`](#mobile-startmediaprojectionrecording),
either returning its payload or uploading it to a remote location. Only supported since Android 10
(Q / API level 29).

If the recording process is not running, but another recording has previously finished, its data is
used instead. If no previous recording was found, an error is thrown.

Available since driver version 2.4.0.

#### Parameters

|<div style="width:8em">Name</div>|<div style="width:8em">Type</div>|Description|
|--|--|--|
|`remotePath?`|`string`|Path to a remote location where the resulting video file should be uploaded. Supported path protocols are HTTP(S) and FTP (deprecated). An exception is thrown if the file is too big to fit in the process memory.|
|`user?`|`string`|Username used for authentication to `remotePath`|
|`pass?`|`string`|Password used for authentication to `remotePath`|
|`method?`|`string`|Name of the HTTP(S) multipart upload method. Set to `PUT` by default.|
|`headers?`|`Record<string, any>`|Additional headers to use for the HTTP(S) multipart upload|
|`fileFieldName?`|`string`|Name of the form field for storing the file content blob for HTTP(S) uploads. Set to `file` by default.|
|`formFields?`|`Record<string, any>` or `Array<[string, any]>`|Additional form fields to use for the HTTP(S) multipart upload|
|`uploadTimeout?`|`integer`|Maximum timeout for uploading the file. Set to `240000` (4 minutes) by default. Available since driver version 2.18.0.|

#### Response

`string` - the Base64-encoded string of the screen recording, or an empty string if `remotePath` is
set

### `mobile: isMediaProjectionRecordingRunning`

Determines whether a Media Projection-based recording is currently active. Only supported since
Android 10 (Q / API level 29).

Available since driver version 2.4.0.

#### Response

`boolean` - `true` if recording is active, otherwise `false`

### `mobile: lock`

Locks the device and optionally unlocks it after a specified duration. Only simple (e.g. without a
password) locks are supported.

Available since driver version 2.26.3.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`seconds?`|`float`|Number of seconds after which to unlock the device. If omitted or set to `0`, automatic unlock is skipped.|

#### Response

`null`

### `mobile: unlock`

Unlocks the device if it is locked. Refer to [the Device Lock/Unlock guide](../guides/unlock.md)
for more details.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`key?`|`string`|The unlock key. By default, set to the value of the [`appium:unlockKey`](./capabilities.md#unlockkey) capability. Must be provided together with `type`.|
|`type?`|`string`|The unlock type. By default, set to the value of the [`appium:unlockType`](./capabilities.md#unlocktype) capability. Supported values are `pin`, `pinWithKeyEvent`, `password`, `pattern` and `fingerprint`. Must be provided together with `key`.|
|`strategy?`|`string`|Approach to use for unlocking. By default, set to the value of the [`appium:unlockStrategy`](./capabilities.md#unlockstrategy) capability. Ignored if `type` is set to `fingerprint`.|
|`timeoutMs?`|`integer`|The unlock timeout. By default, set to the value of the [`appium:unlockSuccessTimeout`](./capabilities.md#unlocksuccesstimeout) capability.|

#### Response

`null`

### `mobile: isLocked`

Determines whether the device is locked.

#### Response

`boolean` - `true` if the device is locked, otherwise `false`

### `mobile: getDeviceTime`

Retrieves the current system time on the device under test.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`format?`|`string`|Format to return the timestamp in. Refer to the [`dayjs` documentation](https://day.js.org/docs/en/display/format) for the format syntax. Set to `YYYY-MM-DDTHH:mm:ssZ` by default, matching the ISO8601 format.|

#### Response

`string` - the device timestamp in the specified format

### `mobile: openNotifications`

Opens the notification tray on the device under test. Does nothing if the tray is already opened.

Available since driver version 2.23.0.

#### Response

`null`

### `mobile: getNotifications`

Retrieves up to 100 most recent Android notifications, including dismissed ones. The Appium Settings
helper app must first be *manually* granted notification access.

#### Response

`Record<string, any>` - mapping of notification categories to arrays of notification objects. Newer
notifications are always added to the start of the array. For details on the notification object,
refer to the Android [`StatusBarNotification`](https://developer.android.com/reference/android/service/notification/StatusBarNotification)
and [`Notification`](https://developer.android.com/reference/android/app/Notification) documentation.
The `isRemoved` flag is set to `true` for dismissed notifications.

Example output:

```json
{
  "statusBarNotifications": [
    {
      "isGroup": false,
      "packageName": "io.appium.settings",
      "isClearable": false,
      "isOngoing": true,
      "id": 1,
      "tag": null,
      "notification": {
        "title": null,
        "bigTitle": "Appium Settings",
        "text": null,
        "bigText": "Keep this service running, so Appium for Android can properly interact with several system APIs",
        "tickerText": null,
        "subText": null,
        "infoText": null,
        "template": "android.app.Notification$BigTextStyle"
      },
      "userHandle": 0,
      "groupKey": "0|io.appium.settings|1|null|10133",
      "overrideGroupKey": null,
      "postTime": 1576853518850,
      "key": "0|io.appium.settings|1|null|10133",
      "isRemoved": false
    }
  ]
}
```

### `mobile: statusBar`

Performs the specified command on the system status bar. Calls `adb shell cmd statusbar` under the
hood. Only supported since Android 8 (Oreo / API level 26).

Available since driver version 2.25.0.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`command`|`string`|Name of the status bar command. See below for supported values.|
|`component?`|`string`|Name of the tile component to apply the command on. Only used for `addTile`, `removeTile` and `clickTile` commands.|

The following values are supported for the `command` parameter:

|<div style="width:11em">Name</div>|Description|
|--|--|
|`expandNotifications`|Opens the notifications panel|
|`expandSettings`|Opens the notifications panel and expand quick settings if present|
|`collapse`|Collapses the notifications and settings panel|
|`addTile`|Adds a TileService of the specified component|
|`removeTile`|Removes a TileService of the specified component|
|`clickTile`|Clicks on a TileService of the specified component|
|`getStatusIcons`|Returns the list of status bar icons and the order they appear in. List items are separated using the newline character|

#### Response

`string` - output of the requested status bar command. Could be empty

### `mobile: getConnectivity`

Retrieves the state of one or more connectivity-related system services.

Available since driver version 2.13.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`services?`|`string` or `Array<string>`|One or more service names to check. Supported values are `wifi`, `data`, and `airplaneMode`. By default, the states for all services are returned.|

#### Response

`Record<string, boolean>` - mapping of service names to whether they are enabled. If the `services` parameter was set, only the specified services are returned.

### `mobile: setConnectivity`

Sets the state of one or more connectivity-related system services. On real devices, switching WiFi
only works reliably since Android 11 (R / API level 30).

Available since driver version 2.13.0.

!!! warning

    Using this method may result in Android terminating/disconnecting the UiAutomator2 server app
    on the device under test, causing a session disconnect. The only way to restore the session
    afterwards would be to quit it, restore device connectivity, then reconnect to it with the
    [`appium:noReset`](./capabilities.md#noreset) capability set to `true`.

#### Parameters

At least one of the below parameters must be provided. If any parameter is not specified, the state
of its service remains unchanged.

|Name|Type|Description|
|--|--|--|
|`wifi?`|`boolean`|Whether WiFi should be enabled or disabled|
|`data?`|`boolean`|Whether mobile data should be enabled or disabled|
|`airplaneMode?`|`boolean`|Whether Airplane Mode should be enabled or disabled|

#### Response

`null`

### `mobile: bluetooth`

Performs the specified action on the Android system Bluetooth adapter. An error is thrown if the
device under test does not have a Bluetooth adapter.

Available since driver version 3.4.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`action`|`string`|Bluetooth action to apply. Supported values are `enable`, `disable`, and `unpairAll`.|

#### Response

`null`

### `mobile: nfc`

Performs the specified action on the Android system NFC adapter. An error is thrown if the device
under test does not have a NFC adapter.

Available since driver version 3.4.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`action`|`string`|NFC action to apply. Supported values are `enable` and `disable`.|

#### Response

`null`

### `mobile: toggleGps`

Toggles the state of location services (GPS). This functionality only works reliably starting from
Android 12 (S / API level 31).

Available since driver version 2.23.0.

#### Response

`null`

### `mobile: isGpsEnabled`

Determines whether location services (GPS) are enabled. This functionality only works reliably
starting from Android 12 (S / API level 31).

Available since driver version 2.23.0.

#### Response

`boolean` - `true` if GPS services are enabled, otherwise `false`

### `mobile: refreshGpsCache`

Sends a request to refresh the GPS cache on the device under test. By default, location tracking is
configured for [low battery consumption](https://github.com/appium/io.appium.settings/blob/master/app/src/main/java/io/appium/settings/LocationTracker.java),
so this method can be useful if the device location frequently changes.

The device under test must either have Google Play Services installed, or be running Android 11
(R / API level 30) or later (which relies on [`LocationManager`](https://developer.android.com/reference/android/location/LocationManager)).

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`timeoutMs?`|`integer`|Maximum number of milliseconds to block until the GPS cache is confirmed to have been refreshed. Set to `20000` by default. An error is thrown if the device does not return a successful cache refresh response within this timeout. If set to `0` or a negative value, waiting is skipped.|

#### Response

`null`

### `mobile: getGeolocation`

Retrieves the current location of the device under test.

Available since driver version 3.8.1.

#### Response

`Location` - an object with the following properties:

|Name|Type|Description|
|--|--|--|
|`altitude`|`float`|Altitude of the device location|
|`latitude`|`float`|Latitude of the device location|
|`longitude`|`float`|Longitude of the device location|

### `mobile: setGeolocation`

Sets the current location of the device under test.

Available since driver version 3.8.1.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`latitude`|`float`|New latitude value|
|`longitude`|`float`|New longitude value|
|`altitude?`|`float`|New altitude value|
|`satellites?`|`integer`|Number of satellites being tracked. Only supported on emulators. Must be in the range `[1, 12]`. Available since driver version 4.1.0.|
|`speed?`|`float`|Current speed in meters per second. Must not be negative. See [`Location.setSpeed`](https://developer.android.com/reference/android/location/Location#setSpeed(float)) for more details. Available since driver version 4.1.0.|
|`bearing?`|`float`|Current bearing in degrees. Only supported on real devices. Must be in the range `[0, 360)`. See [`Location.setBearing`](https://developer.android.com/reference/android/location/Location#setBearing(float)) for more details. Available since driver version 4.1.0.|
|`accuracy?`|`float`|Current horizontal accuracy in meters. Only supported on real devices. Must not be negative. See [`Location.setAccuracy`](https://developer.android.com/reference/android/location/Location#setAccuracy(float)) for more details. Available since driver version 4.1.0.|

#### Response

`null`

### `mobile: resetGeolocation`

Resets the current location of the device under test to the default/system one. Only supported on
real devices.

Available since driver version 3.8.1.

#### Response

`null`

### `mobile: pushFile`

Pushes data to a file on the device under test. If the target file already exists, its contents
will be overwritten.

Available since driver version 2.6.0.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|---|---|---|
|`remotePath`|`string`|Full path to the file where the data should be written to, or a path inside an app bundle (e.g. `@my.app.id/my/path`). The latter format requires the target app bundle to have debugging enabled. An error is thrown if the path resolves to a directory.|
|`payload`|`string`|Base64-encoded data to be included in the file|

#### Response

`null`

### `mobile: pullFile`

Pulls the contents of a file from the device under test.

Available since driver version 2.6.0.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|---|---|---|
|`remotePath`|`string`|Full path to the file where the data should be retrieved from, or a path inside an app bundle (e.g. `@my.app.id/my/path`). The latter format requires the target app bundle to have debugging enabled. An error is thrown if the path resolves to a directory.|

#### Response

`string` - Base64-encoded contents of the specified file

### `mobile: deleteFile`

Deletes a file from the device under test.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|---|---|---|
|`remotePath`|`string`|Full path to the file to be deleted, or a path inside an app bundle (e.g. `@my.app.id/my/path`). The latter format requires the target app bundle to have debugging enabled. An error is thrown if the path resolves to a directory.|

#### Response

`boolean` - `true` if the file was successfully deleted, `false` if it does not exist

### `mobile: pullFolder`

Pulls the contents of a directory from the device under test.

Available since driver version 2.6.0.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|---|---|---|
|`remotePath`|`string`|Full path to a directory on the device under test|

#### Response

`string` - Base64-encoded zipped contents of the specified directory

### `mobile: listSms`

Retrieves the most recent SMS messages.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`max?`|`integer`|Maximum number of messages to retrieve. Set to `100` by default.|

#### Response

`Record<string, any>` - map containing an array of notification objects, and their count. Newer
messages are always added to the start of the array.

Example output:

```json
 {
  "items": [
    {
      "id": "2",
      "address": "+123456789",
      "person": null,
      "date": "1581936422203",
      "read": "0",
      "status": "-1",
      "type": "1",
      "subject": null,
      "body": "\"text message2\"",
      "serviceCenter": null
    },
    {
      "id": "1",
      "address": "+123456789",
      "person": null,
      "date": "1581936382740",
      "read": "0",
      "status": "-1",
      "type": "1",
      "subject": null,
      "body": "\"text message\"",
      "serviceCenter": null
    }
  ],
  "total": 2
 }
```

### `mobile: hideKeyboard`

Hides the on-screen keyboard. An error is thrown if the keyboard cannot be hidden.

Available since driver version 2.16.0.

#### Response

`boolean` - `true` if the keyboard was successfully hidden, otherwise `false`

### `mobile: isKeyboardShown`

Determines whether the on-screen keyboard is shown.

Available since driver version 2.16.0.

#### Response

`boolean` - `true` if the keyboard is shown, otherwise `false`

### `mobile: setStylusHandwriting`

Enables or disables the Android system stylus handwriting input method. The [`set_stylus_handwriting`](./insecure-features.md#set_stylus_handwriting)
insecure feature must be enabled.

This functionality can be used to hide a possible system popup titled 'Try out your stylus'. Refer
to [this ticket](https://github.com/appium/appium-uiautomator2-driver/issues/909) for more details.

Available since driver version 7.1.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`enabled`|`boolean`|Whether to enable or disable the stylus handwriting feature|

#### Response

`null`

### `mobile: getClipboard`

Retrieves the content of the primary clipboard on the device under test.

Available since driver version 3.7.0.

#### Response

`string` - the clipboard content as a Base64-encoded string. An empty string is returned if the
clipboard contains no data.

### `mobile: setClipboard`

Sets the contents of the primary device clipboard. Calls [`ClipboardManager.setPrimaryClip()`](https://developer.android.com/reference/android/content/ClipboardManager#setPrimaryClip(android.content.ClipData))
under the hood.

Available since driver version 3.7.0.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`content`|`string`|Base64-encoded payload to place in the clipboard.|
|`contentType?`|`string`|The only supported and default value is `plaintext`.|
|`label?`|`string`|Label to identify the payload. By default, set to the first 10 symbols of the plaintext data.|

#### Response

`null`

### `mobile: pressKey`

Emulates a single key press of the specified key. Uses either [`pressKey()`](https://developer.android.com/reference/androidx/test/uiautomator/UiDevice#pressKeyCode(int))
or a new [`KeyEvent`](https://developer.android.com/reference/android/view/KeyEvent#KeyEvent(long,%20long,%20int,%20int,%20int,%20int,%20int,%20int,%20int))
under the hood.

Available since driver version 2.17.0.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`keycode`|`integer`|Code of the key to press. Must match the numerical value for a supported KeyEvent `KEYCODE_` constant.|
|`metastate`|`integer`|One or more meta keys that should be simultaneously pressed. Must match the combined numerical value for one or more supported KeyEvent `META_` constants.|
|`flags`|`integer`|Flags to apply during the press. Must match the combined numerical value for one or more supported KeyEvent `FLAG_` constants.|
|`isLongPress?`|`boolean`|Whether to emulate a long press. Set to `false` by default.|
|`source?`|`integer`|Input device source. Must be set to the value of an [`InputDevice`](https://developer.android.com/reference/android/view/InputDevice) `SOURCE_` constant, or an bitwise OR combination of multiple such values. Set to `257` (`SOURCE_KEYBOARD`) by default.|

#### Response

`null`

## Emulator (AVD)

### `mobile: execEmuConsoleCommand`

Executes the specified command using the Android emulator telnet console interface. The
[`emulator_console`](./insecure-features.md#emulator_console) insecure feature must be enabled.
Only supported on emulators.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|---|---|---|
|`command`|`string` or `Array<string>`|Command name to execute. See [Android Emulator Console Guide](https://developer.android.com/studio/run/emulator-console) for more details on available commands|
|`execTimeout?`|`integer`|Timeout in milliseconds to wait for the server to reply to the given command. Set to `60000` by default|
|`connTimeout?`|`integer`|Console connection timeout in milliseconds. Set to `5000` by default|
|`initTimeout?`|`integer`|Telnet console initialization timeout in milliseconds (the time between the connection being established and the command prompt becoming available). Set to `5000` ms by default|

#### Response

`string` - the command output. An error is thrown if command execution fails.

### `mobile: injectEmulatorCameraImage`

Sets the specified image as the output of the camera viewfinder. Only supported on emulators.

This functionality can be useful, for example, when testing QR code scanning functionality in the
application under test.

Available since driver version 3.2.0.

#### Preconditions

If this method is used on a newly created or resetted device, it is mandatory to provide a value
(or an empty map to use its defaults) to the [`appium:injectedImageProperties`](./capabilities.md#injectedimageproperties)
capability, in order to prepare the emulator for image injection.

There is also a possibility to perform a manual configuration of the necessary preconditions. For
that, replace the content of the `Toren1BD.posters` file located in `$ANDROID_HOME/emulator/resources`
with the following text:

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

After that, make sure to (re)start the emulator to pick up the changes. The values under
`poster table` can also be customized for different image properties.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`payload`|`string`|Base64-encoded `.PNG` image to set as the viewfinder output. Other image formats are not supported.|

#### Response

`null`

### `mobile: sendSms`

Emulates sending an SMS to the specified phone number. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`phoneNumber`|`string`|Phone number to send the message to|
|`message`|`string`|Message contents to send|

#### Response

`null`

### `mobile: gsmCall`

Emulates a GSM call action for the specified phone number. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`phoneNumber`|`string`|Phone number to apply the action to|
|`action`|`string`|Call action to apply. Supported values are `call`, `accept`, `cancel` and `hold`.|

#### Response

`null`

### `mobile: gsmSignal`

Emulates a change of the GSM signal strength profile. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|<div style="width:8em">Name</div>|Type|Description|
|--|--|--|
|`strength`|`integer`|Signal strength profile to apply. Supported values are `0` (worst signal), `1`, `2`, `3`, and `4` (best signal)|

#### Response

`null`

### `mobile: gsmVoice`

Emulates a change of the GSM voice state. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`state`|`string`|Voice state to apply. Supported values are `on`, `off`, `denied`, `searching`, `roaming`, `home`, and `unregistered`.|

#### Response

`null`

### `mobile: powerAC`

Emulates a power state change on the device. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`state`|`string`|Power state to apply. Supported values are `on` and `off`.|

#### Response

`null`

### `mobile: powerCapacity`

Emulates a power capacity change on the device. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`percent`|`integer` or `string`|Power capacity to apply. Must be in the range `[0, 100]`.|

#### Response

`null`

### `mobile: networkSpeed`

Emulates a network connection speed mode change. Only supported on emulators.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`speed`|`string`|Network speed mode to apply. Supported values are `gsm`, `scsd`, `gprs`, `edge`, `umts`, `hsdpa`, `lte`, `evdo`, and `full`.|

#### Response

`null`

### `mobile: sensorSet`

Sets the value of a specific hardware sensor on the device under test. Only supported on emulators.
Refer to the Android [Manage sensors on the emulator](https://developer.android.com/studio/run/emulator-console#manage-sensors)
guide for more details.

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`sensorType`|`string`|Type of sensor to set the value for. Supported values can be found in the [`appium-adb` source code here](https://github.com/appium/appium-adb/blob/master/lib/tools/emu-constants.ts#L32).|
|`value`|`string`|Value to set for the specified sensor. The supported format depends on `sensorType`.|

#### Response

`null`

### `mobile: fingerprint`

Emulates authentication using a virtual fingerprint with the specified ID. Only supported on
emulators running Android 6 (Marshmallow / API level 23) or later.

Virtual fingerprints should first be registered by opening the Android fingerprint registration
settings and running this command with the ID that the fingerprint should be assigned to. Once
registered, the command and ID can be used in fingerprint authentication prompts.

Available since driver version 2.22.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`fingerprintId`|`integer` or `string`|Identifier of a virtual fingerprint|

#### Response

`null`

## Applications

### `mobile: listApps`

Retrieves information about installed applications on the device under test. Only supported since
Android 8 (Oreo / API level 26).

Available since driver version 6.9.0.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`user?`|`integer` or `string`|ID of the user to filter the installed packages for|

#### Response

`Record<string, Record<string, any>>` - mapping of package names to their details. The
`versionCode` property is only populated for devices running Android 9 (Pie / API level 28) or
later.

In UiAutomator2 driver versions before 7.0.0, the response is `Array<string>` - a list of package
names.

### `mobile: isAppInstalled`

Determines whether the application with the specified package identifier is installed on the device
under test.

Available since driver version 2.5.0.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`appId`|`string`|Package identifier of the application|
|`user?`|`integer` or `string`|ID of the user for which the app is installed. The `current` user is used by default. Available since driver version 3.3.0.|

#### Response

`boolean` - `true` if the app is installed, otherwise `false`

### `mobile: queryAppState`

Retrieves the state of the application with the specified package identifier on the device under
test.

Available since driver version 2.5.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app to query|

#### Response

`integer` - a number indicating the app state:

|Number|Description|
|--|--|
|`0`|Not installed|
|`1`|Not running|
|`3`|Running in background|
|`4`|Running in foreground|

### `mobile: activateApp`

Activates the application with the specified package identifier or launches it if necessary, by
simulating a tap on the app icon on the Android UI.

Available since driver version 2.5.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app to activate|

#### Response

`null`

### `mobile: terminateApp`

Terminates the application with the specified package identifier and waits until its app process
has stopped.

Available since driver version 2.5.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app to terminate|
|`timeout?`|`integer`|Number of milliseconds to wait until the app is terminated. Set to `500` by default. Since driver version 2.9.0, setting this to `0` or a negative value skips the app state check.|

#### Response

`boolean` - `true` if the app was terminated, otherwise `false`

### `mobile: backgroundApp`

Moves the active app to the background and optionally restores it into the foreground after a
specified duration. The call is blocking.

Available since driver version 2.19.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`seconds`|`float`|Number of seconds after which to restore the app to foreground. If set to `0` or a negative value, automatic restoration is skipped.|

#### Response

`null`

### `mobile: installApp`

Installs the specified application on the device under test. 

If a newer version of the application was already installed, the `INSTALL_FAILED_VERSION_DOWNGRADE`
error may be raised.

Available since driver version 2.5.0.

#### Parameters

|<div style="width:10em">Name</div>|Type|Description|
|--|--|--|
|`appPath`|`string`|Full path to a file on the host machine, or URL to a remote location. The app must have the `.apk` or `.apks` extension.|
|`checkVersion?`|`boolean`|Whether to skip installation if an identical or newer app version is already installed. Unset by default. Applied before `replace`. Available since driver version 2.45.0.|
|`timeout?`|`integer`|Number of milliseconds to wait until the app is installed. Set to `60000` by default, unless overridden using the [`appium:adbExecTimeout`](./capabilities.md#adbexectimeout) capability|
|`allowTestPackages?`|`boolean`|Whether to allow installation of test packages. Set to `false` by default|
|`useSdcard?`|`boolean`|Whether to install the app on the SD card instead of built-in storage. Set to `false` by default|
|`grantPermissions?`|`boolean`|Whether to automatically grant all permissions defined in the application manifest after installation. Set to `false` by default. Only supported on Android 6 (Marshmallow / API level 23) or later.|
|`replace?`|`boolean`|Whether to replace any already existing app installation. Set to `true` by default. If set to `false` and the app is already installed, an error is thrown. Applied after `checkVersion`.|
|`noIncremental?`|`boolean`|Whether to disable incremental app installation. Set to `false` by default. Refer to [How ADB incremental-install works](https://android.googlesource.com/platform/packages/modules/adb/+/HEAD/docs/dev/incremental-install.md) for more details.|

#### Response

`null`

### `mobile: installMultipleApks`

Installs one or more applications on the device under test. Uses the `install-multiple` option of
`adb` under the hood.

#### Parameters

|Name|<div style="width:8em">Type</div>|Description|
|--|--|--|
|`apks`|`Array<string>`|List of full paths to files on the host machine, or URLs to remote locations. All apps must have the `.apk` extension.|
|`options?`|`InstallOptions`|Installation options. See below for a detailed structure.|

The `options` property is an object with the following properties:

|<div style="width:10em">Name</div>|Type|Description|
|---|---|---|
|`allowTestPackages?`|`boolean`|Whether to allow installation of test packages. Set to `false` by default|
|`useSdcard?`|`boolean`|Whether to install the apps on the SD card instead of built-in storage. Set to `false` by default|
|`grantPermissions?`|`boolean`|Whether to automatically grant all permissions defined in the application manifests after installation. Set to `false` by default. Only supported on Android 6 (Marshmallow / API level 23) or later.|
|`replace?`|`boolean`|Whether to replace any already existing app installations. Set to `true` by default. If set to `false` and any app is already installed, an error is thrown.|
|`partialInstall?`|`boolean`|Whether to use partial application installs (i.e. non-standalone updates). [Refer to this StackExchange post](https://android.stackexchange.com/questions/111064/what-is-a-partial-application-install-via-adb) for more details.|
|`timeout?`|`integer`|Timeout in milliseconds for installing the apps. Set to `20000` by default.|

#### Response

`null`

### `mobile: clearApp`

Clears all data associated with the application with the specified package identifier: user data,
cache, and settings. Calls `adb shell pm clear <appId>` under the hood.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app to clear|

#### Response

`null`

### `mobile: removeApp`

Uninstalls the application with the specified package identifier from the device under test.

Available since driver version 2.5.0.

#### Parameters

|<div style="width:10em">Name</div>|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app to uninstall|
|`timeout?`|`integer`|Number of milliseconds to wait until the app is terminated before uninstallation. Set to `20000` by default.|
|`keepData?`|`boolean`|Whether to retain application data and cache after uninstall. Unset by default.|
|`skipInstallCheck?`|`boolean`|Whether to check if the app is installed before uninstalling it. Set to `true` by default.|

#### Response

`boolean` - `true` if the app was removed, otherwise `false`

### `mobile: getAppStrings`

Retrieves string resources for the specified app language. An error is thrown if strings cannot be
fetched, or no strings exist for the specified language.

Available since driver version 2.15.0.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`language?`|`string`|Language whose strings should be retrieved. If omitted, the default system language is used (affected by the [`appium:language`](./capabilities.md#language) capability)|
|`stringFile?`|`string`|Path to the app whose strings should be retrieved. If not specified, the app under test is used. Available since driver version 8.3.0.|

#### Response

`Record<string, string>` - mapping of resource identifiers to localized strings

### `mobile: getPermissions`

Retrieves runtime permissions for a specified application package.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|---|---|---|
|`type?`|`string`|Type of permissions to retrieve. Supported values are `denied`, `granted` and `requested`. Set to `requested` by default.|
|`appPackage?`|`string`|Name of the application package to change. Set to the package of the app under test by default.|

#### Response

`Array<string>` - list of permission names. Could be empty

### `mobile: changePermissions`

Changes runtime permissions for a specified application package.

This function supports two modes, `pm` and `appops`, which can be distinguished using the `target`
parameter. Use of the `appops` mode requires driver version 2.13.7 or later, and the
[`adb_shell`](./insecure-features.md#adb_shell) insecure feature to be enabled.

#### Parameters

|<div style="width:7em">Name</div>|<div style="width:7em">Type</div>|Description|
|---|---|---|
|`permissions`|`string` or `Array<string>`|One or more permissions to be changed. For `pm` mode, supported values can be found in the [Android Manifest documentation](https://developer.android.com/reference/android/Manifest.permission), and the `all` magic string is additionally supported. For `appops` mode, supported values can be found in the [Android AppOpsManager documentation](https://developer.android.com/reference/android/app/AppOpsManager). Full constant values must be used for both modes.|
|`appPackage?`|`string`|Name of the application package to change. Set to the package of the app under test by default.|
|`action`|`string`|Permission action to apply. Supported values are either `grant` or `revoke` (in `pm` mode), or `allow`, `ignore`, `deny` and `default` (in `appops` mode).|
|`target?`|`string`|The mode to use. Supported values are `pm` and `appops`. Set to `pm` by default.|

#### Response

`null`

### `mobile: getCurrentPackage`

Retrieves the package name of the currently focused app.

Available since driver version 2.20.0.

#### Response

`string` - name of the focused app package. Could be `null`

### `mobile: getCurrentActivity`

Retrieves the name of the currently focused app activity.

Available since driver version 2.20.0.

#### Response

`string` - name of the focused app activity. Could be `null`

### `mobile: startActivity`

Starts the specified app activity. The activity can only be executed in scope of the current app
package.

Available since driver version 2.8.0.

#### Parameters

|<div style="width:14em">Name</div>|<div style="width:12em">Type</div>|Description|
|--|--|--|
|`appActivity`|`string`|Activity name to start|
|`locale?`|`Record<string, string>`|Map of language-related identifiers to use for setting the app locale. Follows the same format as the [`appium:appLocale`](./capabilities.md#applocale) capability.|
|`optionalIntentArguments?`|`Record<string, any>`|Map of options to be applied for the intent passed to the launchable app activity. Follows the same format as the [`appium:intentOptions`](./capabilities.md#intentoptions) capability.|
|`optionalActivityArguments?`|`string`|Map of options to be applied for the launchable app activity. Follows the same format as the [`appium:activityOptions`](./capabilities.md#activityoptions) capability.|

#### Response

`null`

### `mobile: startService`

Starts a specified service intent. Calls [`Context.startService()`](https://developer.android.com/reference/android/content/Context#startService(android.content.Intent))
/ [`Context.startForegroundService()`](https://developer.android.com/reference/android/content/Context#startForegroundService(android.content.Intent))
under the hood.

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`intent`|`string`|Name of the service intent to start. Only services belonging to the app under test are supported.|
|`user?`|`integer` or `string`|ID of the user to use for starting the intent. The `current` user is used by default.|
|`foreground?`|`boolean`|Whether to start the service in the foreground. Set to `false` by default.|

#### Response

`string` - the fully qualified name of the component that was started due to the intent

### `mobile: stopService`

Stops the specified service intent. Calls [`Context.stopService()`](https://developer.android.com/reference/android/content/Context#stopService(android.content.Intent))
under the hood.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`intent`|`string`|Name of the service intent to stop. Only services belonging to the app under test are supported.|
|`user?`|`integer` or `string`|ID of the user to use for starting the intent. The `current` user is used by default.|

#### Response

`string` - equal to `'true'` if the service was successfully stopped

### `mobile: deepLink`

### `mobile: broadcast`

Sends a broadcast Intent to the Android system. Invokes `adb shell am broadcast` under the hood.

#### Parameters

|<div style="width:16em">Name</div>|<div style="width:11em">Type</div>|Description|
|--|--|--|
|`intent?`|`string`|Full name of the intent to broadcast|
|`user?`|`integer` or `string`|ID of the user to send the broadcast to|
|`action?`|`string`|Name of the intent action|
|`uri?`|`string`|Intent URI|
|`mimeType?`|`string`|Intent MIME type|
|`identifier?`|`string`|Intent identifier|
|`categories?`|`string` or `Array<string>`|One or more intent categories|
|`component?`|`string`|Intent component|
|`package?`|`string`|Intent package name|
|`extras?`|`Array<Array<string>>`|Extra intent arguments. See below for expected structure|
|`flags?`|`string`|Flags in hexadecimal format to apply on intent start-up. Refer to the [Android Intent documentation](https://developer.android.com/reference/android/content/Intent) for supported values. Multiple flags should be merged into one value.|
|`receiverPermission?`|`string`|Permission that the receiver must hold|
|`allowBackgroundActivityStarts?`|`boolean`|Whether the receiver may start activities even if in the background|

The `flags` parameter is an array of arrays, where each subarray contains 3 items: value category,
key, and the value itself. Supported value categories and their value types are as follows:

|<div style="width:7em">Value Category</div>|Value Type|
|--|--|
|`s`|String|
|`sn`|Null (only the key is required; the value should be omitted)|
|`z`|Boolean|
|`i`|Integer|
|`l`|Long integer|
|`f`|Float|
|`u`|URI|
|`cn`|Component name (string)|
|`ia`|String of comma-separated integers|
|`ial`|String of comma-separated integers|
|`la`|String of comma-separated long integers|
|`lal`|String of comma-separated long integers|
|`fa`|String of comma-separated floats|
|`fal`|String of comma-separated floats|
|`sa`|Comma-separated strings (commas that are part of the strings themselves should be escaped)|
|`sal`|Comma-separated strings (commas that are part of the strings themselves should be escaped)|

#### Response

`string` - output of the `adb shell am broadcast` command.

### `mobile: deviceidle`

Adds or removes one or more applications from the Android system whitelist for apps that should not
be forced into a limited mode after a period of inactivity (in other words, apps that should not be
automatically put to sleep). Calls `adb shell dumpsys deviceidle` under the hood. Only supported
since Android 6 (Marshmallow / API level 23).

Refer to the [Diving Into Android 'M' Doze](https://www.protechtraining.com/blog/post/diving-into-android-m-doze-875)
guide for more details.

Available since driver version 2.40.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`action`|`string`|Action to apply for the whitelist. Supported values are `whitelistAdd` and `whitelistRemove`.|
|`packages`|`string` or `Array<string>`|One or more package identifiers to add or remove from the whitelist|

#### Response

`null`

### `mobile: sendTrimMemory`

Simulates a system memory trimming-related event for the specified package, by calling
[`ComponentCallbacks2.onTrimMemory()`](https://developer.android.com/reference/android/content/ComponentCallbacks2#onTrimMemory(int)).

This functionality can be useful to verify app functionality under different system memory usage
levels. Refer to the Android [Manage your app's memory](https://developer.android.com/topic/performance/memory)
guide for more details.

Available since driver version 2.40.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`pkg`|`string`|Package identifier of the application to send the event to.|
|`level`|`string`|Context of the trim to simulate. Supported values are `COMPLETE`, `MODERATE`, `BACKGROUND`, `UI_HIDDEN`, `RUNNING_CRITICAL`, `RUNNING_LOW`, and `RUNNING_MODERATE`.|

#### Response

`null`

## Web Context

### `mobile: getContexts`

Retrieves a detailed list of available webview contexts with their mapping information. Does not
include non-webview (e.g. native) contexts.

#### Parameters

|<div style="width:10em">Name</div>|Type|Description|
|--|--|--|
|`waitForWebviewMs?`|`integer`|Number of milliseconds for how long to retry retrieval of webview data. Set to `0` by default. Higher values can help prevent ChromeDriver errors such as `failed to connect to socket 'localabstract:chrome_devtools_remote'`. Refer to [this issue](https://github.com/appium/appium/issues/19251) for more details. Available since driver version 2.30.0.|

#### Response

`Array<Record<string, any>>` - list of webview objects. Example output:

```json
[
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
]
```

### `mobile: getChromeCapabilities`

Retrieves the current ChromeDriver session capabilities. Only supported in a webview context. Can
be useful for debugging Chrome/webview automation issues and understanding what capabilities are
being applied to the Chromedriver instance.

Available since driver version 6.0.7.

#### Response

`Record<string, any>` - map of current ChromeDriver capabilities, typically consisting of standard
W3C WebDriver capabilities. The exact structure may depend on the Chrome/ChromeDriver version and
the initial session capabilities.

### `mobile: viewportElementRect`

## Gestures

### `mobile: dragGesture`

### `mobile: flingGesture`

### `mobile: doubleClickGesture`

### `mobile: clickGesture`

### `mobile: longClickGesture`

### `mobile: pinchCloseGesture`

### `mobile: pinchOpenGesture`

### `mobile: swipeGesture`

### `mobile: scrollGesture`

## Elements

### `mobile: scroll`

### `mobile: scrollBackTo`

### `mobile: type`

### `mobile: replaceElementValue`

### `mobile: performEditorAction`

Performs IME action on the currently focused editable element.

Very often Android developers use the [`onEditorAction`](https://developer.android.com/reference/android/widget/TextView.OnEditorActionListener.html#onEditorAction(android.widget.TextView,%20int,%20android.view.KeyEvent))
callback with the `actionId` argument to implement handling of actions, for example, when the
`Search` or `Done` button is pressed on the on-screen keyboard. This method aims to emulate the
invocation of such a callback on the focused element.

#### Parameters

|Name|Type|Description|
|---|---|---|
|`action`|`integer` or `string`|Name or integer code of the editor action to be executed. Supported values are `unspecified`, `none`, `go`, `search`, `send`, `next`, `done`, and `previous`. Refer to the [Android `EditorInfo`](https://developer.android.com/reference/android/view/inputmethod/EditorInfo) documentation for more details.|

#### Response

`null`

### `mobile: acceptAlert`

### `mobile: dismissAlert`
