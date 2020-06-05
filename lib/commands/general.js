import _ from 'lodash';
import log from '../logger';
import { errors, BASEDRIVER_HANDLED_SETTINGS, W3C_ELEMENT_KEY } from 'appium-base-driver';
import { fs, tempDir, util } from 'appium-support';

let extensions = {},
    commands = {},
    helpers = {};

commands.getPageSource = async function () {
  return await this.uiautomator2.jwproxy.command('/source', 'GET', {});
};

commands.getClipboard = async function () {
  return (await this.adb.getApiLevel() < 29)
    ? (await this.uiautomator2.jwproxy.command('/appium/device/get_clipboard', 'POST', {}))
    : (await this.adb.getClipboard());
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

  // Clients require the resulting mapping to have both keys
  // and values of type string
  const preprocessStringsMap = function (mapping) {
    const result = {};
    for (const [key, value] of _.toPairs(mapping)) {
      result[key] = _.isString(value) ? value : JSON.stringify(value);
    }
    return result;
  };

  if (this.apkStrings[language]) {
    // Return cached strings
    return preprocessStringsMap(this.apkStrings[language]);
  }

  if (!this.opts.app && !this.opts.appPackage) {
    log.errorAndThrow("One of 'app' or 'appPackage' capabilities should must be specified");
  }

  let app = this.opts.app;
  const tmpRoot = await tempDir.openDir();
  try {
    if (!app) {
      try {
        app = await this.adb.pullApk(this.opts.appPackage, tmpRoot);
      } catch (err) {
        log.errorAndThrow(`Failed to pull an apk from '${this.opts.appPackage}'. Original error: ${err.message}`);
      }
    }

    if (!await fs.exists(app)) {
      log.errorAndThrow(`The app at '${app}' does not exist`);
    }

    try {
      const {apkStrings} = await this.adb.extractStringsFromApk(app, language, tmpRoot);
      this.apkStrings[language] = apkStrings;
      return preprocessStringsMap(apkStrings);
    } catch (err) {
      log.errorAndThrow(`Cannot extract strings from '${app}'. Original error: ${err.message}`);
    }
  } finally {
    await fs.rimraf(tmpRoot);
  }
};

// memoized in constructor
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

    execEmuConsoleCommand: 'mobileExecEmuConsoleCommand',

    scrollBackTo: 'mobileScrollBackTo',
    scroll: 'mobileScroll',
    viewportScreenshot: 'mobileViewportScreenshot',

    deepLink: 'mobileDeepLink',

    startLogsBroadcast: 'mobileStartLogsBroadcast',
    stopLogsBroadcast: 'mobileStopLogsBroadcast',

    acceptAlert: 'mobileAcceptAlert',
    dismissAlert: 'mobileDismissAlert',

    batteryInfo: 'mobileGetBatteryInfo',

    deviceInfo: 'mobileGetDeviceInfo',

    getDeviceTime: 'mobileGetDeviceTime',

    changePermissions: 'mobileChangePermissions',
    getPermissions: 'mobileGetPermissions',

    performEditorAction: 'mobilePerformEditorAction',

    startScreenStreaming: 'mobileStartScreenStreaming',
    stopScreenStreaming: 'mobileStopScreenStreaming',

    getNotifications: 'mobileGetNotifications',

    listSms: 'mobileListSms',

    type: 'mobileType',
    sensorSet: 'sensorSet',

    deleteFile: 'mobileDeleteFile',

    startService: 'mobileStartService',
    stopService: 'mobileStopService',
  };

  if (!_.has(mobileCommandsMapping, mobileCommand)) {
    throw new errors.UnknownCommandError(`Unknown mobile command "${mobileCommand}". ` +
      `Only ${_.keys(mobileCommandsMapping)} commands are supported.`);
  }
  return await this[mobileCommandsMapping[mobileCommand]](opts);
};

/**
 * @typedef {Object} ScrollElementToElementOpts
 * @property {string} elementId The identifier of the scrollable element,
 * which is going to be scrolled. It is required this element
 * is a valid scrollable container and it was located by `-android uiautomator`
 * strategy.
 * @property {string} elementToId The identifier of the item, which belongs
 * to the scrollable element above, and which should become visible after
 * the scrolling operation is finished. It is required this element
 * was located by `-android uiautomator` strategy.
 */

/**
 * Scrolls the given scrollable element `elementId` until `elementToId`
 * becomes visible. This function returns immediately if the `elementToId`
 * is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 *
 * @param {ScrollElementToElementOpts} opts
 * @throws {Error} if the scrolling operation cannot be performed
 */
commands.mobileScrollBackTo = async function (opts = {}) {
  const {elementId, elementToId} = opts;
  if (!elementId || !elementToId) {
    log.errorAndThrow(`Both elementId and elementToId arguments must be provided`);
  }
  return await this.uiautomator2.jwproxy.command(
    `/appium/element/${util.unwrapElement(elementId)}/scroll_to/${util.unwrapElement(elementToId)}`, 'POST', {});
};

/**
 * @typedef {Object} ScrollOpts
 * @property {?string} element The identifier of an element. It is required this element
 * is a valid scrollable container and it was located by `-android uiautomator`
 * strategy. If this property is not provided then the first currently available scrollable view
 * is selected for the interaction.
 * @property {!string} strategy The following strategies are supported:
 * - `accessibility id` (UiSelector().description)
 * - `class name` (UiSelector().className)
 * - `-android uiautomator` (UiSelector)
 * @property {!string} selector The corresponding lookup value for the given
 * strategy.
 * @property {?number} maxSwipes The maximum number of swipes to perform
 * on the target scrollable view in order to reach the destination element.
 * In case this value is unset then it would be retrieved from the scrollable
 * element itself (vua `getMaxSearchSwipes()` property).
 */

/**
 * Scrolls the given scrollable element until the element identified
 * by `strategy` and `selector` becomes visible. This function returns immediately if the
 * destination element is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 *
 * @param {ScrollOpts} opts
 * @throws {Error} if the scrolling operation cannot be performed
 */
commands.mobileScroll = async function (opts = {}) {
  const {element, strategy, selector, maxSwipes} = opts;
  if (!strategy || !selector) {
    log.errorAndThrow(`Both strategy and selector arguments must be provided`);
  }
  const params = {
    params: {strategy, selector, maxSwipes},
  };
  if (element) {
    params.origin = {
      [W3C_ELEMENT_KEY]: util.unwrapElement(element),
    };
  }
  return await this.uiautomator2.jwproxy.command('/touch/scroll', 'POST', params);
};

commands.mobileViewportScreenshot = async function () {
  return await this.getViewportScreenshot();
};

commands.setUrl = async function (url) {
  await this.adb.startUri(url, this.opts.appPackage);
};

/**
 * @typedef {object} DeepLinkOpts
 * @property {!string} url - The name of URL to start.
 * @property {!string} package - The name of the package to start the URI with.
 * @property {?boolean} waitForLaunch [true] - if `false` then adb won't wait
 * for the started activity to return the control
 */

/**
 * Start URL that take users directly to specific content in the app
 * @param {DeepLinkOpts} opts
 */
commands.mobileDeepLink = async function (opts = {}) {
  const {
    url,
    package: pkg,
    waitForLaunch,
  } = opts;
  return await this.adb.startUri(url, pkg, { waitForLaunch });
};

commands.openNotifications = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/open_notifications', 'POST', {});
};

commands.updateSettings = async function (settings) {
  // we have some settings that are set on the settings object in the driver
  // only, for example image finding settings. The uiauto2 server does not know
  // what to do with them, so just set them on this driver's settings instance,
  // and don't forward them to the server
  let driverOnlySettings = {};
  let serverSettings = {};
  for (let [setting, value] of _.toPairs(settings)) {
    if (BASEDRIVER_HANDLED_SETTINGS.includes(setting)) {
      driverOnlySettings[setting] = value;
    } else {
      serverSettings[setting] = value;
    }
  }
  if (!_.isEmpty(driverOnlySettings)) {
    log.info(`Found some settings designed to be handled by BaseDriver: ` +
             `${JSON.stringify(_.keys(driverOnlySettings))}. Not ` +
             `sending these on to the UiAutomator2 server and instead ` +
             `setting directly on the driver`);
    await this.settings.update(driverOnlySettings);
  }
  if (!_.isEmpty(serverSettings)) {
    log.info('Forwarding the following settings to the UiAutomator2 server: ' +
             JSON.stringify(_.keys(serverSettings)));
    await this.uiautomator2.jwproxy.command('/appium/settings', 'POST',
      {settings: serverSettings});
  }
};

commands.getSettings = async function () {
  // as above, we might have some driver-only settings to return as well
  const driverOnlySettings = this.settings.getSettings();
  const serverSettings = await this.uiautomator2.jwproxy.command('/appium/settings', 'GET');
  return {...driverOnlySettings, ...serverSettings};
};

/**
 * Overriding appium-android-driver's wrapBootstrapDisconnect,
 * unlike in appium-android-driver avoiding adb restarting as it intern
 * kills UiAutomator2 server running in the device.
 **/
helpers.wrapBootstrapDisconnect = async function (wrapped) {
  await wrapped();
};

// Stop proxying to any Chromedriver and redirect to uiautomator2
helpers.suspendChromedriverProxy = function () {
  this.chromedriver = null;
  this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);
  this.jwpProxyActive = true;
};

/**
 * The list of available info entries can be found at
 * https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/main/java/io/appium/uiautomator2/handler/GetDeviceInfo.java
 */
commands.mobileGetDeviceInfo = async function () {
  return await this.uiautomator2.jwproxy.command('/appium/device/info', 'GET');
};

/**
 * @typedef {Object} TypingOptions
 * @property {!string|number|boolean} text - The text to type
 */

/**
 * Types the given Unicode string.
 * It is expected that the focus is already put
 * to the destination input field before this method is called.
 *
 * @param {TypingOptions} opts
 * @returns {boolean} `true` if the input text has been successfully sent to adb
 * @throws {Error} if `text` property has not been provided
 */
commands.mobileType = async function mobileType (opts = {}) {
  const {
    text,
  } = opts;
  if (_.isUndefined(text)) {
    log.errorAndThrow(`The 'text' argument is mandatory`);
  }
  return await this.adb.typeUnicode(text);
};

Object.assign(extensions, commands, helpers);

export default extensions;
