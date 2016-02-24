import _ from 'lodash';
import { BaseDriver } from 'appium-base-driver';
import UiAutomator2Server from './uiautomator2';
import { fs } from 'appium-support';
import { retryInterval } from 'asyncbox';
import logger from './logger';
import commands from './commands';
import { DEFAULT_ADB_PORT } from 'appium-adb';
import * as uiautomator2Helpers from './helpers';
import { androidHelpers, androidCommands, WEBVIEW_BASE } from 'appium-android-driver';
import desiredCapConstraints from './desired-caps';


let helpers = {};
Object.assign(helpers, uiautomator2Helpers, androidHelpers);

// The range of ports we can use on the system for communicating to the
// UiAutomator2 HTTP server on the device
const SYSTEM_PORT_RANGE = [8200, 8299];

// This is the port that UiAutomator2 listens to on the device. We will forward
// one of the ports above on the system to this port on the device.
const DEVICE_PORT = 8080;

// This is a set of methods and paths that we never want to proxy to UiAutomator2
const NO_PROXY = [
  ['GET', new RegExp('^/session/[^/]+/log/types$')],
  ['POST', new RegExp('^/session/[^/]+/log')],
  ['POST', new RegExp('^/session/[^/]+/location')],
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/appium')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/contexts')],
  ['POST', new RegExp('^/session/[^/]+/element/[^/]+/value')],
  ['GET', new RegExp('^/session/[^/]+/network_connection')],
  ['POST', new RegExp('^/session/[^/]+/network_connection')],
  ['POST', new RegExp('^/session/[^/]+/ime')],
  ['GET', new RegExp('^/session/[^/]+/ime')],
  ['POST', new RegExp('^/session/[^/]+/keys')],
  ['POST', new RegExp('^/session/[^/]+/touch/multi/perform')],
];

const APP_EXTENSION = '.apk';


class AndroidUiautomator2Driver extends BaseDriver {
  constructor (opts = {}, shouldValidateCaps = true) {
    // `shell` overwrites adb.shell, so remove
    delete opts.shell;

    super(opts, shouldValidateCaps);

    this.desiredCapConstraints = desiredCapConstraints;
    this.uiautomator2 = null;
    this.jwpProxyActive = false;
    this.defaultIME = null;
    this.jwpProxyAvoid = NO_PROXY;
    this.apkStrings = {}; // map of language -> strings obj

    // handle webview mechanics from AndroidDriver
    this.chromedriver = null;
    this.sessionChromedrivers = {};
  }

  async createSession (caps) {
    try {
     
      // TODO handle otherSessionData for multiple sessions
      let sessionId;
      [sessionId] = await super.createSession(caps);
      // fail very early if the app doesn't actually exist, since uiautomator2
      // (unlike the android driver) can't run a pre-installed app based
      // only on package name. It has to be an actual apk
      this.opts.app = await this.helpers.configureApp(this.opts.app, APP_EXTENSION);
      await this.checkAppPresent();
      this.opts.systemPort = this.opts.systemPort || SYSTEM_PORT_RANGE[0];
      this.opts.adbPort = this.opts.adbPort || DEFAULT_ADB_PORT;
      await this.startUiAutomator2Session();
      return [sessionId, caps];
    } catch (e) {
      await this.deleteSession();
      throw e;
    }
  }

  get driverData () {
    // TODO fille out resource info here
    return {};
  }

  async startUiAutomator2Session () {
    if (!this.opts.javaVersion) {
      this.opts.javaVersion = await helpers.getJavaVersion();
    }

    // get device udid for this session
    let {udid, emPort} = await helpers.getDeviceInfoFromCaps(this.opts);
    this.opts.udid = udid;
    this.opts.emPort = emPort;

    // now that we know our java version and device info, we can create our
    // ADB instance
    this.adb = await androidHelpers.createADB(this.opts.javaVersion,
        this.opts.udid, this.opts.emPort, this.opts.adbPort);
    // fail very early if the user's app doesn't have the appropriate perms
    // for uiautomator2 automation
    await helpers.ensureInternetPermissionForApp(this.adb, this.opts.app);
    // get appPackage et al from manifest if necessary
    let appInfo = await helpers.getLaunchInfo(this.adb, this.opts);
    // and get it onto our 'opts' object so we use it from now on
    Object.assign(this.opts, appInfo);
    // set up the modified UiAutomator2 server etc
    await this.initUiAutomator2Server();
    // start an avd, set the language/locale, pick an emulator, etc...
    // TODO with multiple devices we'll need to parameterize this
    await helpers.initDevice(this.adb, this.opts);
    // Further prepare the device by forwarding the UiAutomator2 port
    await this.adb.forwardPort(this.opts.systemPort, DEVICE_PORT);
    // prepare our actual AUT, get it on the device, etc...
    await this.initAUT();
    // unlock the device to prepare it for testing
    await helpers.unlock(this.adb);
    // launch UiAutomator2 and wait till its online and we have a session
    await this.uiautomator2.startSession(this.caps);
    // rescue UiAutomator2 if it fails to start our AUT
    await this.ensureAppStarts();
    // if we want to immediately get into a webview, set our context
    // appropriately
    if (this.opts.autoWebview) {
      await retryInterval(20, this.opts.autoWebviewTimeout || 2000, async () => {
        await this.setContext(this.defaultWebviewName());
      });
    }
    // now that everything has started successfully, turn on proxying so all
    // subsequent session requests go straight to/from uiautomator2
    this.jwpProxyActive = true;
  }

  async initUiAutomator2Server () {
    // now that we have package and activity, we can create an instance of
    // uiautomator2 with the appropriate data
    this.uiautomator2 = new UiAutomator2Server({
      host: this.opts.host || 'localhost',
      systemPort: this.opts.systemPort,
      devicePort: DEVICE_PORT,
      adb: this.adb,
      apk: this.opts.app,
      tmpDir: this.opts.tmpDir,
      appPackage: this.opts.appPackage,
      appActivity: this.opts.appActivity,
    });
    this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);   
   
  }

  async initAUT () {
    // set the localized strings for the current language from the apk
    // TODO: incorporate changes from appium#5308 which fix a race cond-
    // ition bug in old appium and need to be replicated here
    this.apkStrings[this.opts.language] = await helpers.pushStrings(
        this.opts.language, this.adb, this.opts);
    if (!this.opts.skipUninstall) {
      await this.adb.uninstallApk(this.opts.appPackage);
    }
    if (!this.opts.noSign) {
      let signed = await this.adb.checkApkCert(this.opts.app, this.opts.appPackage);
      if (!signed) {
        await this.adb.sign(this.opts.app, this.opts.appPackage);
      }
    }
    await helpers.installApkRemotely(this.adb, this.opts.app,
                                     this.opts.appPackage,
                                     this.opts.fastReset);
    await this.uiautomator2.installServerApk();
  }

  async ensureAppStarts () {
    // make sure we have an activity and package to wait for
    let appWaitPackage = this.opts.appWaitPackage || this.opts.appPackage;
    let appWaitActivity = this.opts.appWaitActivity || this.opts.appActivity;
    
    logger.info(`UiAutomator2 did not start the activity we were waiting for, ` +
                  `'${appWaitPackage}/${appWaitActivity}'. ` +
                  `Starting it ourselves`);
    await this.adb.startApp({
        pkg: this.opts.appPackage,
        activity: this.opts.appActivity,
        action: this.opts.intentAction,
        category: this.opts.intentCategory,
        flags: this.opts.intentFlags,
        waitPkg: this.opts.appWaitPackage,
        waitActivity: this.opts.appWaitActivity,
        optionalIntentArguments: this.opts.optionalIntentArguments,
        stopApp: !this.opts.dontStopAppOnReset,
        retry: false
      });    
  }

  async deleteSession () {
    logger.debug('Deleting UiAutomator2 session');
    if (this.uiautomator2) {
      if (this.jwpProxyActive) {
        await this.uiautomator2.deleteSession();
      }
      this.uiautomator2 = null;
    }
    this.jwpProxyActive = false;

    if (this.adb) {
      if (this.opts.unicodeKeyboard && this.opts.resetKeyboard &&
          this.defaultIME) {
        logger.debug(`Resetting IME to '${this.defaultIME}'`);
        await this.adb.setIME(this.defaultIME);
      }
      await this.adb.forceStop(this.opts.appPackage);
      await this.adb.stopLogcat();
    }
    await super.deleteSession();
  }

  async checkAppPresent () {
    logger.debug('Checking whether app is actually present');
    if (!(await fs.exists(this.opts.app))) {
      logger.errorAndThrow(`Could not find app apk at '${this.opts.app}'`);
    }
  }

  defaultWebviewName () {
    return `${WEBVIEW_BASE}0`;
  }

  // Need to override android-driver's version of this since we don't actually
  // have a bootstrap; instead we just restart adb and re-forward the UiAutomator2
  // port
  async wrapBootstrapDisconnect (wrapped) {
    await wrapped();
    await this.adb.restart();
    await this.adb.forwardPort(this.opts.systemPort, DEVICE_PORT);
  }

  proxyActive (sessionId) {
    super.proxyActive(sessionId);

    // we always have an active proxy to the UiAutomator2 server
    return true;
  }

  getProxyAvoidList (sessionId) {
    super.getProxyAvoidList(sessionId);
    
    return this.jwpProxyAvoid;
  }

  canProxy (sessionId) {
    super.canProxy(sessionId);

    // we can always proxy to the uiautomator2 server
    return true;
  }
}

// first add the android-driver commands which we will fall back to
for (let [cmd, fn] of _.pairs(androidCommands)) {
  // we do some different/special things with these methods
  if (!_.contains(['defaultWebviewName'], cmd)) {
    AndroidUiautomator2Driver.prototype[cmd] = fn;
  }
}

// then overwrite with any uiautomator2-specific commands
for (let [cmd, fn] of _.pairs(commands)) {
  AndroidUiautomator2Driver.prototype[cmd] = fn;
}

export default AndroidUiautomator2Driver;
