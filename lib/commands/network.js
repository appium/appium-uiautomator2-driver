
let extensions = {}, commands = {};

commands.setWifiState = async function(wifi) {
  return await this.uiautomator2.jwproxy.command('/appium/device/toggle_wifi', 'POST', {wifi});
};

commands.isWifiOn = async function() {
  return await this.uiautomator2.jwproxy.command('/appium/device/wifi_state', 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
