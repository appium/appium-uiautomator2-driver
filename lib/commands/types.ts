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
