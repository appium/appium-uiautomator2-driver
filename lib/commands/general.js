// @ts-check

import _ from 'lodash';
import B from 'bluebird';
import {errors, PROTOCOLS} from 'appium/driver';
import {APK_EXTENSION} from '../extensions';
import {mixin} from './mixins';
import {AndroidUiautomator2Driver} from '../driver';

/**
 * Massages the arguments going into an execute method.
 * @remarks A similar method is implemented in `appium-xcuitest-driver`, but it
 * appears the methods in here handle unwrapping of `Element` objects, so we do
 * not do that here.
 * @param {readonly any[] | readonly [StringRecord] | Readonly<StringRecord>} [args]
 * @internal
 * @returns {StringRecord<unknown>}
 */
function preprocessExecuteMethodArgs(args) {
  if (_.isArray(args)) {
    args = _.first(args);
  }
  const executeMethodArgs = /** @type {StringRecord<unknown>} */ (args ?? {});
  /**
   * Renames the deprecated `element` key to `elementId`.  Historically,
   * all of the pre-Execute-Method-Map execute methods accepted an `element` _or_ and `elementId` param.
   * This assigns the `element` value to `elementId` if `elementId` is not already present.
   */
  if (!('elementId' in executeMethodArgs) && 'element' in executeMethodArgs) {
    executeMethodArgs.elementId = executeMethodArgs.element;
    delete executeMethodArgs.element;
  }

  return executeMethodArgs;
}

/**
 * Type guard to check if a script is an execute method.
 * @param {any} script
 * @internal
 * @returns {script is keyof import('../execute-method-map').Uiautomator2ExecuteMethodMap}
 */
function isExecuteMethod(script) {
  return script in AndroidUiautomator2Driver.executeMethodMap;
}

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

  /**
   * @override
   * @privateRemarks Because the "mobile" commands (execute methods) in this
   * driver universally accept an options object, this method will _not_ call
   * into `BaseDriver.executeMethod`.
   */
  async execute(script, args) {
    if (isExecuteMethod(script)) {
      const executeMethodArgs = preprocessExecuteMethodArgs(args);
      this.log.info(`Executing native command '${script}'`);
      return await this.executeMobile(script, executeMethodArgs);
    }
    if (!this.isWebContext()) {
      throw new errors.NotImplementedError();
    }
    const endpoint =
      /** @type {import('appium-chromedriver').Chromedriver} */ (this.chromedriver).jwproxy
        .downstreamProtocol === PROTOCOLS.MJSONWP
        ? '/execute'
        : '/execute/sync';
    return await /** @type {import('appium-chromedriver').Chromedriver} */ (
      this.chromedriver
    ).jwproxy.command(endpoint, 'POST', {
      script,
      args,
    });
  },

  /**
   * @param script Must be of the form `mobile: <something>`, which differs from its parent class implementation.
   * @override
   */
  async executeMobile(script, opts = {}) {
    if (!isExecuteMethod(script)) {
      const commandNames = _.map(_.keys(AndroidUiautomator2Driver.executeMethodMap), (value) =>
        value.slice(8)
      );
      throw new errors.UnknownCommandError(
        `Unknown mobile command "${script}". ` +
          `Only ${commandNames.join(', ')} commands are supported.`
      );
    }
    const methodName =
      AndroidUiautomator2Driver.executeMethodMap[
        /** @type {keyof import('../execute-method-map').Uiautomator2ExecuteMethodMap} */ (script)
      ].command;

    return await /** @type {(opts?: any) => Promise<unknown>} */ (this[methodName])(opts);
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
    return /** @type {StringRecord} */ (
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

/**
 * @template [T=any]
 * @typedef {import('@appium/types').StringRecord<T>} StringRecord
 */
