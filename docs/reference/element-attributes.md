---
title: Element Attributes
---

The UiAutomator2 driver supports various native and custom element attributes.

As a general rule, attributes that have a `null` value, or are not applicable to a given element
type or Android version, are omitted from the page source. One exception to this rule is [`text`](#text).
Certain attributes also have further conditions for being omitted.

## `a11y-focused`

> Example: `true`

Whether the element is accessibility focused. Retrieved from [`AccessibilityNodeInfo.isAccessibilityFocused()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isAccessibilityFocused()).

This attribute can also be retrieved using the `accessibilityFocused` alias.

## `a11y-important`

> Example: `true`

Whether the element is considered important for accessibility. Retrieved from [`AccessibilityNodeInfo.isImportantForAccessibility()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isImportantForAccessibility()).
Supported since Android 7 (Nougat / API level 24).

This attribute can also be retrieved using the `importantForAccessibility` alias.

## `actions`

> Example: `ACTION_FOCUS,ACTION_SELECT,ACTION_CLEAR_SELECTION`

Comma-separated list of constants identifying the element's available accessibility actions.
Retrieved from [`AccessibilityNodeInfo.getActionList()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getActionList()).

This attribute is not included in the default page source due to performance reasons, but it can be
added by changing the [`includeA11yActionsInPageSource`](./settings.md#includea11yactionsinpagesource)
setting to true, or retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).

Available since driver version 4.0.0.

## `bounds`

> Example: `[0,0][100,100]`

Bounds of the element's frame as a combination of its top-left and bottom-right corner points,
formatted as `[<top-left-X>,<top-left-Y>][<bottom-right-X>,<bottom-right-Y>]`. Calculated by
retrieving [`AccessibilityNodeInfo.getBoundsInScreen()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getBoundsInScreen(android.graphics.Rect))
and trimming the outer bounds.

## `checkable`

> Example: `true`

Whether the element is checkable. Retrieved from [`AccessibilityNodeInfo.isCheckable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isCheckable()).

## `checked`

> Example: `true`

Whether the element is checked. Retrieved from [`AccessibilityNodeInfo.isChecked()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isCheckable()).
Always set to `false` if [`checkable`](#checkable) is `false`.

## `class`

> Example: `android.view.View`

Full name of the element's class. Retrieved from [`AccessibilityNodeInfo.getClassName()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getClassName()).
Could be `null` and therefore omitted.

This attribute can also be retrieved using the `className` alias.

## `clickable`

> Example: `true`

Whether the element responds to clicks. Retrieved from [`AccessibilityNodeInfo.isClickable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isClickable()).

## `collection-info`

> Example: `{"rowCount":5,"columnCount":1,"isHierarchical":false,"selectionMode":0}`

JSON representation of the element's [`CollectionInfo`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.CollectionInfo),
containing the `rowCount`, `columnCount`, `isHierarchical`, and `selectionMode` properties.

This attribute is not included in the default page source, but it can be retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).
Could be `null` if the element is not a collection.

This attribute can also be retrieved using the `collectionInfo` alias.

Available since driver version 8.3.0.

## `collection-item-info`

> Example: `{"rowIndex":2,"columnIndex":0,"rowSpan":1,"columnSpan":1,"isHeading":false,"isSelected":true,"rowTitle":null,"columnTitle":null}`

JSON representation of the element's [`CollectionItemInfo`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.CollectionItemInfo),
containing the `rowIndex`, `columnIndex`, `rowSpan`, `columnSpan`, `isHeading`, `isSelected`,
`rowTitle`, and `columnTitle` properties. The `isSelected` property is supported since Android 11
(R / API level 30), while `rowTitle` and `columnTitle` are supported since Android 13 (Tiramisu /
API level 33).

This attribute is not included in the default page source, but it can be retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).
Could be `null` if the element is not a collection item.

This attribute can also be retrieved using the `collectionItemInfo` alias.

Available since driver version 8.3.0.

## `content-desc`

> Example: `foo`

Content description of the element. Retrieved from [`AccessibilityNodeInfo.getContentDescription()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getContentDescription()).
Could be `null` and therefore omitted.

This attribute can also be retrieved using the `contentDescription` alias.

In applications written using [React Native](https://reactnative.dev/), this attribute reflects the
value of the `accessibilityLabel` property.

## `content-invalid`

> Example: `true`

Whether the content of this element is invalid, e.g. a date that is not well-formed. Retrieved from
[`AccessibilityNodeInfo.isContentInvalid()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isContentInvalid()).

This attribute can also be retrieved using the `contentInvalid` alias.

## `contentSize`

> Example: `{"left": 0, "top":0, "width": 100, "height": 100, "scrollableOffset": 10, "touchPadding": 0}`

JSON representation of the dimensions and scroll-related properties of an element. Only applicable
to scrollable views - use [`bounds`](#bounds) to retrieve the element dimensions regardless of the
element type.

This attribute is not included in the default page source due to performance reasons, but it can be
retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).

## `context-clickable`

> Example: `true`

Whether the element is context clickable. Retrieved from [`AccessibilityNodeInfo.isContextClickable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isContextClickable()).
Supported since Android 6 (Marshmallow / API level 23).

This attribute can also be retrieved using the `contextClickable` alias.

## `dismissable`

> Example: `true`

Whether the element can be dismissed. Retrieved from [`AccessibilityNodeInfo.isDismissable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isDismissable()).

## `displayed`

> Example: `true`

Whether the element is visible to the user. Retrieved from [`AccessibilityNodeInfo.isVisibleToUser()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isVisibleToUser()).

## `drawing-order`

> Example: `3`

Drawing order of the view corresponding to this element, relative to its siblings. Retrieved from
[`AccessibilityNodeInfo.getDrawingOrder()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getDrawingOrder()).
Supported since Android 7 (Nougat / API level 24).

This attribute can also be retrieved using the `drawingOrder` alias.

## `enabled`

> Example: `true`

Whether the element is enabled. Retrieved from [`AccessibilityNodeInfo.isEnabled()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isEnabled()).

## `error`

> Example: `there was an error!`

Error text of the element. Retrieved from [`AccessibilityNodeInfo.getError()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getError()).

This attribute can also be retrieved using the `errorText` alias.

## `extras`

> Example: `AccessibilityNodeInfo.roleDescription=;ACTION_ARGUMENT_HTML_ELEMENT_STRING_VALUES=ARTICLE,BLOCKQUOTE`

Extra data of the element. Retrieved from [`AccessibilityNodeInfo.getExtras()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getExtras()).

The value of this attribute is formatted as a semicolon-separated (`;`) string of key-value pairs,
which in turn are separated using the equality sign (`=`). Keys with non-`null` but otherwise empty
values are preserved.

This attribute is not included in the default page source due to performance reasons, but it can be
added by changing the [`includeExtrasInPageSource`](./settings.md#includeextrasinpagesource)
setting to true, or retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).

Available since driver version 2.1.0.

## `focusable`

> Example: `true`

Whether the element is focusable. Retrieved from [`AccessibilityNodeInfo.isFocusable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isFocusable()).

## `focused`

> Example: `true`

Whether the element is focused. Retrieved from [`AccessibilityNodeInfo.isFocused()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isFocused()).
Always set to `false` if [`focusable`](#focusable) is `false`.

## `heading`

> Example: `true`

Whether element represents a heading. Retrieved from [`AccessibilityNodeInfo.isHeading()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isHeading()).
Supported since Android 9 (Pie / API level 28).

## `hint`

> Example: `enter text here`

Hint text of the element. Retrieved from [`AccessibilityNodeInfo.getHintText()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getHintText()).
Supported since Android 8 (Oreo / API level 26).

## `index`

> Example: `1`

Index of the element under its parent, relative to its siblings.

## `input-type`

> Example: `16`

Integer bitmask of the element's input type. Only available for editable input text elements.
Retrieved from [`AccessibilityNodeInfo.getInputType()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getInputType()).

This attribute is omitted from the page source if its value is `0` (`TYPE_NUMBER_VARIATION_NORMAL`).

This attribute can also be retrieved using the `inputType` alias.

## `is-collection`

> Example: `true`

Whether the element represents a collection container (e.g. a list or grid). Calculated by retrieving [`AccessibilityNodeInfo.getCollectionInfo()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getCollectionInfo())
and checking whether it is not `null`.

This attribute is only included in the page source if its value is `true`.

This attribute can also be retrieved using the `isCollection` alias.

Available since driver version 8.3.0.

## `is-collection-item`

> Example: `true`

Whether the element represents an item within a collection container (e.g. a list or grid). Calculated by retrieving [`AccessibilityNodeInfo.getCollectionItemInfo()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getCollectionItemInfo())
and checking whether it is not `null`.

This attribute is only included in the page source if its value is `true`.

This attribute can also be retrieved using the `isCollectionItem` alias.

Available since driver version 8.3.0.

## `live-region`

> Example: `1`

Integer value of the element's live region mode. Retrieved from [`AccessibilityNodeInfo.getLiveRegion()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getLiveRegion()).

This attribute can also be retrieved using the `liveRegion` alias.

## `long-clickable`

> Example: `true`

Whether the element responds to long clicks. Retrieved from [`AccessibilityNodeInfo.isLongClickable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isLongClickable()).

This attribute can also be retrieved using the `longClickable` alias.

## `max-text-length`

> Example: `30`

Maximum text length for the element. Only available for input text elements. Retrieved from [`AccessibilityNodeInfo.getMaxTextLength()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getMaxTextLength()).

This attribute is omitted from the page source if its value is `-1` (maximum text length is not
set).

This attribute can also be retrieved using the `maxTextLength` alias.

## `multiline`

> Example: `true`

Whether the element is a multi line editable text element. Only available for input text elements.
Retrieved from [`AccessibilityNodeInfo.isMultiLine()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isMultiLine()).

This attribute is omitted from the page source if the value of [`max-text-length`](#max-text-length)
is `-1`.

This attribute can also be retrieved using the `multiLine` alias.

## `package`

> Example: `com.mycompany`

Identifier of the package the element belongs to. Retrieved from [`AccessibilityNodeInfo.getPackageName()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getPackageName()).
Could be `null` and therefore omitted.

## `pane-title`

> Example: `title`

Title of the pane represented by this element. Retrieved from [`AccessibilityNodeInfo.getPaneTitle()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getPaneTitle()).
Supported since Android 9 (Pie / API level 28).

This attribute can also be retrieved using the `paneTitle` alias.

## `password`

> Example: `true`

Whether the element is a password input field. Retrieved from [`AccessibilityNodeInfo.isPassword()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isPassword()).

## `resource-id`

> Example: `com.mycompany:id/resId`

Fully qualified resource identifier of the element. Retrieved from [`AccessibilityNodeInfo.getViewIdResourceName()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getViewIdResourceName()).
Could be `null` and therefore omitted.

If the [`mapTestTagToResourceId`](./settings.md#maptesttagtoresourceid) setting is enabled, the
value of this attribute is instead retrieved from the element's Jetpack Compose `testTag` property
(`androidx.compose.ui.semantics.testTag`), if one is present.

This attribute can also be retrieved using the `resourceId` alias.

## `screen-reader-focusable`

> Example: `true`

Whether the element is explicitly marked as a focusable unit by a screen reader. Retrieved from
[`AccessibilityNodeInfo.isScreenReaderFocusable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isScreenReaderFocusable()).
Supported since Android 9 (Pie / API level 28).

This attribute can also be retrieved using the `screenReaderFocusable` alias.

## `scrollable`

> Example: `true`

Whether the element is scrollable. Retrieved from [`AccessibilityNodeInfo.isScrollable()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isScrollable()).

## `selected`

> Example: `true`

Whether the element is selected. Retrieved from [`AccessibilityNodeInfo.isSelected()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isSelected()).

## `selection-end`

> Example: `7`

Index of the character where text selection ends. Only available for input text elements.
Retrieved from [`AccessibilityNodeInfo.getTextSelectionEnd()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getTextSelectionEnd()).

This attribute is omitted from the page source if no text is selected, or the element provides no
range info.

## `selection-start`

> Example: `3`

Index of the character where text selection starts. Only available for input text elements.
Retrieved from [`AccessibilityNodeInfo.getTextSelectionStart()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getTextSelectionStart()).

This attribute is omitted from the page source if no text is selected, or the element provides no
range info.

## `showing-hint`

> Example: `true`

Whether the element's text represents a hint for the user to enter text. Only available for
editable input text elements. Retrieved from [`AccessibilityNodeInfo.isShowingHintText()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isShowingHintText()).
Supported since Android 8 (Oreo / API level 26).

This attribute can also be retrieved using the `showingHintText` alias.

## `text`

> Example: `some text`

Text or value of the element, depending on the element type:

* Range: retrieved from [`AccessibilityNodeInfo.RangeInfo.getCurrent()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.RangeInfo#getCurrent())
* All other elements: retrieved from [`AccessibilityNodeInfo.getText()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getText())

The value of this attribute is never `null` - empty values are instead set to an empty string.

This attribute can also be retrieved using the `name` alias.

## `text-entry-key`

> Example: `true`

Whether the element represents a text entry key that is part of a keyboard or keypad. Retrieved from
[`AccessibilityNodeInfo.isTextEntryKey()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#isTextEntryKey()). Supported since Android 10 (Q / API level 29).

This attribute can also be retrieved using the `textEntryKey` alias.

## `text-has-clickable-span`

> Example: `true`

Whether the element contains [`ClickableSpan`](https://developer.android.com/reference/android/text/style/ClickableSpan)
or [`URLSpan`](https://developer.android.com/reference/android/text/style/URLSpan) markup elements.
Retrieved from [`Spanned.getSpans()`](https://developer.android.com/reference/android/text/Spanned#getSpans(int,%20int,%20java.lang.Class%3CT%3E)).
Only available for text elements.

This attribute can also be retrieved using the `textHasClickableSpan` alias.

## `text-size`

> Example: `12.6`

Text size of the element, in units specified by [`text-unit`](#text-unit). Only available for text
elements. Calculated by retrieving [`AccessibilityNodeInfo.ExtraRenderingInfo.getTextSizeInPx()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.ExtraRenderingInfo#getTextSizeInPx())
and scaling it according to `text-unit`. Supported since Android 11 (R / API level 30).

This attribute is not included in the default page source due to performance reasons, but it can be
added by changing the [`includeExtraRenderingInfo`](./settings.md#includeextrarenderinginfo)
setting to true, or retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).

This attribute can also be retrieved using the `textSize` alias.

Available since driver version 6.7.10.

## `text-unit`

> Example: `mm`

Text size unit of the element. Only available for text elements. Calculated by retrieving
[`AccessibilityNodeInfo.ExtraRenderingInfo.getTextSizeUnit()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo.ExtraRenderingInfo#getTextSizeUnit())
and converting it to a 2-character string.  Supported since Android 11 (R / API level 30).

Supported values are:

* `dp` - device independent pixels ([`COMPLEX_UNIT_DIP`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_DIP))
* `in` - inches ([`COMPLEX_UNIT_IN`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_IN))
* `mm` - millimeters ([`COMPLEX_UNIT_MM`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_MM))
* `pt` - points ([`COMPLEX_UNIT_PT`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_PT))
* `px` - pixels ([`COMPLEX_UNIT_PX`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_PT))
* `sp` - scaled pixels ([`COMPLEX_UNIT_SP`](https://developer.android.com/reference/android/util/TypedValue#COMPLEX_UNIT_SP))

This attribute is not included in the default page source due to performance reasons, but it can be
added by changing the [`includeExtraRenderingInfo`](./settings.md#includeextrarenderinginfo)
setting to true, or retrieved using [the standard Get Element Attribute endpoint](https://www.w3.org/TR/webdriver2/#get-element-attribute).

This attribute can also be retrieved using the `textUnit` alias.

Available since driver version 6.7.10.

## `tooltip-text`

> Example: `Paste`

Tooltip text of the element. Retrieved from [`AccessibilityNodeInfo.getTooltipText()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getTooltipText()).
Supported since Android 9 (Pie / API level 28).

This attribute can also be retrieved using the `tooltipText` alias.

## `window-id`

> Example: `123`

Identifier of the window this element belongs to. Retrieved from [`AccessibilityNodeInfo.getWindowId()`](https://developer.android.com/reference/android/view/accessibility/AccessibilityNodeInfo#getWindowId()).

This attribute can also be retrieved using the `windowId` alias.
