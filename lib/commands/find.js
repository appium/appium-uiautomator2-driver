import CssConverter from '../css-converter';

const helpers = {};

// we override the xpath search for this first-visible-child selector, which
// looks like /*[@firstVisible="true"]
const MAGIC_FIRST_VIS_CHILD_SEL = /\/\*\[@firstVisible ?= ?('|")true\1\]/;

const MAGIC_SCROLLABLE_SEL = /\/\/\*\[@scrollable ?= ?('|")true\1\]/;
const MAGIC_SCROLLABLE_BY = 'new UiSelector().scrollable(true)';

/**
 * Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
 * this.element initialized in find.js of appium-android-drive.
 */
helpers.doFindElementOrEls = async function (params) {
  if (params.strategy === 'xpath' && MAGIC_FIRST_VIS_CHILD_SEL.test(params.selector)) {
    let elementId = params.context;
    return await this.uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {});
  }
  if (params.strategy === 'xpath' && MAGIC_SCROLLABLE_SEL.test(params.selector)) {
    params.strategy = '-android uiautomator';
    params.selector = MAGIC_SCROLLABLE_BY;
  }
  if (params.strategy === 'css selector') {
    params.strategy = '-android uiautomator';
    params.selector = new CssConverter(params.selector, this.opts.appPackage)
      .toUiAutomatorSelector();
  }
  return await this.uiautomator2.jwproxy.command(`/element${params.multiple ? 's' : ''}`, 'POST', params);
};

export { helpers };
export default helpers;
