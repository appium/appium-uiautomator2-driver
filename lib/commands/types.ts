import {Rect, StringRecord} from '@appium/types';

/**
 * Represents options for pressing a key on an Android device.
 */
export interface PressKeyOptions {
  /**
   * A valid Android key code. See https://developer.android.com/reference/android/view/KeyEvent
   * for the list of available key codes.
   */
  keycode: number;
  /**
   * An integer in which each bit set to 1 represents a pressed meta key. See
   * https://developer.android.com/reference/android/view/KeyEvent for more details.
   */
  metastate?: number;
  /**
   * Flags for the particular key event. See
   * https://developer.android.com/reference/android/view/KeyEvent for more details.
   */
  flags?: string;
  /**
   * Whether to emulate long key press. Defaults to `false`.
   */
  isLongPress: boolean;
}

export interface AcceptAlertOptions {
  /**
   * The name of the button to click in order to accept the alert. If the name is not provided
   * then the script will try to detect the button automatically.
   */
  buttonLabel?: string;
}

export interface DismissAlertOptions {
  /**
   * The name of the button to click in order to dismiss the alert. If the name is not provided
   * then the script will try to detect the button automatically.
   */
  buttonLabel?: string;
}

export interface GetAppStringsOptions {
  /**
   * The language abbreviation to fetch app strings mapping for. If no
   * language is provided then strings for the default language on the device under test
   * would be returned. Examples: en, fr
   */
  language?: string;
}

export type BatteryState = -1 | 1 | 2 | 3 | 4 | 5;

export interface BatteryInfo {
  /**
   * Battery level in range [0.0, 1.0], where 1.0 means 100% charge.
   * -1 is returned if the actual value cannot be retrieved from the system.
   */
  level: number;
  /**
   * Battery state. The following values are possible:
   * BATTERY_STATUS_UNKNOWN = 1
   * BATTERY_STATUS_CHARGING = 2
   * BATTERY_STATUS_DISCHARGING = 3
   * BATTERY_STATUS_NOT_CHARGING = 4
   * BATTERY_STATUS_FULL = 5
   * -1 is returned if the actual value cannot be retrieved from the system.
   */
  state: BatteryState;
}

export interface ReplaceValueOptions {
  /**
   * The id of the element whose content will be replaced.
   */
  elementId: string;
  /**
   * The actual text to set.
   */
  text: string;
}

export type MapKey<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & {
  [P in N]: T[K];
};

export interface DeepLinkOpts {
  /**
   * The name of URL to start.
   */
  url: string;
  /**
   * The name of the package to start the URI with.
   */
  package: string;
  /**
   * If `false` then adb won't wait for the started activity to return the control.
   * @defaultValue true
   */
  waitForLaunch?: boolean;
}

export interface TypingOptions {
  /**
   * The text to type. Can be a string, number or boolean.
   */
  text: string | number | boolean;
}
export interface InstallOptions {
  /**
   * Set to true in order to allow test packages installation.
   * @defaultValue false
   */
  allowTestPackages?: boolean;
  /**
   * Set to true to install the app on sdcard instead of the device memory.
   * @defaultValue false
   */
  useSdcard?: boolean;
  /**
   * Set to true in order to grant all the permissions requested in the application's manifest
   * automatically after the installation is completed under Android 6+.
   * @defaultValue false
   */
  grantPermissions?: boolean;
  /**
   * Set it to false if you don't want the application to be upgraded/reinstalled
   * if it is already present on the device.
   * @defaultValue true
   */
  replace?: boolean;
  /**
   * Install apks partially. It is used for 'install-multiple'.
   * https://android.stackexchange.com/questions/111064/what-is-a-partial-application-install-via-adb
   * @defaultValue false
   */
  partialInstall?: boolean;
}

export interface InstallMultipleApksOptions {
  /**
   * The list of APKs to install. Each APK should be a path to a apk
   * or downloadable URL as HTTP/HTTPS.
   */
  apks: string[];
  /**
   * The installation options.
   */
  options?: InstallOptions;
}
export interface BackgroundAppOptions {
  /**
   * The amount of seconds to wait between putting the app to background and restoring it.
   * Any negative value means to not restore the app after putting it to background.
   * @defaultValue -1
   */
  seconds?: number;
}

export interface ClickOptions {
  /**
   * The id of the element to be clicked. If the element is missing then both click offset coordinates must be provided. If both the element id and offset are provided then the coordinates are parsed as relative offsets from the top left corner of the element.
   */
  elementId?: string;
  /**
   * The x coordinate to click on.
   */
  x?: number;
  /**
   * The y coordinate to click on.
   */
  y?: number;
}

export interface LongClickOptions {
  /**
   * The id of the element to be clicked.
   * If the element is missing then both click offset coordinates must be provided.
   * If both the element id and offset are provided then the coordinates
   * are parsed as relative offsets from the top left corner of the element.
   */
  elementId?: string;
  /**
   * The x coordinate to click on.
   */
  x?: number;
  /**
   * The y coordinate to click on.
   */
  y?: number;
  /**
   * Click duration in milliseconds. The value must not be negative.
   * Default is 500.
   */
  duration?: number;
}

export type DoubleClickOptions = ClickOptions;

export interface DragOptions {
  /**
   * The id of the element to be dragged.
   * If the element id is missing then the start coordinates must be provided.
   * If both the element id and the start coordinates are provided then these
   * coordinates are considered as offsets from the top left element corner.
   */
  elementId?: string;
  /**
   * The x coordinate where the dragging starts
   */
  startX?: number;
  /**
   * The y coordinate where the dragging starts
   */
  startY?: number;
  /**
   * The x coordinate where the dragging ends
   */
  endX?: number;
  /**
   * The y coordinate where the dragging ends
   */
  endY?: number;
  /**
   * The speed at which to perform this gesture in pixels per second.
   * The value must not be negative.
   * Default is 2500 * displayDensity.
   */
  speed?: number;
}

export interface FlingOptions {
  /**
   * The id of the element to be flinged.
   * If the element id is missing then fling bounding area must be provided.
   * If both the element id and the fling bounding area are provided then this
   * area is effectively ignored.
   */
  elementId?: string;
  /**
   * The left coordinate of the fling bounding area.
   */
  left?: number;
  /**
   * The top coordinate of the fling bounding area.
   */
  top?: number;
  /**
   * The width of the fling bounding area.
   */
  width?: number;
  /**
   * The height of the fling bounding area.
   */
  height?: number;
  /**
   * Direction of the fling.
   * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
   */
  direction: string;
  /**
   * The speed at which to perform this gesture in pixels per second.
   * The value must be greater than the minimum fling velocity for the given view (50 by default).
   * Default is 7500 * displayDensity.
   */
  speed?: number;
}

export interface PinchOptions {
  /**
   * The id of the element to be pinched.
   * If the element id is missing then pinch bounding area must be provided.
   * If both the element id and the pinch bounding area are provided then the
   * area is effectively ignored.
   */
  elementId?: string;
  /**
   * The left coordinate of the pinch bounding area.
   */
  left?: number;
  /**
   * The top coordinate of the pinch bounding area.
   */
  top?: number;
  /**
   * The width of the pinch bounding area.
   */
  width?: number;
  /**
   * The height of the pinch bounding area.
   */
  height?: number;
  /**
   * The size of the pinch as a percentage of the pinch area size.
   * Valid values must be float numbers in range 0..1, where 1.0 is 100%
   */
  percent: number;
  /**
   * The speed at which to perform this gesture in pixels per second.
   * The value must not be negative.
   * Default is 2500 * displayDensity.
   */
  speed?: number;
}

export interface SwipeOptions {
  /**
   * The id of the element to be swiped.
   * If the element id is missing then swipe bounding area must be provided.
   * If both the element id and the swipe bounding area are provided then the
   * area is effectively ignored.
   */
  elementId?: string;
  /**
   * The left coordinate of the swipe bounding area.
   */
  left?: number;
  /**
   * The top coordinate of the swipe bounding area.
   */
  top?: number;
  /**
   * The width of the swipe bounding area.
   */
  width?: number;
  /**
   * The height of the swipe bounding area.
   */
  height?: number;
  /**
   * Direction of the swipe.
   * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
   */
  direction: string;
  /**
   * The size of the swipe as a percentage of the swipe area size.
   * Valid values must be float numbers in range 0..1, where 1.0 is 100%.
   */
  percent: number;
  /**
   * The speed at which to perform this gesture in pixels per second.
   * The value must not be negative.
   * Default is 5000 * displayDensity.
   */
  speed?: number;
}
export interface ScrollGestureOptions {
  /**
   * The id of the element to be scrolled.
   * If the element id is missing then scroll bounding area must be provided.
   * If both the element id and the scroll bounding area are provided then this
   * area is effectively ignored.
   */
  elementId?: string;
  /**
   * The left coordinate of the scroll bounding area.
   */
  left?: number;
  /**
   * The top coordinate of the scroll bounding area.
   */
  top?: number;
  /**
   * The width of the scroll bounding area.
   */
  width?: number;
  /**
   * The height of the scroll bounding area.
   */
  height?: number;
  /**
   * Direction of the scroll.
   * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
   */
  direction: string;
  /**
   * The size of the scroll as a percentage of the scrolling area size.
   * Valid values must be float numbers greater than zero, where 1.0 is 100%.
   */
  percent: number;
  /**
   * The speed at which to perform this gesture in pixels per second.
   * The value must not be negative.
   * Default is 5000 * displayDensity.
   */
  speed?: number;
}

export interface ScrollElementToElementOpts {
  /**
   * The identifier of the scrollable element, which is going to be scrolled.
   * It is required this element is a valid scrollable container and it was located
   * by `-android uiautomator` strategy.
   */
  elementId: string;
  /**
   * The identifier of the item, which belongs to the scrollable element above,
   * and which should become visible after the scrolling operation is finished.
   * It is required this element was located by `-android uiautomator` strategy.
   */
  elementToId: string;
}

export interface ScrollOptions {
  /**
   * The identifier of an element. It is required this element is a valid scrollable container
   * and it was located by `-android uiautomator` strategy.
   * If this property is not provided then the first currently available scrollable view
   * is selected for the interaction.
   */
  elementId?: string;
  /**
   * The following strategies are supported:
   * - `accessibility id` (UiSelector().description)
   * - `class name` (UiSelector().className)
   * - `-android uiautomator` (UiSelector)
   */
  strategy: string;
  /**
   * The corresponding lookup value for the given strategy.
   */
  selector: string;
  /**
   * The maximum number of swipes to perform on the target scrollable view in order to reach
   * the destination element. In case this value is unset then it would be retrieved from the
   * scrollable element itself (via `getMaxSearchSwipes()` property).
   */
  maxSwipes?: number;
  /**
   * @deprecated
   */
  element?: string;
}

export type RelativeRect = Pick<Rect, 'width' | 'height'> & {left: Rect['x']; top: Rect['y']};

export interface Screenshot {
  /**
   * Display identifier
   */
  id: string;
  /**
   * Display name
   */
  name?: string;
  /**
   * Is this the default display
   */
  isDefault: boolean;
  /**
   * Actual PNG screenshot encoded as base64
   */
  payload: string;
}

export interface ScreenshotsOpts {
  /**
   * Android display identifier to take a screenshot for.
   * If not provided then screenshots of all displays are going to be returned.
   * If no matches were found then an error is thrown.
   */
  displayId?: number | string;
}

export interface ActionResult {
  repeats: number;
  stepResults: StringRecord[][];
}

export interface ActionArgs {
  name: string;
}

export interface SetClipboardOpts {
  /**
   * Base64-encoded clipboard payload
   */
  content: string;
  /**
   * Only a single content type is supported, which is 'plaintext'
   */
  contentType?: 'plaintext';
  /**
   * Optinal label to identify the current clipboard payload
   */
  label?: string;
}
