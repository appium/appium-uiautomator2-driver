// @ts-check

import _ from 'lodash';
import B from 'bluebird';
import {errors} from 'appium/driver';
import {APK_EXTENSION} from '../extensions';
import {mixin} from './mixins';

/**
 * @satisfies {Record<string, import('type-fest').ConditionalKeys<import('../driver').AndroidUiautomator2Driver, (opts?: any)=> Promise<any>>>}
 */
const mobileCommandsMapping = /** @type {const} */ ({
  shell: 'mobileShell',

  execEmuConsoleCommand: 'mobileExecEmuConsoleCommand',

  dragGesture: 'mobileDragGesture',
  flingGesture: 'mobileFlingGesture',
  doubleClickGesture: 'mobileDoubleClickGesture',
  clickGesture: 'mobileClickGesture',
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
  openNotifications: 'openNotifications',

  listSms: 'mobileListSms',

  type: 'mobileType',
  replaceElementValue: 'mobileReplaceElementValue',

  pushFile: 'mobilePushFile',
  pullFile: 'mobilePullFile',
  pullFolder: 'mobilePullFolder',
  deleteFile: 'mobileDeleteFile',

  isAppInstalled: 'mobileIsAppInstalled',
  queryAppState: 'mobileQueryAppState',
  activateApp: 'mobileActivateApp',
  removeApp: 'mobileRemoveApp',
  terminateApp: 'mobileTerminateApp',
  installApp: 'mobileInstallApp',
  clearApp: 'mobileClearApp',
  backgroundApp: 'mobileBackgroundApp',
  getCurrentActivity: 'getCurrentActivity',
  getCurrentPackage: 'getCurrentPackage',

  startActivity: 'mobileStartActivity',
  startService: 'mobileStartService',
  stopService: 'mobileStopService',
  broadcast: 'mobileBroadcast',

  getContexts: 'mobileGetContexts',

  getAppStrings: 'mobileGetAppStrings',

  installMultipleApks: 'mobileInstallMultipleApks',

  lock: 'mobileLock',
  unlock: 'mobileUnlock',
  isLocked: 'isLocked',

  refreshGpsCache: 'mobileRefreshGpsCache',

  startMediaProjectionRecording: 'mobileStartMediaProjectionRecording',
  isMediaProjectionRecordingRunning: 'mobileIsMediaProjectionRecordingRunning',
  stopMediaProjectionRecording: 'mobileStopMediaProjectionRecording',

  getConnectivity: 'mobileGetConnectivity',
  setConnectivity: 'mobileSetConnectivity',
  toggleGps: 'toggleLocationServices',
  isGpsEnables: 'isLocationServicesEnabled',

  hideKeyboard: 'hideKeyboard',
  isKeyboardShown: 'isKeyboardShown',

  pressKey: 'mobilePressKey',

  getDisplayDensity: 'getDisplayDensity',
  getSystemBars: 'getSystemBars',

  fingerprint: 'mobileFingerprint',
  sendSms: 'mobileSendSms',
  gsmCall: 'mobileGsmCall',
  gsmSignal: 'mobileGsmSignal',
  gsmVoice: 'mobileGsmVoice',
  // @ts-expect-error FIXME: this does not exist anywhere!
  powerAc: 'mobilePowerAC',
  powerCapacity: 'mobilePowerCapacity',
  networkSpeed: 'mobileNetworkSpeed',
  sensorSet: 'sensorSet',

  getPerformanceData: 'mobileGetPerformanceData',
  getPerformanceDataTypes: 'getPerformanceDataTypes',

  statusBar: 'mobilePerformStatusBarCommand',

  screenshots: 'mobileScreenshots',
});

/**
 * @typedef {typeof mobileCommandsMapping} MobileCommandsMapping
 */

/**
 * @type {import('./mixins').UIA2GeneralMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const GeneralMixin = {
  async getPageSource() {
    return String(
      await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
        '/source',
        'GET',
        {}
      )
    );
  },
  async getClipboard() {
    const adb = /** @type {ADB} */ (this.adb);
    return String(
      (await adb.getApiLevel()) < 29
        ? await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
            '/appium/device/get_clipboard',
            'POST',
            {}
          )
        : await adb.getClipboard()
    );
  },
  async doSendKeys(params) {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      '/keys',
      'POST',
      params
    );
  },
  async keyevent(keycode, metastate) {
    this.log.debug(`Ignoring metastate ${metastate}`);
    await /** @type {ADB} */ (this.adb).keyevent(keycode);
  },
  async back() {
    await /** @type {ADB} */ (this.adb).keyevent(4);
  },
  async getDisplayDensity() {
    return /** @type {number} */ (
      await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
        '/appium/device/display_density',
        'GET',
        {}
      )
    );
  },
  async getWindowSize() {
    return /** @type {import('@appium/types').Size} */ (
      await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
        '/window/current/size',
        'GET',
        {}
      )
    );
  },

  // For W3C
  async getWindowRect() {
    const {width, height} = await this.getWindowSize();
    return {
      width,
      height,
      x: 0,
      y: 0,
    };
  },

  async executeMobile(mobileCommand, opts = {}) {
    if (!(mobileCommand in mobileCommandsMapping)) {
      throw new errors.UnknownCommandError(
        `Unknown mobile command "${mobileCommand}". ` +
          `Only ${_.keys(mobileCommandsMapping)} commands are supported.`
      );
    }
    const methodName = /** @type {keyof MobileCommandsMapping} */ (mobileCommand);
    const method =
      /** @type {import('type-fest').ConditionalKeys<typeof this, (opts?: any) => Promise<any>>} */ (
        mobileCommandsMapping[methodName]
      );
    return await /** @type {(opts?: any) => Promise<unknown>} */ (this[method])(opts);
  },

  async mobileViewportScreenshot() {
    return await this.getViewportScreenshot();
  },

  /**
   * Returns the viewport coordinates.
   * @returns The viewport coordinates.
   */
  async mobileViewPortRect() {
    return await this.getViewPortRect();
  },

  async setUrl(url) {
    await /** @type {ADB} */ (this.adb).startUri(url, /** @type {string} */ (this.opts.appPackage));
  },

  /**
   * Start URL that take users directly to specific content in the app
   */
  async mobileDeepLink(opts) {
    const {url, package: pkg, waitForLaunch} = opts;
    return await /** @type {ADB} */ (this.adb).startUri(url, pkg, {waitForLaunch});
  },

  async openNotifications() {
    await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
      '/appium/device/open_notifications',
      'POST',
      {}
    );
  },

  /**
   * Overriding appium-android-driver's wrapBootstrapDisconnect,
   * unlike in appium-android-driver avoiding adb restarting as it intern
   * kills UiAutomator2 server running in the device.
   **/
  async wrapBootstrapDisconnect(wrapped) {
    await wrapped();
  },

  // Stop proxying to any Chromedriver and redirect to uiautomator2
  suspendChromedriverProxy() {
    this.chromedriver = undefined;
    this.proxyReqRes = /** @type {UiAutomator2Server} */ (this.uiautomator2).proxyReqRes.bind(
      this.uiautomator2
    );
    this.proxyCommand = /** @type {typeof this.proxyCommand} */ (
      /** @type {UiAutomator2Server} */ (this.uiautomator2).proxyCommand.bind(this.uiautomator2)
    );
    this.jwpProxyActive = true;
  },

  /**
   * The list of available info entries can be found at
   * https://github.com/appium/appium-uiautomator2-server/blob/master/app/src/main/java/io/appium/uiautomator2/handler/GetDeviceInfo.java
   */
  async mobileGetDeviceInfo() {
    return /** @type {import('@appium/types').StringRecord} */ (
      await /** @type {UiAutomator2Server} */ (this.uiautomator2).jwproxy.command(
        '/appium/device/info',
        'GET'
      )
    );
  },

  /**
   * Types the given Unicode string.
   * It is expected that the focus is already put
   * to the destination input field before this method is called.
   *
   * @returns `true` if the input text has been successfully sent to adb
   * @throws {Error} if `text` property has not been provided
   */
  async mobileType(opts) {
    const {text} = opts;
    if (_.isUndefined(text)) {
      this.log.errorAndThrow(`The 'text' argument is mandatory`);
      throw new Error(); // unreachable
    }
    return await /** @type {ADB} */ (this.adb).typeUnicode(String(text));
  },

  /**
   * Install multiple APKs with `install-multiple` option.
   *
   * @throws {Error} if an error occured while installing the given APKs.
   */
  async mobileInstallMultipleApks(opts) {
    if (!_.isArray(opts.apks) || _.isEmpty(opts.apks)) {
      throw new errors.InvalidArgumentError('No apks are given to install');
    }
    const apks = await B.all(
      opts.apks.map((app) => this.helpers.configureApp(app, [APK_EXTENSION]))
    );
    await /** @type {ADB} */ (this.adb).installMultipleApks(apks, opts.options);
  },

  /**
   * Puts the app to background and waits the given number of seconds Then restores the app
   * if necessary. The call is blocking.
   */
  async mobileBackgroundApp(opts = {}) {
    const {seconds = -1} = opts;
    await this.background(seconds);
  },
};

mixin(GeneralMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 * @typedef {import('appium-adb').ADB} ADB
 */
