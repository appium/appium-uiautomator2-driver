import { memoize } from 'lodash';
import { imageUtil } from 'appium-support';

let extensions = {}, commands = {};

commands.getStatusBarHeight = memoize(async function () {
  const pixelRatio = await this.getDevicePixelRatio();
  const {statusBar} = await this.uiautomator2.jwproxy.command(`/appium/device/system_bars`, 'GET', {});
  // android returns the upscaled pixel height of the status bar, whereas we
  // want to return to the user the true "size", so we downscale
  return statusBar / pixelRatio;
});

commands.getDevicePixelRatio = memoize(async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/pixel_ratio', 'GET', {});
});

commands.getViewportScreenshot = async function () {
  const screenshot = await this.getScreenshot();
  const statBarHeight = await this.getStatusBarHeight();
  const pixelRatio = await this.getDevicePixelRatio();
  const {width, height} = await this.getWindowSize();
  const rect = {
    left: 0,
    top: statBarHeight * pixelRatio,
    width,
    height: (height - (statBarHeight * pixelRatio)),
  };
  return await imageUtil.cropBase64Image(screenshot, rect);
};

commands.getViewPortRect = async function () {
  const windowSize = await this.getWindowSize();
  const statusBarHeight = await this.getStatusBarHeight();
  const pixelRatio = await this.getDevicePixelRatio();
  // android returns the upscaled window size, so to get the true size of the
  // rect we have to downscale
  return {
    left: 0,
    top: statusBarHeight,
    width: parseInt(Math.ceil(windowSize.width / pixelRatio), 10),
    height: parseInt(Math.ceil((windowSize.height / pixelRatio) - statusBarHeight), 10)
  };
};

Object.assign(extensions, commands);
export { commands };
export default extensions;
