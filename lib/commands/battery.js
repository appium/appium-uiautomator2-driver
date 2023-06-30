// @ts-check

import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2BatteryMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const BatteryMixin = {
  /**
   * Reads the battery information from the device under test.
   *
   * @returns The actual battery info
   */
  async mobileGetBatteryInfo() {
    const result = /** @type {import('./types').MapKey<BatteryInfo, 'state', 'status'>} */ (
      await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
        this.uiautomator2
      ).jwproxy.command('/appium/device/battery_info', 'GET', {})
    );
    const batteryInfo = /** @type {any} */ (result);
    // Give it the same name as in iOS
    batteryInfo.state = result.status;
    delete batteryInfo.status;
    return /** @type {BatteryInfo} */ (batteryInfo);
  },
};

mixin(BatteryMixin);

/**
 * @typedef {import('./types').BatteryInfo} BatteryInfo
 */
