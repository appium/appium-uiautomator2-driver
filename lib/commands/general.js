import _ from 'lodash';
import log from '../logger';
import { androidHelpers } from 'appium-android-driver';
import { errors } from 'appium-base-driver';

let extensions = {},
    commands = {},
    helpers = {};

commands.getPageSource = async function  () {
  return await this.uiautomator2.jwproxy.command('/source', 'GET', {});
};

// Need to override this for correct unicode support
commands.doSendKeys = async function (params) {
  await this.uiautomator2.jwproxy.command('/keys', 'POST', params);
};

// uiautomator2 doesn't support metastate for keyevents
commands.keyevent = async function (keycode, metastate) {
  log.debug(`Ignoring metastate ${metastate}`);
  await this.adb.keyevent(keycode);
};

// Use ADB since we don't have UiAutomator
commands.back = async function () {
  await this.adb.keyevent(4);
};

commands.getStrings = async function (language) {
  if (!language) {
    language = await this.adb.getDeviceLanguage();
    log.info(`No language specified, returning strings for: ${language}`);
  }

  if (this.apkStrings[language]) {
    // Return cached strings
    return this.apkStrings[language];
  }

  // TODO: This is mutating the current language, but it's how appium currently works
  this.apkStrings[language] = await androidHelpers.pushStrings(language, this.adb, this.opts);
  await this.uiautomator2.jwproxy.command(`/appium/app/strings`, 'POST', {});

  return this.apkStrings[language];
};

commands.getWindowSize = async function () {
  return await this.uiautomator2.jwproxy.command('/window/current/size', 'GET', {});
};

// For W3C
commands.getWindowRect = async function () {
  const {width, height} = await this.getWindowSize();
  return {
    width,
    height,
    x: 0,
    y: 0,
  };
};

extensions.executeMobile = async function (mobileCommand, opts = {}) {
  const mobileCommandsMapping = {
    shell: 'mobileShell',

    scrollBackTo: 'mobileScrollBackTo',
    viewportScreenshot: 'mobileViewportScreenshot',

    deepLink: 'mobileDeepLink',

    startLogsBroadcast: 'mobileStartLogsBroadcast',
    stopLogsBroadcast: 'mobileStopLogsBroadcast',
  };

  if (!_.has(mobileCommandsMapping, mobileCommand)) {
    throw new errors.UnknownCommandError(`Unknown mobile command "${mobileCommand}". ` +
                                         `Only ${_.keys(mobileCommandsMapping)} commands are supported.`);
  }
  return await this[mobileCommandsMapping[mobileCommand]](opts);
};

commands.mobileScrollBackTo = async function (opts) {
  const {elementId, elementToId} = opts;
  return await this.uiautomator2.jwproxy.command(`/appium/element/${elementId}/scroll_to/${elementToId}`, 'POST', {});
};

commands.mobileViewportScreenshot = async function () {
  return await this.getViewportScreenshot();
};

commands.setUrl = async function (url) {
  await this.adb.startUri(url, this.opts.appPackage);
};

commands.mobileDeepLink = async function (opts = {}) {
  const {url, package:pkg} = opts;
  return await this.adb.startUri(url, pkg);
};

commands.openNotifications = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/open_notifications', 'POST', {});
};

commands.updateSettings = async function (settings) {
  return await this.uiautomator2.jwproxy.command('/appium/settings', 'POST', {settings});
};

commands.getSettings = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/settings', 'GET');
};

/**
 * Overriding appium-android-driver's wrapBootstrapDisconnect,
 * unlike in appium-android-driver avoiding adb restarting as it intern
 * kills UiAutomator2 server running in the device.
 **/
helpers.wrapBootstrapDisconnect = async function (wrapped)  {
  await wrapped();
};

// Stop proxying to any Chromedriver and redirect to uiautomator2
helpers.suspendChromedriverProxy = function () {
  this.chromedriver = null;
  this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);
  this.jwpProxyActive = true;
};

Object.assign(extensions, commands, helpers);

export default extensions;
