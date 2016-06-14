import _ from 'lodash';
import log from '../logger';
import utf7 from 'utf7';
import androidHelpers from '../android-helpers';
import { webviewHelpers, CHROMIUM_WIN } from 'appium-android-driver';

const {imap} = utf7;

let extensions = {},
    commands = {},
    helpers = {};

function encodeString (value, unicode) {
  for (let i = 0; i < value.length; i++) {
    let c = value.charCodeAt(i);
    // if we're using the unicode keyboard, and this is unicode, maybe encode
    if (unicode && (c > 127 || c === 38)) {
      // this is not simple ascii, or it is an ampersand (`&`)
      if (c >= parseInt("E000", 16) && c <= parseInt("E040", 16)) {
        // Selenium uses a Unicode PUA to cover certain special characters
        // see https://code.google.com/p/selenium/source/browse/java/client/src/org/openqa/selenium/Keys.java
      } else {
        // encode the text
        value = imap.encode(value);
        break;
      }
    }
  }
  return value;
}

// Need to override this for correct unicode support
commands.setValue = async function (value, elementId) {
  if (value instanceof Array) {
    value = value.join("");
  }
  log.debug(`Setting text on element '${elementId}': '${value}'`);
  value = encodeString(value, this.opts.unicodeKeyboard);
  await this.uiautomator2.jwproxy.command(`/element/${elementId}/value`, 'POST', {value: [value]});
};

// Need to override this for correct unicode support
commands.keys = async function (value) {
  if (value instanceof Array) {
    value = value.join("");
  }
  log.debug(`Setting text: '${value}'`);
  value = encodeString(value, this.opts.unicodeKeyboard);
  await this.uiautomator2.jwproxy.command('/keys', 'POST', {value: [value]});
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

commands.getContexts = async function () {
  let chromiumViews = [];
  let webviews = await webviewHelpers.getWebviews(this.adb,
      this.opts.androidDeviceSocket);
  if (_.contains(webviews, CHROMIUM_WIN)) {
    chromiumViews = [CHROMIUM_WIN];
  } else {
    chromiumViews = [];
  }

  log.info('Getting window handles from uiautomator2');
  let uiautomator2Views = await this.uiautomator2.jwproxy.command('/window_handles', 'GET', {});
  this.contexts = _.union(uiautomator2Views, chromiumViews);
  log.info(`Available contexts: ${JSON.stringify(this.contexts)}`);
  return this.contexts;
};

helpers.switchContext = async function (name) {
  // called when setting context
  await this.uiautomator2.jwproxy.command('/window', 'POST', {name});
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
  await this.uiautomator2.jwproxy.command(`/app/strings`,'POST',{});

  return this.apkStrings[language];
};

helpers.isChromedriverContext = function (windowName) {
  return windowName === CHROMIUM_WIN;
};

Object.assign(extensions, commands, helpers);

export default extensions;
