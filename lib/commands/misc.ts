import type {Orientation, StringRecord} from '@appium/types';
import type {AndroidUiautomator2Driver} from '../driver';

/**
 * Retrieves the current page source.
 * @returns The XML page source of the current screen.
 */
export async function getPageSource(this: AndroidUiautomator2Driver): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command('/source', 'GET', {}));
}

/**
 * Gets the current device orientation.
 * @returns The current device orientation ('LANDSCAPE' or 'PORTRAIT').
 */
export async function getOrientation(this: AndroidUiautomator2Driver): Promise<Orientation> {
  return (await this.uiautomator2.jwproxy.command(`/orientation`, 'GET', {})) as Orientation;
}

/**
 * Sets the device orientation.
 * @param orientation - The desired orientation ('LANDSCAPE' or 'PORTRAIT').
 */
export async function setOrientation(
  this: AndroidUiautomator2Driver,
  orientation: Orientation,
): Promise<void> {
  const normalizedOrientation = orientation.toUpperCase() as Orientation;
  await this.uiautomator2.jwproxy.command(`/orientation`, 'POST', {orientation: normalizedOrientation});
}

/**
 * Opens the device notification shade.
 */
export async function openNotifications(this: AndroidUiautomator2Driver): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/device/open_notifications', 'POST', {});
}

/**
 * Stops proxying to Chromedriver and restores UIA2 proxy.
 */
export function suspendChromedriverProxy(this: AndroidUiautomator2Driver): void {
  if (!this.uiautomator2?.proxyReqRes || !this.uiautomator2?.proxyCommand) {
    return;
  }

  this.chromedriver = undefined;
  this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);
  this.proxyCommand = this.uiautomator2.proxyCommand.bind(this.uiautomator2);
  this.jwpProxyActive = true;
}

/**
 * Retrieves device info via the UIA2 server.
 * @returns Device information as a string record.
 */
export async function mobileGetDeviceInfo(this: AndroidUiautomator2Driver): Promise<StringRecord> {
  return (await this.uiautomator2.jwproxy.command('/appium/device/info', 'GET')) as StringRecord;
}

/**
 * Resets the accessibility cache on the device.
 */
export async function mobileResetAccessibilityCache(this: AndroidUiautomator2Driver): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/reset_ax_cache', 'POST', {});
}

