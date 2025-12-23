import type {AndroidUiautomator2Driver} from '../driver';
import type {BatteryInfo} from './types';

/**
 * Reads the battery information from the device under test.
 * @returns Battery information including level (0.0-1.0) and state (charging, discharging, etc.).
 */
export async function mobileGetBatteryInfo(this: AndroidUiautomator2Driver): Promise<BatteryInfo> {
  const result = (await this.uiautomator2.jwproxy.command('/appium/device/battery_info', 'GET', {})) as {
    status: BatteryInfo['state'];
    level: number;
  };
  const batteryInfo = result as any;
  // Give it the same name as in iOS
  batteryInfo.state = result.status;
  delete batteryInfo.status;
  return batteryInfo as BatteryInfo;
}

