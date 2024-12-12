import _ from 'lodash';

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string|number} keycode
 * @param {number} [metastate]
 * @param {number} [flags]
 * @returns {Promise<void>}
 */
export async function pressKeyCode(keycode, metastate, flags) {
  await this.uiautomator2.jwproxy.command(
    '/appium/device/press_keycode',
    'POST',
    {
      keycode,
      metastate,
      flags,
    }
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string|number} keycode
 * @param {number} metastate
 * @param {number} [flags]
 * @returns {Promise<void>}
 */
export async function longPressKeyCode(keycode, metastate, flags) {
  await this.uiautomator2.jwproxy.command(
    '/appium/device/long_press_keycode',
    'POST',
    {
      keycode,
      metastate,
      flags,
    }
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').PressKeyOptions} opts
 * @returns {Promise<void>}
 */
export async function mobilePressKey(opts) {
  const {keycode, metastate, flags, isLongPress = false} = opts;

  await this.uiautomator2.jwproxy.command(
    `/appium/device/${isLongPress ? 'long_' : ''}press_keycode`,
    'POST',
    {
      keycode,
      metastate,
      flags,
    }
  );
}

/**
 * Types the given Unicode string.
 * It is expected that the focus is already put
 * to the destination input field before this method is called.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').TypingOptions} opts
 * @returns {Promise<boolean>} `true` if the input text has been successfully sent to adb
 * @throws {Error} if `text` property has not been provided
 */
export async function mobileType(opts) {
  const {text} = opts;
  if (_.isUndefined(text)) {
    throw this.log.errorWithException(`The 'text' argument is mandatory`);
  }
  return await this.settingsApp.typeUnicode(String(text));
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('appium-android-driver').SendKeysOpts} params
 * @returns {Promise<void>}
 */
export async function doSendKeys(params) {
  await this.uiautomator2.jwproxy.command(
    '/keys',
    'POST',
    params
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string|number} keycode
 * @param {number} [metastate]
 * @returns {Promise<void>}
 */
export async function keyevent(keycode, metastate) {
  this.log.debug(`Ignoring metastate ${metastate}`);
  await this.adb.keyevent(keycode);
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
