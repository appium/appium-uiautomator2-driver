---
hide:
  - navigation

title: Overview
---

The UiAutomator2 driver is an Appium driver intended for black-box automated testing of native and
hybrid Android applications.

## Target Platforms

The driver supports the following Android platforms as automation targets:

|Platform|Simulators|Real devices|
|--|--|--|
|Android|:white_check_mark:|:white_check_mark:|
|Android TV|:white_check_mark:|:white_check_mark:|
|Android Wear / Wear OS|:white_check_mark:|:white_check_mark:|
|Android XR|:white_check_mark:|:question: [^untested]|
|Android Auto|:x:|:x:|
|Android Automotive|:white_check_mark:|:question: [^untested]|

## Contexts

The following application contexts are supported for automation:

* Native applications
* Webviews based on Chrome
* Hybrid applications

## Technologies Used

The UiAutomator2 driver uses the [W3C WebDriver protocol](https://www.w3.org/TR/webdriver/) for
session management. Under the hood, the driver combines several different technologies to achieve
its functionality:

* Native testing
    * Based on Android's [UI Automator library](https://developer.android.com/training/testing/other-components/ui-automator)
    * Provided by the [`appium-uiautomator2-server`](https://github.com/appium/appium-android/tree/main/packages/uiautomator2-server) library
* Webview testing
    * Based on [the ChromeDriver server](https://developer.chrome.com/docs/chromedriver)
    * Provided by the [`appium-chromedriver`](https://github.com/appium/appium-android/tree/main/packages/chromedriver) library
* Additional tools
    * Support for `adb` is handled by the [`appium-adb`](https://github.com/appium/appium-android/tree/main/packages/adb) library
    * Management of certain Android settings is handled by the [`io.appium.settings`](https://github.com/appium/appium-android/tree/main/packages/settings) library

Several libraries and other features are shared with [the Appium Espresso driver](https://github.com/appium/appium-espresso-driver),
as part of the [`appium-android-driver`](https://github.com/appium/appium-android-driver) library.

## End-to-End Architecture

The diagram below is intentionally the simplest end-to-end example. Cloud service providers, device
farms, network gateways, and sophisticated local setups may insert additional layers between the
client library and the automation host.

```mermaid
flowchart TD
  subgraph ClientSide["Test Client"]
    T["Test Code"]
    CL["Appium Client Library<br/>(Java / Python / JS / Ruby / C#)"]
  end

  subgraph ServerHost["Automation Host"]
    AS["Appium Server<br/>WebDriver HTTP API"]
    XD["UiAutomator2 Driver<br/>(appium-uiautomator2-driver)"]
    ADBM["ADB + Port Forwarding"]
    CDM["Chromedriver Management<br/>(hybrid / webview only)"]
  end

  subgraph DeviceTarget["Android Device / Emulator"]
    U2S["UiAutomator2 Server<br/>(instrumentation HTTP API)"]
    UIA["UiAutomator Framework"]
    CD["Chromedriver<br/>(in webview context)"]
    AUT["Application Under Test"]
  end

  T --> CL
  CL -->|"W3C WebDriver over HTTP"| AS
  AS -->|"Forwards session commands to driver"| XD
  XD -->|"Install, shell, forward ports"| ADBM
  XD -->|"Context switch to WEBVIEW_*"| CDM
  ADBM -->|"adb forward (e.g. host:8200 → device:6790)"| U2S
  CDM -->|"Chromedriver HTTP"| CD
  U2S -->|"UiAutomator APIs"| UIA
  UIA -->|"UI interactions + accessibility tree"| AUT
  CD -->|"WebDriver in webview"| AUT
```

[^untested]: Not tested
