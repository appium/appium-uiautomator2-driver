// @ts-check

import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2ActionsMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const ActionsMixin = {
  async pressKeyCode(keycode, metastate, flags) {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      '/appium/device/press_keycode',
      'POST',
      {
        keycode,
        metastate,
        flags,
      }
    );
  },

  async longPressKeyCode(keycode, metastate, flags) {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      '/appium/device/long_press_keycode',
      'POST',
      {
        keycode,
        metastate,
        flags,
      }
    );
  },

  async doSwipe(swipeOpts) {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      `/touch/perform`,
      'POST',
      swipeOpts
    );
  },

  async doDrag(dragOpts) {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      `/touch/drag`,
      'POST',
      dragOpts
    );
  },

  async getOrientation() {
    return /** @type {import('@appium/types').Orientation} */ (
      await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
        `/orientation`,
        'GET',
        {}
      )
    );
  },

  async setOrientation(orientation) {
    orientation = /** @type {import('@appium/types').Orientation} */ (orientation.toUpperCase());
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      `/orientation`,
      'POST',
      {orientation}
    );
  },

  async mobilePressKey(opts) {
    const {keycode, metastate, flags, isLongPress = false} = opts;

    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      `/appium/device/${isLongPress ? 'long_' : ''}press_keycode`,
      'POST',
      {
        keycode,
        metastate,
        flags,
      }
    );
  },
};

mixin(ActionsMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 */
