import _ from 'lodash';

let helpers = {}, extensions = {};

/**
 * Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
 * this.element and this.params initialized in find.js of appium-android-drive.
 */
helpers.doFindElementOrEls = async function () {
  try {
    if (this.params.multiple) {
      this.element = await this.uiautomator2.jwproxy.command(`/elements`, 'POST', this.params);
    } else {
      this.element = await this.uiautomator2.jwproxy.command(`/element`, 'POST', this.params);
    }
  } catch (err) {
    if (err.message && err.message.match(/An element could not be located/)) {
      // we are fine with this, just indicate a retry
      return false;
    }
    throw err;
  }

  // we want to return false if we want to potentially try again
  if (this.params.multiple) {
    return this.element && this.element.length !== 0;
  } else {
    return !_.isNull(this.element);
  }
};

Object.assign(extensions, helpers);
export { helpers };
export default extensions;
