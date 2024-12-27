/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  DefaultCreateSessionResult,
  DriverData,
  ExternalDriver,
  InitialOpts,
  Orientation,
  RouteMatcher,
  SingularSessionData,
  StringRecord,
} from '@appium/types';
import {DEFAULT_ADB_PORT} from 'appium-adb';
import AndroidDriver, {utils} from 'appium-android-driver';
import {SETTINGS_HELPER_ID} from 'io.appium.settings';
import {BaseDriver, DeviceSettings} from 'appium/driver';
import {fs, mjpeg, util} from 'appium/support';
import {retryInterval} from 'asyncbox';
import B from 'bluebird';
import _ from 'lodash';
import os from 'node:os';
import path from 'node:path';
import {checkPortStatus, findAPortNotInUse} from 'portscanner';
import type {ExecError} from 'teen_process';
import UIAUTOMATOR2_CONSTRAINTS, {type Uiautomator2Constraints} from './constraints';
import {APKS_EXTENSION, APK_EXTENSION} from './extensions';
import {newMethodMap} from './method-map';
import { signApp } from './helpers';
import type { EmptyObject } from 'type-fest';
import type {
  Uiautomator2Settings,
  Uiautomator2DeviceDetails,
  Uiautomator2DriverCaps,
  Uiautomator2DriverOpts,
  Uiautomator2SessionCaps,
  Uiautomator2SessionInfo,
  Uiautomator2StartSessionOpts,
  W3CUiautomator2DriverCaps,
} from './types';
import {SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID, UiAutomator2Server} from './uiautomator2';
import {
  mobileGetActionHistory,
  mobileScheduleAction,
  mobileUnscheduleAction,
  performActions,
  releaseActions,
} from './commands/actions';
import {
  getAlertText,
  mobileAcceptAlert,
  mobileDismissAlert,
  postAcceptAlert,
  postDismissAlert,
} from './commands/alert';
import {
  mobileInstallMultipleApks,
  mobileBackgroundApp,
} from './commands/app-management';
import {
  mobileGetAppStrings,
} from './commands/app-strings';
import {
  mobileGetBatteryInfo,
} from './commands/battery';
import {
  getClipboard,
  mobileGetClipboard,
  setClipboard,
  mobileSetClipboard,
} from './commands/clipboard';
import {
  active,
  getAttribute,
  elementEnabled,
  elementDisplayed,
  elementSelected,
  getName,
  getLocation,
  getSize,
  getElementRect,
  getElementScreenshot,
  getText,
  setValueImmediate,
  doSetElementValue,
  click,
  clear,
  mobileReplaceElementValue,
} from './commands/element';
import {
  executeMobile,
  mobileCommandsMapping,
} from './commands/execute';
import {
  doFindElementOrEls,
} from './commands/find';
import {
  mobileClickGesture,
  mobileDoubleClickGesture,
  mobileDragGesture,
  mobileFlingGesture,
  mobileLongClickGesture,
  mobilePinchCloseGesture,
  mobilePinchOpenGesture,
  mobileScroll,
  mobileScrollBackTo,
  mobileScrollGesture,
  mobileSwipeGesture,
} from './commands/gestures';
import {
  pressKeyCode,
  longPressKeyCode,
  mobilePressKey,
  mobileType,
  doSendKeys,
  keyevent,
} from './commands/keyboard';
import {
  getPageSource,
  getOrientation,
  setOrientation,
  openNotifications,
  suspendChromedriverProxy,
  mobileGetDeviceInfo,
} from './commands/misc';
import {
  setUrl,
  mobileDeepLink,
  back,
} from './commands/navigation';
import {
  mobileScreenshots,
  mobileViewportScreenshot,
  getScreenshot,
  getViewportScreenshot,
} from './commands/screenshot';
import {
  getStatusBarHeight,
  getDevicePixelRatio,
  getDisplayDensity,
  getViewPortRect,
  getWindowRect,
  getWindowSize,
  mobileViewPortRect,
} from './commands/viewport';

// The range of ports we can use on the system for communicating to the
// UiAutomator2 HTTP server on the device
const DEVICE_PORT_RANGE = [8200, 8299];

// The guard is needed to avoid dynamic system port allocation conflicts for
// parallel driver sessions
const DEVICE_PORT_ALLOCATION_GUARD = util.getLockFileGuard(
  path.resolve(os.tmpdir(), 'uia2_device_port_guard'),
  {timeout: 25, tryRecovery: true}
);

// This is the port that UiAutomator2 listens to on the device. We will forward
// one of the ports above on the system to this port on the device.
const DEVICE_PORT = 6790;
// This is the port that the UiAutomator2 MJPEG server listens to on the device.
// We will forward one of the ports above on the system to this port on the
// device.
const MJPEG_SERVER_DEVICE_PORT = 7810;

const LOCALHOST_IP4 = '127.0.0.1';

// NO_PROXY contains the paths that we never want to proxy to UiAutomator2 server.
// TODO:  Add the list of paths that we never want to proxy to UiAutomator2 server.
// TODO: Need to segregate the paths better way using regular expressions wherever applicable.
// (Not segregating right away because more paths to be added in the NO_PROXY list)
const NO_PROXY: RouteMatcher[] = [
  ['DELETE', new RegExp('^/session/[^/]+/actions')],
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
  ['POST', new RegExp('^/session/[^/]+/appium/device/(?!set_clipboard)[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/replace_value')],
  ['POST', new RegExp('^/session/[^/]+/appium/element/[^/]+/value')],
  ['POST', new RegExp('^/session/[^/]+/appium/getPerformanceData')],
  ['POST', new RegExp('^/session/[^/]+/appium/performanceData/types')],
  ['POST', new RegExp('^/session/[^/]+/appium/settings')],
  ['POST', new RegExp('^/session/[^/]+/appium/execute_driver')],
  ['POST', new RegExp('^/session/[^/]+/appium/start_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/appium/stop_recording_screen')],
  ['POST', new RegExp('^/session/[^/]+/appium/.*event')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/element')],
  ['POST', new RegExp('^/session/[^/]+/ime/[^/]+')],
  ['POST', new RegExp('^/session/[^/]+/keys')],
  ['POST', new RegExp('^/session/[^/]+/location')],
  ['POST', new RegExp('^/session/[^/]+/network_connection')],
  ['POST', new RegExp('^/session/[^/]+/timeouts')],
  ['POST', new RegExp('^/session/[^/]+/url')],

  // MJSONWP commands
  ['GET', new RegExp('^/session/[^/]+/log/types')],
  ['POST', new RegExp('^/session/[^/]+/execute')],
  ['POST', new RegExp('^/session/[^/]+/execute_async')],
  ['POST', new RegExp('^/session/[^/]+/log')],
  // W3C commands
  // For Selenium v4 (W3C does not have this route)
  ['GET', new RegExp('^/session/[^/]+/se/log/types')],
  ['GET', new RegExp('^/session/[^/]+/window/rect')],
  ['POST', new RegExp('^/session/[^/]+/execute/async')],
  ['POST', new RegExp('^/session/[^/]+/execute/sync')],
  // For Selenium v4 (W3C does not have this route)
  ['POST', new RegExp('^/session/[^/]+/se/log')],
];

// This is a set of methods and paths that we never want to proxy to Chromedriver.
const CHROME_NO_PROXY: RouteMatcher[] = [
  ['GET', new RegExp('^/session/[^/]+/appium')],
  ['GET', new RegExp('^/session/[^/]+/context')],
  ['GET', new RegExp('^/session/[^/]+/element/[^/]+/rect')],
  ['GET', new RegExp('^/session/[^/]+/orientation')],
  ['POST', new RegExp('^/session/[^/]+/appium')],
  ['POST', new RegExp('^/session/[^/]+/context')],
  ['POST', new RegExp('^/session/[^/]+/orientation')],

  // this is needed to make the mobile: commands working in web context
  ['POST', new RegExp('^/session/[^/]+/execute$')],
  ['POST', new RegExp('^/session/[^/]+/execute/sync')],

  // MJSONWP commands
  ['GET', new RegExp('^/session/[^/]+/log/types$')],
  ['POST', new RegExp('^/session/[^/]+/log$')],
  // W3C commands
  // For Selenium v4 (W3C does not have this route)
  ['GET', new RegExp('^/session/[^/]+/se/log/types$')],
  // For Selenium v4 (W3C does not have this route)
  ['POST', new RegExp('^/session/[^/]+/se/log$')],
];

const MEMOIZED_FUNCTIONS = ['getStatusBarHeight', 'getDevicePixelRatio'] as const;

class AndroidUiautomator2Driver
  extends AndroidDriver
  implements
    ExternalDriver<
      Uiautomator2Constraints,
      string,
      StringRecord
    >
{
  static newMethodMap = newMethodMap;

  uiautomator2: UiAutomator2Server;

  systemPort: number | undefined;

  _originalIme: string | null;

  mjpegStream?: mjpeg.MJpegStream;

  override caps: Uiautomator2DriverCaps;

  override opts: Uiautomator2DriverOpts;

  override desiredCapConstraints: Uiautomator2Constraints;

  constructor(opts: InitialOpts = {} as InitialOpts, shouldValidateCaps = true) {
    // `shell` overwrites adb.shell, so remove
    // @ts-expect-error FIXME: what is this?
    delete opts.shell;

    super(opts, shouldValidateCaps);

    this.locatorStrategies = [
      'xpath',
      'id',
      'class name',
      'accessibility id',
      'css selector',
      '-android uiautomator',
    ];
    this.desiredCapConstraints = _.cloneDeep(UIAUTOMATOR2_CONSTRAINTS);
    this.jwpProxyActive = false;
    this.jwpProxyAvoid = NO_PROXY;
    this._originalIme = null;

    this.settings = new DeviceSettings(
      {ignoreUnimportantViews: false, allowInvisibleElements: false},
      this.onSettingsUpdate.bind(this)
    );
    // handle webview mechanics from AndroidDriver
    this.sessionChromedrivers = {};

    this.caps = {} as Uiautomator2DriverCaps;
    this.opts = opts as Uiautomator2DriverOpts;
    // memoize functions here, so that they are done on a per-instance basis
    for (const fn of MEMOIZED_FUNCTIONS) {
      this[fn] = _.memoize(this[fn]) as any;
    }
  }

  override validateDesiredCaps(caps: any): caps is Uiautomator2DriverCaps {
    return super.validateDesiredCaps(caps);
  }

  async createSession(
    w3cCaps1: W3CUiautomator2DriverCaps,
    w3cCaps2?: W3CUiautomator2DriverCaps,
    w3cCaps3?: W3CUiautomator2DriverCaps,
    driverData?: DriverData[]
  ): Promise<any> {
    try {
      // TODO handle otherSessionData for multiple sessions
      const [sessionId, caps] = (await BaseDriver.prototype.createSession.call(
        this,
        w3cCaps1,
        w3cCaps2,
        w3cCaps3,
        driverData
      )) as DefaultCreateSessionResult<Uiautomator2Constraints>;

      const startSessionOpts: Uiautomator2StartSessionOpts = {
        ...caps,
        platform: 'LINUX',
        webStorageEnabled: false,
        takesScreenshot: true,
        javascriptEnabled: true,
        databaseEnabled: false,
        networkConnectionEnabled: true,
        locationContextEnabled: false,
        warnings: {},
        desired: caps,
      };

      const defaultOpts = {
        fullReset: false,
        autoLaunch: true,
        adbPort: DEFAULT_ADB_PORT,
        androidInstallTimeout: 90000,
      };
      _.defaults(this.opts, defaultOpts);

      this.opts.adbPort = this.opts.adbPort || DEFAULT_ADB_PORT;
      // get device udid for this session
      const {udid, emPort} = await this.getDeviceInfoFromCaps();
      this.opts.udid = udid;
      // @ts-expect-error do not put random stuff on opts
      this.opts.emPort = emPort;
      // now that we know our java version and device info, we can create our
      // ADB instance
      this.adb = await this.createADB();

      if (this.isChromeSession) {
        this.log.info(`We're going to run a Chrome-based session`);
        const {pkg, activity: defaultActivity} = utils.getChromePkg(this.opts.browserName!);
        let activity: string = defaultActivity;
        if (await this.adb.getApiLevel() >= 24) {
          try {
            activity = await this.adb.resolveLaunchableActivity(pkg);
          } catch (e) {
            this.log.warn(`Using the default ${pkg} activity ${activity}. Original error: ${e.message}`);
          }
        }
        this.opts.appPackage = this.caps.appPackage = pkg;
        this.opts.appActivity = this.caps.appActivity = activity;
        this.log.info(`Chrome-type package and activity are ${pkg} and ${activity}`);
      }

      if (this.opts.app) {
        // find and copy, or download and unzip an app url or path
        this.opts.app = await this.helpers.configureApp(this.opts.app, [
          APK_EXTENSION,
          APKS_EXTENSION,
        ]);
        await this.checkAppPresent();
      } else if (this.opts.appPackage) {
        // the app isn't an actual app file but rather something we want to
        // assume is on the device and just launch via the appPackage
        this.log.info(`Starting '${this.opts.appPackage}' directly on the device`);
      } else {
        this.log.info(
          `Neither 'app' nor 'appPackage' was set. Starting UiAutomator2 ` +
            'without the target application'
        );
      }

      const result = await this.startUiAutomator2Session(startSessionOpts);

      if (this.opts.mjpegScreenshotUrl) {
        this.log.info(`Starting MJPEG stream reading URL: '${this.opts.mjpegScreenshotUrl}'`);
        this.mjpegStream = new mjpeg.MJpegStream(this.opts.mjpegScreenshotUrl);
        await this.mjpegStream.start();
      }
      return [sessionId, result];
    } catch (e) {
      await this.deleteSession();
      throw e;
    }
  }

  async getDeviceDetails(): Promise<Uiautomator2DeviceDetails> {
    const [
      pixelRatio,
      statBarHeight,
      viewportRect,
      {apiVersion, platformVersion, manufacturer, model, realDisplaySize, displayDensity},
    ] = await B.all([
      this.getDevicePixelRatio(),
      this.getStatusBarHeight(),
      this.getViewPortRect(),
      this.mobileGetDeviceInfo(),
    ]);

    return {
      pixelRatio,
      statBarHeight,
      viewportRect,
      deviceApiLevel: _.parseInt(apiVersion),
      platformVersion,
      deviceManufacturer: manufacturer,
      deviceModel: model,
      deviceScreenSize: realDisplaySize,
      deviceScreenDensity: displayDensity,
    };
  }

  override get driverData() {
    // TODO fill out resource info here
    return {};
  }

  override async getSession(): Promise<SingularSessionData<Uiautomator2Constraints>> {
    const sessionData = await BaseDriver.prototype.getSession.call(this);
    this.log.debug('Getting session details from server to mix in');
    const uia2Data = (await this.uiautomator2!.jwproxy.command('/', 'GET', {})) as any;
    return {...sessionData, ...uia2Data};
  }

  async allocateSystemPort() {
    const forwardPort = async (localPort: number) => {
      this.log.debug(
        `Forwarding UiAutomator2 Server port ${DEVICE_PORT} to local port ${localPort}`
      );
      if ((await checkPortStatus(localPort, LOCALHOST_IP4)) === 'open') {
        throw this.log.errorWithException(
          `UiAutomator2 Server cannot start because the local port #${localPort} is busy. ` +
            `Make sure the port you provide via 'systemPort' capability is not occupied. ` +
            `This situation might often be a result of an inaccurate sessions management, e.g. ` +
            `old automation sessions on the same device must always be closed before starting new ones.`
        );
      }
      await this.adb!.forwardPort(localPort, DEVICE_PORT);
    };

    if (this.opts.systemPort) {
      this.systemPort = this.opts.systemPort;
      return await forwardPort(this.systemPort);
    }

    await DEVICE_PORT_ALLOCATION_GUARD(async () => {
      const [startPort, endPort] = DEVICE_PORT_RANGE;
      try {
        this.systemPort = await findAPortNotInUse(startPort, endPort);
      } catch (e) {
        throw this.log.errorWithException(
          `Cannot find any free port in range ${startPort}..${endPort}}. ` +
            `Please set the available port number by providing the systemPort capability or ` +
            `double check the processes that are locking ports within this range and terminate ` +
            `these which are not needed anymore`
        );
      }
      await forwardPort(this.systemPort);
    });
  }

  async releaseSystemPort() {
    if (!this.systemPort || !this.adb) {
      return;
    }

    if (this.opts.systemPort) {
      // We assume if the systemPort is provided manually then it must be unique,
      // so there is no need for the explicit synchronization
      await this.adb.removePortForward(this.systemPort);
    } else {
      await DEVICE_PORT_ALLOCATION_GUARD(
        async () => await this.adb!.removePortForward(this.systemPort!)
      );
    }
  }

  async allocateMjpegServerPort() {
    if (this.opts.mjpegServerPort) {
      this.log.debug(
        `MJPEG broadcasting requested, forwarding MJPEG server port ${MJPEG_SERVER_DEVICE_PORT} ` +
          `to local port ${this.opts.mjpegServerPort}`
      );
      await this.adb!.forwardPort(this.opts.mjpegServerPort, MJPEG_SERVER_DEVICE_PORT);
    }
  }

  async releaseMjpegServerPort() {
    if (this.opts.mjpegServerPort) {
      await this.adb!.removePortForward(this.opts.mjpegServerPort);
    }
  }

  async performSessionPreExecSetup(): Promise<StringRecord|undefined> {
    const apiLevel = await this.adb.getApiLevel();
    if (apiLevel < 21) {
      throw this.log.errorWithException(
        'UIAutomator2 is only supported since Android 5.0 (Lollipop). ' +
          'You could still use other supported backends in order to automate older Android versions.'
      );
    }

    const preflightPromises: Promise<any>[] = [];
    if (apiLevel >= 28) {
      // Android P
      preflightPromises.push((async () => {
        this.log.info('Relaxing hidden api policy');
        try {
          await this.adb.setHiddenApiPolicy('1', !!this.opts.ignoreHiddenApiPolicyError);
        } catch (err) {
          throw this.log.errorWithException(
            'Hidden API policy (https://developer.android.com/guide/app-compatibility/restrictions-non-sdk-interfaces) cannot be enabled. ' +
              'This might be happening because the device under test is not configured properly. ' +
              'Please check https://github.com/appium/appium/issues/13802 for more details. ' +
              'You could also set the "appium:ignoreHiddenApiPolicyError" capability to true in order to ' +
              'ignore this error, which might later lead to unexpected crashes or behavior of ' +
              `the automation server. Original error: ${err.message}`
          );
        }
      })());
    }
    if (util.hasValue(this.opts.gpsEnabled)) {
      preflightPromises.push((async () => {
        this.log.info(
          `Trying to ${this.opts.gpsEnabled ? 'enable' : 'disable'} gps location provider`
        );
        await this.adb.toggleGPSLocationProvider(Boolean(this.opts.gpsEnabled));
      })());
    }
    if (this.opts.hideKeyboard) {
      preflightPromises.push((async () => {
        this._originalIme = await this.adb.defaultIME();
      })());
    }
    let appInfo;
    preflightPromises.push((async () => {
      // get appPackage et al from manifest if necessary
      appInfo = await this.getLaunchInfo();
    })());
    // start settings app, set the language/locale, start logcat etc...
    preflightPromises.push(this.initDevice());

    await B.all(preflightPromises);

    this.opts = {...this.opts, ...(appInfo ?? {})};
    return appInfo;
  }

  async performSessionExecution(capsWithSessionInfo: StringRecord): Promise<void> {
    await B.all([
      // Prepare the device by forwarding the UiAutomator2 port
      // This call mutates this.systemPort if it is not set explicitly
      this.allocateSystemPort(),
      // Prepare the device by forwarding the UiAutomator2 MJPEG server port (if
      // applicable)
      this.allocateMjpegServerPort(),
    ]);

    const [uiautomator2,] = await B.all([
      // set up the modified UiAutomator2 server etc
      this.initUiAutomator2Server(),
      (async () => {
        // Should be after installing io.appium.settings
        if (this.opts.disableWindowAnimation && await this.adb.getApiLevel() < 26) {
          // API level 26 is Android 8.0.
          // Granting android.permission.SET_ANIMATION_SCALE is necessary to handle animations under API level 26
          // Read https://github.com/appium/appium/pull/11640#issuecomment-438260477
          // `--no-window-animation` works over Android 8 to disable all of animations
          if (await this.adb.isAnimationOn()) {
            this.log.info('Disabling animation via io.appium.settings');
            await this.settingsApp.setAnimationState(false);
            this._wasWindowAnimationDisabled = true;
          } else {
            this.log.info('Window animation is already disabled');
          }
        }
      })(),
      // set up app under test
      // prepare our actual AUT, get it on the device, etc...
      this.initAUT(),
    ]);

    // launch UiAutomator2 and wait till its online and we have a session
    await uiautomator2.startSession(capsWithSessionInfo);
    // now that everything has started successfully, turn on proxying so all
    // subsequent session requests go straight to/from uiautomator2
    this.jwpProxyActive = true;
  }

  async performSessionPostExecSetup(): Promise<void> {
    // Unlock the device after the session is started.
    if (!this.opts.skipUnlock) {
      // unlock the device to prepare it for testing
      await this.unlock();
    } else {
      this.log.debug(`'skipUnlock' capability set, so skipping device unlock`);
    }

    if (this.isChromeSession) {
      // start a chromedriver session
      await this.startChromeSession();
    } else if (this.opts.autoLaunch && this.opts.appPackage) {
      await this.ensureAppStarts();
    }

    // if the initial orientation is requested, set it
    if (util.hasValue(this.opts.orientation)) {
      this.log.debug(`Setting initial orientation to '${this.opts.orientation}'`);
      await this.setOrientation(this.opts.orientation as Orientation);
    }

    // if we want to immediately get into a webview, set our context
    // appropriately
    if (this.opts.autoWebview) {
      const viewName = this.defaultWebviewName();
      const timeout = this.opts.autoWebviewTimeout || 2000;
      this.log.info(`Setting auto webview to context '${viewName}' with timeout ${timeout}ms`);
      await retryInterval(timeout / 500, 500, this.setContext.bind(this), viewName);
    }

    // We would like to notify about the initial context setting
    if (await this.getCurrentContext() === this.defaultContextName()) {
      await this.notifyBiDiContextChange();
    }
  }

  async startUiAutomator2Session(
    caps: Uiautomator2StartSessionOpts
  ): Promise<Uiautomator2SessionCaps> {
    const appInfo = await this.performSessionPreExecSetup();
    // set actual device name, udid, platform version, screen size, screen density, model and manufacturer details
    const sessionInfo: Uiautomator2SessionInfo = {
      deviceName: this.adb.curDeviceId!,
      deviceUDID: this.opts.udid!,
    };
    const capsWithSessionInfo = {
      ...caps,
      ...sessionInfo,
    };
    // Adding AUT info in the capabilities if it does not exist in caps
    if (appInfo) {
      for (const capName of ['appPackage', 'appActivity']) {
        if (!capsWithSessionInfo[capName] && appInfo[capName]) {
          capsWithSessionInfo[capName] = appInfo[capName];
        }
      }
    }

    await this.performSessionExecution(capsWithSessionInfo);

    const deviceInfoPromise: Promise<Uiautomator2DeviceDetails|EmptyObject> = (async () => {
      try {
        return await this.getDeviceDetails();
      } catch (e) {
        this.log.warn(`Cannot fetch device details. Original error: ${e.message}`);
        return {};
      }
    })();

    await this.performSessionPostExecSetup();

    return {...capsWithSessionInfo, ...(await deviceInfoPromise)};
  }

  async initUiAutomator2Server() {
    // broken out for readability
    const uiautomator2Opts = {
      // @ts-expect-error FIXME: maybe `address` instead of `host`?
      host: this.opts.remoteAdbHost || this.opts.host || LOCALHOST_IP4,
      systemPort: this.systemPort as number,
      devicePort: DEVICE_PORT,
      adb: this.adb,
      tmpDir: this.opts.tmpDir as string,
      disableWindowAnimation: !!this.opts.disableWindowAnimation,
      disableSuppressAccessibilityService: this.opts.disableSuppressAccessibilityService,
      readTimeout: this.opts.uiautomator2ServerReadTimeout,
    };
    // now that we have package and activity, we can create an instance of
    // uiautomator2 with the appropriate options
    this.uiautomator2 = new UiAutomator2Server(this.log, uiautomator2Opts);
    this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);
    this.proxyCommand = this.uiautomator2.proxyCommand.bind(
      this.uiautomator2
    ) as typeof this.proxyCommand;

    if (this.opts.skipServerInstallation) {
      this.log.info(`'skipServerInstallation' is set. Skipping UIAutomator2 server installation.`);
    } else {
      await this.uiautomator2.installServerApk(this.opts.uiautomator2ServerInstallTimeout);
      try {
        await this.adb!.addToDeviceIdleWhitelist(
          SETTINGS_HELPER_ID,
          SERVER_PACKAGE_ID,
          SERVER_TEST_PACKAGE_ID
        );
      } catch (e) {
        const err = e as ExecError;
        this.log.warn(
          `Cannot add server packages to the Doze whitelist. Original error: ` +
            (err.stderr || err.message)
        );
      }
    }

    return this.uiautomator2;
  }

  async initAUT() {
    // Uninstall any uninstallOtherPackages which were specified in caps
    if (this.opts.uninstallOtherPackages) {
      await this.uninstallOtherPackages(
        utils.parseArray(this.opts.uninstallOtherPackages),
        [SETTINGS_HELPER_ID, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID]
      );
    }

    // Install any "otherApps" that were specified in caps
    if (this.opts.otherApps) {
      let otherApps;
      try {
        otherApps = utils.parseArray(this.opts.otherApps);
      } catch (e) {
        throw this.log.errorWithException(
          `Could not parse "otherApps" capability: ${(e as Error).message}`
        );
      }
      otherApps = await B.all(
        otherApps.map((app) => this.helpers.configureApp(app, [APK_EXTENSION, APKS_EXTENSION]))
      );
      await this.installOtherApks(otherApps);
    }

    if (this.opts.app) {
      if (
        (this.opts.noReset && !(await this.adb!.isAppInstalled(this.opts.appPackage!))) ||
        !this.opts.noReset
      ) {
        if (
          !this.opts.noSign &&
          !(await this.adb!.checkApkCert(this.opts.app, this.opts.appPackage!, {
            requireDefaultCert: false,
          }))
        ) {
          await signApp(this.adb!, this.opts.app);
        }
        if (!this.opts.skipUninstall) {
          await this.adb!.uninstallApk(this.opts.appPackage!);
        }
        await this.installAUT();
      } else {
        this.log.debug(
          'noReset has been requested and the app is already installed. Doing nothing'
        );
      }
    } else {
      if (this.opts.fullReset) {
        throw this.log.errorWithException(
          'Full reset requires an app capability, use fastReset if app is not provided'
        );
      }
      this.log.debug('No app capability. Assuming it is already on the device');
      if (this.opts.fastReset && this.opts.appPackage) {
        await this.resetAUT();
      }
    }
  }

  async ensureAppStarts() {
    // make sure we have an activity and package to wait for
    const appWaitPackage = this.opts.appWaitPackage || this.opts.appPackage;
    const appWaitActivity = this.opts.appWaitActivity || this.opts.appActivity;
    this.log.info(
      `Starting '${this.opts.appPackage}/${this.opts.appActivity} ` +
        `and waiting for '${appWaitPackage}/${appWaitActivity}'`
    );

    if (
      this.opts.noReset &&
      !this.opts.forceAppLaunch &&
      (await this.adb!.processExists(this.opts.appPackage!))
    ) {
      this.log.info(
        `'${this.opts.appPackage}' is already running and noReset is enabled. ` +
          `Set forceAppLaunch capability to true if the app must be forcefully restarted on session startup.`
      );
      return;
    }
    await this.adb!.startApp({
      pkg: this.opts.appPackage!,
      activity: this.opts.appActivity,
      action: this.opts.intentAction || 'android.intent.action.MAIN',
      category: this.opts.intentCategory || 'android.intent.category.LAUNCHER',
      flags: this.opts.intentFlags || '0x10200000', // FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
      waitPkg: this.opts.appWaitPackage,
      waitActivity: this.opts.appWaitActivity,
      waitForLaunch: this.opts.appWaitForLaunch,
      waitDuration: this.opts.appWaitDuration,
      optionalIntentArguments: this.opts.optionalIntentArguments,
      stopApp: this.opts.forceAppLaunch || !this.opts.dontStopAppOnReset,
      retry: true,
      user: this.opts.userProfile,
    });
  }

  async deleteSession() {
    this.log.debug('Deleting UiAutomator2 session');

    const screenRecordingStopTasks = [
      async () => {
        if (!_.isEmpty(this._screenRecordingProperties)) {
          await this.stopRecordingScreen();
        }
      },
      async () => {
        if (await this.mobileIsMediaProjectionRecordingRunning()) {
          await this.mobileStopMediaProjectionRecording();
        }
      },
      async () => {
        if (!_.isEmpty(this._screenStreamingProps)) {
          await this.mobileStopScreenStreaming();
        }
      },
    ];

    try {
      await this.stopChromedriverProxies();
    } catch (err) {
      this.log.warn(`Unable to stop ChromeDriver proxies: ${(err as Error).message}`);
    }

    if (this.jwpProxyActive) {
      try {
        await this.uiautomator2.deleteSession();
      } catch (err) {
        this.log.warn(`Unable to proxy deleteSession to UiAutomator2: ${(err as Error).message}`);
      }
      this.jwpProxyActive = false;
    }

    if (this.adb) {
      await B.all(
        screenRecordingStopTasks.map((task) => {
          (async () => {
            try {
              await task();
            } catch (ign) {}
          })();
        })
      );

      if (this.opts.appPackage) {
        if (
          !this.isChromeSession &&
          ((!this.opts.dontStopAppOnReset && !this.opts.noReset) ||
            (this.opts.noReset && this.opts.shouldTerminateApp))
        ) {
          try {
            await this.adb.forceStop(this.opts.appPackage);
          } catch (err) {
            this.log.warn(`Unable to force stop app: ${(err as Error).message}`);
          }
        }
        if (this.opts.fullReset && !this.opts.skipUninstall) {
          this.log.debug(
            `Capability 'fullReset' set to 'true', Uninstalling '${this.opts.appPackage}'`
          );
          try {
            await this.adb.uninstallApk(this.opts.appPackage);
          } catch (err) {
            this.log.warn(`Unable to uninstall app: ${(err as Error).message}`);
          }
        }
      }
      // This value can be true if test target device is <= 26
      if (this._wasWindowAnimationDisabled) {
        this.log.info('Restoring window animation state');
        await this.settingsApp.setAnimationState(true);
      }
      if (this._originalIme) {
        try {
          await this.adb.setIME(this._originalIme);
        } catch (e) {
          this.log.warn(`Cannot restore the original IME: ${e.message}`);
        }
      }
      try {
        await this.releaseSystemPort();
      } catch (error) {
        this.log.warn(`Unable to remove system port forward: ${(error as Error).message}`);
        // Ignore, this block will also be called when we fall in catch block
        // and before even port forward.
      }
      try {
        await this.releaseMjpegServerPort();
      } catch (error) {
        this.log.warn(`Unable to remove MJPEG server port forward: ${(error as Error).message}`);
        // Ignore, this block will also be called when we fall in catch block
        // and before even port forward.
      }

      if ((await this.adb.getApiLevel()) >= 28) {
        // Android P
        this.log.info('Restoring hidden api policy to the device default configuration');
        await this.adb.setDefaultHiddenApiPolicy(!!this.opts.ignoreHiddenApiPolicyError);
      }
    }
    if (this.mjpegStream) {
      this.log.info('Closing MJPEG stream');
      this.mjpegStream.stop();
    }
    await super.deleteSession();
  }

  async checkAppPresent() {
    this.log.debug('Checking whether app is actually present');
    if (!this.opts.app || !(await fs.exists(this.opts.app))) {
      throw this.log.errorWithException(`Could not find app apk at '${this.opts.app}'`);
    }
  }

  async onSettingsUpdate() {
    // intentionally do nothing here, since commands.updateSettings proxies
    // settings to the uiauto2 server already
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  proxyActive(sessionId: string): boolean {
    // we always have an active proxy to the UiAutomator2 server
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canProxy(sessionId: string): boolean {
    // we can always proxy to the uiautomator2 server
    return true;
  }

  getProxyAvoidList(): RouteMatcher[] {
    // we are maintaining two sets of NO_PROXY lists, one for chromedriver(CHROME_NO_PROXY)
    // and one for uiautomator2(NO_PROXY), based on current context will return related NO_PROXY list
    if (util.hasValue(this.chromedriver)) {
      // if the current context is webview(chromedriver), then return CHROME_NO_PROXY list
      this.jwpProxyAvoid = CHROME_NO_PROXY;
    } else {
      this.jwpProxyAvoid = NO_PROXY;
    }
    if (this.opts.nativeWebScreenshot) {
      this.jwpProxyAvoid = [
        ...this.jwpProxyAvoid,
        ['GET', new RegExp('^/session/[^/]+/screenshot')],
      ];
    }

    return this.jwpProxyAvoid;
  }

  async updateSettings(settings: Uiautomator2Settings) {
    await this.settings.update(settings);
    await this.uiautomator2!.jwproxy.command('/appium/settings', 'POST', {settings});
  }

  async getSettings() {
    const driverSettings = this.settings.getSettings();
    const serverSettings = (await this.uiautomator2!.jwproxy.command(
      '/appium/settings',
      'GET'
    )) as Partial<Uiautomator2Settings>;
    return {...driverSettings, ...serverSettings} as any;
  }

  mobileGetActionHistory = mobileGetActionHistory;
  mobileScheduleAction = mobileScheduleAction;
  mobileUnscheduleAction = mobileUnscheduleAction;
  performActions = performActions;
  releaseActions = releaseActions;

  getAlertText = getAlertText;
  mobileAcceptAlert = mobileAcceptAlert;
  mobileDismissAlert = mobileDismissAlert;
  postAcceptAlert = postAcceptAlert;
  postDismissAlert = postDismissAlert;

  mobileInstallMultipleApks = mobileInstallMultipleApks;
  mobileBackgroundApp = mobileBackgroundApp;

  mobileGetAppStrings = mobileGetAppStrings;

  mobileGetBatteryInfo = mobileGetBatteryInfo;

  active = active;
  getAttribute = getAttribute;
  elementEnabled = elementEnabled;
  elementDisplayed = elementDisplayed;
  elementSelected = elementSelected;
  getName = getName;
  getLocation = getLocation;
  getSize = getSize;
  getElementRect = getElementRect;
  getElementScreenshot = getElementScreenshot;
  getText = getText;
  setValueImmediate = setValueImmediate;
  doSetElementValue = doSetElementValue;
  click = click;
  clear = clear;
  mobileReplaceElementValue = mobileReplaceElementValue;

  executeMobile = executeMobile;
  mobileCommandsMapping = mobileCommandsMapping;

  doFindElementOrEls = doFindElementOrEls;

  mobileClickGesture = mobileClickGesture;
  mobileDoubleClickGesture = mobileDoubleClickGesture;
  mobileDragGesture = mobileDragGesture;
  mobileFlingGesture = mobileFlingGesture;
  mobileLongClickGesture = mobileLongClickGesture;
  mobilePinchCloseGesture = mobilePinchCloseGesture;
  mobilePinchOpenGesture = mobilePinchOpenGesture;
  mobileScroll = mobileScroll;
  mobileScrollBackTo = mobileScrollBackTo;
  mobileScrollGesture = mobileScrollGesture;
  mobileSwipeGesture = mobileSwipeGesture;

  pressKeyCode = pressKeyCode;
  longPressKeyCode = longPressKeyCode;
  mobilePressKey = mobilePressKey;
  mobileType = mobileType;
  doSendKeys = doSendKeys;
  keyevent = keyevent;

  getPageSource = getPageSource;
  getOrientation = getOrientation;
  setOrientation = setOrientation;
  openNotifications = openNotifications;
  suspendChromedriverProxy = suspendChromedriverProxy as any;
  mobileGetDeviceInfo = mobileGetDeviceInfo;

  getClipboard = getClipboard;
  mobileGetClipboard = mobileGetClipboard;
  setClipboard = setClipboard;
  mobileSetClipboard = mobileSetClipboard;

  setUrl = setUrl;
  mobileDeepLink = mobileDeepLink;
  back = back;

  mobileScreenshots = mobileScreenshots;
  mobileViewportScreenshot = mobileViewportScreenshot;
  getScreenshot = getScreenshot;
  getViewportScreenshot = getViewportScreenshot;

  getStatusBarHeight = getStatusBarHeight;
  getDevicePixelRatio = getDevicePixelRatio;
  getDisplayDensity = getDisplayDensity;
  getViewPortRect = getViewPortRect;
  getWindowRect = getWindowRect;
  getWindowSize = getWindowSize;
  mobileViewPortRect = mobileViewPortRect;
}

export {AndroidUiautomator2Driver};
