import log from '../logger';

let commands = {}, helpers = {}, extensions = {};


commands.getLocation = async function (elementId) {
   log.info(`calling get location: ${elementId}`);
   return await this.uiautomator2.jwproxy.command(`/element/${elementId}/location`, 'GET', {});
};

commands.getLocationInView = async function (elementId) {
  return await this.getLocation(elementId);
};

commands.getSize = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/size`, 'GET', {});
};

commands.touchLongClick = async function (elementId, x, y, duration) {
  let params = {elementId, x, y, duration}; 
  return await this.uiautomator2.jwproxy.command(`/touch/longclick`, 'POST', {params});
};

commands.touchDown = async function (elementId, x, y) {
  let params = {elementId, x, y}; 
  return await this.uiautomator2.jwproxy.command(`/touch/down`,'POST', {params});
};

commands.touchUp = async function (elementId, x, y) {
  let params = {elementId, x, y};  
  return await this.uiautomator2.jwproxy.command(`/touch/up`,'POST', {params});
};

commands.touchMove = async function (elementId, x, y) {
  let params = {elementId, x, y};  
  return await this.uiautomator2.jwproxy.command(`/touch/move`,'POST', {params});
};


helpers.setElementValue = async function (keys, elementId, replace = false) {
  let text = keys;
  if (keys instanceof Array) {
    text = keys.join("");
  }

  let params = {
    "id" : elementId,
    text,
    replace,
    unicodeKeyboard: this.opts.unicodeKeyboard
  };

  await this.uiautomator2.jwproxy.command(`/element/${elementId}/value`, 'POST', params);
};

commands.setValue = async function (keys, elementId) {
  return await this.setElementValue(keys, elementId, false);
};

commands.replaceValue = async function (keys, elementId) {
  return await this.setElementValue(keys, elementId, true);
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
