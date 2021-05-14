import log from '../logger';
import _ from 'lodash';
import { util } from 'appium-support';
import { PROTOCOLS, W3C_ELEMENT_KEY } from 'appium-base-driver';

let commands = {}, helpers = {}, extensions = {};

function toBool (s) {
  return _.isString(s) ? (s.toLowerCase() === 'true') : !!s;
}

commands.active = async function active () {
  return await this.uiautomator2.jwproxy.command('/element/active', 'GET');
};

commands.getAttribute = async function (attribute, elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/attribute/${attribute}`, 'GET', {});
};

commands.elementDisplayed = async function (elementId) {
  return toBool(await this.getAttribute('displayed', elementId));
};

commands.elementEnabled = async function (elementId) {
  return toBool(await this.getAttribute('enabled', elementId));
};

commands.elementSelected = async function (elementId) {
  return toBool(await this.getAttribute('selected', elementId));
};

commands.getName = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/name`, 'GET', {});
};

commands.getLocation = async function (elementId) {
  log.info(`calling get location: ${elementId}`);
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/location`, 'GET', {});
};

commands.getSize = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/size`, 'GET', {});
};

commands.touchLongClick = async function (element, x, y, duration) {
  let params = {element, x, y, duration};
  return await this.uiautomator2.jwproxy.command(`/touch/longclick`, 'POST', {params});
};

commands.touchDown = async function (element, x, y) {
  let params = {element, x, y};
  return await this.uiautomator2.jwproxy.command(`/touch/down`, 'POST', {params});
};

commands.touchUp = async function (element, x, y) {
  let params = {element, x, y};
  return await this.uiautomator2.jwproxy.command(`/touch/up`, 'POST', {params});
};

commands.touchMove = async function (element, x, y) {
  let params = {element, x, y};
  return await this.uiautomator2.jwproxy.command(`/touch/move`, 'POST', {params});
};

helpers.doSetElementValue = async function (params) {
  return await this.uiautomator2.jwproxy.command(`/element/${params.elementId}/value`, 'POST', params);
};

commands.setValueImmediate = async function (keys, elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/value`, 'POST', {
    elementId,
    text: _.isArray(keys) ? keys.join('') : keys,
    replace: false,
    unicodeKeyboard: this.opts.unicodeKeyboard,
  });
};

commands.getText = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/text`, 'GET', {});
};

commands.click = async function (element) {
  return await this.uiautomator2.jwproxy.command(`/element/${element}/click`, 'POST', {element});
};

commands.getElementScreenshot = async function (element) {
  return await this.uiautomator2.jwproxy.command(`/element/${element}/screenshot`, 'GET', {});
};

commands.tap = async function (elementId = null, x = null, y = null, count = 1) {
  const areCoordinatesDefined = util.hasValue(x) && util.hasValue(y);
  if (!util.hasValue(elementId) && !areCoordinatesDefined) {
    throw new Error(`Either element id to tap or both absolute coordinates should be defined`);
  }

  for (let i = 0; i < count; i++) {
    if (util.hasValue(elementId) && !areCoordinatesDefined) {
      // we are either tapping on the default location of the element
      // or an offset from the top left corner
      await this.uiautomator2.jwproxy.command(`/element/${elementId}/click`, 'POST');
    } else {
      await this.uiautomator2.jwproxy.command(`/appium/tap`, 'POST', {
        x, y,
        [W3C_ELEMENT_KEY]: elementId,
      });
    }
  }
};

commands.clear = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/clear`, 'POST', {elementId});
};

commands.getElementRect = async function (elementId) {
  if (this.isWebContext()) {
    log.debug(`Detected downstream chromedriver protocol: ${this.chromedriver.jwproxy.downstreamProtocol}`);
    if (this.chromedriver.jwproxy.downstreamProtocol === PROTOCOLS.MJSONWP) {
      const {x, y} = await this.chromedriver.jwproxy.command(`/element/${elementId}/location`, 'GET');
      const {width, height} = await this.chromedriver.jwproxy.command(`/element/${elementId}/size`, 'GET');
      return {x, y, width, height};
    }
    return await this.chromedriver.jwproxy.command(`/element/${elementId}/rect`, 'GET');
  }
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/rect`, 'GET');
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
