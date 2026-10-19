---
title: Multiple Windows/Displays
---

This guide explains how to test multi-window Android applications using the UiAutomator2 driver,
including how windows, displays, and hardware displays relate to each other, and how various
settings affect element location and page source generation.

## What Are Multi-Window Apps

Multi-window applications are Android applications that can display multiple windows simultaneously
on the screen. This includes:

- **Split-screen mode**: Two applications running side-by-side
- **Picture-in-picture (PiP)**: A video player window floating over other content
- **Freeform windows**: Desktop-like windowed applications (on supported devices)
- **System windows**: On-screen keyboards, system dialogs, and notification panels
- **Overlay windows**: Floating action buttons, tooltips, and other overlay UI elements

Each window in a multi-window environment has its own view hierarchy and can be interacted with
independently. The UiAutomator2 driver provides settings and capabilities to handle these complex
scenarios.

## Windows vs Displays

Understanding the relationship between these concepts is crucial for effective multi-window testing:

### Windows

A **window** is a container for UI elements that belongs to an application. Each window has:

- A unique `windowId` identifier
- A `packageName` identifying the owning application
- Bounds (`rect`) defining its position and size on screen
- A Z-order (`layer`) determining which window appears on top
- A `type` indicating the window type (application, input method, system, etc.)
- A `title` (may be null)
- A `physicalDisplayId` (physical display identifier, may be null) - returned as a string
- A `virtualDisplayId` (virtual display identifier, may be null) - only set for virtual displays
- State flags: `isActive`, `isFocused`, `isAccessibilityFocused`, `isInPictureInPictureMode`

Available windows can be retrieved using the [`mobile: listWindows`](../reference/execute-methods.md#mobile-listwindows)
execute method, which is essential for understanding the window structure in multi-window scenarios.

### Displays

A **display** (also called a logical display) is a virtual screen that can contain multiple windows.
Each display has:

- A `displayId` identifier (typically `0` for the default display) - this is the logical display ID
- A `name` (display name, may be null)
- A `physicalId` (physical display identifier) that maps to the actual hardware display
- A `virtualId` (virtual display identifier, may be null) - only set for virtual displays
- Display metrics (width, height, density, DPI, etc.)

On Android, the default display (`displayId = 0`) is always present. Additional displays can be
created for:

- External monitors connected via USB-C or HDMI
- Wireless displays
- Virtual displays created by applications

Available displays can be retrieved using the [`mobile: listDisplays`](../reference/execute-methods.md#mobile-listdisplays)
execute method, to see both logical and physical display identifiers along with their metrics.

### Hardware Displays

A **hardware display** (physical display) is the actual physical screen hardware. Multiple logical
displays can map to the same physical display, or a single logical display can span multiple
physical displays.

### Multi-Display Support

The driver only supports management of multiple displays since **Android 11 (R / API level 30)**:

- The driver can access windows from all displays using `getWindowsOnAllDisplays()`
- The `currentDisplayId` setting allows targeting a specific display for element lookup
- Window operations respect the selected display context

Older Android versions are limited:

- Only the default display (`displayId = 0`) is accessible
- `getWindows()` only returns windows from the default display
- Multi-display operations are not supported
- The `currentDisplayId` setting has no effect

## Managing Windows

The [`mobile: listWindows`](../reference/execute-methods.md#mobile-listwindows) execute method is a
powerful tool for understanding and debugging multi-window applications. It returns information
about all windows currently available on the device, including their properties and relationships.

All the following examples are written in Python.

### Basic Usage

```python
# List all windows without filters
windows = driver.execute_script('mobile: listWindows')

# Print information about each window
for window in windows:
    print(f"Window ID: {window['windowId']}")
    print(f"Display ID: {window['displayId']}")
    print(f"Physical Display ID: {window['physicalDisplayId']}")
    if window.get('virtualDisplayId'):
        print(f"Virtual Display ID: {window['virtualDisplayId']}")
    print(f"Package: {window['packageName']}")
    print(f"Type: {window['type']}")
    print(f"Title: {window['title']}")
    print(f"Layer: {window['layer']}")
    print(f"Active: {window['isActive']}, Focused: {window['isFocused']}")
    print(f"Bounds: {window['rect']}")
    print("---")
```

### Filtering Windows

Results can be filtered in order to find specific windows:

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

# Find windows by physical display ID (note: physicalDisplayId is a string)
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'physicalDisplayId': '1234567890'
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

### Advanced Filtering Options

The execute method supports many filter options:

```python
# Filter by package name with glob patterns
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'packageName': 'com.example.*'  # Glob pattern support
    }
})

# Filter by window type (e.g., TYPE_APPLICATION = 1, TYPE_INPUT_METHOD = 2)
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'type': 1  # Application windows only
    }
})

# Filter by window title with glob patterns
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'title': 'My App*'  # Glob pattern support
    }
})

# Filter by Z-order layer (higher = on top)
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'layer': 100  # Windows with layer >= 100
    }
})

# Filter by window state
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'isActive': True,
        'isFocused': True
    }
})

# Filter for picture-in-picture windows
windows = driver.execute_script('mobile: listWindows', {
    'filters': {
        'isInPictureInPictureMode': True
    }
})
```

### Skipping Screenshots

By default, for Android 14 (U / API level 34) or later, the method attempts to take screenshots of
each window. This can be skipped for better performance:

```python
windows = driver.execute_script('mobile: listWindows', {
    'skipScreenshots': True
})
```

### Practical Use Cases

**1. Debugging Window Visibility Issues:**
```python
# Check if the application window is visible
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
# First, list all displays to understand the display structure
displays = driver.execute_script('mobile: listDisplays')
for display in displays:
    print(f"Logical Display ID: {display['id']}")
    print(f"  Name: {display['name']}")
    print(f"  Physical ID: {display['physicalId']}")
    if display.get('virtualId'):
        print(f"  Virtual ID: {display['virtualId']}")
    print(f"  Is default: {display['isDefault']}")
    print(f"  Size: {display['metrics']['widthPixels']}x{display['metrics']['heightPixels']}")

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

**4. Finding Active or Focused Windows:**
```python
# Find the currently active window
active_windows = driver.execute_script('mobile: listWindows', {
    'filters': {'isActive': True}
})

# Find windows with input focus
focused_windows = driver.execute_script('mobile: listWindows', {
    'filters': {'isFocused': True}
})

# Find the topmost window (highest layer) from the app
app_windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})
if app_windows:
    topmost = max(app_windows, key=lambda w: w['layer'])
    print(f"Topmost window layer: {topmost['layer']}")
```

**5. Using Display Information:**
```python
# Get display information using mobile: listDisplays
displays = driver.execute_script('mobile: listDisplays')

# Find the default display
default_display = next((d for d in displays if d['isDefault']), None)
if default_display:
    print(f"Default display: {default_display['id']}")
    print(f"  Physical ID: {default_display['physicalId']}")
    print(f"  Density: {default_display['metrics']['density']}")

# Use display metrics to calculate coordinates
for display in displays:
    metrics = display['metrics']
    center_x = metrics['widthPixels'] / 2
    center_y = metrics['heightPixels'] / 2
    print(f"Display {display['id']} center: ({center_x}, {center_y})")
```

## Managing Displays

The [`mobile: listDisplays`](../reference/execute-methods.md#mobile-listdisplays) command provides
information about all displays available on the device, including both logical and physical display
identifiers along with detailed metrics.

All the following examples are written in Python.

### Basic Usage

```python
# List all displays
displays = driver.execute_script('mobile: listDisplays')

# Print information about each display
for display in displays:
    print(f"Logical Display ID: {display['id']}")
    print(f"  Name: {display['name']}")
    print(f"  Physical ID: {display['physicalId']}")
    if display.get('virtualId'):
        print(f"  Virtual ID: {display['virtualId']}")
    print(f"  Is default: {display['isDefault']}")
    print(f"  Size: {display['metrics']['widthPixels']}x{display['metrics']['heightPixels']}")
    print(f"  Density: {display['metrics']['density']} ({display['metrics']['densityDpi']} DPI)")
    print("---")
```

### Understanding Display Metrics

Each display includes detailed metrics that can be useful for:

- Calculating screen coordinates
- Understanding display density for scaling
- Determining display capabilities

```python
displays = driver.execute_script('mobile: listDisplays')
for display in displays:
    metrics = display['metrics']

    # Calculate display center
    center_x = metrics['widthPixels'] / 2
    center_y = metrics['heightPixels'] / 2

    # Calculate density-independent pixels (dp)
    dp_width = metrics['widthPixels'] / metrics['density']
    dp_height = metrics['heightPixels'] / metrics['density']

    print(f"Display {display['id']}:")
    print(f"  Physical pixels: {metrics['widthPixels']}x{metrics['heightPixels']}")
    print(f"  Density-independent: {dp_width:.1f}x{dp_height:.1f} dp")
    print(f"  Center: ({center_x}, {center_y})")
    print(f"  Physical DPI: {metrics['xdpi']:.1f}x{metrics['ydpi']:.1f}")
```

### Finding the Default Display

```python
displays = driver.execute_script('mobile: listDisplays')
default_display = next((d for d in displays if d['isDefault']), None)

if default_display:
    print(f"Default display ID: {default_display['id']}")
    print(f"Default display physical ID: {default_display['physicalId']}")
```

### Retrieving Display Screenshots

The `physicalId` property returned by this execute method can be used to retrieve screenshots of
specific displays, by passing the value to [`mobile: screenshots`](../reference/execute-methods.md#mobile-screenshots):

```python
# Get physical display IDs
displays = driver.execute_script('mobile: listDisplays')

# Take screenshot of each display
for display in displays:
    if display.get('physicalId'):
        screenshots = driver.execute_script('mobile: screenshots', {
            'displayId': display['physicalId']
        })
        print(f"Screenshot taken for display {display['id']} (physical: {display['physicalId']})")
```

## Compatible Locator Strategies

Not all element locator strategies supported by the UiAutomator2 driver are equally suitable for
use with multi-window/multi-display applications.

### UiObject2-Based Locators

UiObject2-based locators support multi-window scenarios. This includes the following strategies:

- [`id`](../reference/locator-strategies.md#id)
- [`accessibility id`](../reference/locator-strategies.md#accessibility-id)
- [`class name`](../reference/locator-strategies.md#class-name)
- [`xpath`](../reference/locator-strategies.md#xpath) (when used with proper window context)

These locators work with the window selection logic controlled by the
[`enableMultiWindows`](../reference/settings.md#enablemultiwindows), [`currentDisplayId`](../reference/settings.md#currentdisplayid)
and [`enableTopmostWindowFromActivePackage`](../reference/settings.md#enabletopmostwindowfromactivepackage)
settings.

### UiObject-Based Selectors

The [`-android uiautomator`](../reference/locator-strategies.md#uiautomator) locator strategy uses
the legacy `UiSelector` API, which:

- **Does not support multi-window lookups**
- Only searches within the active window
- Cannot access elements in other windows even when `enableMultiWindows` is enabled
- Should be avoided for multi-window scenarios

## Relevant Driver Settings

### [`currentDisplayId`](../reference/settings.md#currentdisplayid)

This setting determines which display is used for element lookup operations when using
UiObject2-based locators.

**How it works:**

- When set to a specific display ID, all element lookups are scoped to that display
- Only windows from the specified display are considered during element search
- This setting is applied to `BySelector` objects via the `displayId()` method
- If the specified display ID doesn't exist, an error is thrown
- Set to `-1` to reset the setting to its default behavior (use the default display)

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

**Example (Python):**

```python
# Set display 1 as current
driver.update_settings({'currentDisplayId': 1})

# Now all element lookups will search only on display 1
element = driver.find_element('id', 'myButton')

# Coordinate-based gestures will now target display 1
driver.execute_script('mobile: clickGesture', {'x': 100, 'y': 200})

# Reset to default display
driver.update_settings({'currentDisplayId': 0})

# Gestures will now target the default display
driver.execute_script('mobile: clickGesture', {'x': 100, 'y': 200})
```

### [`enableMultiWindows`](../reference/settings.md#enablemultiwindows)

This setting controls whether multiple windows are included in the accessibility tree used for
element location and page source generation.

**When `false` (default):**

- Only the active window's root node is retrieved
- Element lookups search only within the active window
- Page source contains only the active window's hierarchy
- This is the fastest and most common configuration

**When `true`:**

- All accessible windows are retrieved and included in the accessibility tree
- Element lookups can find elements across all windows
- Page source includes content from all windows
- Useful for interacting with system windows (like keyboards) or overlay windows
- The [`window-id`](../reference/element-attributes.md#window-id) element attribute can be used to
  tune element queries

**Example (Python):**

```python
# Enable multi-window mode
driver.update_settings({'enableMultiWindows': True})

# Now it is possible to find elements in the on-screen keyboard or other windows
keyboard_key = driver.find_element('id', 'keyboard_key_a')
```

**Important considerations:**

- Enabling this setting may impact performance as more windows need to be processed
- The window selection logic also depends on `enableTopmostWindowFromActivePackage`
- This setting affects both element location and page source generation

### [`enableTopmostWindowFromActivePackage`](../reference/settings.md#enabletopmostwindowfromactivepackage)

This setting determines which window from the active application package is used when
`enableMultiWindows` is `false`.

**When `false` (default):**

- Uses `getRootInActiveWindow()` to get the active window root
- This is the window that currently has focus
- May not be the topmost window if the app has multiple windows

**When `true`:**

- Searches all windows from the active package
- Selects the window with the highest Z-order (topmost layer)
- Useful when an app has multiple windows and the topmost one should be interacted with

**Example (Python):**

```python
# Enable topmost window selection
driver.update_settings({'enableTopmostWindowFromActivePackage': True})

# Now element lookups will use the topmost window from the app
element = driver.find_element('id', 'myButton')
```

**Interaction with `enableMultiWindows`:**

- When `enableMultiWindows` is `true`, this setting is ignored (all windows are included)
- When `enableMultiWindows` is `false` and this setting is `true`, only the topmost window from the active package is used
- When both are `false`, the active window is used

### Combining Settings

The interaction between `enableMultiWindows` and `currentDisplayId` determines which windows are
included for page source (XML hierarchy) generation and UiObject2-based element lookup:

- `enableMultiWindows` is `true` + `currentDisplayId` is set
    - Only windows belonging to the specified display are included in the page source
    - Each window's hierarchy from that display is merged into the XML tree
    - Fastest multi-window configuration since it's limited to one display
    - Elements from windows on other displays are not visible in the page source
- `enableMultiWindows` is `true` + `currentDisplayId` is not set
    - All accessible windows from all displays are included in the page source
    - Each window's hierarchy is merged into the XML tree
    - Elements can originate from multiple sources: the main application window, on-screen keyboard,
      system dialogs, overlay windows, other application windows (in split-screen mode), and windows
      from all connected displays
- `enableMultiWindows` is `false` + `currentDisplayId` is set
    - Only the active window's hierarchy is included
    - `currentDisplayId` is effectively ignored in this case, as only the active window is used
      regardless of which display it's on
    - Fastest generation time
    - Smallest XML output
    - Elements from other windows are not visible in the page source
- `enableMultiWindows` is `false` + `currentDisplayId` is not set
    - Only the active window's hierarchy is included (or topmost window if
      `enableTopmostWindowFromActivePackage` is `true`)
    - Fastest generation time
    - Smallest XML output
    - Elements from other windows are not visible in the page source

## Best Practices

1. Use UiObject2-based locators (`id`, `accessibility id`, `class name`) instead of legacy
   `-android uiautomator` selectors for multi-window scenarios

2. Start with default settings and only enable `enableMultiWindows` when interaction with multiple
   windows is required

3. Use `currentDisplayId` when testing on devices with multiple displays

4. Enable `enableTopmostWindowFromActivePackage` when the app under test has multiple windows, and
   only the visible one is needed

5. Reset the accessibility cache using [`mobile: resetAccessibilityCache`](../reference/execute-methods.md#mobile-resetaccessibilitycache)
   if encountering stale element references after window changes

6. List windows using [`mobile: listWindows`](../reference/execute-methods.md#mobile-listwindows)
   to understand the window structure before writing locators. Use filtering to find specific
   windows and verify which windows are accessible for element location.

## Examples

### Split-Screen Application

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

# Filter to find windows from the app
app_windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})
print(f"Found {len(app_windows)} windows from the app")

# Find elements - now searches across all windows
element = driver.find_element('id', 'myButton')

# Get page source - includes all windows
source = driver.get_page_source()
```

### Multiple Displays

```python
displays = driver.execute_script('mobile: listDisplays')

# Set the current display for element lookups
driver.update_settings({'currentDisplayId': displays[1]['id']})

# All subsequent element lookups will search on the second display
element = driver.find_element('id', 'myButton')

# Screenshots will also be taken from the second display
screenshot = driver.get_screenshot_as_base64()

# Reset to default display (using -1)
driver.update_settings({'currentDisplayId': -1})
```

## Taking Screenshots

Screenshots are an important part of multi-window and multi-display testing. The UiAutomator2
driver provides two methods for taking screenshots that work with multiple displays.

### Standard Approach

The standard screenshotting approach works with the `currentDisplayId` setting:

- Standard screenshots (`getScreenshot()`, `get_screenshot_as_base64()`, etc.) will capture the
  specified display
- The driver automatically detects if the display has custom density or is a non-default display
- For better compatibility with custom displays, the driver may use the `screencap` command instead
  of the standard screenshot API
- If the device under test is an emulator and has a virtual display, then it is only possible to
  take the virtual display screenshot since Android 14 (U / API level 34)

**Example (Python):**

```python
# Set display 1 as current
driver.update_settings({'currentDisplayId': 1})

# This screenshot will be from display 1
screenshot = driver.get_screenshot_as_base64()

# Reset to default display (using -1)
driver.update_settings({'currentDisplayId': -1})

# Now screenshots will be from the default display
screenshot = driver.get_screenshot_as_base64()
```

### mobile: screenshots

The [`mobile: screenshots`](../reference/execute-methods.md#mobile-screenshots) execute method
provides more control over multi-display screenshot capture, by allowing to specify the target
display using its identifier.

It is important to note that the display identifiers used by this method are _physical or virtual
display IDs_, which are _different_ from the _logical_ display IDs used by `currentDisplayId`
setting:

- **Logical display ID** (`currentDisplayId`): Used for element location, window operations, and
  standard screenshots. Typically starts at 0. Can be retrieved from the `id` field returned by
  `mobile: listDisplays`.
- **Physical display ID** (`mobile: screenshots`): Used for the `mobile: screenshots` method with
  physical displays. Returned as a string to avoid JavaScript number precision issues. Can be
  retrieved from:
    - The `physicalId` field returned by `mobile: listDisplays` (recommended)
    - The `physicalDisplayId` field returned by `mobile: listWindows` (note: this is a string)
    - The `adb shell dumpsys SurfaceFlinger --display-id` command output
- **Virtual display ID** (`mobile: screenshots`): Used for the `mobile: screenshots` method with
  virtual displays. Returned as a string. Can be retrieved from:
    - The `virtualId` field returned by `mobile: listDisplays` (recommended)
    - The `virtualDisplayId` field returned by `mobile: listWindows` (note: this is a string)
    - The `adb shell dumpsys SurfaceFlinger --display-id` command output

**Taking Screenshots of All Displays:**

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

**Taking Screenshot of a Specific Display:**

It is possible to use `mobile: listDisplays` to get physical or virtual display IDs, then pass them
to `mobile: screenshots`:

```python
# Get display ID from mobile: listDisplays (recommended)
displays = driver.execute_script('mobile: listDisplays')

# For physical displays, use physicalId
if displays and displays[0].get('physicalId') is not None:
    display_id = displays[0]['physicalId']

    # Use the physical display ID to take a screenshot
    screenshots = driver.execute_script('mobile: screenshots', {
        'displayId': display_id
    })

    # Returns a dictionary with one entry
    display_info = screenshots[display_id]
    screenshot_data = display_info['payload']  # base64-encoded PNG

# For virtual displays, use virtualId
elif displays and displays[0].get('virtualId') is not None:
    display_id = displays[0]['virtualId']

    # Use the virtual display ID to take a screenshot
    screenshots = driver.execute_script('mobile: screenshots', {
        'displayId': display_id
    })

    # Returns a dictionary with one entry
    display_info = screenshots[display_id]
    screenshot_data = display_info['payload']  # base64-encoded PNG
else:
    print("Display ID not available")
```

The display ID can also be retrieved from `mobile: listWindows`:

```python
# Get display ID from a window
windows = driver.execute_script('mobile: listWindows', {
    'filters': {'packageName': 'com.example.myapp'}
})

if windows:
    window = windows[0]
    display_id = None

    # Prefer physical display ID, fall back to virtual if available
    if window.get('physicalDisplayId') is not None:
        display_id = window['physicalDisplayId']
    elif window.get('virtualDisplayId') is not None:
        display_id = window['virtualDisplayId']

    if display_id:
        # Use the display ID to take a screenshot
        screenshots = driver.execute_script('mobile: screenshots', {
            'displayId': display_id
        })

        # Returns a dictionary with one entry
        display_info = screenshots[display_id]
        screenshot_data = display_info['payload']  # base64-encoded PNG
    else:
        print("Display ID not available for this window")
```

### Best Practices

1. Use `currentDisplayId` for standard screenshots when they should match the current testing 
   context
2. Use `mobile: screenshots` when requiring screenshots from multiple displays simultaneously, or
   targeting specific physical or virtual displays
3. Be aware of the difference between logical display IDs (`currentDisplayId`) and physical/virtual
   display IDs (`mobile: screenshots`)
4. Use `mobile: listDisplays` to get display IDs: the `physicalId` field (for physical displays) or
   `virtualId` field (for virtual displays), both returned as strings, can be used directly with
   `mobile: screenshots`
5. Use `mobile: listWindows` to understand which windows are on which displays: the
   `physicalDisplayId` field (for physical displays) or `virtualDisplayId` field (for virtual
   displays), both returned as strings, can also be used with `mobile: screenshots` when taking a
   screenshot of the display containing a specific window
6. Alternative: Use `adb shell dumpsys SurfaceFlinger --display-id` for finding all display IDs
   without using the driver methods

## References

- [Android Multi-Window Support](https://developer.android.com/guide/topics/large-screens/multi-window-support)
- [AccessibilityWindowInfo API](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo)
- [UiAutomator2 Server Source Code](https://github.com/appium/appium-uiautomator2-server)
