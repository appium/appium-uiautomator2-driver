---
title: Class Chain Locator Strategy
---

The UiAutomator2 driver supports searching elements using the _class chain_
[locator search strategy](../reference/locator-strategies.md#class-chain) (`-android class chain`). It is
inspired by the class chain locators of the XCUITest driver, and is a simplified and much faster
alternative of [XPath](../reference/locator-strategies.md#xpath): the chain is evaluated directly on the
accessibility tree, in a single pass, and the lookup does not need the page source of the whole
application. A class chain is a `/`-separated list of _steps_. Each step selects elements of a
certain type, optionally narrowed down by predicates and a position, relative to the elements
matched by the previous step.

!!! info "Availability"

    The strategy is available since driver version 10.1.0 (UiAutomator2 server 11.5.0).
    Older versions reject such locators as an unsupported locator strategy.

!!! tip

    Use `id`, `accessibility id` or `class name` locators for elements that can be identified
    only by one of their own attributes. Class chain is the right choice when the element has to be
    identified by a combination of attributes, or can be found only in relation to other elements,
    like its parent, descendants or siblings.

## Quick Examples

The strategy name and the chain are passed to the standard element lookup endpoints,
for example `POST /session/:id/element`:

```json
{"using": "-android class chain", "value": "**/android.widget.TextView[`text BEGINSWITH 'A'`]"}
```

=== "Class Chain"

    ```text
    **/android.widget.LinearLayout[`resource-id == 'com.example:id/row'`]/android.widget.Button[2]
    ```

=== "XPath"

    ```text
    (//android.widget.LinearLayout[@resource-id='com.example:id/row']/android.widget.Button)[2]
    ```

Both examples select the second button among the direct children of all rows.

## Steps

Every step starts with an element type, which is the _full name_ of the Android class of the element
(the [`class`](../reference/element-attributes.md#class) attribute), for example `android.widget.Button`, or `*`
for any type. The type is matched exactly, so `android.view.View` does not match the elements of its
subclasses.

### Children and Descendants

Steps are separated by `/`, and select direct children of the elements matched by the previous step.
Use `**/` to select all descendants instead. The first step is relative to the element the search
is made from, which are the roots of the windows (see below) if the search is made on the driver.

|Class chain|Selects|XPath alternative|
|---|---|---|
|`android.widget.FrameLayout/android.widget.LinearLayout`|linear layouts, which are children of frame layouts, which are the window roots|`/hierarchy/android.widget.FrameLayout/android.widget.LinearLayout`|
|`**/android.widget.Button`|all buttons|`//android.widget.Button`|
|`**/android.widget.ListView/**/android.widget.TextView`|all text views inside of lists, at any depth|`//android.widget.ListView//android.widget.TextView`|

### Positions

A position in square brackets selects a single element among the matches of the entire preceding
chain, not per matched element of the previous step, like for XPath. Positions start with `1`.
A negative position counts from the end: `-1` is the last match. Avoid positions in the
intermediate steps if possible, because they make the lookup slower, and negative ones need all
matches of the step.

|Class chain|Selects|XPath alternative|
|---|---|---|
|`**/android.widget.TextView[3]`|the third text view|`(//android.widget.TextView)[3]`|
|`**/android.widget.TextView[-1]`|the last text view|`(//android.widget.TextView)[last()]`|
|`**/android.widget.ListView/android.widget.TextView[2]`|the second text view among the children of all lists|`(//android.widget.ListView/android.widget.TextView)[2]`|
|`**/android.widget.ListView[1]/*[-2]`|the second last child of the first list|`(//android.widget.ListView)[1]/*[last() - 1]`|

### Predicates

Predicates restrict the elements of a step. They are put into square brackets before the position,
and every predicate is an expression using the [element attributes](../reference/element-attributes.md):

- ``[`predicate`]`` - the predicate is applied to the matched elements themselves
- `[$predicate$]` - the predicate is applied to all _descendants_ of the matched elements;
  an element is selected if at least one of its descendants (not the element itself) satisfies
  the predicate

Only the marker enclosing the predicate has to be escaped inside of it by doubling: a backtick
in ``[`...`]`` or a dollar sign in `[$...$]`, for example `[$text == 'a$$b'$]`.
Predicates are always put before the position, never after it. Several predicates are applied
one after another, in the given order.

|Class chain|Selects|XPath alternative|
|---|---|---|
|``**/android.widget.Button[`text == 'OK'`]``|buttons with the text `OK`|`//android.widget.Button[@text='OK']`|
|``**/android.widget.TextView[`clickable == true AND text CONTAINS 'done'`]``|clickable text views with `done` in the text|`//android.widget.TextView[@clickable='true' and contains(@text, 'done')]`|
|``**/android.widget.LinearLayout[$class == 'android.widget.CheckBox' AND checked == true$]``|linear layouts, which contain a checked checkbox|`//android.widget.LinearLayout[.//android.widget.CheckBox[@checked='true']]`|
|``**/android.widget.TextView[`text BEGINSWITH 'A'`][-1]``|the last text view, whose text starts with `A`|`(//android.widget.TextView[starts-with(@text, 'A')])[last()]`|

#### Predicate Syntax

A predicate is a subset of the [NSPredicate](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/Predicates/AdditionalChapters/Introduction.html)
syntax, the same one that the iOS strategies use. A comparison is `attribute OPERATOR value`.

- **Attributes:** any [element attribute](../reference/element-attributes.md) that has a plain value, for
  example `text`, `content-desc`, `resource-id`, `class`, `package`, `index`, `checked`,
  `clickable`, `enabled`, `selected` or `scrollable`, either by its name or by one of its aliases
  (`contentDescription`, `resourceId`). The attributes that are not in the page source by default
  (`actions`, `text-size`, `text-unit`) can be used without enabling the settings that add them
  to it. `bounds` as a whole, `extras` and the collection attributes cannot be used,
  but the numeric parts of the bounds can be: `bounds.left`, `bounds.top`, `bounds.right`,
  `bounds.bottom`, `bounds.width` and `bounds.height`.
- **Values:** strings in single or double quotes (a backslash escapes the quote), integer
  and floating point numbers, booleans (`true`/`false`, `YES`/`NO`, `1`/`0`) and `nil` (or `NULL`)
  for a missing value.
- **Operators:** `==` (or `=`), `!=`, `<`, `<=`, `>`, `>=`, `BETWEEN {1, 5}`, `IN {'a', 'b'}`,
  `BEGINSWITH`, `ENDSWITH`, `CONTAINS`, `LIKE` (with the `*` and `?` wildcards) and `MATCHES`
  (a [Java regular expression](https://docs.oracle.com/en/java/javase/17/docs/api/java/util/regex/Pattern.html)
  that has to match the whole value). `[c]` and `[d]` modifiers make string operators ignore the
  case and diacritics: `text CONTAINS[cd] 'cafe'`.
- **Logic:** `AND` (`&&`), `OR` (`||`), `NOT` (`!`) and parentheses, as well as `TRUEPREDICATE`
  and `FALSEPREDICATE`.

Numbers are compared by their value, strings exactly. A missing value (for example, `original-text`
of an element without text) only satisfies `== nil`, `!= value` and `IN {..., nil}`. `actions CONTAINS 'ACTION_CLICK'`
matches a whole action name of the comma-separated list, while the other string attributes are
matched by a substring. Attributes are read only if a predicate needs them, and `AND`/`OR` stop at
the first operand that decides the result, so put the cheap and the most selective conditions first.

## Axis Steps

Axis steps select elements relative to the elements matched by the previous step in a direction
other than "down". They replace the XPath axes, which are the most common reason to use the
much slower XPath strategy.

|Step|Selects|XPath alternative|
|---|---|---|
|`..`|the parent|`..` or `parent::*`|
|`^android.widget.ListView`|all ancestors of the given type|`ancestor::android.widget.ListView`|
|`>android.widget.Button`|all following siblings of the given type|`following-sibling::android.widget.Button`|
|`<android.widget.Button`|all preceding siblings of the given type|`preceding-sibling::android.widget.Button`|
|`~android.widget.Button`|all siblings of the given type, except the matched element itself|`preceding-sibling::android.widget.Button \| following-sibling::android.widget.Button`|

Axis steps accept `*`, predicates and positions, the same way as regular steps. `..` is the
exception: it has neither a type nor a position, but may have predicates.

### Examples

The button right before the "OK" button:

=== "Class Chain"

    ```text
    **/android.widget.Button[`text == 'OK'`]/<android.widget.Button[1]
    ```

=== "XPath"

    ```text
    //android.widget.Button[@text='OK']/preceding-sibling::android.widget.Button[1]
    ```

The first row after the row containing the "Total" label:

=== "Class Chain"

    ```text
    **/android.widget.TextView[`text == 'Total'`]/^android.widget.LinearLayout[1]/>android.widget.LinearLayout[1]
    ```

=== "XPath"

    ```text
    //android.widget.TextView[@text='Total']/ancestor::android.widget.LinearLayout[1]
    /following-sibling::android.widget.LinearLayout[1]
    ```

All buttons next to the "OK" button, which are children of the same parent:

=== "Class Chain"

    ```text
    **/android.widget.Button[`text == 'OK'`]/~android.widget.Button
    ```

=== "XPath"

    ```text
    //android.widget.Button[@text='OK']/preceding-sibling::android.widget.Button
    | //android.widget.Button[@text='OK']/following-sibling::android.widget.Button
    ```

The input field, which is next to the label "Email", found through the parent:

=== "Class Chain"

    ```text
    **/android.widget.TextView[`text == 'Email'`]/../android.widget.EditText
    ```

=== "XPath"

    ```text
    //android.widget.TextView[@text='Email']/../android.widget.EditText
    ```

The dialog layout containing the "OK" button, using a predicate on the parent:

=== "Class Chain"

    ```text
    **/android.widget.Button[`text == 'OK'`]/..[`resource-id == 'android:id/parentPanel'`]
    ```

=== "XPath"

    ```text
    //android.widget.Button[@text='OK']/parent::*[@resource-id='android:id/parentPanel']
    ```

### Positions on Axes

Positions count along the axis, as they do for XPath axes: from the nearest element for `^`
and `<`, in document order for `>` and `~`, and from the other end if negative.

|Class chain|Selects|XPath alternative|
|---|---|---|
|`^android.widget.LinearLayout[1]`|the closest ancestor of the type|`ancestor::android.widget.LinearLayout[1]`|
|`^*[-1]`|the outermost ancestor|`ancestor::*[last()]`|
|`<android.widget.Button[1]`|the closest preceding button|`preceding-sibling::android.widget.Button[1]`|
|`>android.widget.Button[-1]`|the last following button|`following-sibling::android.widget.Button[last()]`|

### Rules

- An axis step may follow any step, and may also start the chain, in which case it is relative
  to the element the search is made from, for example when finding an element within another element.
- An axis step cannot directly follow `**/`, but `**/` may follow an axis step:
  `android.widget.Button/../**/android.widget.ImageView`.
- As for the other steps, a position selects among the matches of the whole step. If the previous step
  matches several elements, then the matches of `>` and `~` for all of them are merged in the document order
  before the position is applied, while the matches of `^` and `<` stay in the order of the axis, with
  duplicates removed. XPath applies the position for each element separately.
- The matches of a chain containing axis steps are always returned in the document order, same as for XPath.

## Predicate String Strategy

If the elements can be identified only by their own attributes, the `-android predicate string`
locator strategy is a shorter alternative. Its value is a predicate with the
[syntax](#predicate-syntax) described above, and the strategy finds all elements below the search
root that satisfy it. It is the same as the class chain ``**/*[`predicate`]``, so the search scope
and the performance are the same, and a position or a step cannot be used. The predicate does not
have to be enclosed in backticks.

!!! info "Availability"

    The strategy is available since driver version 10.2.0 (UiAutomator2 server 11.6.0).

|Predicate string|Class chain|
|---|---|
|``text == 'OK'``|``**/*[`text == 'OK'`]``|
|``class == 'android.widget.Button' AND enabled == true``|``**/*[`class == 'android.widget.Button' AND enabled == true`]``|
|``text CONTAINS[cd] 'cafe' OR content-desc BEGINSWITH 'menu'``|``**/*[`text CONTAINS[cd] 'cafe' OR content-desc BEGINSWITH 'menu'`]``|

A malformed predicate fails before anything is searched, with an `invalid selector` error that
points to the position of the problem.

## Search Scope

The elements of the tree are the same as in the page source and XPath lookups:

- The first step is relative to the roots of the windows, which depend on the
  [`enableMultiWindows`](../reference/settings.md#enablemultiwindows) and
  [`enableTopmostWindowFromActivePackage`](../reference/settings.md#enabletopmostwindowfromactivepackage)
  settings. A lookup within an element only searches below that element.
- Invisible elements are skipped, unless [`allowInvisibleElements`](../reference/settings.md#allowinvisibleelements)
  is enabled or the class of the element is listed in
  [`alwaysTraversableViewClasses`](../reference/settings.md#alwaystraversableviewclasses),
  and the depth of the tree is limited by [`snapshotMaxDepth`](../reference/settings.md#snapshotmaxdepth).
- The `index` attribute is the position of the element among the children of its parent, as in the
  page source, and the `text` attribute is `""` for elements without a text, as in XPath.
- Toast messages are not searched. The page source adds them to the end of the tree as synthetic
  elements built from the toast notifications, they are not part of the accessibility tree that
  a class chain walks, whereas XPath looks them up in the page source.

Malformed chains and predicates fail before anything is searched, with an `invalid selector`
error that points to the position of the problem.

## Performance

A class chain reads the accessibility tree lazily and only once per lookup. The children of a node
are fetched only when the search gets to them, and a lookup of a single element stops at the first
match, unless the last step has a negative position. Reading the accessibility nodes dominates the
time for all the strategies, so the numbers depend on the device and the screen, and are only
good for comparing the strategies.

In measurements on an API 36 emulator, on a screen of the Settings app with about 70 elements,
the median times were about:

|Lookup|Class chain|UiSelector|XPath|
|---|---|---|---|
|a single element by its text|10 ms|10 ms|22 ms|
|a single element by its resource id|6 ms|5 ms|22 ms|
|all 19 elements of a class|19 ms|36 ms|22 ms|
|all 9 elements with a resource id|20 ms|27 ms|23 ms|

So looking up a single element is about as fast as with [`-android uiautomator`](../reference/locator-strategies.md#uiautomator),
and the lookups of multiple elements are faster than with both alternatives.

## More Information

- [Locator Strategies](../reference/locator-strategies.md) — overview of all strategies and their performance
- [Element Attributes](../reference/element-attributes.md) — attributes available in predicates
- [Settings](../reference/settings.md) — settings that define which elements are searched
