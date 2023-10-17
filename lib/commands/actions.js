// @ts-check

import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2ActionsMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const ActionsMixin = {
  async pressKeyCode(keycode, metastate, flags) {
    await this.uiautomator2.jwproxy.command(
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
    await this.uiautomator2.jwproxy.command(
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
    await this.uiautomator2.jwproxy.command(
      `/touch/perform`,
      'POST',
      swipeOpts
    );
  },

  async doDrag(dragOpts) {
    await this.uiautomator2.jwproxy.command(
      `/touch/drag`,
      'POST',
      dragOpts
    );
  },

  async getOrientation() {
    return /** @type {import('@appium/types').Orientation} */ (
      await this.uiautomator2.jwproxy.command(
        `/orientation`,
        'GET',
        {}
      )
    );
  },

  async setOrientation(orientation) {
    orientation = /** @type {import('@appium/types').Orientation} */ (orientation.toUpperCase());
    await this.uiautomator2.jwproxy.command(
      `/orientation`,
      'POST',
      {orientation}
    );
  },

  async mobilePressKey(opts) {
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
  },

  /**
   * See https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-scheduleaction
   * @param {Record<string, any>} opts
   */
  async mobileScheduleAction(opts = {}) {
    return await this.uiautomator2.jwproxy.command(
      '/appium/schedule_action',
      'POST',
      opts
    );
  },

  /**
   * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-getactionhistory
   */
  async mobileGetActionHistory(opts) {
    return /** @type {import('./types').ActionResult} */ (
      await this.uiautomator2.jwproxy.command(
        '/appium/action_history',
        'POST',
        opts ?? {}
      )
    );
  },

  /**
   * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-unscheduleaction
   */
  async mobileUnscheduleAction(opts) {
    return await this.uiautomator2.jwproxy.command(
      '/appium/unschedule_action',
      'POST',
      opts ?? {}
    );
  },
};

mixin(ActionsMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 */
