---
title: Locator Strategies
---

The UiAutomator2 driver supports several location strategies in the native context. The list below
describes each strategy along with usage recommendations.

## Id

|Name|Speed Ranking|Example|
|---|---|---|
|`id`|⭐⭐⭐⭐⭐|`com.mycompany:id/resourceId`|

This strategy is mapped to the native UI Automator [`BySelector.res`](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#res(java.lang.String))
matcher, which returns elements whose resource name matches the specified value exactly.

If the package identifier prefix is not specified and the [`disableIdLocatorAutocompletion`](./settings.md#disableidlocatorautocompletion)
setting is not enabled, the prefix identifier of the current app under test is added automatically.

!!! info "When to Use"

    Use this strategy for elements that can be identified using their [`View.id`](https://developer.android.com/reference/android/view/View#attr_android:id)
    attribute value.

## Accessibility Id

|Name|Speed Ranking|Example|
|---|---|---|
|`accessibility id`|⭐⭐⭐⭐⭐|`my description`|

This strategy is mapped to the native UI Automator [`BySelector.desc`](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#desc(java.lang.String))
matcher, which returns elements whose content description matches the specified value exactly.

!!! info "When to Use"

    Use this strategy for elements that can be identified using their [`View.contentDescription`](https://developer.android.com/reference/android/view/View#attr_android:contentDescription)
    attribute value.

## Class Name

|Name|Speed Ranking|Example|
|---|---|---|
|`class name`|⭐⭐⭐⭐⭐|`android.view.View`|

This strategy is mapped to the native UI Automator [`BySelector.clazz`](https://developer.android.com/reference/androidx/test/uiautomator/BySelector#clazz(java.lang.String))
matcher, which returns elements whose class name matches the specified value exactly.

!!! info "When to Use"

    Use this strategy for elements that can be identified using their class name.

## UiAutomator

|Name|Speed Ranking|Example|
|---|---|---|
|`-android uiautomator`|⭐⭐⭐⭐|`new UiSelector().resourceId("android:id/list")`|

This strategy is mapped to the native UI Automator [`UiSelector`](https://developer.android.com/reference/androidx/test/uiautomator/UiSelector) locator.

The strategy also allows to implicitly perform some advanced operations, like scrolling. Refer to
the [UiAutomator Locator Strategy](../guides/uiautomator-locator-strategy.md) guide for more details.
To scroll without `UiScrollable`, see [Migrating from UiScrollable and UiSelector](../guides/migrating-from-uiscrollable.md).

!!! warning

    Google is planning to [deprecate](https://developer.android.com/training/testing/other-components/ui-automator-legacy#ui-automator)
    and remove `UiCollection`, `UiObject`, `UiScrollable`, and `UiSelector` support from the
    UiAutomator framework. This will render all `-android uiautomator`-based locators invalid, so
    keep this in mind while using them or planning to use them in the future.
    Replace them with [Predicate String](#predicate-string) or [Class Chain](#class-chain) locators, which
    are about as fast as `UiSelector`, and faster than [XPath](#xpath).

    The driver logs a warning, once per session, when a `UiScrollable` expression is used as a
    locator or when `mobile: scroll` is called with this strategy.

!!! info "When to Use"

    Prefer [Predicate String](#predicate-string) and [Class Chain](#class-chain) for new tests. Use this
    strategy only for elements that cannot be identified by the other strategies, as long as it is available.

## Predicate String

|Name|Speed Ranking|Example|
|---|---|---|
|`-android predicate string`|⭐⭐⭐⭐|``text == 'Gallery' AND clickable == true``|

This strategy finds all elements below the search root (the whole screen or the context element)
that satisfy a predicate on their attributes. It is a shorthand for the
[class chain](#class-chain) ``**/*[`predicate`]``, uses the same
[predicate syntax](../guides/android-class-chain.md#predicate-syntax) and has the same performance.
Available since driver version 10.2.0.
Read the [Class Chain Locator Strategy](../guides/android-class-chain.md#predicate-string-strategy)
article for more details.

!!! info "When to Use"

    Use this strategy for elements that can be identified by a combination of their own attributes,
    for example when the `id`, `accessibility id` and `class name` strategies are not enough, and
    the parent, sibling or descendant elements are not needed.

## Class Chain

|Name|Speed Ranking|Example|
|---|---|---|
|`-android class chain`|⭐⭐⭐⭐|``**/android.widget.TextView[`text == 'Gallery'`]``|

This strategy evaluates a chain of steps (children, descendants, parents, ancestors and siblings of
the elements, each one optionally narrowed down by predicates on the element attributes and
a position) directly on the accessibility tree. It is a layer over the same tree as the
[XPath](#xpath) strategy, but it does not need the page source of the whole application, so it is
much faster, and about as fast as [UiAutomator](#uiautomator) for finding single elements.
Available since driver version 10.1.0.
Read the [Class Chain Locator Strategy](../guides/android-class-chain.md) article for more details on how
to build such locators.

!!! info "When to Use"

    Use this strategy for elements that _cannot_ be identified only using their own attributes,
    but _can_ be identified upon additionally using their parent element(s), sibling element(s)
    and/or their descendant element attribute(s). It is also the recommended replacement of
    [UiAutomator](#uiautomator) locators, which Google is going to remove.

## XPath

|Name|Speed Ranking|Example|
|---|---|---|
|`xpath`|⭐⭐⭐|`//android.view.View[@text="Regular" and @checkable="true"]`|

This strategy relies on the XML tree generated by the UiAutomator2 driver's page source API.

XPath versions 1.0 and 2.0 are supported. 

!!! info "When to Use"

    Use this strategy when no other strategy is applicable, typically for elements that can only be
    identified by conditions that cannot be expressed by the other strategies, for example the complex
    ones that combine several elements of the hierarchy.

## CSS Selector

|Name|Speed Ranking|Example|
|---|---|---|
|`css selector`|⭐⭐⭐⭐|`android.widget.TextView[text^="Gal"]:instance(0)`|

This strategy converts a CSS selector to a [class chain](#class-chain) on the driver side, so it has
the same performance and search scope. Only the first comma-separated selector is used. The following is supported:

- a fully qualified class name as the tag (`android.widget.TextView`), or a trailing part of it (`TextView`, `.widget.TextView`)
- `#id` and `[id=...]`, which are qualified with the application package unless they already have the `package:id/` form
- the attributes `text`, `description` (aliases `content-desc`, `content-description`, `desc`, `accessibility-id`),
  `resource-id`, `class-name` and `package-name` with the `=`, `^=`, `$=`, `*=` and `~=` operators.
  `text` and `description` ignore the case in `^=` and `*=`
- the boolean attributes `checkable`, `checked`, `clickable`, `enabled`, `focusable`, `focused`, `long-clickable`,
  `scrollable` and `selected`, either as `[clickable=true]` or `:clickable`
- `:nth-child(n)` or `:index(n)`, the `index` attribute of the element, and the zero-based `:instance(n)`, the position among the matches
- the descendant (a space) and the child (`>`) combinators

!!! info "When to Use"

    Use this strategy if the locators are shared with web tests or the client library offers CSS selectors only.
    Prefer [Predicate String](#predicate-string) and [Class Chain](#class-chain) otherwise.
