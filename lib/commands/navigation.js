/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function setUrl(url) {
  await this.adb.startUri(url, /** @type {string} */ (this.opts.appPackage));
}

/**
 * Start URL that take users directly to specific content in the app
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').DeepLinkOpts} opts
 * @returns {Promise<void>}
 */
export async function mobileDeepLink(opts) {
  const {url, package: pkg, waitForLaunch} = opts;
  return await this.adb.startUri(url, pkg, {waitForLaunch});
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<void>}
 */
export async function back() {
  await this.adb.keyevent(4);
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
