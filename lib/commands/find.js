
let helpers = {}, extensions = {};

/**
 * Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
 * this.element initialized in find.js of appium-android-drive.
 */
helpers.doFindElementOrEls = async function (params) {
  if (params.multiple) {
    return await this.uiautomator2.jwproxy.command(`/elements`, 'POST', params);
  } else {
    return await this.uiautomator2.jwproxy.command(`/element`, 'POST', params);
  }
};

Object.assign(extensions, helpers);
export { helpers };
export default extensions;
