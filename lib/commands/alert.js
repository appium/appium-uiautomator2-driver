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
 * @param {string} [buttonLabel] The name of the button to click in order to accept the alert.
 * If the name is not provided
 * then the script will try to detect the button automatically.
 * @returns {Promise<void>}
 */
export async function mobileAcceptAlert(buttonLabel) {
  await this.uiautomator2.jwproxy.command(
    '/alert/accept',
    'POST',
    {buttonLabel}
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
 * @param {string} [buttonLabel] The name of the button to click in order to dismiss the alert.
 * If the name is not provided
 * then the script will try to detect the button automatically.
 * @returns {Promise<void>}
 */
export async function mobileDismissAlert(buttonLabel) {
  await this.uiautomator2.jwproxy.command(
    '/alert/dismiss',
    'POST',
    {buttonLabel}
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
