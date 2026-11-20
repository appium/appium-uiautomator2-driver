---
title: Migrating from UiScrollable and UiSelector
---

Many tests use `-android uiautomator` expressions not to find elements, but to scroll:
`new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(...)`.
Google is going to [remove](https://developer.android.com/training/testing/other-components/ui-automator-legacy#ui-automator)
`UiScrollable` and `UiSelector` from the UiAutomator framework, after which these locators stop working.
The driver logs a warning, once per session, if it sees one. This guide shows what to use instead.

!!! note "Requirements"

    The scrolling features described here are available since driver version 9.4.0. With older
    versions, `mobile: scroll` only supports the `accessibility id`, `class name` and
    `-android uiautomator` strategies, and `mobile: scrollGesture` requires an element or an area.
    The Java snippets use
    [java-client](https://github.com/appium/java-client) 10 and Selenium 4. The code is
    the same for any client, only the way of calling `mobile:` commands differs.

## Why migrate

- `UiScrollable` is going away, and so are the locators built on `UiSelector`, including the ones the
  driver generates for the `css selector` strategy.
- It can be slow. On an emulator, scrolling a strip of 30 tabs from the first tab to the 28th took
  about 41 seconds with `UiScrollable` and about 28 seconds with `mobile: scroll`, and to the 10th tab
  about 19 and 7 seconds (medians of 2 or 3 runs).
- It hides failures. If the chain of a `UiScrollable` locator has a setter (`setMaxSearchSwipes`,
  `setAsHorizontalList`, ...) and the target is not on the screen yet, the lookup returns the scrollable
  container instead of the target, even if the target does not exist, instead of failing with
  "no such element".
- Its scroll direction, search start and swipe count are decided by the framework and cannot be tuned.

## What replaces what

| Legacy | Use instead |
|---|---|
| `UiScrollable(...).scrollIntoView(selector)`, `scrollTextIntoView(text)`, `scrollDescriptionIntoView(text)` | [`mobile: scroll`](#scroll-until-an-element-is-visible) with the `xpath`, `id` or `accessibility id` strategy |
| `getChildByText(...)`, `getChildByDescription(...)`, `getChildByInstance(...)` | [Find the child inside the view](#find-a-child-of-the-view) |
| `scrollForward()`, `scrollBackward()` | [`mobile: scrollGesture`](../reference/execute-methods.md#mobile-scrollgesture) |
| `scrollToEnd(n)`, `flingToEnd(n)`, `scrollToBeginning(n)`, `flingToBeginning(n)` | [Scroll to the end or to the beginning](#scroll-to-the-end-or-to-the-beginning) |
| `setAsHorizontalList()` | [`direction`](#scroll-horizontal-lists) of `mobile: scroll` |
| `setMaxSearchSwipes(n)` | `maxSwipes` of `mobile: scroll` |
| `setSwipeDeadZonePercentage(p)` | Gestures on elements keep a 10% margin from the edges of the element. Use an element, or an area that is inset from the screen edges. |
| ViewPager and carousels | [`mobile: swipeGesture`](#page-through-a-carousel) |
| Plain `UiSelector` lookups | A regular locator, see below |

### Replacing `UiSelector` lookups

| `UiSelector` | XPath | Other strategies |
|---|---|---|
| `.text("A")` | `//*[@text='A']` | |
| `.textContains("A")` | `//*[contains(@text, 'A')]` | |
| `.textStartsWith("A")` | `//*[starts-with(@text, 'A')]` | |
| `.textMatches("A.*")` | `//*[matches(@text, 'A.*')]` (XPath 2, server 4.25 and newer) | |
| `.description("A")` | `//*[@content-desc='A']` | `accessibility id` |
| `.resourceId("pkg:id/a")` | `//*[@resource-id='pkg:id/a']` | `id` |
| `.className("android.widget.Button")` | `//android.widget.Button` | `class name` |
| `.scrollable(true)` | `//*[@scrollable='true']` | |
| `.clickable(true)`, `.checked(true)`, ... | `//*[@clickable='true']`, `//*[@checked='true']` | |
| `.instance(n)` | `(<expression>)[n + 1]` | |
| `.childSelector(...)` | A nested path, for example `//*[@resource-id='list']//*[@text='A']` | |

## Choosing the tool

| | `mobile: scroll` | `mobile: scrollGesture` | W3C actions |
|---|---|---|---|
| Scrolls until an element is visible | yes | no, one swipe per call | no, one swipe per call |
| Tells if more content is available | no | yes, returns `false` at the end | no |
| Can scroll several pages in one call | yes, up to `maxSwipes` | yes, `percent` above `1` | no |
| Vendor extension | yes | yes | no |
| Control over the exact path and speed | no | speed only | full |

Prefer `mobile: scroll` to reach an element, `mobile: scrollGesture` for a fixed amount of scrolling or
your own stop condition, and W3C actions if you cannot use `mobile:` commands.

## Recipes

### Scroll until an element is visible

`mobile: scroll` scrolls a view with gestures and looks for the element inside of it after each swipe.
It stops when the element is visible, when the end of the content is reached, or after `maxSwipes`
swipes (30 by default). If the element is not found, the command fails with "no such element".

```java
/** Scrolls the first scrollable view until the element is visible. */
static void scrollTo(AndroidDriver driver, String xpath) {
    driver.executeScript("mobile: scroll", Map.of(
            "strategy", "xpath",
            "selector", xpath));
}

/** Scrolls the given view from its beginning, using at most 10 swipes. */
static void scrollTo(AndroidDriver driver, WebElement view, String xpath) {
    driver.executeScript("mobile: scroll", Map.of(
            "elementId", ((RemoteWebElement) view).getId(),
            "strategy", "xpath",
            "selector", xpath,
            "fromStart", true,
            "maxSwipes", 10));
}
```

- Without `elementId`, the first scrollable view on the screen is scrolled. Pass the view when
  there are several scrollable views, such as a drawer and a list, and prefer a view found by its
  resource id to `(//*[@scrollable='true'])[1]`.
- The search goes down by default. It does not return to the beginning of the content unless
  `fromStart` is `true`, so use `fromStart` if the element might be above the current position.
- The strategies `id`, `xpath`, `accessibility id`, `class name` and `-android uiautomator` are supported,
  but `-android uiautomator` is deprecated.

!!! warning

    Eventually, all locators based on the `-android uiautomator` strategy will fail, not only the
    ones used for scrolling.

### Scroll horizontal lists

A `HorizontalScrollView` is scrolled to the right by default, so the code above works for tab
strips. Other horizontal containers, for example a horizontal `RecyclerView`, need a direction:

```java
/** Scrolls a horizontal view that is not a HorizontalScrollView, for example a RecyclerView. */
static void scrollRightTo(AndroidDriver driver, WebElement view, String xpath) {
    driver.executeScript("mobile: scroll", Map.of(
            "elementId", ((RemoteWebElement) view).getId(),
            "strategy", "xpath",
            "selector", xpath,
            "direction", "right"));
}
```

### Scroll to the end or to the beginning

`mobile: scrollGesture` returns `true` if more content is available, and a `percent` above `1`
scrolls that many pages, stopping at the end:

```java
/** Values of "percent" above 1 scroll that many pages and stop at the end of the content. */
static void scrollToEnd(AndroidDriver driver, WebElement view) {
    driver.executeScript("mobile: scrollGesture", Map.of(
            "elementId", ((RemoteWebElement) view).getId(),
            "direction", "down",
            "percent", 50));
}

static void scrollToBeginning(AndroidDriver driver, WebElement view) {
    driver.executeScript("mobile: scrollGesture", Map.of(
            "elementId", ((RemoteWebElement) view).getId(),
            "direction", "up",
            "percent", 50));
}
```

### Your own search loop

If you need your own stop condition, for example a text that appears after a scroll, call `mobile: scrollGesture`
in a loop. Set the implicit wait to zero while the loop is running, because otherwise every lookup that
finds nothing takes as long as the implicit wait, and restore it afterwards:

```java
/** The same as scrollTo, but with your own stop condition and no dependency on the strategies above. */
static WebElement scrollIntoView(AndroidDriver driver, WebElement view, By target, int maxSwipes) {
    // Every lookup that finds nothing would otherwise take as long as the implicit wait
    Duration implicitWait = driver.manage().timeouts().getImplicitWaitTimeout();
    driver.manage().timeouts().implicitlyWait(Duration.ZERO);
    try {
        for (int i = 0; i <= maxSwipes; i++) {
            List<WebElement> found = view.findElements(target);
            if (!found.isEmpty()) {
                return found.get(0);
            }
            boolean canScrollMore = (Boolean) driver.executeScript("mobile: scrollGesture", Map.of(
                    "elementId", ((RemoteWebElement) view).getId(),
                    "direction", "down",
                    "percent", 0.7));
            if (!canScrollMore) {
                List<WebElement> last = view.findElements(target); // the final swipe might have revealed it
                if (!last.isEmpty()) {
                    return last.get(0);
                }
                break;
            }
        }
        throw new NoSuchElementException("Cannot scroll to " + target);
    } finally {
        driver.manage().timeouts().implicitlyWait(implicitWait);
    }
}
```

### Find a child of the view

`getChildByText()` found a child of the scrollable view and scrolled to it. Scroll first, then look for the child:

```java
/** Replaces UiScrollable.getChildByText(). Scroll to the child first. */
static WebElement childByText(WebElement view, String text) {
    return view.findElement(AppiumBy.xpath(".//*[@text='" + text + "']"));
}
```

### Page through a carousel

`UiScrollable` cannot scroll views that are not reported as scrollable, such as a `ViewPager`.
Swipe them instead:

```java
/** Pages a carousel or a ViewPager to the next page. */
static void nextPage(AndroidDriver driver, WebElement pager) {
    driver.executeScript("mobile: swipeGesture", Map.of(
            "elementId", ((RemoteWebElement) pager).getId(),
            "direction", "left",
            "percent", 0.75));
}
```

### W3C actions

If `mobile:` commands are not available, for example because a grid does not allow them,
swipe with a pointer sequence. The duration of the move sets the speed: a very short move
turns into a fling and overshoots. Get the coordinates from the element, and stay inside of
it, away from the screen edges.

```java
/** Moves the finger from the bottom to the top of the view, which scrolls the content down. */
static void swipeUp(AndroidDriver driver, WebElement view) {
    Rectangle rect = view.getRect();
    int x = rect.x + rect.width / 2;
    int startY = rect.y + (int) (rect.height * 0.8);
    int endY = rect.y + (int) (rect.height * 0.2);
    PointerInput finger = new PointerInput(PointerInput.Kind.TOUCH, "finger");
    Sequence swipe = new Sequence(finger, 0)
            .addAction(finger.createPointerMove(Duration.ZERO, PointerInput.Origin.viewport(), x, startY))
            .addAction(finger.createPointerDown(PointerInput.MouseButton.LEFT.asArg()))
            .addAction(new Pause(finger, Duration.ofMillis(100)))
            .addAction(finger.createPointerMove(Duration.ofMillis(600), PointerInput.Origin.viewport(), x, endY))
            .addAction(finger.createPointerUp(PointerInput.MouseButton.LEFT.asArg()));
    driver.perform(List.of(swipe));
}
```

W3C actions do not report whether more content is available, so check the result of the swipe
yourself, for example by looking for the element after each swipe.

## Things to know

- **Speed.** One scroll gesture takes about a second and a half, plus the time to look for the
  element. Searching the far end of a long list can take half a minute, so give `mobile: scroll`
  a realistic `maxSwipes`, and scroll the list that contains the element, not the whole screen.
- **Screen edges and gesture navigation.** A swipe that starts on the edge of the screen can be taken
  by the system for the back or home gesture. Gestures on elements keep a 10% margin, but a gesture
  on an area does not: keep the area inside of the screen. An area that covers the whole display is
  clamped to its last pixel, which is still an edge.
- **Animations.** A click right after a scroll can miss if the list is still moving. Keep
  [`disableWindowAnimation`](../reference/capabilities.md#disablewindowanimation) enabled or wait for the
  element to stop moving.
- **Direction.** `down` and `right` move towards the end of the content, like `scrollForward()`. The
  finger moves the other way.
- **Stale elements.** Elements that scrolled out of the screen can disappear from the hierarchy of
  recycling views such as `RecyclerView`, so look them up again after scrolling.

## Troubleshooting

| Symptom | Reason and fix |
|---|---|
| "There are no scrollable elements on the current display" | The screen has nothing the accessibility service reports as scrollable. Pass the view you want to scroll, or use `mobile: swipeGesture` or W3C actions. |
| "Cannot scroll to ..." | The element was not found before the end of the content or `maxSwipes`. Check the locator in the page source, raise `maxSwipes`, set `fromStart` if the element can be above the current position, or set `direction` for a horizontal view. |
| The wrong view is scrolled | Several views are scrollable. Pass the view as `elementId`. |
| Nothing happens, `scrollGesture` returns `false` | The view is already at the end in that direction, or the area is outside of the screen. |
| A horizontal list does not scroll | Only a `HorizontalScrollView` is horizontal by default. Set `direction`. |
| A swipe opens a list item | A horizontal swipe on a vertical list can end as a click on the row. Swipe along the axis of the view. |
| The element is found, but the click does nothing | The list was still moving. See "Animations" above. |
