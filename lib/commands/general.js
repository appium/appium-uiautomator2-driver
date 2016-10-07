import log from '../logger';
import androidHelpers from '../android-helpers';

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
