---
title: Endpoints
---

The UiAutomator2 driver comes with a set of many available endpoints, which are primarily inherited from
the Appium base driver, and can be found in [their Appium docs reference pages](https://appium.io/docs/en/latest/reference/api/).
Refer to the documentation of your Appium client for how to call specific endpoints.

The driver also defines several additional endpoints listed below. Please note that most of the
driver-specific functionality is available using [Execute Methods](./execute-methods.md) instead.

All endpoints listed below are supported since driver version 2.12.2, unless otherwise specified.

## JSON Wire Protocol

### availableIMEEngines

```
GET /session/:sessionId/ime/available_engines
```

> JSONWP documentation: [/session/:sessionId/ime/available_engines](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidimeavailable_engines)

Retrieves all IME (input method editor) engines available on the device under test.

#### Response

`string[]` - a list of available IME engines

### getActiveIMEEngine

```
GET /session/:sessionId/ime/active_engine
```

> JSONWP documentation: [/session/:sessionId/ime/active_engine](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidimeactive_engine)

Retrieves the name of the active IME engine.

#### Response

`string` - the name of the active IME engine

### isIMEActivated

```
GET /session/:sessionId/ime/activated
```

> JSONWP documentation: [/session/:sessionId/ime/activated](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidimeactivated)

Determines if IME input is available and active.

#### Response

`boolean` - `true` if IME is active, otherwise `false`

### deactivateIMEEngine

```
POST /session/:sessionId/ime/deactivate
```

> JSONWP documentation: [/session/:sessionId/ime/deactivate](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidimedeactivate)

Deactivates the currently active IME engine.

#### Response

`null`

### activateIMEEngine

```
POST /session/:sessionId/ime/activate
```

> JSONWP documentation: [/session/:sessionId/ime/activate](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidimeactivate)

Activates an IME engine.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`engine`|`string`|Name of the IME engine to activate|

#### Response

`null`

### getWindowSize

```
GET /session/:sessionId/window/:windowhandle/size
```

> JSONWP documentation: [/session/:sessionId/window/:windowhandle/size](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidwindowwindowhandlesize)

Retrieves the size of the current window. The `:windowhandle` property is ignored, as the driver
always uses the currently active window.

!!! warning "Deprecated"

    Please use the [getWindowRect](https://appium.io/docs/en/latest/reference/api/webdriver/#getwindowrect)
    endpoint instead

#### Response

`Record<string, number>` - object containing the `width` and `height` properties of the current
window

### keys

```
POST /session/:sessionId/keys
```

> JSONWP documentation: [/session/:sessionId/keys](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidkeys)

Sends a sequence of key strokes to the active element.

!!! warning "Deprecated"

    Please use the `keyUp` and `keyDown` W3C Actions instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`value`|`string`|Keys to be sent|

#### Response

`null`

### getLocation

```
GET /session/:sessionId/element/:elementId/location
```

> JSONWP documentation: [/session/:sessionId/element/:elementId/location](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidelementidlocation)

Returns the element's location on the page.

!!! warning "Deprecated"

    Please use the [getElementRect](https://appium.io/docs/en/latest/reference/api/webdriver/#getelementrect)
    endpoint instead

#### Response

`Record<string, number>` - object containing the `x` and `y` values of the element's top-left
coordinates

### getLocationInView

```
GET /session/:sessionId/element/:elementId/location_in_view
```

> JSONWP documentation: [/session/:sessionId/element/:elementId/location_in_view](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidelementidlocation_in_view)

Returns the element's location on the page screen once it has been scrolled into view.

!!! warning "Deprecated"

    Please use the [getElementRect](https://appium.io/docs/en/latest/reference/api/webdriver/#getelementrect)
    endpoint instead

#### Response

`Record<string, number>` - object containing the `x` and `y` values of the element's top-left
coordinates

### getSize

```
GET /session/:sessionId/element/:elementId/size
```

> JSONWP documentation: [/session/:sessionId/element/:elementId/size](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidelementidsize)

Returns the element's size in pixels.

!!! warning "Deprecated"

    Please use the [getElementRect](https://appium.io/docs/en/latest/reference/api/webdriver/#getelementrect)
    endpoint instead

#### Response

`Record<string, number>` - object containing the `width` and `height` properties of the element

### setGeoLocation

```
POST /session/:sessionId/location
```

> JSONWP documentation: [/session/:sessionId/location](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidlocation)

Sets the current location of the device under test.

!!! warning "Deprecated"

    Please use the [`mobile: setGeolocation`](./execute-methods.md#mobile-setgeolocation) execute
    method instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`location`|`Record<string, float>`|New device latitude, longitude and altitude|

The `location` parameter is an object with the following properties:

|Name|Type|Description|
|--|--|--|
|`altitude`|`float`|Altitude of the device location|
|`latitude`|`float`|Latitude of the device location|
|`longitude`|`float`|Longitude of the device location|

#### Response

`null`

### getLog

```
POST /session/:sessionId/log
```

> JSONWP documentation: [/session/:sessionId/log](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidlog)

Retrieves the logs for a given log type. Supported log types can be retrieved using the
[getLogTypes](#getlogtypes) endpoint.

Available since before driver version 2.0.0.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`type`|`string`|Log type to retrieve the logs for|

#### Response

`GetLogEntry[]` - an array of log entries.

Typically a log entry is an object with the following properties:

|Name|Description|Type|
|--|--|--|
|`level`|Level at which the message was logged|string|
|`message`|Contents of the actual log message|string|
|`timestamp`|Message timestamp (in milliseconds) in Unix format|number|

### getLogTypes

```
GET /session/:sessionId/log/types
```

> JSONWP documentation: [/session/:sessionId/log/types](https://www.selenium.dev/documentation/legacy/json_wire_protocol/#sessionsessionidlogtypes)

Retrieves the available log types that can be used to call the [getLog](#getlog) endpoint.

Available since before driver version 2.0.0.

#### Response

`string[]` - an array of log types

## Mobile JSON Wire Protocol

### getNetworkConnection

```
GET /session/:sessionId/network_connection
```

> MJSONWP documentation: [Device Modes](https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#device-modes)

Retrieves the current state of network types (data, Wi-Fi, airplane mode).

!!! warning "Deprecated"

    Please use the [`mobile: getConnectivity`](./execute-methods.md#mobile-getconnectivity) execute
    method instead

#### Response

`NetworkConnectionState` - a number indicating the current network state:

|Value|Data|Wi-Fi|Airplane Mode|
|--|--|--|--|
|`0`|OFF|OFF|OFF|
|`1`|OFF|OFF|ON|
|`2`|OFF|ON|OFF|
|`4`|ON|OFF|OFF|
|`6`|ON|ON|OFF|

### setNetworkConnection

```
POST /session/:sessionId/network_connection
```

> MJSONWP documentation: [Device Modes](https://github.com/SeleniumHQ/mobile-spec/blob/master/spec-draft.md#device-modes)

Sets the state of network types (data, Wi-Fi, airplane mode).

!!! warning "Deprecated"

    Please use the [`mobile: setConnectivity`](./execute-methods.md#mobile-setconnectivity) execute
    method instead

#### Parameters

|<div style="width:6em">Name</div>|<div style="width:18em">Type</div>|Description|
|--|--|--|
|`parameters`|`{"type": `[`NetworkConnectionState`](#response_12)`}`|Object containing the `type` key, whose value is the desired network state|

#### Response

[`NetworkConnectionState`](#response_12) - the new network state

## Appium Protocol

### startRecordingScreen

```
POST /session/:sessionId/appium/start_recording_screen
```

Starts recording the device screen using Android's `screenrecord` tool. On emulators this
functionality is only supported starting from Android 8 (Oreo / API level 27). The recording can be
stopped either using the [stopRecordingScreen](#stoprecordingscreen) endpoint, or by stopping the
session itself.

#### Parameters

|Name|Type|Description|
|--|--|--|
|`options?`|`Record<string, any>`|Options for starting the screen recording|

The following keys are supported:

|<div style="width:8em">Name</div>|Type|Description|
|--|--|--|
|`videoSize?`|`string`|Dimensions of the resulting video, formatted as `<width>x<height>`. By default, the device's native display resolution is used, or `1280x720` if the native resolution is unsupported. For best results, use a size supported by your device's AVC encoder.|
|`bugReport?`|`boolean`|Whether to add a video overlay with debugging information, such as a timestamp. Only supported since Android 9 (Pie / API level 28).|
|`timeLimit?`|`float` or `string`|Maximum recording time in seconds. Set to `180` (3 minutes) by default. The maximum supported value is `1800` seconds (30 minutes). A single recording chunk can be at most `180` seconds long, so if a greater value is specified, the driver will attempt to use multiple chunks and combine them using `ffmpeg`. In such cases, if `ffmpeg` is not available on `PATH`, only the most recent chunk will be retained.|
|`bitRate?`|`integer` or `string`|Bitrate of the video, in bits per second. Set to `20000000` (20Mbps) by default.|
|`forceRestart?`|`boolean`|Whether to skip returning the results of any currently running screenrecording process, and start a new one right away|

If `forceRestart` is `false` or unset (the default value), all the keys supported by the
stopRecordingScreen endpoint can also be used, in order to handle the upload of the result from the
currently running screenrecord process.

#### Response

`string` - the Base64-encoded string of a previous screen recording, if one existed and
`forceRestart` and `remotePath` were not set, otherwise an empty string

### stopRecordingScreen

```
POST /session/:sessionId/appium/stop_recording_screen
```

Stops the active screen recording process started by [startRecordingScreen](#startrecordingscreen),
either returning its payload or uploading it to a remote location. On emulators this functionality
is only supported starting from Android 9 (Pie / API level 28).

#### Parameters

|Name|Type|Description|
|--|--|--|
|`options?`|`Record<string, any>`|Options for stopping the screen recording|

The following keys are supported:

|<div style="width:8em">Name</div>|<div style="width:8em">Type</div>|Description|
|--|--|--|
|`remotePath?`|`string`|Path to a remote location where the resulting video file should be uploaded. Supported path protocols are HTTP(S) and FTP (deprecated). An exception is thrown if the file is too big to fit in the process memory.|
|`user?`|`string`|Username used for authentication to `remotePath`|
|`pass?`|`string`|Password used for authentication to `remotePath`|
|`method?`|`string`|Name of the HTTP(S) multipart upload method. Set to `PUT` by default.|
|`headers?`|`Record<string, any>`|Additional headers to use for the HTTP(S) multipart upload|
|`fileFieldName?`|`string`|Name of the form field for storing the file content blob for HTTP(S) uploads. Set to `file` by default.|
|`formFields?`|`Record<string, any>` or `Array<[string, any]>`|Additional form fields to use for the HTTP(S) multipart upload|

#### Response

`string` - the Base64-encoded string of the screen recording, or an empty string if `remotePath` is
set or no active screen recording process is found

### startActivity

```
POST /session/:sessionId/appium/device/start_activity
```

Starts the specified app activity.

!!! warning "Deprecated"

    Please use the [`mobile: startActivity`](./execute-methods.md#mobile-startactivity) execute
    method instead

#### Parameters

|<div style="width:9em">Name</div>|Type|Description|
|--|--|--|
|`appPackage?`|`string`|Package of app whose activity should be started. If omitted, the `appPackage` value of the app under test is used.|
|`appActivity`|`string`|Activity to be started|
|`appWaitPackage?`|`string`|Package to be waited on upon launching the specified activity. Set to `appPackage` if omitted.|
|`appWaitActivity?`|`string`|Activity to be waited on upon launching the specified activity. Set to `appActivity` if omitted.|

#### Response

`null`

### getCurrentActivity

```
GET /session/:sessionId/appium/device/current_activity
```

Retrieves the name of the currently focused app activity.

!!! warning "Deprecated"

    Please use the [`mobile: getCurrentActivity`](./execute-methods.md#mobile-getcurrentactivity)
    execute method instead

#### Response

`string` - name of the focused app activity. Could be `null`

### getCurrentPackage

```
GET /session/:sessionId/appium/device/current_package
```

Retrieves the package name of the currently focused app.

!!! warning "Deprecated"

    Please use the [`mobile: getCurrentPackage`](./execute-methods.md#mobile-getcurrentpackage)
    execute method instead

#### Response

`string` - name of the focused app package. Could be `null`

### queryAppState

```
POST /session/:sessionId/appium/device/app_state
```

Retrieves the state of the specified app.

!!! warning "Deprecated"

    Please use the [`mobile: queryAppState`](./execute-methods.md#mobile-queryappstate) execute
    method instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`appId`|`string`|Package identifier of the app|

#### Response

`integer` - a number indicating the app state:

|Number|Description|
|--|--|
|`0`|Not installed|
|`1`|Not running|
|`3`|Running in background|
|`4`|Running in foreground|

### background

```
POST /session/:sessionId/appium/app/background
```

Moves the active app to the background and optionally restores it into the foreground after a
specified duration. The call is blocking.

!!! warning "Deprecated"

    Please use the [`mobile: backgroundApp`](./execute-methods.md#mobile-backgroundapp) execute
    method instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`seconds`|`float`|Number of seconds after which to restore the app to foreground. If set to `0` or a negative value, automatic restoration is skipped.|

#### Response

`boolean | string` - the log output of launching the app if it was originally launched using
[startActivity](#startactivity), otherwise `true`

### getStrings

```
POST /session/:sessionId/appium/app/strings
```

Retrieves string resources for the specified app language. An error is thrown if strings cannot be
fetched, or no strings exist for the specified language.

!!! warning "Deprecated"

    Please use the [`mobile: getAppStrings`](./execute-methods.md#mobile-getappstrings) execute
    method instead

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`language?`|`string`|Language whose strings should be retrieved. If omitted, the default system language is used (affected by the [`appium:language`](./capabilities.md#language) capability)|
|`stringFile?`|`string`|Path to the app whose strings should be retrieved. If not specified, the app under test is used.|

#### Response

`Record<string, string>` - mapping of resource identifiers to localized strings

### getClipboard

```
POST /session/:sessionId/appium/device/get_clipboard
```

Retrieves the content of the primary clipboard on the device under test.

!!! warning "Deprecated"

    Please use the [`mobile: getClipboard`](./execute-methods.md#mobile-getclipboard) execute
    method instead

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`contentType?`|`string`|The type to retrieve the content as. The only supported and default value is `plaintext`.|

#### Response

`string` - the clipboard content as a Base64 string. An empty string is returned if the clipboard
contains no data.

### lock

```
POST /session/:sessionId/appium/device/lock
```

Locks the device and optionally unlocks it after a specified duration. Only simple (e.g. without a
password) locks are supported.

!!! warning "Deprecated"

    Please use the [`mobile: lock`](./execute-methods.md#mobile-lock) execute method instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`seconds?`|`float`|Number of seconds after which to unlock the device. If omitted or set to `0`, automatic unlock is skipped.|

#### Response

`null`

### unlock

```
POST /session/:sessionId/appium/device/unlock
```

Unlocks the device if it is locked. Only simple (e.g. without a password) locks are supported.

!!! warning "Deprecated"

    Please use the [`mobile: unlock`](./execute-methods.md#mobile-unlock) execute method instead

#### Response

`null`

### isLocked

```
POST /session/:sessionId/appium/device/is_locked
```

Determines whether the device is locked.

!!! warning "Deprecated"

    Please use the [`mobile: isLocked`](./execute-methods.md#mobile-islocked) execute method instead

#### Response

`boolean` - `true` if the device is locked, otherwise `false`

### getPerformanceData

```
POST /session/:sessionId/appium/getPerformanceData
```

Retrieves performance data about the given Android subsystem. The data is parsed from the output of
the `dumpsys` utility.

!!! warning "Deprecated"

    Please use the [`mobile: getPerformanceData`](./execute-methods.md#mobile-getperformancedata)
    execute method instead

#### Parameters

|<div style="width:7em">Name</div>|Type|Description|
|--|--|--|
|`packageName`|`string`|Name of the package identifier to fetch the data for|
|`dataType`|`string`|Subsystem name to return the data for. Supported values can be retrieved using the [getPerformanceDataTypes](#getperformancedatatypes) endpoint.|

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

### getPerformanceDataTypes

```
POST /session/:sessionId/appium/performanceData/types
```

Retrieves supported performance data types, which can be used as the `dataType` argument for the
[getPerformanceData](#getperformancedata) endpoint.

!!! warning "Deprecated"

    Please use the [`mobile: getPerformanceDataTypes`](./execute-methods.md#mobile-getperformancedatatypes)
    execute method instead

#### Response

`Array<string>` - list of supported data types

### fingerprint

```
POST /session/:sessionId/appium/device/finger_print
```

Emulates authentication using a virtual fingerprint with the specified ID. Only supported on
emulators running Android 6 (Marshmallow / API level 23) or later.

Virtual fingerprints should first be registered by opening the Android fingerprint registration
settings and running this command with the ID that the fingerprint should be assigned to. Once
registered, the command and ID can be used in fingerprint authentication prompts.

!!! warning "Deprecated"

    Please use the [`mobile: fingerprint`](./execute-methods.md#mobile-fingerprint) execute method
    instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`fingerprintId`|`integer` or `string`|Identifier of a virtual fingerprint|

#### Response

`null`

### getSystemBars

```
GET /session/:sessionId/appium/device/system_bars
```

Retrieves properties of various bars in the system UI.

!!! warning "Deprecated"

    Please use the [`mobile: getSystemBars`](./execute-methods.md#mobile-getsystembars)
    execute method instead

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

### getDisplayDensity

```
GET /session/:sessionId/appium/device/display_density
```

Retrieves the density of the current display in DPI.

!!! warning "Deprecated"

    Please use the [`mobile: getDisplayDensity`](./execute-methods.md#mobile-getdisplaydensity)
    execute method instead

#### Response

`integer` - the display density in DPI

### openNotifications

```
POST /session/:sessionId/appium/device/open_notifications
```

Opens the notification tray on the device under test. Does nothing if the tray is already opened.

!!! warning "Deprecated"

    Please use the [`mobile: openNotifications`](./execute-methods.md#mobile-opennotifications)
    execute method instead

#### Response

`null`

### pressKeyCode

```
POST /session/:sessionId/appium/device/press_keycode
```

Emulates a single key press of the specified key. Uses either [`pressKey()`](https://developer.android.com/reference/androidx/test/uiautomator/UiDevice#pressKeyCode(int))
or a new [`KeyEvent`](https://developer.android.com/reference/android/view/KeyEvent#KeyEvent(long,%20long,%20int,%20int,%20int,%20int,%20int,%20int,%20int))
under the hood.

!!! warning "Deprecated"

    Please use the [`mobile: pressKey`](./execute-methods.md#mobile-presskey) execute method
    instead

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`keycode`|`integer`|Code of the key to press. Must match the numerical value for a supported KeyEvent `KEYCODE_` constant.|
|`metastate?`|`integer`|One or more meta keys that should be simultaneously pressed. Must match the combined numerical value for one or more supported KeyEvent `META_` constants.|
|`flags?`|`integer`|Flags to apply during the press. Must match the combined numerical value for one or more supported KeyEvent `FLAG_` constants.|

#### Response

`null`

### longPressKeyCode

```
POST /session/:sessionId/appium/device/long_press_keycode
```

Emulates a single long key press of the specified key. Creates a new [`KeyEvent`](https://developer.android.com/reference/android/view/KeyEvent#KeyEvent(long,%20long,%20int,%20int,%20int,%20int,%20int,%20int,%20int))
under the hood.

!!! warning "Deprecated"

    Please use the [`mobile: pressKey`](./execute-methods.md#mobile-presskey) execute method
    instead

#### Parameters

|<div style="width:6em">Name</div>|Type|Description|
|--|--|--|
|`keycode`|`integer`|Code of the key to press. Must match the numerical value for a supported KeyEvent `KEYCODE_` constant.|
|`metastate?`|`integer`|One or more meta keys that should be simultaneously pressed. Must match the combined numerical value for one or more supported KeyEvent `META_` constants.|
|`flags?`|`integer`|Flags to apply during the press. Must match the combined numerical value for one or more supported KeyEvent `FLAG_` constants.|

#### Response

`null`

### setValueImmediate

```
POST /session/:sessionId/appium/element/:elementId/value
```

Sets the value of an element using `adb`.

!!! warning "Deprecated"

    Please use the [setValue](https://appium.io/docs/en/latest/reference/api/webdriver/#setvalue)
    endpoint instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`text`|`string`|Text to send to an element|

#### Response

`null`

### replaceValue

```
POST /session/:sessionId/appium/element/:elementId/replace_value
```

Replaces the value of an element using `adb`.

!!! warning "Deprecated"

    Please use the [setValue](https://appium.io/docs/en/latest/reference/api/webdriver/#setvalue)
    endpoint instead

#### Parameters

|Name|Type|Description|
|--|--|--|
|`text`|`string`|Text to send to an element, replacing existing text|

#### Response

`null`
