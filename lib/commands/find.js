
let helpers = {}, extensions = {};

// we override the xpath search for this first-visible-child selector, which
// looks like /*[@firstVisible="true"]
const MAGIC_FIRST_VIS_CHILD_SEL = /\/\*\[@firstVisible ?= ?('|")true\1\]/;

/**
 * Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
 * this.element initialized in find.js of appium-android-drive.
 */
helpers.doFindElementOrEls = async function (params) {
  if (params.strategy === "xpath" && MAGIC_FIRST_VIS_CHILD_SEL.test(params.selector)) {
    let elementId = params.context;
    return await this.uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {});
  }
  if (params.multiple) {
    return await this.uiautomator2.jwproxy.command(`/elements`, 'POST', params);
  } else {
    return await this.uiautomator2.jwproxy.command(`/element`, 'POST', params);
  }
};

Object.assign(extensions, helpers);
export { helpers };
export default extensions;
