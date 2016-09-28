

let commands = {}, helpers = {}, extensions = {};

commands.doSwipe = async function(swipeOpts) {
  return await this.uiautomator2.jwproxy.command(`/touch/perform`, 'POST', swipeOpts);
};

commands.doDrag = async function (dragOpts) {
  return await this.uiautomator2.jwproxy.command(`/touch/drag`, 'POST', dragOpts);
};

commands.getOrientation = async function () {
  return await this.uiautomator2.jwproxy.command(`/orientation`, 'GET', {});
};

commands.setOrientation = async function (orientation) {
  orientation = orientation.toUpperCase();
  return await this.uiautomator2.jwproxy.command(`/orientation`, 'POST', {orientation});
};

Object.assign(extensions, commands, helpers);
export { commands, helpers };
export default extensions;
