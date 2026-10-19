---
hide:
  - navigation

title: Getting Started
---

## System Requirements

There are four primary requirements to use the UiAutomator2 driver:

* macOS, Windows or Linux host machine
* Appium
* Java Development Kit (JDK)
    * Can be downloaded from hosts like [Oracle](https://jdk.java.net/) or [Adoptium](https://adoptium.net/en-GB/temurin/releases/)
    * [`JAVA_HOME` environment variable must be set](https://www.baeldung.com/java-home-on-windows-7-8-10-mac-os-x-linux)
* Android SDK
    * Android SDK Platform & Build-Tools (via [Android Studio](https://developer.android.com/studio) or [standalone](https://developer.android.com/tools/sdkmanager))
    * Android SDK Platform-Tools (via [Android Studio](https://developer.android.com/studio) or [standalone](https://developer.android.com/tools/releases/platform-tools))
    * [`ANDROID_HOME` environment variable must be set](https://developer.android.com/tools/variables)

For most use cases, the latest versions of the above prerequisites should work just fine. Support for
older versions is specified in the tables listed below.

!!! note

    This document only lists compatibility information starting from UiAutomator2 driver 2.0.0, which
    was the first version supporting Appium 2. For compatibility with driver versions older than 2.0.0
    (Appium 1), please refer to [the Appium 1 changelog](https://github.com/appium/appium/blob/1.x/CHANGELOG.md).

!!! note

    If you already have the driver installed, since version 2.39.0 you can also verify most of its
    requirements with the built-in Appium Doctor:

    ```
    appium driver doctor uiautomator2
    ```

### Android OS

The UiAutomator2 driver can only automate devices under test that are running at least its minimum
supported Android OS version.

Please note that this OS version is not the same as the version of the Android SDK Platform listed
in the aforementioned host machine requirements.

| UiAutomator2 driver version | Minimum Android OS version on the device under test |
| --- | --- |
| >= 6.0.0 | Android 8 (Oreo / API level 26) |
| 2.0.0 - 5.0.7 | Android 5 (Lollipop / API level 21) [^android5] |

### JDK

JDK is required by the Android SDK.

| Android SDK version | Minimum JDK version |
| --- | --- |
| >= Android 11 (R / API level 30) | JDK 9 |
| < Android 11 (R / API level 30) | JDK 8 |

### Appium Server

Make sure to install a version of Appium that supports your target driver version. The requirements
and prerequisites of Appium itself can be found in [the Appium documentation](https://appium.io/docs/en/latest/quickstart/install/).

| UiAutomator2 driver version | Supported Appium server version |
| --- | --- |
| >= 5.0.0 | Appium 3 |
| 2.0.0 - 4.2.9 | Appium 2 |

## Installation

Provided you have set up the above prerequisites, you can install the driver using Appium's
[extension CLI](https://appium.io/docs/en/latest/cli/extensions/):

```bash
appium driver install uiautomator2
```

You can also specify an exact driver version:

```bash
appium driver install uiautomator2@8.6.0
```

Alternatively, if you are running a Node.js project, you can include `appium-uiautomator2-driver`
as one of your project dependencies. [Refer to the Appium documentation](https://appium.io/docs/en/latest/guides/managing-exts/#do-it-yourself-with-npm)
for more information about this approach.

### Verify the Installation

In order to check that the driver was installed correctly, simply launch the Appium server:

```bash
appium
```

The server log output should include a line like the following:

```
[Appium] AndroidUiAutomator2Driver has been successfully loaded in 0.789s
```

## Device Preparation

### Emulators

* One or more Android Virtual Devices (AVDs) must be created
    * This can be done either via [Android Studio](https://developer.android.com/studio/run/managing-avds)
      or using [the standalone `avdmanager` tool](https://developer.android.com/tools/avdmanager)

### Real Devices

* [USB or Wireless debugging must be enabled](https://developer.android.com/studio/debug/dev-options)
* The device must appear in the output of `adb devices` as `online`

## Creating a Session

The UiAutomator2 driver, like all Appium drivers, requires providing [specific capabilities](https://appium.io/docs/en/latest/guides/caps/)
in order to start a new session. The following example lists the minimum required capabilities for
a basic session:

```json
// This will start a session on the first connected real device
{
  "platformName": "Android",
  "appium:automationName": "UiAutomator2"
}
```

See [the Capabilities reference page](../reference/capabilities.md) for more information on the
capabilities supported by the driver.

[^android5]: Partial support due to known compatibility issues. Android 6 (Marshmallow / API level 23) or later is recommended.
