import log from '../logger';
import _ from 'lodash';

let commands = {}, helpers = {}, extensions = {};

function toBool (s) {
  return _.isString(s) ? (s.toLowerCase() === 'true') : !!s;
}

commands.getAttribute = async function (attribute, elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/attribute/${attribute}`, 'GET', {});
};

commands.elementDisplayed = async function (elementId) {
  return toBool(await this.getAttribute("displayed", elementId));
};

commands.elementEnabled = async function (elementId) {
  return toBool(await this.getAttribute("enabled", elementId));
};

commands.elementSelected = async function (elementId) {
  return toBool(await this.getAttribute("selected", elementId));
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

commands.tap = async function (element, x = 0, y = 0, count = 1) {
  for (let i = 0; i < count; i++) {
    if (element) {
      // we are either tapping on the default location of the element
      // or an offset from the top left corner
      let params = {element};
      if (x !== 0 || y !== 0) {
        params.x = x;
        params.y = y;
      }
      await this.uiautomator2.jwproxy.command(`/element/${element}/click`, 'POST', params);
    } else {
      await this.uiautomator2.jwproxy.command(`/appium/tap`, 'POST', {x, y});
    }
  }
};

commands.clear = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/clear`, 'POST', {elementId});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
