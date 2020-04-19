let commands = {}, helpers = {}, extensions = {};

commands.getAlertText = async function () {
  return await this.uiautomator2.jwproxy.command('/alert/text', 'GET', {});
};

/**
 * @typedef {Object} AcceptAlertOptions
 * @property {?string} buttonLabel - The name of the button to click in order to
 *                                   accept the alert. If the name is not provided
 *                                   then the script will try to detect the button
 *                                   automatically.
 */

/**
 * @param {AcceptAlertOptions} opts
 * @throws {InvalidElementStateError} If no matching button, that can accept the alert,
 *                                    can be found
 * @throws {NoAlertOpenError} If no alert is present
 */
commands.mobileAcceptAlert = async function (opts = {}) {
  return await this.uiautomator2.jwproxy.command('/alert/accept', 'POST', opts);
};

commands.postAcceptAlert = async function () {
  return await this.mobileAcceptAlert();
};

/**
 * @typedef {Object} DismissAlertOptions
 * @property {?string} buttonLabel - The name of the button to click in order to
 *                                   dismiss the alert. If the name is not provided
 *                                   then the script will try to detect the button
 *                                   automatically.
 */

/**
 * @param {DismissAlertOptions} opts
 * @throws {InvalidElementStateError} If no matching button, that can dismiss the alert,
 *                                    can be found
 * @throws {NoAlertOpenError} If no alert is present
 */
commands.mobileDismissAlert = async function (opts = {}) {
  return await this.uiautomator2.jwproxy.command('/alert/dismiss', 'POST', opts);
};

commands.postDismissAlert = async function () {
  return await this.mobileDismissAlert();
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
