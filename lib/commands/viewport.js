
import { ImageHelpers } from 'appium-base-driver';

let extensions = {}, commands = {};

commands.getStatusBarHeight = async function () {
  return await this.uiautomator2.jwproxy.command(`/appium/device/stat_bar_height`, 'GET', {});
};

commands.getDevicePixelRatio = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/pixel_ratio', 'GET', {});
};

commands.getViewportScreenshot = async function() {
  const screenshot = await this.getScreenshot();

  let rect = await this.getViewPortRect();
  return await ImageHelpers.cropBase64Image(screenshot, rect);
};

commands.getViewPortRect = async function() {
  const windowSize = await this.getWindowSize();
  const statusBarHeight = await this.getStatusBarHeight();
  return {left: 0, top: statusBarHeight, width: windowSize.width, height: windowSize.height - statusBarHeight};
};

commands.getFirstVisible = async function (elementId) {
  return await this.uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {});
};

Object.assign(extensions, commands);
export { commands };
export default extensions;