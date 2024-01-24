
/**
 * Reads the battery information from the device under test.
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('./types').BatteryInfo>} The actual battery info
 */
export async function mobileGetBatteryInfo() {
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
}

/**
 * @typedef {import('./types').BatteryInfo} BatteryInfo
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
