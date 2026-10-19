---
hide:
  - navigation

title: Troubleshooting
---

## Session Startup Issues

### Outdated Driver Binaries

Sometimes various older driver binaries (like Appium Settings) might be cached on the device under
test, which would prevent a new/upgraded driver version from starting a session.

Run the built-in [`reset`](../reference/scripts.md#reset) script in order to cleanup the cached
binaries from all connected devices on the current machine.

### Permission Denial When Starting Intent

The full error description usually looks like `'java.lang.SecurityException: Permission Denial: starting Intent { act=android.intent.action.MAIN cat=[android.intent.category.LAUNCHER] flg=0x10200000 cmp=com.mypackage/.myactivity.MainActivity launchParam=MultiScreenLaunchParams { mDisplayId=0 mBaseDisplayId=0 mFlags=0 } } from null (pid=11366, uid=2000) not exported from uid 10191`.
An error like this might indicate that the provided application package and activity name (either
passed to UiAutomator2 as [`appium:appPackage`](../reference/capabilities.md#apppackage) /
[`appium:appActivity`](../reference/capabilities.md#appactivity) or auto detected), is not the
correct one to start the application under test.

In order to fix this, it is necessary to check the correct values with the application developer,
and test them manually first by executing: `adb shell am start -W -n com.myfixedpackage/.myfixedactivity.MainActivity -S -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -f 0x10200000`.
If this commands succeeds manually and starts the necessary application on the device, then it will
work for the UiAutomator2 driver as well.

Some devices might also require adjustments to their the security configuration in the developer
options, or security preferences. For example, Realme devices require [_Disable Permission Monitoring_ and a couple of flags in the developer options](https://github.com/appium/appium/issues/13802#issuecomment-703882230)
in order to avoid a _Permission Denial_ error.

### Activity Never Started

This problem may manifest with a message like `com.myactivity.* never started`. It usually
indicates that the _first_ application activity (either passed to UiAutomator2 as
[`appium:appWaitPackage`](../reference/capabilities.md#appwaitpackage) /
[`appium:appWaitActivity`](../reference/capabilities.md#appwaitactivity) or auto-detected) is not
the one actually launched as the first one. This problem typically occurs in applications with
multiple activities.

In order to resolve the problem, one should check with application developer regarding which
activity/package is the very first one that appears on application startup. The currently focused
activity name can be verified using the `adb shell dumpsys window windows` command (see the
[Activity Startup guide](../guides/activity-startup.md)).

The UiAutomator2 driver also allows the use of wildcards in the `appium:appWaitActivity` value,
which can be particularly useful if the activity name is generated dynamically, or it is not the
same all the time. For example, `com.mycompany.*` will match any of `com.mycompany.foo`,
`com.mycompany.bar`.

### Command Timed Out

If the activity names are correct, but the startup still times out, another possible approach is to
increase the value of the [`app:appWaitDuration`](../reference/capabilities.md#appwaitduration)
capability. Normally, the default 20 seconds is enough for the most of applications, however, some
bigger apps might require more time to start and show the first activity. (It is strongly
recommended to not develop apps to behave this way.)

There may also be situations where the launch activity does not return the control to the calling
process at all. This could be mitigated by setting the [`appium:autoLaunch`](../reference/capabilities.md#autolaunch)
capability to `false`, which skips waiting for the activity. However, by choosing this option, the
driver cannot make sure the activity has fully started, so then it is up to the client code to
verify the initial UI state is the one that is expected.

### Firebase Installations Exception

`firebaseinstallations.googleapis.com` sends the APK file's certificate information in the
`X-Android-Cert` header in its initialization step. The UiAutomator2 driver re-signs the
application under test with the default Appium debug signature. This may cause an exception
(`java.util.concurrent.ExecutionException: com.google.firebase.installations.FirebaseInstallationsException`)
when the application under test starts.

To avoid this problem, set the [`appium:noSign`](../reference/capabilities.md#nosign) capability to
`true`, which skips the re-signing process. For more details, refer to the [Unblocking Firebase Network Traffic in Modified Android Applications](https://www.thecobraden.com/posts/unblocking_firebase_ids/)
guide.

## Session Deleted Due to Socket Hangup

This type of error means the driver is unable to connect to the UiAutomator2 REST server running on
the device under test. There might be multiple causes for this issue:

### Already Terminated by Script

Sending a [Delete Session](https://appium.io/docs/en/latest/reference/api/webdriver/#deletesession)
request terminates both the session and the UiAutomator2 server on the device. Any further commands
sent to the same UiAutomator2 server would return a socket hangup error.

Such issues can happen if the test script does not properly configure session management, for
example, by starting a new session while the previous one is still running and has not been quit
properly, or there is a timeout while waiting for a new command. Adjusting the session management
logic (e.g. making sure each session is being properly created in the test setup section and is
terminated in the test teardown) or changing/disabling the command timeout (see the
[`appium:newCommandTimeout`](https://appium.io/docs/en/latest/reference/session/caps/#optional-capabilities)
capability) might help to address such errors.

### Terminated by Android OS

There may be situations where Android itself kills the session. The recommended approach here is to
debug the problem by fetching the [`logcat`](https://developer.android.com/studio/command-line/logcat)
output and finding occurrences of `io.appium.uiautomator2.server` traces labeled with `error` or
`exception`.

Sometimes it may be necessary to turn off some internal phone optimizations, sometimes the server
crashes because of an internal UI Automator framework bug, sometimes because of a bug in the server
code itself. Each case should be investigated separately if the search over the internet shows no
matches...

### Unstable Connection

The connectivity between the phone and the host is unstable. Nothing much to add on this one. Maybe
the phone has a defect, or the USB cable is damaged, or the installed Android SDK is out of date...

## Element(s) Cannot Be Found

All element location strategies in the UiAutomator2 driver work similarly under the hood, except
for `xpath`. If some element is not found, but it is (or should be) present in the page source, the
following may help:

- Check that the selector does not contain any typos
- Make sure there are no race conditions
- Add a timeout of several seconds before stopping the element search

In case the lookup still fails while using a non-XPath locator, then it is likely that the target
element is actually not present. There is not much that could be done in the driver to
change/influence this, since such lookup calls are passed directly to Google's UI Automator
framework. Still, the driver provides several settings that may help:

!!! warning

    The default values for the following settings have been set for optimal element lookup and page
    source generation performance. Continuously using different values may sometimes significantly
    (especially in case of large app sources) reduce element lookup and page source generation speed.

### Common Settings

- [`allowInvisibleElements`](../reference/settings.md#allowinvisibleelements)

    By default, this setting is set to `false`, which hides elements that are not visible from the
    page source and from the xpath location. Changing this value to `true` would add such invisible
    elements to the page source and make them locatable.

- [`ignoreUnimportantViews`](../reference/settings.md#ignoreunimportantviews)

    This setting is enabled by default. By disabling it, the page source could receive more
    elements that are normally hidden due to their unimportance.

- [`enableMultiWindows`](../reference/settings.md#enablemultiwindows)

    This setting, if set to `true`, extends the page source by adding the actual content of other
    windows that are currently present on the device's screen. For example, the on-screen keyboard
    in Android is not a part of the current app hierarchy, but rather belongs to a separate window.

- [`snapshotMaxDepth`](../reference/settings.md#snapshotmaxdepth)

    For this setting, it only makes sense to change its default value if the application under test
    has deeply nested elements in the page tree hierarchy (e.g. more than 70 levels), and the
    destination element is suspected to be a part of these deeply nested views. Increasing the
    value of this setting will reduce the performance of XPath searches and page tree retrievals,
    so be careful while assigning too high values to it.

### Id Locators

The following settings may adjust the behavior of [`id`](../reference/locator-strategies.md#id)-based
locators:

- [`disableIdLocatorAutocompletion`](../reference/settings.md#disableidlocatorautocompletion)

    The general resources naming convention for Android apps is `<app_id>:id/<resource_name>`. This
    should guarantee uniqueness of each identifier accross the user interface. However, this is
    only a convention, and Android still allows to have various resource names that do not follow
    this format. If testing an application like this, consider changing the `disableIdLocatorAutocompletion`
    setting to `true`, so that the driver does not automatically rewrite selector values by adding
    `<app_id>:id/` prefixes to them.

- [`mapTestTagToResourceId`](../reference/settings.md#maptesttagtoresourceid)

    If testing a Jetpack Compose application, its elements may have the `testTag` semantic
    property. Changing this setting to `true` replaces the value of the retrieved `resource-id`
    attribute for such elements with the value their `testTag` property, which can then be used in
    `id`-based locators.

### XPath Locators

The following settings may adjust the behavior of [`xpath`](../reference/locator-strategies.md#xpath)-based
locators:

- [`alwaysTraversableViewClasses`](../reference/settings.md#alwaystraversableviewclasses)

    This setting is similar to `allowInvisibleElements`, but primarily aimed at Jetpack Compose
    applications, which may contain invisible nodes with visible child elements. By default, such
    child elements are not included in the application source.

## ClassCastException During XPath Lookup

Driver versions older than 7.5.2 may encounter the following error for complex XPath2-based queries:

```
ClassCastException: java.util.ArrayList$ListItr cannot be cast to org.eclipse.wst.xml.xpath2.processor
```

This exception was caused by a bug in the [Eclipse's PsychoPath](https://wiki.eclipse.org/PsychoPathXPathProcessor)
library used by the driver to support [XPath2](https://www.w3.org/TR/xpath20/) syntax. The issue was
primarily observed while using `following::` or `preceding::` axes in XPath queries (e.g.
`(//android.widget.TextView[@text='some, text']/following::android.widget.ImageButton)[1]`).

The bug has been fixed since driver version 7.5.2. For older driver versions, a possible
workaround is to set the [`enforceXPath1`](../reference/settings.md#enforcexpath1) setting, which
forcefully switches the driver's XPath processor to the standard Android's Apache Harmony-based
XPath1, which does not have this issue (but also does not support XPath2 syntax). Refer to issue
[#16142](https://github.com/appium/appium/issues/16142#issuecomment-1003954166) for more details.

## Slow Element Interaction

If tests need at least 10 seconds or more to locate/interact with a single element, consider
changing the default value of the [`waitForIdleTimeout`](../reference/settings.md#waitforidletimeout)
setting.

By default, the UI Automator framework (and all other Accessibility-based frameworks) always waits
for the accessibility event stream to become idle before interacting with an element. This is
needed to make sure all animations/transitions are finished before, for example, interacting with
an element by clicking it. In case the application under test constantly runs some background
animations or hogs the accessibility event stream in some other way, these waits may significantly
slow down the automation flow.

Setting the value of `waitForIdleTimeout` to `0` should completely disable any waits, and enforce
interactions to happen immediately ignoring the accessibility event stream state. The downside of
that would be that all interactions are never going to be delayed, so clicks and other actions
might happen at wrong places of the application UI. That is why is it important to check the app
under test first and fix its source to get rid of activities hogging the event loop. Sometimes it
makes sense to disable animations completely for the app build under test, which could speed up
test flows significantly in some situations.

## Scroll/Swipe Gestures Have No Effect

The UiAutomator2 driver provides multiple options for automating touch gestures:

- For simple gestures, like swipe, scroll, drag, double click, fling or pinch, use the supported
[gesture execute methods](../reference/execute-methods.md#gestures)
- Certain scrolling behaviors may also be automatable using [UiScrollable-based UiAutomator locators](../guides/uiautomator-locator-strategy.md)
- For more sophisticated gestures, consider using [W3C actions](https://w3c.github.io/webdriver/#actions)

The deprecated JSONWP TouchActions API is no longer supported since driver version 3.0.0.

If the action code in the client source looks good and satisfies the above requirements, but its
execution still does not deliver the expected result, then the following debugging meassures may
help:

- Enable `Show taps` and `Pointer location` Developer options in the device Settings. When running
  a test script with these options enabled, the device screen will show the exact pointer trace
  path, allowing to check the velocity of the gesture. This also works for multi-touch gestures.
  This trace can then be compared to a manual use of the same gesture.
- Check the device [logcat](https://developer.android.com/studio/debug/logcat) output for possible
  error messages. Usually a single gesture consists of hundreds of atomic steps. If any of these
  steps receives incorrect/unsupported parameters, then the whole gesture might fail. The log has
  details about each step being executed and arguments passed to it.
- Make sure the gesture has valid coordinates and respects pauses between pointer state changes.
  For example, it is always mandatory to provide a valid element or valid `absolute` coordinates
  to any gesture at the beginning. Android only registers a long touch/click if the pointer has
  been depressed for longer than `500ms`. For shorter actions, a simple click is registered
  instead.
- Do not mix webview and native elements in actions arguments. Native actions can only consume
  native elements. One option for performing a native action on a web element would be to translate
  its coordinates into the native context (for example, using the [`mobile: viewportElementRect`](../reference/execute-methods.md#mobile-viewportelementrect)
  execute method), then pass these coordinates as native action arguments.

Check the below tutorials for more details on how to build reliable action chains:

- [Automating Complex Gestures with the W3C Actions API](https://www.headspin.io/blog/automating-complex-gestures-with-the-w3c-actions-api)
- [Swiping your way through Appium by Wim Selles #AppiumConf2021](https://www.youtube.com/watch?v=oAJ7jwMNFVU)
- [Android Input Events](../guides/input-events.md)

## Webviews With Chrome Custom Tabs

[Chrome custom tabs](https://developer.chrome.com/docs/android/custom-tabs/) could have its own
window handlings similarly to regular Selenium Web automation.

Appium allows switching the context from `NATIVE_APP` to `WEBVIEW_xyz`, for example, to interact
with the WEBVIEW contents over chromedriver. Then, if the WEBVIEW uses Chrome's custom tabs
implementation, the WEBVIEW context may require switching to a specific the window handler in
order to interact with contents.

This approach may be useful if `chrome://inspect` or [`mobile: getContexts`](../reference/execute-methods.md#mobile-getcontexts)
returns more available pages than actual contexts.

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