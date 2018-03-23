import log from '../logger';
import { util } from 'appium-support';


let extensions = {}, commands = {};

commands.mobileSetClipboard = async function (opts = {}) {
  if (!util.hasValue(opts.content)) {
    log.errorAndThrow(`The 'content' argument is mandatory`);
  }
  return await this.uiautomator2.jwproxy.command('/appium/clipboard/set', 'POST', opts);
};

commands.mobileGetClipboard = async function (opts = {}) {
  return await this.uiautomator2.jwproxy.command('/appium/clipboard/get', 'POST', opts);
};


Object.assign(extensions, commands);
export { commands };
export default extensions;
