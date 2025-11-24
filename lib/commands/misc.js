/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<string>}
 */
export async function getPageSource() {
  return String(
    await this.uiautomator2.jwproxy.command(
      '/source',
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('@appium/types').Orientation>}
 */
export async function getOrientation() {
  return /** @type {import('@appium/types').Orientation} */ (
    await this.uiautomator2.jwproxy.command(
      `/orientation`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('@appium/types').Orientation} orientation
 * @returns {Promise<void>}
 */
export async function setOrientation(orientation) {
  orientation = /** @type {import('@appium/types').Orientation} */ (orientation.toUpperCase());
  await this.uiautomator2.jwproxy.command(
    `/orientation`,
    'POST',
    {orientation}
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<void>}
 */
export async function openNotifications() {
  await this.uiautomator2.jwproxy.command(
    '/appium/device/open_notifications',
    'POST',
    {}
  );
}

/**
 * Stop proxying to any Chromedriver and redirect to uiautomator2
 * @this {AndroidUiautomator2Driver}
 * @returns {void}
 */
export function suspendChromedriverProxy() {
  if (!this.uiautomator2?.proxyReqRes || !this.uiautomator2?.proxyCommand) {
    return;
  }

  this.chromedriver = undefined;
  this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(
    this.uiautomator2
  );
  this.proxyCommand = /** @type {typeof this.proxyCommand} */ (
    this.uiautomator2.proxyCommand.bind(this.uiautomator2)
  );
  this.jwpProxyActive = true;
}

/**
 * Get information about all available displays
 * @returns {Promise<Object[]>} List of display information
 */
export async function mobileGetDisplayInfo () {
  return await this.uiautomator2.jwproxy.command(
    '/appium/device/display_info',
    'GET'
  );
};

/**
 * Get the page source for a specific display
 * @this {AndroidUiautomator2Driver}
 * @param {number} displayId
 * @returns {Promise<string>}
 */
export async function mobileGetPageSourceOnDisplay(displayId) {
  let endpoint = '/appium/source/on_display';

  if (displayId != null) {
    const numericDisplayId = typeof displayId === 'string' ? parseInt(displayId, 10) : displayId;
    if (isNaN(numericDisplayId)) {
      throw new Error('displayId must be a number if provided');
    }
    endpoint += `?displayId=${numericDisplayId}`;
  }

  return String(await this.uiautomator2.jwproxy.command(endpoint, 'GET'));
}

/**
 * The list of available info entries can be found at
 * https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/main/java/io/appium/uiautomator2/handler/GetDeviceInfo.java
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<StringRecord>}
 */
export async function mobileGetDeviceInfo() {
  return /** @type {StringRecord} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/device/info',
      'GET'
    )
  );
}

/**
 * @template [T=any]
 * @typedef {import('@appium/types').StringRecord<T>} StringRecord
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
