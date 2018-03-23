import log from '../logger';
import { util } from 'appium-support';


let extensions = {}, commands = {};

/**
 * @typedef {Object} SetClipboardOptions
 * @property {!Object} content - The content to be set.
 * @property {?string} contentType [plaintext] - The type of the content to set.
 *                                               Only `plaintext` is supported.
 * @property {?string} label - The actual label to be assigned to the clipboard
 *                             data. This is set to the first 10 characters of
 *                             `content` property by default.
 */

/**
 * Sets the primary clipboard's content on the device under test.
 *
 * @param {SetClipboardOptions} opts [{}] - The set of possible options
 */
commands.mobileSetClipboard = async function (opts = {}) {
  if (!util.hasValue(opts.content)) {
    log.errorAndThrow(`The 'content' argument is mandatory`);
  }
  return await this.uiautomator2.jwproxy.command('/appium/clipboard/set', 'POST', opts);
};

/**
 * @typedef {Object} ClipboardData
 * @property {?Object} content - The actual content of the clipboard or `null`
 *                               if it contains no data.
 * @property {string} contentType [plaintext] - The type of the actual clipboard content
 *                                              Only `plaintext` is supported.
 */

/**
 * Gets the content of the primary clipboard on the device under test.
 *
 * @param {Object} opts [{}] - The set of possible options.
 * @returns {ClipboardData} The actual clipboard content
 */
commands.mobileGetClipboard = async function (opts = {}) {
  return await this.uiautomator2.jwproxy.command('/appium/clipboard/get', 'POST', opts);
};


Object.assign(extensions, commands);
export { commands };
export default extensions;
