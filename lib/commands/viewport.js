
// memoized in constructor
/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<number>}
 */
export async function getStatusBarHeight() {
  const {statusBar} = /** @type {{statusBar: number}} */ (
    await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
      this.uiautomator2
    ).jwproxy.command(`/appium/device/system_bars`, 'GET', {})
  );
  return statusBar;
}

// memoized in constructor
/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<string>}
 */
export async function getDevicePixelRatio() {
  return String(
    await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
      this.uiautomator2
    ).jwproxy.command('/appium/device/pixel_ratio', 'GET', {})
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('./types').RelativeRect>}
 */
export async function getViewPortRect() {
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
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('./types').RelativeRect>} The viewport coordinates.
 */
export async function mobileViewPortRect() {
  return await this.getViewPortRect();
}

// For W3C
/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('@appium/types').Rect>}
 */
export async function getWindowRect() {
  const {width, height} = await this.getWindowSize();
  return {
    width,
    height,
    x: 0,
    y: 0,
  };
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<number>}
 */
export async function getDisplayDensity() {
  return /** @type {number} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/device/display_density',
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('@appium/types').Size>}
 */
export async function getWindowSize() {
  return /** @type {import('@appium/types').Size} */ (
    await this.uiautomator2.jwproxy.command(
      '/window/current/size',
      'GET',
      {}
    )
  );
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
