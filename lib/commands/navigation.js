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
 * @param {string} url The name of URL to start.
 * @param {string} [pkg] The name of the package to start the URI with.
 * @param {boolean} [waitForLaunch=true] If `false` then adb won't wait for
 * the started activity to return the control.
 * @returns {Promise<void>}
 */
export async function mobileDeepLink(url, pkg, waitForLaunch) {
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
