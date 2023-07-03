// @ts-check

import CssConverter from '../css-converter';
import {mixin} from './mixins';

// we override the xpath search for this first-visible-child selector, which
// looks like /*[@firstVisible="true"]
const MAGIC_FIRST_VIS_CHILD_SEL = /\/\*\[@firstVisible ?= ?('|")true\1\]/;

const MAGIC_SCROLLABLE_SEL = /\/\/\*\[@scrollable ?= ?('|")true\1\]/;
const MAGIC_SCROLLABLE_BY = 'new UiSelector().scrollable(true)';

/**
 * @type {import('./mixins').UIA2FindMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const FindMixin = {
  /**
   * @privateRemarks Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
   * this.element initialized in find.js of appium-android-drive.
   */
  async doFindElementOrEls(params) {
    const uiautomator2 = /** @type {import('../uiautomator2').UiAutomator2Server} */ (
      this.uiautomator2
    );
    if (params.strategy === 'xpath' && MAGIC_FIRST_VIS_CHILD_SEL.test(params.selector)) {
      let elementId = params.context;
      return /** @type {Element} */ (
        await uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {})
      );
    }
    if (params.strategy === 'xpath' && MAGIC_SCROLLABLE_SEL.test(params.selector)) {
      params.strategy = '-android uiautomator';
      params.selector = MAGIC_SCROLLABLE_BY;
    }
    if (params.strategy === 'css selector') {
      params.strategy = '-android uiautomator';
      params.selector = new CssConverter(
        params.selector,
        this.opts.appPackage
      ).toUiAutomatorSelector();
    }
    return /** @type {Element|Element[]} */ (
      await uiautomator2.jwproxy.command(`/element${params.multiple ? 's' : ''}`, 'POST', params)
    );
  },
};

mixin(FindMixin);

/**
 * @typedef {import('@appium/types').Element} Element
 */
