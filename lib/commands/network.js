import log from '../logger';

let extensions = {}, commands = {};

commands.setWifiState = async function(wifi) {
  let type = wifi << 1;
  try {
    return await this.uiautomator2.jwproxy.command('/network_connection', 'POST', {type});
  } catch (error) {
    log.error(`Unable to set Network connection to WIFI, retrying with adb command. ERROR:: ${error.message}`);
    await this.adb.setWifiState(wifi, this.isEmulator());
  }
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
