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

helpers.doSetElementValue = async function(params){
  return await this.uiautomator2.jwproxy.command(`/element/${params.elementId}/value`, 'POST', params);
};

commands.setValue = async function (keys, elementId) {
  return await this.setElementValue(keys, elementId, false);
};

commands.replaceValue = async function (keys, elementId) {
  return await this.setElementValue(keys, elementId, true);
};

commands.getText = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/text`, 'GET', {});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
