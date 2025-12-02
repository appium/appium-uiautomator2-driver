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
- A `type` indicating the window type (application, input method, system, etc.)
- A `title` (may be null)
- A `physicalDisplayId` (physical display identifier, may be null) - returned as a string
- A `virtualDisplayId` (virtual display identifier, may be null) - only set for virtual displays
- State flags: `isActive`, `isFocused`, `isAccessibilityFocused`, `isInPictureInPictureMode`

You can list all available windows using the [`mobile: listWindows`](../README.md#mobile-listwindows) command, which is essential for understanding the window structure in multi-window scenarios.

### Displays

A **display** (also called a logical display) is a virtual screen that can contain multiple windows. Each display has:
- A `displayId` identifier (typically `0` for the default display) - this is the logical display ID
- A `name` (display name, may be null)
- A `physicalId` (physical display identifier) that maps to the actual hardware display
- A `virtualId` (virtual display identifier, may be null) - only set for virtual displays
- Display metrics (width, height, density, DPI, etc.)

On Android, the default display (`displayId = 0`) is always present. Additional displays can be created for:
- External monitors connected via USB-C or HDMI
- Wireless displays
- Virtual displays created by applications

You can list all available displays using the [`mobile: listDisplays`](../README.md#mobile-listdisplays) command to see both logical and physical display identifiers along with their metrics.

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

The `mobile: listWindows` method supports many filter options:

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

# Find the topmost window (highest layer) from your app
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

## Using `mobile: listDisplays` to Inspect Display Information

The [`mobile: listDisplays`](../README.md#mobile-listdisplays) command provides information about all displays available on the device, including both logical and physical display identifiers along with detailed metrics.

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

### Getting Physical Display IDs for Screenshots

The `physicalId` from `mobile: listDisplays` is the recommended way to get physical display IDs for use with `mobile: screenshots`:

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
- Set to `-1` to reset the setting to its default behavior (use the default display)

**Example:**
```python
# Set the current display to display 1
driver.update_settings({'currentDisplayId': 1})

# Now all element lookups will search only on display 1
element = driver.find_element('id', 'myButton')

# Reset to default display behavior
driver.update_settings({'currentDisplayId': -1})
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

# Reset to default display (using -1)
driver.update_settings({'currentDisplayId': -1})
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

# Reset to default display (using -1)
driver.update_settings({'currentDisplayId': -1})

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

**Recommended approach:** Use `mobile: listDisplays` to get physical or virtual display IDs:

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

**Alternative approach:** Get display ID from `mobile: listWindows`:

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

**Direct usage:** You can also use a known physical or virtual display ID directly:

```python
# Get screenshot of a specific physical display ID
screenshots = driver.execute_script('mobile: screenshots', {
    'displayId': '1234567890'  # Physical display ID (string)
})

# Or use a virtual display ID
screenshots = driver.execute_script('mobile: screenshots', {
    'displayId': '12345'  # Virtual display ID (string)
})

# Returns a dictionary with one entry
display_info = screenshots['1234567890']  # or '12345' for virtual
screenshot_data = display_info['payload']  # base64-encoded PNG
```

#### Understanding Display Identifiers

**Important:** The display identifiers used by `mobile: screenshots` are **physical or virtual display IDs**, which are different from the logical display IDs used by `currentDisplayId` setting.

- **Logical display ID** (`currentDisplayId`): Used for element location, window operations, and standard screenshots. Typically starts at 0. You can get this from the `id` field returned by `mobile: listDisplays`.
- **Physical display ID** (`mobile: screenshots`): Used for the `mobile: screenshots` method with physical displays. Returned as a string to avoid JavaScript number precision issues. You can get this value from:
  - The `physicalId` field returned by `mobile: listDisplays` (recommended)
  - The `physicalDisplayId` field returned by `mobile: listWindows` (note: this is a string)
  - The `adb shell dumpsys SurfaceFlinger --display-id` command output
- **Virtual display ID** (`mobile: screenshots`): Used for the `mobile: screenshots` method with virtual displays. Returned as a string. You can get this value from:
  - The `virtualId` field returned by `mobile: listDisplays` (recommended)
  - The `virtualDisplayId` field returned by `mobile: listWindows` (note: this is a string)
  - The `adb shell dumpsys SurfaceFlinger --display-id` command output

**Example workflow:**
```python
# 1. List displays to see all available displays with their IDs
displays = driver.execute_script('mobile: listDisplays')
for display in displays:
    print(f"Logical Display ID: {display['id']}")
    print(f"  Physical ID: {display['physicalId']}")
    if display.get('virtualId'):
        print(f"  Virtual ID: {display['virtualId']}")
    print(f"  Is default: {display['isDefault']}")
    print(f"  Size: {display['metrics']['widthPixels']}x{display['metrics']['heightPixels']}")

# 2. List windows to see which windows are on which displays
windows = driver.execute_script('mobile: listWindows', {})
for window in windows:
    print(f"Window ID: {window['windowId']}")
    print(f"  Logical display ID: {window['displayId']}")
    print(f"  Physical display ID: {window['physicalDisplayId']}")  # Note: string type
    if window.get('virtualDisplayId'):
        print(f"  Virtual display ID: {window['virtualDisplayId']}")
    print(f"  Package: {window['packageName']}")
    print(f"  Type: {window['type']}, Layer: {window['layer']}")

# 3. Use currentDisplayId for element operations (logical display)
driver.update_settings({'currentDisplayId': 0})  # Or use -1 to reset to default
element = driver.find_element('id', 'myButton')

# 4. Use mobile: screenshots with physical or virtual display IDs
# Get display ID from mobile: listDisplays (recommended)
default_display = next((d for d in displays if d['isDefault']), None)
if default_display:
    # Prefer physical ID, fall back to virtual ID if available
    display_id = default_display.get('physicalId') or default_display.get('virtualId')
    if display_id:
        screenshots = driver.execute_script('mobile: screenshots', {
            'displayId': display_id
        })
        display_info = screenshots[display_id]
        screenshot_data = display_info['payload']
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
2. **Use `mobile: screenshots`** when you need screenshots from multiple displays simultaneously or want to target specific physical or virtual displays
3. **Be aware of the difference** between logical display IDs (`currentDisplayId`) and physical/virtual display IDs (`mobile: screenshots`)
4. **Use `mobile: listDisplays`** to get display IDs - This is the recommended way to obtain physical or virtual display IDs along with display metrics. The `physicalId` field (for physical displays) or `virtualId` field (for virtual displays), both returned as strings, can be used directly with `mobile: screenshots`
5. **Use `mobile: listWindows`** to understand which windows are on which displays - The `physicalDisplayId` field (for physical displays) or `virtualDisplayId` field (for virtual displays), both returned as strings, can also be used with `mobile: screenshots` if you need to screenshot the display containing a specific window
6. **Alternative: Use `adb shell dumpsys SurfaceFlinger --display-id`** if you need to find all display IDs without using the driver methods

## References

- [Android Multi-Window Support](https://developer.android.com/guide/topics/large-screens/multi-window-support)
- [AccessibilityWindowInfo API](https://developer.android.com/reference/android/view/accessibility/AccessibilityWindowInfo)
- [UiAutomator2 Server Source Code](https://github.com/appium/appium-uiautomator2-server)

