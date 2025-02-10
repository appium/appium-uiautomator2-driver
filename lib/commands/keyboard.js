import { errors } from 'appium/driver';
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
 * @param {number} keycode A valid Android key code. See https://developer.android.com/reference/android/view/KeyEvent
 * for the list of available key codes.
 * @param {number} [metastate] An integer in which each bit set to 1 represents a pressed meta key. See
 * https://developer.android.com/reference/android/view/KeyEvent for more details.
 * @param {string} [flags] Flags for the particular key event. See
 * https://developer.android.com/reference/android/view/KeyEvent for more details.
 * @param {boolean} [isLongPress=false] Whether to emulate long key press
 * @returns {Promise<void>}
 */
export async function mobilePressKey(keycode, metastate, flags, isLongPress = false) {
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
 *
 * @this {AndroidUiautomator2Driver}
 * @param {string | number | boolean} text The text to type. Can be a string, number or boolean.
 * @returns {Promise<boolean>} `true` if the input text has been successfully sent to adb
 * @throws {Error} if `text` property has not been provided
 */
export async function mobileType(text) {
  if (_.isUndefined(text)) {
    throw new errors.InvalidArgumentError(`The 'text' argument is mandatory`);
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
