import type {AndroidUiautomator2Driver} from '../driver.js';
import type {WindowFilters, WindowInfo, DisplayInfo} from './types.js';

declare module '../driver.js' {
  interface AndroidUiautomator2Driver {
    mobileListWindows(...args: Parameters<typeof mobileListWindows>): ReturnType<typeof mobileListWindows>;
    mobileListDisplays(...args: Parameters<typeof mobileListDisplays>): ReturnType<typeof mobileListDisplays>;
  }
}

/**
 * Gets a list of windows on all displays.
 * For Android API 30+ (R), uses getWindowsOnAllDisplays().
 * For older APIs, uses getWindows().
 */
export async function mobileListWindows(
  this: AndroidUiautomator2Driver,
  filters?: WindowFilters,
  skipScreenshots?: boolean,
): Promise<WindowInfo[]> {
  return (await this.uiautomator2.jwproxy.command('/appium/list_windows', 'POST', {
    filters,
    skipScreenshots,
  })) as WindowInfo[];
}

/**
 * Gets a list of all displays available on the device.
 */
export async function mobileListDisplays(this: AndroidUiautomator2Driver): Promise<DisplayInfo[]> {
  return (await this.uiautomator2.jwproxy.command('/appium/list_displays', 'POST', {})) as DisplayInfo[];
}
