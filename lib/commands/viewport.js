
import { ImageHelpers } from 'appium-base-driver';

let extensions = {}, commands = {};

commands.getStatusBarHeight = async function () {
    return await this.uiautomator2.jwproxy.command(`/statBarHeight`, 'GET', {});
};

commands.getDevicePixelRatio = async function () {
    return await this.uiautomator2.jwproxy.command('/devicePixelRatio', 'GET', {});
};

commands.getViewportScreenshot = async function() {
    const windowSize = await this.getWindowSize();

    const statusBarHeight = await this.getStatusBarHeight();
    const screenshot = await this.getScreenshot();

    let rect = {left: 0, top: statusBarHeight, width: windowSize.width, height: windowSize.height - statusBarHeight};
    return await ImageHelpers.cropBase64Image(screenshot, rect);
};

commands.isScrollable = async function () {
    return await this.uiautomator2.jwproxy.command('/isScrollable', 'GET', {});
};

commands.getScrollableViewSize = async function () {
    return await this.uiautomator2.jwproxy.command('/scrollableViewSize', 'GET', {});
};

commands.definiteScrolling = async function (startX, startY, endX, endY) {
    let param = {startX, startY, endX, endY};
    return await this.uiautomator2.jwproxy.command('/definiteScrolling', 'POST', param);
};

commands.getFirstVisibleItemIdFromScrollableView = async function () {
    return await this.uiautomator2.jwproxy.command('/firstVisibleItemFromScrollableView', 'GET', {});
};

commands.scrollToId = async function (id) {
    let param = {id};
    return await this.uiautomator2.jwproxy.command('/scrollToId', 'POST', param);
};

Object.assign(extensions, commands);
export { commands };
export default extensions;