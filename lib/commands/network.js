
let extensions = {}, commands = {};

commands.setWifiState = async function(wifi) {
  let type = wifi << 1;
  return await this.uiautomator2.jwproxy.command('/network_connection', 'POST', {type});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
