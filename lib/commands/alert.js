// @ts-check

import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2AlertMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const AlertMixin = {
  async getAlertText() {
    return String(
      await this.uiautomator2.jwproxy.command(
        '/alert/text',
        'GET',
        {}
      )
    );
  },
  async mobileAcceptAlert(opts = {}) {
    await this.uiautomator2.jwproxy.command(
      '/alert/accept',
      'POST',
      opts
    );
  },
  async postAcceptAlert() {
    await this.mobileAcceptAlert();
  },
  async mobileDismissAlert(opts = {}) {
    await this.uiautomator2.jwproxy.command(
      '/alert/dismiss',
      'POST',
      opts
    );
  },
  async postDismissAlert() {
    await this.mobileDismissAlert();
  },
};

mixin(AlertMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 */
