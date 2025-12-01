# Testing Multi-Window Android Applications

This guide explains how to test multi-window Android applications using the UiAutomator2 driver, including how windows, displays, and hardware displays relate to each other, and how various settings affect element location and page source generation.

## What Are Multi-Window Android Applications?

Multi-window applications are Android applications that can display multiple windows simultaneously on the screen. This includes:

- **Split-screen mode**: Two applications running side-by-side
- **Picture-in-picture (PiP)**: A video player window floating over other content
- **Freeform windows**: Desktop-like windowed applications (on supported devices)
- **System windows**: On-screen keyboards, system dialogs, and notification panels
- **Overlay windows**: Floating action buttons, tooltips, and other overlay UI elements

Each window in a multi-window environment has its own view hierarchy and can be interacted with independently. The UiAutomator2 driver provides settings and capabilities to handle these complex scenarios.

## Windows, Displays, and Hardware Displays

Understanding the relationship between these concepts is crucial for effective multi-window testing:

### Windows

A **window** is a container for UI elements that belongs to an application. Each window has:
- A unique `windowId` identifier
- A `packageName` identifying the owning application
- Bounds (`rect`) defining its position and size on screen
- A Z-order (`layer`) determining which window appears on top

You can list all available windows using the [`mobile: listWindows`](../README.md#mobile-listwindows) command, which is essential for understanding the window structure in multi-window scenarios.

### Displays

A **display** (also called a logical display) is a virtual screen that can contain multiple windows. Each display has:
- A `displayId` identifier (typically `0` for the default display)
- A `physicalDisplayId` that maps to the actual hardware display

On Android, the default display (`displayId = 0`) is always present. Additional displays can be created for:
- External monitors connected via USB-C or HDMI
- Wireless displays
- Virtual displays created by applications

### Hardware Displays

A **hardware display** (physical display) is the actual physical screen hardware. Multiple logical displays can map to the same physical display, or a single logical display can span multiple physical displays.

### Multi-Display Support

**Android API 30+ (Android R):**
- Full multi-display support is available
- The driver can access windows from all displays using `getWindowsOnAllDisplays()`
- The `currentDisplayId` setting allows you to target a specific display for element lookup
- Window operations respect the selected display context

**Before Android API 30:**
- Only the default display (`displayId = 0`) is accessible
- `getWindows()` only returns windows from the default display
- Multi-display operations are not supported
- The `currentDisplayId` setting has no effect

## Using `mobile: listWindows` to Inspect Window Structure

The `mobile: listWindows` command is a powerful tool for understanding and debugging multi-window applications. It returns information about all windows currently available on the device, including their properties and relationships.

### Basic Usage

```python
# List all windows without filters
windows = driver.execute_script('mobile: listWindows')

# Print information about each window
for window in windows:
    print(f"Window ID: {window['windowId']}")
    print(f"Display ID: {window['displayId']}")
    print(f"Package: {window['packageName']}")
    print(f"Bounds: {window['rect']}")
    print("---")
```

### Filtering Windows

You can filter the results to find specific windows:

```python
# Find windows from a specific package
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'packageName': 'com.example.myapp'
    }
})

# Find windows on a specific display
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'displayId': 0
    }
})

# Find a specific window by ID
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'windowId': 42
    }
})

# Combine multiple filters (AND logic)
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'packageName': 'com.example.myapp',
        'displayId': 0
    }
})
```

### Package Name Filtering with Glob Patterns

The `packageName` filter supports glob patterns for flexible matching:

```python
# Find windows from any package starting with 'com.example'
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'packageName': 'com.example.*'
    }
})
```

### Skipping Screenshots for Performance

By default, `mobile: listWindows` attempts to take screenshots of each window (on Android API 34+). You can skip this for better performance:

```python
# Skip screenshots to improve performance
windows = driver.execute_script('mobile: listWindows', {
    'skipScreenshots': True
})
```

### Practical Use Cases

**1. Debugging Window Visibility Issues:**
```python
# Check if your app's window is visible
windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})
if not windows:
    print("App window not found!")
else:
    print(f"Found {len(windows)} window(s) from the app")
```

**2. Finding System Windows (like keyboards):**
```python
# Find all system windows
all_windows = driver.execute_script('mobile: listWindows', {})
system_windows = [w for w in all_windows if w['packageName'] and 'android' in w['packageName']]
print(f"Found {len(system_windows)} system windows")
```

**3. Understanding Multi-Display Setup:**
```python
# Group windows by display
windows = driver.execute_script('mobile: listWindows', {})
windows_by_display = {}
for window in windows:
    display_id = window['displayId']
    if display_id not in windows_by_display:
        windows_by_display[display_id] = []
    windows_by_display[display_id].append(window)

print(f"Windows on each display: {windows_by_display}")
```

## Element Location Strategy in Multi-Window Applications

The UiAutomator2 driver uses different strategies for locating elements depending on the locator type and settings configuration.

### UiObject2-Based Locators (Recommended)

UiObject2-based locators support multi-window scenarios and are affected by the following settings:

- **`id`** (resource ID)
- **`accessibility id`** (content description)
- **`className`**
- **`xpath`** (when used with proper window context)

These locators work with the window selection logic controlled by `enableMultiWindows`, `currentDisplayId` and `enableTopmostWindowFromActivePackage` settings.

### Legacy UiObject-Based Selectors (Limited Support)

The **`-android uiautomator`** strategy uses the legacy `UiSelector` API, which:
- **Does not support multi-window lookups**
- Only searches within the active window
- Cannot access elements in other windows even when `enableMultiWindows` is enabled
- Should be avoided for multi-window scenarios

If you need to use UiSelector-based locators, consider using the newer UiObject2-based alternatives instead.

## Settings That Affect Element Location

### `currentDisplayId`

**Type:** `integer`
**Default:** `0` (default display)
**Available since:** Android API 30+

The `currentDisplayId` setting determines which display is used for element lookup operations when using UiObject2-based locators.

**How it works:**
- When set to a specific display ID, all element lookups are scoped to that display
- Only windows from the specified display are considered during element search
- This setting is applied to `BySelector` objects via the `displayId()` method
- If the specified display ID doesn't exist, an error is thrown

**Example:**
```python
# Set the current display to display 1
driver.update_settings({'currentDisplayId': 1})

# Now all element lookups will search only on display 1
element = driver.find_element('id', 'myButton')
```

**Note:** This setting only affects UiObject2-based locators (`id`, `accessibility id`, `className`). It has no effect on legacy `-android uiautomator` selectors or xpath lookups (which use their own window selection logic).

**Screenshot Behavior:**
- When `currentDisplayId` is set to a custom value, the standard `getScreenshot()` method will take a screenshot of the specified display

**Coordinate-Based Gesture Behavior:**
- Coordinate-based gestures (taps, swipes, drags, etc. performed using x/y coordinates) are executed on either the default active display or the display specified by `currentDisplayId`
- When `currentDisplayId` is set, all coordinate-based gestures will target that display
- This includes gestures performed via:
  - W3C Actions API (pointer actions with coordinates)
  - Mobile gesture commands (`mobile: clickGesture`, `mobile: swipeGesture`, etc.) when coordinates are provided
  - Direct coordinate-based interactions
- This ensures that gestures are performed on the correct display in multi-display scenarios

**Example:**
```python
# Set display 1 as current
driver.update_settings({'currentDisplayId': 1})

# Coordinate-based gestures will now target display 1
driver.execute_script('mobile: clickGesture', {'x': 100, 'y': 200})

# Reset to default display
driver.update_settings({'currentDisplayId': 0})

# Gestures will now target the default display
driver.execute_script('mobile: clickGesture', {'x': 100, 'y': 200})
```

### `enableMultiWindows`

**Type:** `boolean`
**Default:** `false`

The `enableMultiWindows` setting controls whether multiple windows are included in the accessibility tree used for element location and page source generation.

**When `false` (default):**
- Only the active window's root node is retrieved
- Element lookups search only within the active window
- Page source contains only the active window's hierarchy
- This is the fastest and most common configuration

**When `true`:**
- All accessible windows are retrieved and included in the accessibility tree
- Element lookups can find elements across all windows
- Page source includes content from all windows
- Useful when you need to interact with system windows (like keyboards) or overlay windows

**Example:**
```python
# Enable multi-window mode
driver.update_settings({'enableMultiWindows': True})

# Now you can find elements in the on-screen keyboard or other windows
keyboard_key = driver.find_element('id', 'keyboard_key_a')
```

**Important considerations:**
- Enabling this setting may impact performance as more windows need to be processed
- The window selection logic also depends on `enableTopmostWindowFromActivePackage`
- This setting affects both element location and page source generation

### `enableTopmostWindowFromActivePackage`

**Type:** `boolean`
**Default:** `false`

The `enableTopmostWindowFromActivePackage` setting determines which window from the active application package is used when `enableMultiWindows` is `false`.

**When `false` (default):**
- Uses `getRootInActiveWindow()` to get the active window root
- This is the window that currently has focus
- May not be the topmost window if the app has multiple windows

**When `true`:**
- Searches all windows from the active package
- Selects the window with the highest Z-order (topmost layer)
- Useful when an app has multiple windows and you want to interact with the one on top

**Example:**
```python
# Enable topmost window selection
driver.update_settings({'enableTopmostWindowFromActivePackage': True})

# Now element lookups will use the topmost window from your app
element = driver.find_element('id', 'myButton')
```

**Interaction with `enableMultiWindows`:**
- When `enableMultiWindows` is `true`, this setting is ignored (all windows are included)
- When `enableMultiWindows` is `false` and this setting is `true`, only the topmost window from the active package is used
- When both are `false`, the active window is used

## How Settings Affect Page Source Generation

The page source (XML hierarchy) generation is directly affected by the window selection settings. **Note:** XPath lookups use the same page source, so the rules described here apply to both page source generation and XPath queries.

The interaction between `enableMultiWindows` and `currentDisplayId` determines which windows are included:

### When `enableMultiWindows` is `true` and `currentDisplayId` is set

- Only windows belonging to the specified display are included in the page source
- Each window's hierarchy from that display is merged into the XML tree
- Fastest multi-window configuration since it's limited to one display
- Elements from windows on other displays are not visible in the page source

### When `enableMultiWindows` is `true` and `currentDisplayId` is not customized

- All accessible windows from all displays are included in the page source
- Each window's hierarchy is merged into the XML tree
- You can see elements from:
  - The main application window
  - On-screen keyboard
  - System dialogs
  - Overlay windows
  - Other application windows (in split-screen mode)
  - Windows from all connected displays

### When `enableMultiWindows` is `false` and `currentDisplayId` is set

- Only the active window's hierarchy is included
- `currentDisplayId` is effectively ignored in this case, as only the active window is used regardless of which display it's on
- Fastest generation time
- Smallest XML output
- Elements from other windows are not visible in the page source

### When `enableMultiWindows` is `false` and `currentDisplayId` is not customized

- Only the active window's hierarchy is included (or topmost window if `enableTopmostWindowFromActivePackage: true`)
- Fastest generation time
- Smallest XML output
- Elements from other windows are not visible in the page source

### XPath Lookups

XPath lookups use the same window selection logic as page source generation. The interaction between `enableMultiWindows` and `currentDisplayId` determines which windows are included:

- **When `enableMultiWindows` is `true` and `currentDisplayId` is set**: The page source only includes windows belonging to the specified display. Xpath can find elements across all windows from that display.
- **When `enableMultiWindows` is `true` and `currentDisplayId` is not customized**: The page source includes windows from all displays. Xpath can find elements across all windows from all displays.
- **When `enableMultiWindows` is `false` and `currentDisplayId` is set**: The page source only includes the active window. `currentDisplayId` is effectively ignored in this case, as only the active window is used regardless of which display it's on.
- **When `enableMultiWindows` is `false` and `currentDisplayId` is not customized**: The page source only includes the active window (or topmost window if `enableTopmostWindowFromActivePackage` is `true`). Xpath searches only within that single window.

**Using `window-id` Attribute to Fine-Tune XPath Lookups:**

When `enableMultiWindows` is enabled and `currentDisplayId` is not customized, elements from multiple windows are included in the page source. Each element has a `window-id` attribute that identifies which window it belongs to. You can use this attribute in your xpath queries to target elements from specific windows.

**Important:** Using `window-id` in xpath only makes sense when:
- `enableMultiWindows` is `true` (multiple windows are included in the page source)
- `currentDisplayId` is not customized (not set to a specific display)

**Why?**
- When `enableMultiWindows` is `false`, only one window is included in the page source, so all elements have the same `window-id`
- When `currentDisplayId` is set to a specific display, only windows from that display are included, so all elements would have the same `window-id` (or windows from the same display)
- Only when multiple windows from potentially different displays are included does the `window-id` attribute provide meaningful differentiation

**Example:**
```python
# Enable multi-windows for xpath searches (without setting currentDisplayId)
driver.update_settings({'enableMultiWindows': True})

# First, find the window ID you want to target
windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})
target_window_id = windows[0]['windowId']

# Use window-id attribute in xpath to target a specific window
element = driver.find_element('xpath', f'//*[@window-id="{target_window_id}" and @text="My Button"]')

# Or find all elements in a specific window
elements = driver.find_elements('xpath', f'//*[@window-id="{target_window_id}"]')
```

**Note:** The `window-id` attribute is only available when the element's window identifier can be determined. In rare cases, this attribute might not be present for some elements.

## Best Practices

1. **Use UiObject2-based locators** (`id`, `accessibility id`, `className`) instead of legacy `-android uiautomator` selectors for multi-window scenarios

2. **Start with default settings** and only enable `enableMultiWindows` when you specifically need to interact with multiple windows

3. **Use `currentDisplayId`** when testing on devices with multiple displays (Android API 30+)

4. **Enable `enableTopmostWindowFromActivePackage`** when your app has multiple windows and you want to interact with the visible one

5. **Reset accessibility cache** using [`mobile: resetAccessibilityCache`](../README.md#mobile-resetaccessibilitycache) if you encounter stale element references after window changes

6. **List windows** using [`mobile: listWindows`](../README.md#mobile-listwindows) to understand the window structure before writing locators. Use filtering to find specific windows and verify which windows are accessible for element location.

## Example: Testing a Split-Screen Application

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options

# Setup
options = UiAutomator2Options()
options.app_package = 'com.example.myapp'
driver = webdriver.Remote('http://localhost:4723', options=options)

# Enable multi-window support
driver.update_settings({
    'enableMultiWindows': True
})

# List all windows to see what's available
windows = driver.execute_script('mobile: listWindows', {})
print(f"Found {len(windows)} windows")

# Filter to find windows from your app
app_windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})
print(f"Found {len(app_windows)} windows from the app")

# Find elements - now searches across all windows
element = driver.find_element('id', 'myButton')

# Get page source - includes all windows
source = driver.get_page_source()
```

## Example: Testing on Multiple Displays

```python
# Check available displays (Android API 30+)
# Use adb command: adb shell dumpsys display

# Set the current display for element lookups
driver.update_settings({'currentDisplayId': 1})

# All subsequent element lookups will search on display 1
element = driver.find_element('id', 'myButton')

# Screenshots will also be taken from display 1
screenshot = driver.get_screenshot_as_base64()

# Reset to default display
driver.update_settings({'currentDisplayId': 0})
```

## Screenshots and Multi-Display Support

Screenshots are an important part of multi-window and multi-display testing. The UiAutomator2 driver provides two methods for taking screenshots that work with multiple displays.

### How `currentDisplayId` Affects Screenshots

When the `currentDisplayId` setting is configured to a non-default display:

- **Standard screenshots** (`getScreenshot()`, `get_screenshot_as_base64()`, etc.) will capture the specified display
- The driver automatically detects if the display has custom density or is a non-default display
- For better compatibility with custom displays, the driver may use the `screencap` command instead of the standard screenshot API
- This ensures that screenshots match the display context you're currently testing

**Example:**
```python
# Set display 1 as current
driver.update_settings({'currentDisplayId': 1})

# This screenshot will be from display 1
screenshot = driver.get_screenshot_as_base64()

# Reset to default display
driver.update_settings({'currentDisplayId': 0})

# Now screenshots will be from the default display
screenshot = driver.get_screenshot_as_base64()
```

### Using `mobile: screenshots` for Multi-Display Screenshots

The [`mobile: screenshots`](../README.md#mobile-screenshots) method provides more control over multi-display screenshot capture. This method is available since Android 10 (API 29).

#### Taking Screenshots of All Displays

```python
# Get screenshots of all available displays
screenshots = driver.execute_script('mobile: screenshots', {})

# screenshots is a dictionary where keys are display IDs
for display_id, display_info in screenshots.items():
    print(f"Display {display_id}: {display_info['name']}")
    print(f"  Is default: {display_info['isDefault']}")
    print(f"  Screenshot size: {len(display_info['payload'])} bytes")
    # display_info['payload'] contains base64-encoded PNG data
```

#### Taking Screenshots of a Specific Display

You can get the physical display ID from `mobile: listWindows` results and use it with `mobile: screenshots`:

```python
# First, get windows to find the physical display ID
windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})

# Get the physical display ID from the window
if windows and windows[0].get('physicalDisplayId') is not None:
    physical_display_id = windows[0]['physicalDisplayId']

    # Use the physical display ID to take a screenshot
    screenshots = driver.execute_script('mobile: screenshots', {
        'displayId': physical_display_id
    })

    # Returns a dictionary with one entry
    # Note: The key in the returned dictionary will be a string representation
    display_info = screenshots[str(physical_display_id)]
    screenshot_data = display_info['payload']  # base64-encoded PNG
else:
    print("Physical display ID not available for this window")
```

Alternatively, you can use a known physical display ID directly:

```python
# Get screenshot of a specific physical display ID
screenshots = driver.execute_script('mobile: screenshots', {
    'displayId': '1234567890'  # Physical display ID (string or number)
})

# Returns a dictionary with one entry
display_info = screenshots['1234567890']
screenshot_data = display_info['payload']  # base64-encoded PNG
```

#### Understanding Display Identifiers

**Important:** The display identifiers used by `mobile: screenshots` are **physical display IDs**, which are different from the logical display IDs used by `currentDisplayId` setting.

- **Logical display ID** (`currentDisplayId`): Used for element location, window operations, and standard screenshots. Typically starts at 0.
- **Physical display ID** (`mobile: screenshots`): Used for the `mobile: screenshots` method. You can get this value from the `physicalDisplayId` property returned by `mobile: listWindows`, or by using `adb shell dumpsys SurfaceFlinger --display-id`. The `physicalDisplayId` from `mobile: listWindows` can be used directly with `mobile: screenshots` to take a screenshot of the display containing a specific window.

**Example workflow:**
```python
# 1. List windows to see logical display IDs and physical display IDs
windows = driver.execute_script('mobile: listWindows', {})
for window in windows:
    print(f"Window on logical display {window['displayId']}")
    if window.get('physicalDisplayId') is not None:
        print(f"  Physical display ID: {window['physicalDisplayId']}")
    else:
        print(f"  Physical display ID: not available")

# 2. Use currentDisplayId for element operations (logical display)
driver.update_settings({'currentDisplayId': 0})
element = driver.find_element('id', 'myButton')

# 3. Use mobile: screenshots with physical display IDs
# You can get physical display IDs from mobile: listWindows results
target_window = windows[0]
if target_window.get('physicalDisplayId') is not None:
    physical_display_id = target_window['physicalDisplayId']
    screenshots = driver.execute_script('mobile: screenshots', {
        'displayId': physical_display_id
    })
    # Note: The key in the returned dictionary will be a string representation
    display_info = screenshots[str(physical_display_id)]
else:
    print("Physical display ID not available for this window")

# Alternatively, you can find physical display IDs using adb:
# adb shell dumpsys SurfaceFlinger --display-id
```

**Example:**
```python
screenshots = driver.execute_script('mobile: screenshots', {})

for display_id, info in screenshots.items():
    print(f"Display ID: {display_id}")
    print(f"  Name: {info['name']}")
    print(f"  Default: {info['isDefault']}")
    print(f"  Screenshot: {info['payload'][:50]}...")  # First 50 chars
```

### Best Practices for Screenshots in Multi-Display Scenarios

1. **Use `currentDisplayId` for standard screenshots** when you want screenshots to match your current testing context
2. **Use `mobile: screenshots`** when you need screenshots from multiple displays simultaneously or want to target specific physical displays
3. **Be aware of the difference** between logical display IDs (`currentDisplayId`) and physical display IDs (`mobile: screenshots`)
4. **List windows first** to understand which logical displays contain your application windows
5. **Get physical display IDs from `mobile: listWindows`** - The `physicalDisplayId` returned by `mobile: listWindows` can be used directly with `mobile: screenshots` to take a screenshot of the display containing a specific window. This is more convenient than using `adb shell dumpsys SurfaceFlinger --display-id`
6. **Alternative: Use `adb shell dumpsys SurfaceFlinger --display-id`** if you need to find all physical display IDs without listing windows first

## References

- [Android Multi-Window Support](https://developer.android.com/guide/topics/large-screens/multi-window-support)
- [AccessibilityWindowInfo API](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo)
- [UiAutomator2 Server Source Code](https://github.com/appium/appium-uiautomator2-server)

