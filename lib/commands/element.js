import log from '../logger';

let commands = {},  extensions = {};


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

Object.assign(extensions, commands);
export default extensions;
