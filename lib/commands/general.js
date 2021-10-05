import _ from 'lodash';
import log from '../logger';
import B from 'bluebird';
import { errors, BASEDRIVER_HANDLED_SETTINGS } from 'appium-base-driver';
import { fs, tempDir } from 'appium-support';
import { APK_EXTENSION } from '../extensions';

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

commands.getDisplayDensity = async function getDisplayDensity () {
  return await this.uiautomator2.jwproxy.command('/appium/device/display_density', 'GET', {});
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

    dragGesture: 'mobileDragGesture',
    flingGesture: 'mobileFlingGesture',
    doubleClickGesture: 'mobileDoubleClickGesture',
    longClickGesture: 'mobileLongClickGesture',
    pinchCloseGesture: 'mobilePinchCloseGesture',
    pinchOpenGesture: 'mobilePinchOpenGesture',
    swipeGesture: 'mobileSwipeGesture',
    scrollGesture: 'mobileScrollGesture',
    scrollBackTo: 'mobileScrollBackTo',
    scroll: 'mobileScroll',
    viewportScreenshot: 'mobileViewportScreenshot',
    viewportRect: 'mobileViewPortRect',

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

    clearApp: 'mobileClearApp',

    startActivity: 'mobileStartActivity',
    startService: 'mobileStartService',
    stopService: 'mobileStopService',
    broadcast: 'mobileBroadcast',

    getContexts: 'mobileGetContexts',

    installMultipleApks: 'mobileInstallMultipleApks',

    unlock: 'mobileUnlock',
  };

  if (!_.has(mobileCommandsMapping, mobileCommand)) {
    throw new errors.UnknownCommandError(`Unknown mobile command "${mobileCommand}". ` +
      `Only ${_.keys(mobileCommandsMapping)} commands are supported.`);
  }
  return await this[mobileCommandsMapping[mobileCommand]](opts);
};

commands.mobileViewportScreenshot = async function () {
  return await this.getViewportScreenshot();
};

/**
 * @typedef {object} Rectangle
 * @property {number} left - The left coordinate of the Rectangle.
 * @property {number} top - The top coordinate of the Rectangle.
 * @property {number} width - The width of Rectangle.
 * @property {number} height - The height of Rectangle.
 */

/**
 * Returns the viewport coordinates.
 * @returns {Rectangle} The viewport coordinates.
 */
commands.mobileViewPortRect = async function mobileViewPortRect () {
  return await this.getViewPortRect();
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


/**
 * @typedef {Object} InstallOptions
 * @property {boolean} allowTestPackages [false] - Set to true in order to allow test
 *                                                 packages installation.
 * @property {boolean} useSdcard [false] - Set to true to install the app on sdcard
 *                                         instead of the device memory.
 * @property {boolean} grantPermissions [false] - Set to true in order to grant all the
 *                                                permissions requested in the application's manifest
 *                                                automatically after the installation is completed
 *                                                under Android 6+.
 * @property {boolean} replace [true] - Set it to false if you don't want
 *                                      the application to be upgraded/reinstalled
 *                                      if it is already present on the device.
 * @property {boolean} partialInstall [false] - Install apks partially. It is used for 'install-multiple'.
 *                                             https://android.stackexchange.com/questions/111064/what-is-a-partial-application-install-via-adb
 */

/**
 * @typedef {Object} InstallMultipleApksOptions
 * @property {Array<string>} apks - The list of APKs to install. Each APK should be a path to a apk
 *                                  or downloadable URL as HTTP/HTTPS.
 * @property {InstallOptions} options
 */

/**
 * Install multiple APKs with `install-multiple` option.
 *
 * @param {InstallMultipleApksOptions} opts
 * @throws {Error} if an error occured while installing the given APKs.
 */
commands.mobileInstallMultipleApks = async function (opts = {}) {
  if (!_.isArray(opts.apks) || _.isEmpty(opts.apks)) {
    throw new errors.InvalidArgumentError('No apks are given to install');
  }
  const apks = await B.all(opts.apks
    .map((app) => this.helpers.configureApp(app, [APK_EXTENSION])));
  await this.adb.installMultipleApks(apks, opts.options);
};

Object.assign(extensions, commands, helpers);

export default extensions;
