

let commands = {}, helpers = {}, extensions = {};

commands.pressKeyCode = async function (keycode, metastate = null, flags = null) {
  return await this.uiautomator2.jwproxy.command('/appium/device/press_keycode', 'POST', {
    keycode,
    metastate,
    flags,
  });
};

commands.longPressKeyCode = async function (keycode, metastate = null, flags = null) {
  return await this.uiautomator2.jwproxy.command('/appium/device/long_press_keycode', 'POST', {
    keycode,
    metastate,
    flags
  });
};

commands.doSwipe = async function (swipeOpts) {
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
