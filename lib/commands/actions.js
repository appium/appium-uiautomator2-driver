

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

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
