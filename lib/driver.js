import _ from 'lodash';
import { BaseDriver, DeviceSettings } from 'appium-base-driver';
import { UiAutomator2Server, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID } from './uiautomator2';
import { fs, util, mjpeg } from 'appium-support';
import { retryInterval } from 'asyncbox';
import B from 'bluebird';
import logger from './logger';
import commands from './commands/index';
import { DEFAULT_ADB_PORT } from 'appium-adb';
import uiautomator2Helpers from './helpers';
import { androidHelpers, androidCommands, SETTINGS_HELPER_PKG_ID } from 'appium-android-driver';
import desiredCapConstraints from './desired-caps';
import { findAPortNotInUse } from 'portscanner';


const helpers = Object.assign({}, uiautomator2Helpers, androidHelpers);

// The range of ports we can use on the system for communicating to the
// UiAutomator2 HTTP server on the device
const SYSTEM_PORT_RANGE = [8200, 8299];

// This is the port that UiAutomator2 listens to on the device. We will forward
// one of the ports above on the system to this port on the device.
const DEVICE_PORT = 6790;

// NO_PROXY contains the paths that we never want to proxy to UiAutomator2 server.
// TODO:  Add the list of paths that we never want to proxy to UiAutomator2 server.
// TODO: Need to segregate the paths better way using regular expressions wherever applicable.
// (Not segregating right away because more paths to be added in the NO_PROXY list)
const NO_PROXY = [
  ['GET', new RegExp('^/session/(?!.*/)')],
  ['GET', new RegExp('^/session/[^/]+/alert_[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/alert/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/[^/]+/current_activity')],
  ['GET', new RegExp('^/session/[^/]+/appium/[^/]+/current_package')],
  ['GET', new RegExp('^/session/[^/]+/appium/app/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/device/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/settings')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/contexts')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/attribute')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/displayed')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/enabled')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/location_in_view')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/name')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/screenshot')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/selected')],
  ['GET', new RegExp('^/session/[^/]+/ime/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/location')],
  ['GET', new RegExp('^/session/[^/]+/log/types')],
  ['GET', new RegExp('^/session/[^/]+/network_connection')],
  ['GET', new RegExp('^/session/[^/]+/screenshot')],
  ['GET', new RegExp('^/session/[^/]+/timeouts')],
  ['GET', new RegExp('^/session/[^/]+/url')],
  ['POST', new RegExp('^/session/[^/]+/[^/]+_alert$')],
  ['POST', new RegExp('^/session/[^/]+/actions')],
  ['POST', new RegExp('^/session/[^/]+/alert/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/app/[^/]')],
  ['POST', new RegExp('^/session/[^/]+/appium/[^/]+/start_activity')],
  ['POST', new RegExp('^/session/[^/]+/appium/app/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/appium/compare_images')],
  ['POST', new RegExp('^/session/[^/]+/appium/device/(?!set_clipboard|get_clipboard)[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/replace_value')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/value')],
  ['POST', new RegExp('^/session/[^/]+/appium/getPerformanceData')],
  ['POST', new RegExp('^/session/[^/]+/appium/performanceData/types')],
  ['POST', new RegExp('^/session/[^/]+/appium/settings')],
  ['POST', new RegExp('^/session/[^/]+/appium/execute_driver')],
  ['POST', new RegExp('^/session/[^/]+/appium/start_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/appium/stop_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/element')],
  ['POST', new RegExp('^/session/[^/]+/ime/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/keys')],
  ['POST', new RegExp('^/session/[^/]+/location')],
  ['POST', new RegExp('^/session/[^/]+/log')],
  ['POST', new RegExp('^/session/[^/]+/network_connection')],
  ['POST', new RegExp('^/session/[^/]+/timeouts')],
  ['POST', new RegExp('^/session/[^/]+/touch/multi/perform')],
  ['POST', new RegExp('^/session/[^/]+/touch/perform')],
  ['POST', new RegExp('^/session/[^/]+/url')],

  // MJSONWP commands
  ['POST', new RegExp('^/session/[^/]+/execute')],
  ['POST', new RegExp('^/session/[^/]+/execute_async')],
  // W3C commands
  ['GET', new RegExp('^/session/[^/]+/window/rect')],
  ['POST', new RegExp('^/session/[^/]+/execute/async')],
  ['POST', new RegExp('^/session/[^/]+/execute/sync')],
];

// This is a set of methods and paths that we never want to proxy to Chromedriver.
const CHROME_NO_PROXY = [
  ['GET', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/rect')],
  ['GET', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/touch/multi/perform')],
  ['POST', new RegExp('^/session/[^/]+/touch/perform')],
];
const APK_EXTENSION = '.apk';
const APKS_EXTENSION = '.apks';

const MEMOIZED_FUNCTIONS = [
  'getStatusBarHeight',
  'getDevicePixelRatio',
];

class AndroidUiautomator2Driver extends BaseDriver {
  constructor (opts = {}, shouldValidateCaps = true) {
    // `shell` overwrites adb.shell, so remove
    delete opts.shell;

    super(opts, shouldValidateCaps);
    this.locatorStrategies = [
      'xpath',
      'id',
      'class name',
      'accessibility id',
      '-android uiautomator'
    ];
    this.desiredCapConstraints = desiredCapConstraints;
    this.uiautomator2 = null;
    this.jwpProxyActive = false;
    this.defaultIME = null;
    this.jwpProxyAvoid = NO_PROXY;
    this.apkStrings = {}; // map of language -> strings obj

    this.settings = new DeviceSettings({ignoreUnimportantViews: false, allowInvisibleElements: false},
        this.onSettingsUpdate.bind(this));
    // handle webview mechanics from AndroidDriver
    this.chromedriver = null;
    this.sessionChromedrivers = {};

    // memoize functions here, so that they are done on a per-instance basis
    for (const fn of MEMOIZED_FUNCTIONS) {
      this[fn] = _.memoize(this[fn]);
    }
  }

  validateDesiredCaps (caps) {
    return super.validateDesiredCaps(caps) && androidHelpers.validateDesiredCaps(caps);
  }

  async createSession (...args) {
    try {
      // TODO handle otherSessionData for multiple sessions
      let [sessionId, caps] = await super.createSession(...args);

      let serverDetails = {
        platform: 'LINUX',
        webStorageEnabled: false,
        takesScreenshot: true,
        javascriptEnabled: true,
        databaseEnabled: false,
        networkConnectionEnabled: true,
        locationContextEnabled: false,
        warnings: {},
        desired: this.caps,
      };

      this.caps = Object.assign(serverDetails, this.caps);

      this.curContext = this.defaultContextName();

      let defaultOpts = {
        fullReset: false,
        autoLaunch: true,
        adbPort: DEFAULT_ADB_PORT,
        androidInstallTimeout: 90000
      };
      _.defaults(this.opts, defaultOpts);

      if (this.isChromeSession) {
        logger.info("We're going to run a Chrome-based session");
        let {pkg, activity} = helpers.getChromePkg(this.opts.browserName);
        this.opts.appPackage = this.caps.appPackage = pkg;
        this.opts.appActivity = this.caps.appActivity = activity;
        logger.info(`Chrome-type package and activity are ${pkg} and ${activity}`);
      }

      if (this.opts.reboot) {
        this.setAvdFromCapabilities(caps);
      }

      if (this.opts.app) {
        // find and copy, or download and unzip an app url or path
        this.opts.app = await this.helpers.configureApp(this.opts.app, [APK_EXTENSION, APKS_EXTENSION]);
        await this.checkAppPresent();
      } else if (this.opts.appPackage) {
        // the app isn't an actual app file but rather something we want to
        // assume is on the device and just launch via the appPackage
        logger.info(`Starting '${this.opts.appPackage}' directly on the device`);
      } else {
        logger.info(`Neither 'app' nor 'appPackage' was set. Starting UiAutomator2 ` +
          'without the target application');
      }
      try {
        this.opts.systemPort = this.opts.systemPort || await findAPortNotInUse(SYSTEM_PORT_RANGE[0], SYSTEM_PORT_RANGE[1]);
      } catch (e) {
        logger.errorAndThrow(`Cannot find any free port in range ${_.first(SYSTEM_PORT_RANGE)}..${_.last(SYSTEM_PORT_RANGE)}}. ` +
          `Please set the available port number by providing the systemPort capability or ` +
          `double check the processes that are locking ports within this range and terminate ` +
          `these which are not needed anymore`);
      }
      this.opts.adbPort = this.opts.adbPort || DEFAULT_ADB_PORT;

      await this.startUiAutomator2Session();
      await this.fillDeviceDetails();
      if (this.opts.mjpegScreenshotUrl) {
        logger.info(`Starting MJPEG stream reading URL: '${this.opts.mjpegScreenshotUrl}'`);
        this.mjpegStream = new mjpeg.MJpegStream(this.opts.mjpegScreenshotUrl);
        await this.mjpegStream.start();
      }
      return [sessionId, this.caps];
    } catch (e) {
      await this.deleteSession();
      throw e;
    }
  }

  async fillDeviceDetails () {
    this.caps.pixelRatio = await this.getDevicePixelRatio();
    this.caps.statBarHeight = await this.getStatusBarHeight();
    this.caps.viewportRect = await this.getViewPortRect();
  }

  get driverData () {
    // TODO fill out resource info here
    return {};
  }

  async getSession () {
    let sessionData = await super.getSession();
    logger.debug('Getting session details from server to mix in');
    let uia2Data = await this.uiautomator2.jwproxy.command('/', 'GET', {});
    return Object.assign({}, sessionData, uia2Data);
  }

  isEmulator () {
    return !!(this.opts.avd || /emulator/.test(this.opts.udid));
  }

  setAvdFromCapabilities (caps) {
    if (this.opts.avd) {
      logger.info('avd name defined, ignoring device name and platform version');
    } else {
      if (!caps.deviceName) {
        logger.errorAndThrow('avd or deviceName should be specified when reboot option is enables');
      }
      if (!caps.platformVersion) {
        logger.errorAndThrow('avd or platformVersion should be specified when reboot option is enabled');
      }
      let avdDevice = caps.deviceName.replace(/[^a-zA-Z0-9_.]/g, '-');
      this.opts.avd = `${avdDevice}__${caps.platformVersion}`;
    }
  }

  async startUiAutomator2Session () {
    // get device udid for this session
    let {udid, emPort} = await helpers.getDeviceInfoFromCaps(this.opts);
    this.opts.udid = udid;
    this.opts.emPort = emPort;

    // now that we know our java version and device info, we can create our
    // ADB instance
    this.adb = await androidHelpers.createADB(this.opts);

    const apiLevel = await this.adb.getApiLevel();

    if (apiLevel < 21) {
      logger.errorAndThrow('UIAutomation2 is only supported since Android 5.0 (Lollipop). ' +
        'You could still use other supported backends in order to automate older Android versions.');
    }

    if (apiLevel >= 28) { // Android P
      logger.warn('Relaxing hidden api policy');
      await this.adb.setHiddenApiPolicy('1');
    }

    // check if we have to enable/disable gps before running the application
    if (util.hasValue(this.opts.gpsEnabled)) {
      if (this.isEmulator()) {
        logger.info(`Trying to ${this.opts.gpsEnabled ? 'enable' : 'disable'} gps location provider`);
        await this.adb.toggleGPSLocationProvider(this.opts.gpsEnabled);
      } else {
        logger.warn(`Sorry! 'gpsEnabled' capability is only available for emulators`);
      }
    }

    // get appPackage et al from manifest if necessary
    const appInfo = await helpers.getLaunchInfo(this.adb, this.opts);
    // and get it onto our 'opts' object so we use it from now on
    Object.assign(this.opts, appInfo || {});

    // set actual device name, udid, platform version, screen size, screen density, model and manufacturer details
    this.caps.deviceName = this.adb.curDeviceId;
    this.caps.deviceUDID = this.opts.udid;

    // start an avd, set the language/locale, pick an emulator, etc...
    // TODO with multiple devices we'll need to parameterize this
    this.defaultIME = await helpers.initDevice(this.adb, this.opts);

    // set up the modified UiAutomator2 server etc
    await this.initUiAutomator2Server();

    // Further prepare the device by forwarding the UiAutomator2 port
    logger.debug(`Forwarding UiAutomator2 Server port ${DEVICE_PORT} to ${this.opts.systemPort}`);
    await this.adb.forwardPort(this.opts.systemPort, DEVICE_PORT);

    // Should be after installing io.appium.settings in helpers.initDevice
    if (this.opts.disableWindowAnimation && (await this.adb.getApiLevel() < 26)) { // API level 26 is Android 8.0.
      // Granting android.permission.SET_ANIMATION_SCALE is necessary to handle animations under API level 26
      // Read https://github.com/appium/appium/pull/11640#issuecomment-438260477
      // `--no-window-animation` works over Android 8 to disable all of animations
      if (await this.adb.isAnimationOn()) {
        logger.info('Disabling animation via io.appium.settings');
        await this.adb.setAnimationState(false);
        this._wasWindowAnimationDisabled = true;
      } else {
        logger.info('Window animation is already disabled');
      }
    }

    // If the user sets autoLaunch to false, they are responsible for initAUT() and startAUT()
    if (this.opts.autoLaunch) {
      // set up app under test
      // prepare our actual AUT, get it on the device, etc...
      await this.initAUT();
    }
    // Adding AUT package name in the capabilities if package name not exist in caps
    if (!this.caps.appPackage && appInfo) {
      this.caps.appPackage = appInfo.appPackage;
    }

    // launch UiAutomator2 and wait till its online and we have a session
    await this.uiautomator2.startSession(this.caps);

    await this.addDeviceInfoToCaps();

    // Unlock the device after the session is started.
    if (!this.opts.skipUnlock) {
      // unlock the device to prepare it for testing
      await helpers.unlock(this, this.adb, this.caps);
    } else {
      logger.debug(`'skipUnlock' capability set, so skipping device unlock`);
    }

    if (this.isChromeSession) { // start a chromedriver session
      await this.startChromeSession(this);
    } else if (this.opts.autoLaunch && this.opts.appPackage) {
      await this.ensureAppStarts();
    }

    // if the initial orientation is requested, set it
    if (util.hasValue(this.opts.orientation)) {
      logger.debug(`Setting initial orientation to '${this.opts.orientation}'`);
      await this.setOrientation(this.opts.orientation);
    }

    // if we want to immediately get into a webview, set our context
    // appropriately
    if (this.opts.autoWebview) {
      const viewName = this.defaultWebviewName();
      const timeout = this.opts.autoWebviewTimeout || 2000;
      logger.info(`Setting auto webview to context '${viewName}' with timeout ${timeout}ms`);
      await retryInterval(timeout / 500, 500, this.setContext.bind(this), viewName);
    }

    // now that everything has started successfully, turn on proxying so all
    // subsequent session requests go straight to/from uiautomator2
    this.jwpProxyActive = true;
  }

  async addDeviceInfoToCaps () {
    const {
      apiVersion,
      platformVersion,
      manufacturer,
      model,
      realDisplaySize,
      displayDensity,
    } = await this.mobileGetDeviceInfo();
    this.caps.deviceApiLevel = parseInt(apiVersion, 10);
    this.caps.platformVersion = platformVersion;
    this.caps.deviceScreenSize = realDisplaySize;
    this.caps.deviceScreenDensity = displayDensity;
    this.caps.deviceModel = model;
    this.caps.deviceManufacturer = manufacturer;
  }

  async initUiAutomator2Server () {
    // now that we have package and activity, we can create an instance of
    // uiautomator2 with the appropriate data
    this.uiautomator2 = new UiAutomator2Server({
      host: this.opts.remoteAdbHost || this.opts.host || 'localhost',
      systemPort: this.opts.systemPort,
      devicePort: DEVICE_PORT,
      adb: this.adb,
      apk: this.opts.app,
      tmpDir: this.opts.tmpDir,
      appPackage: this.opts.appPackage,
      appActivity: this.opts.appActivity,
      disableWindowAnimation: !!this.opts.disableWindowAnimation,
    });
    this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);

    if (this.opts.skipServerInstallation) {
      logger.info(`'skipServerInstallation' is set. Skipping UIAutomator2 server installation.`);
    } else {
      await this.uiautomator2.installServerApk(this.opts.uiautomator2ServerInstallTimeout);
    }
  }

  async initAUT () {
    // Uninstall any uninstallOtherPackages which were specified in caps
    if (this.opts.uninstallOtherPackages) {
      await helpers.uninstallOtherPackages(
        this.adb,
        helpers.parseArray(this.opts.uninstallOtherPackages),
        [SETTINGS_HELPER_PKG_ID, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID]
      );
    }

    // Install any "otherApps" that were specified in caps
    if (this.opts.otherApps) {
      let otherApps;
      try {
        otherApps = helpers.parseArray(this.opts.otherApps);
      } catch (e) {
        logger.errorAndThrow(`Could not parse "otherApps" capability: ${e.message}`);
      }
      otherApps = await B.all(otherApps
        .map((app) => this.helpers.configureApp(app, [APK_EXTENSION, APKS_EXTENSION])));
      await helpers.installOtherApks(otherApps, this.adb, this.opts);
    }

    if (this.opts.app) {
      if (!this.opts.noSign && !await this.adb.checkApkCert(this.opts.app, this.opts.appPackage)) {
        await helpers.signApp(this.adb, this.opts.app);
      }
      if (!this.opts.skipUninstall) {
        await this.adb.uninstallApk(this.opts.appPackage);
      }
      await helpers.installApk(this.adb, this.opts);
    } else {
      if (this.opts.fullReset) {
        logger.errorAndThrow('Full reset requires an app capability, use fastReset if app is not provided');
      }
      logger.debug('No app capability. Assuming it is already on the device');
      if (this.opts.fastReset && this.opts.appPackage) {
        await helpers.resetApp(this.adb, this.opts);
      }
    }
  }

  async ensureAppStarts () {
    // make sure we have an activity and package to wait for
    const appWaitPackage = this.opts.appWaitPackage || this.opts.appPackage;
    const appWaitActivity = this.opts.appWaitActivity || this.opts.appActivity;

    logger.info(`Starting '${this.opts.appPackage}/${this.opts.appActivity} ` +
      `and waiting for '${appWaitPackage}/${appWaitActivity}'`);

    if (this.caps.androidCoverage) {
      logger.info(`androidCoverage is configured. ` +
        ` Starting instrumentation of '${this.caps.androidCoverage}'...`);
      await this.adb.androidCoverage(this.caps.androidCoverage, appWaitPackage, appWaitActivity);
    } else {
      await this.adb.startApp({
        pkg: this.opts.appPackage,
        activity: this.opts.appActivity,
        action: this.opts.intentAction,
        category: this.opts.intentCategory,
        flags: this.opts.intentFlags,
        waitPkg: this.opts.appWaitPackage,
        waitActivity: this.opts.appWaitActivity,
        waitForLaunch: this.opts.appWaitForLaunch,
        optionalIntentArguments: this.opts.optionalIntentArguments,
        stopApp: !this.opts.dontStopAppOnReset,
        retry: true
      });
    }

  }

  async deleteSession () {
    logger.debug('Deleting UiAutomator2 session');
    await androidHelpers.removeAllSessionWebSocketHandlers(this.server, this.sessionId);
    if (this.uiautomator2) {
      try {
        await this.stopChromedriverProxies();
      } catch (err) {
        logger.warn(`Unable to stop ChromeDriver proxies: ${err.message}`);
      }
      if (this.jwpProxyActive) {
        try {
          await this.uiautomator2.deleteSession();
        } catch (err) {
          logger.warn(`Unable to proxy deleteSession to UiAutomator2: ${err.message}`);
        }
      }
      this.uiautomator2 = null;
    }
    this.jwpProxyActive = false;

    if (this.adb) {
      if (this.opts.unicodeKeyboard && this.opts.resetKeyboard && this.defaultIME) {
        logger.debug(`Resetting IME to '${this.defaultIME}'`);
        try {
          await this.adb.setIME(this.defaultIME);
        } catch (err) {
          logger.warn(`Unable to reset IME: ${err.message}`);
        }
      }
      if (this.caps.androidCoverage) {
        logger.info('Shutting down the adb process of instrumentation...');
        await this.adb.endAndroidCoverage();
        // Use this broadcast intent to notify it's time to dump coverage to file
        if (this.caps.androidCoverageEndIntent) {
          logger.info(`Sending intent broadcast '${this.caps.androidCoverageEndIntent}' at the end of instrumenting.`);
          await this.adb.broadcast(this.caps.androidCoverageEndIntent);
        } else {
          logger.warn('No androidCoverageEndIntent is configured in caps. Possibly you cannot get coverage file.');
        }
      }
      if (this.opts.appPackage) {
        if (!this.isChromeSession && !this.opts.dontStopAppOnReset) {
          try {
            await this.adb.forceStop(this.opts.appPackage);
          } catch (err) {
            logger.warn(`Unable to force stop app: ${err.message}`);
          }
        }
        if (this.opts.fullReset && !this.opts.skipUninstall) {
          logger.debug(`Capability 'fullReset' set to 'true', Uninstalling '${this.opts.appPackage}'`);
          try {
            await this.adb.uninstallApk(this.opts.appPackage);
          } catch (err) {
            logger.warn(`Unable to uninstall app: ${err.message}`);
          }
        }
      }
      // This value can be true if test target device is <= 26
      if (this._wasWindowAnimationDisabled) {
        logger.info('Restoring window animation state');
        await this.adb.setAnimationState(true);
      }
      await this.adb.stopLogcat();
      if (util.hasValue(this.opts.systemPort)) {
        try {
          await this.adb.removePortForward(this.opts.systemPort);
        } catch (error) {
          logger.warn(`Unable to remove port forward '${error.message}'`);
          // Ignore, this block will also be called when we fall in catch block
          // and before even port forward.
        }
      }

      if (await this.adb.getApiLevel() >= 28) { // Android P
        logger.info('Restoring hidden api policy to the device default configuration');
        await this.adb.setDefaultHiddenApiPolicy();
      }

      if (this.opts.reboot) {
        let avdName = this.opts.avd.replace('@', '');
        logger.debug(`Closing emulator '${avdName}'`);
        try {
          await this.adb.killEmulator(avdName);
        } catch (err) {
          logger.warn(`Unable to close emulator: ${err.message}`);
        }
      }
    }
    if (this.mjpegStream) {
      logger.info('Closing MJPEG stream');
      this.mjpegStream.stop();
    }
    await super.deleteSession();
  }

  async checkAppPresent () {
    logger.debug('Checking whether app is actually present');
    if (!(await fs.exists(this.opts.app))) {
      logger.errorAndThrow(`Could not find app apk at '${this.opts.app}'`);
    }
  }

  async onSettingsUpdate () {
    // intentionally do nothing here, since commands.updateSettings proxies
    // settings to the uiauto2 server already
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

  canProxy (sessionId) {
    super.canProxy(sessionId);

    // we can always proxy to the uiautomator2 server
    return true;
  }

  getProxyAvoidList (sessionId) {
    super.getProxyAvoidList(sessionId);
    // we are maintaining two sets of NO_PROXY lists, one for chromedriver(CHROME_NO_PROXY)
    // and one for uiautomator2(NO_PROXY), based on current context will return related NO_PROXY list
    if (util.hasValue(this.chromedriver)) {
      // if the current context is webview(chromedriver), then return CHROME_NO_PROXY list
      this.jwpProxyAvoid = CHROME_NO_PROXY;
    } else {
      this.jwpProxyAvoid = NO_PROXY;
    }
    if (this.opts.nativeWebScreenshot) {
      this.jwpProxyAvoid = [...this.jwpProxyAvoid, ['GET', new RegExp('^/session/[^/]+/screenshot')]];
    }

    return this.jwpProxyAvoid;
  }

  get isChromeSession () {
    return helpers.isChromeBrowser(this.opts.browserName);
  }
}

// first add the android-driver commands which we will fall back to
for (let [cmd, fn] of _.toPairs(androidCommands)) {
  AndroidUiautomator2Driver.prototype[cmd] = fn;
}

// then overwrite with any uiautomator2-specific commands
for (let [cmd, fn] of _.toPairs(commands)) {
  AndroidUiautomator2Driver.prototype[cmd] = fn;
}

export { AndroidUiautomator2Driver };
export default AndroidUiautomator2Driver;
