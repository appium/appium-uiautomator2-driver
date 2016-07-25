import log from '../logger';

let commands = {}, helpers = {}, extensions = {};


commands.getLocation = async function (elementId) {
   log.info(`calling get location: ${elementId}`);
   return await this.uiautomator2.jwproxy.command(`/element/${elementId}/location`, 'GET', {});
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

commands.getText = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/text`, 'GET', {});
};

commands.click = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/element/${elementId}/click`, 'POST', {elementId});
};

commands.tap = async function (elementId, x = 0, y = 0, count = 1) {
  for (let i = 0; i < count; i++) {
    if (elementId) {
      // we are either tapping on the default location of the element
      // or an offset from the top left corner
      if (x !== 0 || y !== 0) {
        await this.uiautomator2.jwproxy.command(`/element/${elementId}/click`, 'POST', {elementId, x, y});
      } else {
        await this.uiautomator2.jwproxy.command(`/element/${elementId}/click`, 'POST', {elementId});
      }
    } else {
      await this.uiautomator2.jwproxy.command(`/element/${elementId}/click`, 'POST', {x, y});
    }
  }
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
