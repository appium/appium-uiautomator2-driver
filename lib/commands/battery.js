let extensions = {}, commands = {};

/**
 * @typedef {Object} BatteryInfo
 *
 * @property {number} level - Battery level in range [0.0, 1.0], where
 *                            1.0 means 100% charge.
 *                             -1 is returned if the actual value cannot be
 *                            retrieved from the system.
 * @property {number} state - Battery state. The following values are possible:
 *   BATTERY_STATUS_UNKNOWN = 1
 *   BATTERY_STATUS_CHARGING = 2
 *   BATTERY_STATUS_DISCHARGING = 3
 *   BATTERY_STATUS_NOT_CHARGING = 4
 *   BATTERY_STATUS_FULL = 5
 *   -1 is returned if the actual value cannot be retrieved from the system.
 */

/**
 * Reads the battery information from the device under test.
 *
 * @returns {BatteryInfo} The actual battery info
 */
commands.mobileGetBatteryInfo = async function () {
  const result = await this.uiautomator2.jwproxy.command('/appium/device/battery_info', 'GET', {});
  // Give it the same name as in iOS
  result.state = result.status;
  delete result.status;
  return result;
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
