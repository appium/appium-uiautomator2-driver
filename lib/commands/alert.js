let commands = {}, helpers = {}, extensions = {};

commands.getAlertText = async function () {
  return await this.uiautomator2.jwproxy.command('/alert/text', 'GET', {});
};

commands.postAcceptAlert = async function () {
  return await this.uiautomator2.jwproxy.command('/alert/accept', 'POST', {});
};

commands.postDismissAlert = async function () {
  return await this.uiautomator2.jwproxy.command('/alert/dismiss', 'POST', {});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
