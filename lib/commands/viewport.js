// @ts-check

import {imageUtil} from 'appium/support';
import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2ViewportMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const ViewportMixin = {
  // memoized in constructor
  async getStatusBarHeight() {
    const {statusBar} = /** @type {{statusBar: number}} */ (
      await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
        this.uiautomator2
      ).jwproxy.command(`/appium/device/system_bars`, 'GET', {})
    );
    return statusBar;
  },

  // memoized in constructor
  async getDevicePixelRatio() {
    return String(
      await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
        this.uiautomator2
      ).jwproxy.command('/appium/device/pixel_ratio', 'GET', {})
    );
  },

  async getViewportScreenshot() {
    const screenshot = await this.getScreenshot();
    const rect = await this.getViewPortRect();
    return await imageUtil.cropBase64Image(screenshot, rect);
  },

  async getViewPortRect() {
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
  },
};

mixin(ViewportMixin);
