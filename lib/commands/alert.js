/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<string>}
 */
export async function getAlertText() {
  return String(
    await this.uiautomator2.jwproxy.command(
      '/alert/text',
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').AcceptAlertOptions} [opts={}]
 * @returns {Promise<void>}
 */
export async function mobileAcceptAlert(opts = {}) {
  await this.uiautomator2.jwproxy.command(
    '/alert/accept',
    'POST',
    opts
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<void>}
 */
export async function postAcceptAlert() {
  await this.mobileAcceptAlert();
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').DismissAlertOptions} [opts={}]
 * @returns {Promise<void>}
 */
export async function mobileDismissAlert(opts = {}) {
  await this.uiautomator2.jwproxy.command(
    '/alert/dismiss',
    'POST',
    opts
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<void>}
 */
export async function postDismissAlert() {
  await this.mobileDismissAlert();
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
