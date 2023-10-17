// @ts-check

import {mixin} from './mixins';

/**
 * @type {import('./mixins').UIA2TouchMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const TouchMixin = {
  async doPerformMultiAction(elementId, states) {
    let opts;
    if (elementId) {
      opts = {
        elementId,
        actions: states,
      };

      await this.uiautomator2.jwproxy.command(
        '/touch/multi/perform',
        'POST',
        opts
      );
    } else {
      opts = {
        actions: states,
      };
      await this.uiautomator2.jwproxy.command(
        '/touch/multi/perform',
        'POST',
        opts
      );
    }
  },

  async performActions(actions) {
    this.log.debug(`Received the following W3C actions: ${JSON.stringify(actions, null, '  ')}`);
    // This is mandatory, since Selenium API uses MOUSE as the default pointer type
    const preprocessedActions = actions.map((action) =>
      Object.assign(
        {},
        action,
        action.type === 'pointer'
          ? {
              parameters: {
                pointerType: 'touch',
              },
            }
          : {}
      )
    );
    this.log.debug(`Preprocessed actions: ${JSON.stringify(preprocessedActions, null, '  ')}`);
    await this.uiautomator2.jwproxy.command(
      '/actions',
      'POST',
      {
        actions: preprocessedActions,
      }
    );
  },

  // eslint-disable-next-line require-await
  async releaseActions() {
    this.log.info('On this platform, releaseActions is a no-op');
  },
};

mixin(TouchMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 */
