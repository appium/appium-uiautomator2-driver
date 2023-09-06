

let commands = {}, helpers = {}, extensions = {};

commands.pressKeyCode = async function (keycode, metastate = null, flags = null) {
  return await this.uiautomator2.jwproxy.command('/appium/device/press_keycode', 'POST', {
    keycode,
    metastate,
    flags,
  });
};

commands.longPressKeyCode = async function (keycode, metastate = null, flags = null) {
  return await this.uiautomator2.jwproxy.command('/appium/device/long_press_keycode', 'POST', {
    keycode,
    metastate,
    flags
  });
};

commands.doSwipe = async function (swipeOpts) {
  return await this.uiautomator2.jwproxy.command(`/touch/perform`, 'POST', swipeOpts);
};

commands.doDrag = async function (dragOpts) {
  return await this.uiautomator2.jwproxy.command(`/touch/drag`, 'POST', dragOpts);
};

commands.getOrientation = async function () {
  return await this.uiautomator2.jwproxy.command(`/orientation`, 'GET', {});
};

commands.setOrientation = async function (orientation) {
  orientation = orientation.toUpperCase();
  return await this.uiautomator2.jwproxy.command(`/orientation`, 'POST', {orientation});
};

/**
 * @typedef {Object} PressKeyOptions
 * @property {number} keycode A valid Android key code. See https://developer.android.com/reference/android/view/KeyEvent
 * for the list of available key codes
 * @property {number?} metastate An integer in which each bit set to 1 represents a pressed meta key. See
 * https://developer.android.com/reference/android/view/KeyEvent for more details.
 * @property {string?} flags Flags for the particular key event. See
 * https://developer.android.com/reference/android/view/KeyEvent for more details.
 * @property {boolean} isLongPress [false] Whether to emulate long key press
*/

/**
 * Emulates single key press of the key with the given code.
 *
 * @param {PressKeyOptions} opts
 */
commands.mobilePressKey = async function mobilePressKey(opts = {}) {
  const {
    keycode,
    metastate,
    flags,
    isLongPress = false,
  } = opts;

  return await this.uiautomator2.jwproxy.command(
    `/appium/device/${isLongPress ? 'long_' : ''}press_keycode`,
    'POST', {
      keycode,
      metastate,
      flags
    }
  );
};

/**
 * See https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-scheduleaction
 * @param {Record<string, any>} opts
 */
commands.mobileScheduleAction = async function mobileScheduleAction (opts = {}) {
  return await this.uiautomator2.jwproxy.command('/appium/schedule_action', 'POST', opts);
};

/**
 * @typedef {Object} ActionResult
 * @property {number} repeats
 * @property {Record<string, any>[][]}
 */

/**
 * @typedef {Object} ActionArgs
 * @property {string} name
 */

/**
 * See https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-getactionhistory
 * @param {ActionArgs} opts
 * @returns {Promise<ActionResult>}
 */
commands.mobileGetActionHistory = async function mobileGetActionHistory (opts) {
  return await this.uiautomator2.jwproxy.command('/appium/action_history', 'POST', opts ?? {});
};

/**
 * See https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-unscheduleaction
 * @param {ActionArgs} opts
 */
commands.mobileUnscheduleAction = async function mobileUnscheduleAction (opts) {
  return await this.uiautomator2.jwproxy.command('/appium/unschedule_action', 'POST', opts ?? {});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
