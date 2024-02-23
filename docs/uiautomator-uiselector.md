## Guide on UiAutomator Locator Types

UIA2 driver enables elements lookup using [UiSelector](https://developer.android.com/reference/androidx/test/uiautomator/UiSelector).
[UiScrollable](https://developer.android.com/reference/androidx/test/uiautomator/UiScrollable)
is also supported.
Both locator types are supported natively by Google's [UiAutomator](https://developer.android.com/training/testing/other-components/ui-automator) framework for Android. With these locators you could create flexible ways to reference complicated element paths, and their performance is very close to native.

### Examples

Note that the index selector is unreliable so prefer instance instead. The
following examples are written against the [ApiDemos](https://github.com/appium/android-apidemos) apk using Ruby.

Find the first textview.

```ruby
# ruby
first_textview = find_element(:uiautomator, 'new UiSelector().className("android.widget.TextView").instance(0)');
```

Find the first element by text.

```ruby
# ruby
first_text = find_element(:uiautomator, 'new UiSelector().text("Animation")')
first_text.text # "Animation"
```

Find the first scrollable element, then find a TextView with the text "Tabs".
The "Tabs" element will be scrolled into view.

```ruby
# ruby
element = find_element(:uiautomator, 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).getChildByText(new UiSelector().className("android.widget.TextView"), "Tabs")')
```

As a special case, scrollIntoView returns the element that is scrolled into view.
scrollIntoView allows scrolling to any UiSelector.

```ruby
# ruby
element = find_element(:uiautomator, 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("WebView").instance(0));')
element.text # "WebView"
```

### More Resources

- [How to Use UISelector in Appium](http://code2test.com/appium-tutorial/how-to-use-uiselector-in-appium/)
- [How to use UiSelector to inspect elements on Android](https://www.automationtestinghub.com/uiselector-android/)
- [UiAutomatorParserTests.java](https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/test/java/io/appium/uiautomator2/utils/UiAutomatorParserTests.java)
- [UiScrollableParserTests.java](https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/test/java/io/appium/uiautomator2/utils/UiScrollableParserTests.java)
- [UiSelectorParserTests.java](https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/test/java/io/appium/uiautomator2/utils/UiSelectorParserTests.java)
