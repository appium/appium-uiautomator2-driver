import { imageUtil } from 'appium-support';
import _ from 'lodash';


let extensions = {}, commands = {};

commands.getStatusBarHeight = _.memoize(async function () {
  const {statusBar} = await this.uiautomator2.jwproxy.command(`/appium/device/system_bars`, 'GET', {});
  return statusBar;
});

commands.getDevicePixelRatio = _.memoize(async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/pixel_ratio', 'GET', {});
});

commands.getViewportScreenshot = async function () {
  const screenshot = await this.getScreenshot();
  const rect = await this.getViewPortRect();
  return await imageUtil.cropBase64Image(screenshot, rect);
};

commands.getViewPortRect = async function () {
  const windowSize = await this.getWindowSize();
  const statusBarHeight = await this.getStatusBarHeight();
  // android returns the upscaled window size, so to get the true size of the
  // rect we have to downscale
  return {
    left: 0,
    top: statusBarHeight,
    width: windowSize.width,
    height: windowSize.height - statusBarHeight
  };
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
