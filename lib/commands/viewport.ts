import type {Rect, Size} from '@appium/types';
import type {AndroidUiautomator2Driver} from '../driver';
import type {RelativeRect} from './types';

/**
 * Gets the status bar height in pixels.
 * @returns The status bar height in pixels.
 */
export async function getStatusBarHeight(this: AndroidUiautomator2Driver): Promise<number> {
  const {statusBar} = (await this.uiautomator2.jwproxy.command(`/appium/device/system_bars`, 'GET', {})) as {
    statusBar: number;
  };
  return statusBar;
}

/**
 * Gets the device pixel ratio.
 * @returns The device pixel ratio as a string.
 */
export async function getDevicePixelRatio(this: AndroidUiautomator2Driver): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command('/appium/device/pixel_ratio', 'GET', {}));
}

/**
 * Gets the viewport rectangle coordinates.
 * @returns The viewport rectangle (left, top, width, height), accounting for status bar height.
 */
export async function getViewPortRect(this: AndroidUiautomator2Driver): Promise<RelativeRect> {
  const windowSize = await this.getWindowSize();
  const statusBarHeight = await this.getStatusBarHeight();
  // android returns the upscaled window size, so to get the true size of the
  // rect we have to downscale
  return {
    left: 0,
    top: statusBarHeight,
    width: windowSize.width,
    height: windowSize.height - statusBarHeight,
  };
}

/**
 * Returns the viewport coordinates.
 * @returns The viewport rectangle (left, top, width, height).
 */
export async function mobileViewPortRect(this: AndroidUiautomator2Driver): Promise<RelativeRect> {
  return await this.getViewPortRect();
}

/**
 * Gets the window rectangle (W3C endpoint).
 * @returns The window rectangle (x, y, width, height).
 */
export async function getWindowRect(this: AndroidUiautomator2Driver): Promise<Rect> {
  const {width, height} = await this.getWindowSize();
  return {
    width,
    height,
    x: 0,
    y: 0,
  };
}

/**
 * Gets the display density.
 * @returns The display density value.
 */
export async function getDisplayDensity(this: AndroidUiautomator2Driver): Promise<number> {
  return (await this.uiautomator2.jwproxy.command('/appium/device/display_density', 'GET', {})) as number;
}

/**
 * Gets the window size.
 * @returns The window size (width, height).
 */
export async function getWindowSize(this: AndroidUiautomator2Driver): Promise<Size> {
  return (await this.uiautomator2.jwproxy.command('/window/current/size', 'GET', {})) as Size;
}

