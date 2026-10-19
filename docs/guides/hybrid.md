---
title: Hybrid Applications
---

The UiAutomator2 driver supports automation of hybrid apps that use Chrome-based webviews. This
enables actions such as retrieving the webview-specific page source, as well as finding and
interacting with elements located inside the webview.

All webviews must be properly configured and debuggable in order to be accessible to the driver.
The availability of a particular webview could be easily verified by using the
[Chrome Remote Debugger](https://developer.chrome.com/docs/devtools/remote-debugging/).

## Contexts

Webview-specific information is not directly integrated into the default page source. Instead, the
driver makes use of Appium's [Context Management API](https://appium.io/docs/en/latest/guides/context/),
where each available webview is separated into its own context. As such, in order to interact with
any webview, it is necessary to first switch to its specific context using the context API.

By default, a UiAutomator2 driver session starts in the native context (named `NATIVE_APP`). This
is usually the only context available in native apps. Hybrid apps, however, can have one or more
web contexts in addition to the native context, and each web context can contain zero or more
pages/windows. To retrieve detailed information about these webviews, the driver also provides the
[`mobile: getContexts`](../reference/execute-methods.md#mobile-getcontexts) execute method.

It is also possible to start a session directly in web context by setting the [`browserName`](../reference/capabilities.md#browsername)
and/or [`appium:autoWebview`](../reference/capabilities.md#autowebview) capabilities.

In practice, when switching the application context from native to webview, the UiAutomator2 driver
simply changes the underlying component to which it forwards most API commands:

* Native context: the UiAutomator2 server application
* Webview context: an instance of [ChromeDriver](https://developer.chrome.com/docs/chromedriver)

Refer to [Technologies Used](../overview.md#technologies-used) for more details.

## Web Context Specifics

Switching from the native context to a ChromeDriver-backed web context brings a few benefits and
drawbacks alike:

* Webview-specific page source with web elements, similar to the one in Chrome DevTools
* Support for standard W3C WebDriver element locator strategies
* No support for driver-specific native locator strategies
* No support for endpoints and execute methods proxied to the UiAutomator2 server app

## Managing ChromeDriver

Similarly to the UiAutomator2 server application, the ChromeDriver instance may also require
configuration before creating a session.

The most important property of this instance is its ChromeDriver version: since Chrome 73
(March 2019), Google requires this version to follow the version of Chromium used to build the
webview under test, and in case of a mismatch, ChromeDriver will simply fail to attach to the
webview (exact matches are not required, but major versions must almost always match).

There are several approaches to obtaining a matching ChromeDriver version:

### Automatic Discovery

The UiAutomator2 driver allows to automatically download the version of ChromeDriver compatible with
the webview under test. This download is initiated upon discovering the webview (either upon
session start or upon switching to the webview context).

However, since this approach allows clients to download files to the Appium server host machine, it
is considered an insecure feature, and requires explicit enablement on the server side via the
[`chromedriver_autodownload`](../reference/insecure-features.md#chromedriver_autodownload) feature
name:

```sh
appium server --allow-insecure chromedriver_autodownload
```

Once this feature is enabled, no additional configuration is required on the client side.

Further configuration of this behavior is also possible through the [`appium:chromedriverExecutableDir`](../reference/capabilities.md#chromedriverexecutabledir)
and [`appium:chromedriverChromeMappingFile`](../reference/capabilities.md#chromedriverchromemappingfile)
capabilities.

### Using Capabilities

If the target ChromeDriver executable already exists on the host machine, it is possible to simply
provide a path to it using the [`appium:chromedriverExecutable`](../reference/capabilities.md#chromedriverexecutable)
capability.

In order to manually download the correct ChromeDriver executable (for Chrome 73+), refer to the
ChromeDriver [Version Selection](https://developer.chrome.com/docs/chromedriver/downloads/version-selection)
guide.

For Chrome 72 / ChromeDriver 2.46 or earlier, supported Chrome versions can be found under each
entry in the [ChromeDriver release notes](https://developer.chrome.com/docs/chromedriver/downloads).

### Upon Driver Installation

!!! warning

    This approach is only applicable to UiAutomator2 driver versions 3.7.11 or earlier.

ChromeDriver versions are managed by the [`appium-chromedriver`](https://github.com/appium/appium-android/tree/main/packages/chromedriver)
package, which comes bundled with the UiAutomator2 driver. Upon installation, `appium-chromedriver`
automatically tries to download the most recent version of ChromeDriver.

If the target webview version of the application under test is known in advance, it is possible to
specify the ChromeDriver version to be installed alongside the UiAutomator2 driver. This is done using the `CHROMEDRIVER_VERSION` environment variable:

```sh
CHROMEDRIVER_VERSION=2.20 appium install driver uiautomator2
```

It is possible to instruct the driver to skip this automatic download, by setting the
`APPIUM_SKIP_CHROMEDRIVER_INSTALL` environment variable:

```bash
APPIUM_SKIP_CHROMEDRIVER_INSTALL=1 appium driver install uiautomator2
```

If ChromeDriver has already been automatically installed this way, it is also possible to skip its
usage using the [`appium:chromedriverUseSystemExecutable`](../reference/capabilities.md#chromedriverusesystemexecutable)
capability.

## Troubleshooting

### Downloading

In case of issues when downloading ChromeDriver, the underlying `appium-chromedriver` package
allows changing the download CDN. Refer to [its README](https://github.com/appium/appium-chromedriver#custom-binaries-url)
for details.

It may also be necessary to adjust network proxy and firewall settings for the above to work.

### W3C Support

Since ChromeDriver version 75, it defaults to using the W3C protocol, while older versions defaulted to
the Mobile JSON Wire Protocol (MJSONWP).

If you encounter a proxy command error like in [this issue](https://github.com/appium/python-client/issues/234),
please update your ChromeDriver version. For older Android devices that cannot use newer
ChromeDrivers, it may also be possible to enforce MJSONWP usage by including `{'w3c': false}` in
the [`appium:chromeOptions`](../reference/capabilities.md#chromeoptions) capability.
