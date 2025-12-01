import {Rect, StringRecord} from '@appium/types';

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

export type MapKey<T, K extends keyof T, N extends string> = Pick<T, Exclude<keyof T, K>> & {
  [P in N]: T[K];
};

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

export interface ActionResult {
  repeats: number;
  stepResults: StringRecord[][];
}

export interface WindowFilters {
  /**
   * Package name pattern with glob support (e.g., 'com.example.*')
   */
  packageName?: string;
  /**
   * Window identifier
   */
  windowId?: number;
  /**
   * Display identifier
   */
  displayId?: number;
  /**
   * Physical display identifier
   */
  physicalDisplayId?: number;
}

export interface WindowInfo {
  /**
   * Window identifier (may be null)
   */
  windowId: number | null;
  /**
   * Display identifier where the window is located (may be null)
   */
  displayId: number | null;
  /**
   * Physical display identifier (may be null)
   */
  physicalDisplayId: number | null;
  /**
   * Window bounds rectangle
   */
  rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  /**
   * Package name of the application that owns this window (may be null)
   */
  packageName: string | null;
  /**
   * Base64-encoded PNG screenshot of the window (may be null).
   * Only available on Android API 34+ and when skipScreenshots is false.
   */
  screenshot: string | null;
}

export interface DisplayMetrics {
  /**
   * Display width in pixels
   */
  widthPixels: number;
  /**
   * Display height in pixels
   */
  heightPixels: number;
  /**
   * Display density (logical density factor)
   */
  density: number;
  /**
   * Display density in DPI
   */
  densityDpi: number;
  /**
   * Scaled density factor for fonts
   */
  scaledDensity: number;
  /**
   * Exact physical pixels per inch of the screen in the X dimension
   */
  xdpi: number;
  /**
   * Exact physical pixels per inch of the screen in the Y dimension
   */
  ydpi: number;
}

export interface DisplayInfo {
  /**
   * Display identifier (logical display ID)
   */
  id: number;
  /**
   * Physical display identifier (may be null). Returned as a string to avoid JavaScript number precision issues with large values.
   */
  physicalId: string | null;
  /**
   * Display metrics containing size and density information
   */
  metrics: DisplayMetrics;
  /**
   * Whether this is the default display
   */
  isDefault: boolean;
}
