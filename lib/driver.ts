import type {
  DefaultCreateSessionResult,
  DriverData,
  ExternalDriver,
  InitialOpts,
  RouteMatcher,
  SingularSessionData,
  StringRecord,
  SessionCapabilities,
} from '@appium/types';
import {DEFAULT_ADB_PORT, type ADB} from 'appium-adb';
import {AndroidDriver, utils} from 'appium-android-driver';
import {BaseDriver, DeviceSettings} from 'appium/driver';
import {mjpeg, util} from 'appium/support';
import UIAUTOMATOR2_CONSTRAINTS, {type Uiautomator2Constraints} from './constraints';
import {newMethodMap} from './method-map';
import {assignDefaults, memoize} from './utils';
import type {
  Uiautomator2Settings,
  Uiautomator2DeviceDetails,
  Uiautomator2DriverCaps,
  Uiautomator2DriverOpts,
  Uiautomator2StartSessionOpts,
  W3CUiautomator2DriverCaps,
} from './types';
import type {UiAutomator2Server} from './uiautomator2-server';
import {
  allocateMjpegServerPort,
  allocateSystemPort,
  initServer,
  performExecution,
  performPostExecSetup,
  performPreExecSetup,
  releaseMjpegServerPort,
  releaseSystemPort,
  requireServer,
  startSession,
} from './uiautomator2-server';
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
import {mobileInstallMultipleApks} from './commands/app-management';
import {checkAppPresent, ensureAppStarts, initAUT, prepareSessionApp} from './commands/aut';
import {mobileGetBatteryInfo} from './commands/battery';
import {getClipboard, setClipboard} from './commands/clipboard';
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
import {doFindElementOrEls} from './commands/find';
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
  mobileResetAccessibilityCache,
} from './commands/misc';
import {mobileListWindows, mobileListDisplays} from './commands/windows';
import {setUrl, mobileDeepLink, back} from './commands/navigation';
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
import {executeMethodMap} from './execute-method-map';

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
  ['GET', new RegExp('^/session/[^/]+/appium/capabilities')],
  ['GET', new RegExp('^/session/[^/]+/appium/commands')],
  ['GET', new RegExp('^/session/[^/]+/appium/device/[^/]+')],
  ['GET', new RegExp('^/session/[^/]+/appium/extensions')],
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

class AndroidUiautomator2Driver
  extends AndroidDriver
  implements ExternalDriver<Uiautomator2Constraints, string, StringRecord>
{
  static newMethodMap = newMethodMap;
  static executeMethodMap = executeMethodMap;

  uiautomator2!: UiAutomator2Server;

  systemPort: number | undefined;

  _originalIme: string | null;

  mjpegStream?: mjpeg.MJpegStream;

  override caps: Uiautomator2DriverCaps;

  override opts: Uiautomator2DriverOpts;

  override desiredCapConstraints: Uiautomator2Constraints;

  mobileGetActionHistory = mobileGetActionHistory;
  mobileScheduleAction = mobileScheduleAction;
  mobileUnscheduleAction = mobileUnscheduleAction;
  performActions = performActions as AndroidDriver['performActions'];
  releaseActions = releaseActions;

  getAlertText = getAlertText;
  mobileAcceptAlert = mobileAcceptAlert;
  mobileDismissAlert = mobileDismissAlert;
  postAcceptAlert = postAcceptAlert;
  postDismissAlert = postDismissAlert;

  mobileInstallMultipleApks = mobileInstallMultipleApks;

  mobileGetBatteryInfo = mobileGetBatteryInfo;

  active = active;
  getAttribute = getAttribute as AndroidDriver['getAttribute'];
  elementEnabled = elementEnabled as AndroidDriver['elementEnabled'];
  elementDisplayed = elementDisplayed as AndroidDriver['elementDisplayed'];
  elementSelected = elementSelected as AndroidDriver['elementSelected'];
  getName = getName as AndroidDriver['getName'];
  getLocation = getLocation as AndroidDriver['getLocation'];
  getSize = getSize as AndroidDriver['getSize'];
  getElementRect = getElementRect;
  getElementScreenshot = getElementScreenshot;
  getText = getText as AndroidDriver['getText'];
  setValueImmediate = setValueImmediate as AndroidDriver['setValueImmediate'];
  doSetElementValue = doSetElementValue as AndroidDriver['doSetElementValue'];
  click = click as AndroidDriver['click'];
  clear = clear;
  mobileReplaceElementValue = mobileReplaceElementValue;

  doFindElementOrEls = doFindElementOrEls as AndroidDriver['doFindElementOrEls'];

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

  pressKeyCode = pressKeyCode as AndroidDriver['pressKeyCode'];
  longPressKeyCode = longPressKeyCode as AndroidDriver['longPressKeyCode'];
  mobilePressKey = mobilePressKey;
  mobileType = mobileType;
  doSendKeys = doSendKeys as AndroidDriver['doSendKeys'];
  keyevent = keyevent;

  getPageSource = getPageSource;
  getOrientation = getOrientation;
  setOrientation = setOrientation;
  openNotifications = openNotifications as AndroidDriver['openNotifications'];
  suspendChromedriverProxy = suspendChromedriverProxy as AndroidDriver['suspendChromedriverProxy'];
  mobileGetDeviceInfo = mobileGetDeviceInfo;
  mobileResetAccessibilityCache = mobileResetAccessibilityCache;
  mobileListWindows = mobileListWindows;
  mobileListDisplays = mobileListDisplays;

  getClipboard = getClipboard;
  setClipboard = setClipboard;

  setUrl = setUrl as AndroidDriver['setUrl'];
  mobileDeepLink = mobileDeepLink;
  back = back;

  mobileScreenshots = mobileScreenshots;
  mobileViewportScreenshot = mobileViewportScreenshot;
  getScreenshot = getScreenshot;
  getViewportScreenshot = getViewportScreenshot;

  getStatusBarHeight = getStatusBarHeight;
  getDevicePixelRatio = getDevicePixelRatio;
  getDisplayDensity = getDisplayDensity as AndroidDriver['getDisplayDensity'];
  getViewPortRect = getViewPortRect;
  getWindowRect = getWindowRect as AndroidDriver['getWindowRect'];
  getWindowSize = getWindowSize as AndroidDriver['getWindowSize'];
  mobileViewPortRect = mobileViewPortRect;

  prepareSessionApp = prepareSessionApp;
  checkAppPresent = checkAppPresent;
  initAUT = initAUT;
  ensureAppStarts = ensureAppStarts;

  allocateSystemPort = allocateSystemPort;
  releaseSystemPort = releaseSystemPort;
  allocateMjpegServerPort = allocateMjpegServerPort;
  releaseMjpegServerPort = releaseMjpegServerPort;
  performSessionPreExecSetup = performPreExecSetup;
  performSessionExecution = performExecution;
  performSessionPostExecSetup = performPostExecSetup;
  startUiAutomator2Session = startSession;
  initUiAutomator2Server = initServer;
  requireUiautomator2 = requireServer;

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
    this.desiredCapConstraints = structuredClone(UIAUTOMATOR2_CONSTRAINTS);
    this.jwpProxyActive = false;
    this.jwpProxyAvoid = NO_PROXY;
    this._originalIme = null;

    this.settings = new DeviceSettings(
      {ignoreUnimportantViews: false, allowInvisibleElements: false},
      this.onSettingsUpdate.bind(this),
    );
    // handle webview mechanics from AndroidDriver
    this.sessionChromedrivers = {};

    this.caps = {} as Uiautomator2DriverCaps;
    this.opts = opts as Uiautomator2DriverOpts;
    // memoize functions here, so that they are done on a per-instance basis
    this.getStatusBarHeight = memoize(this.getStatusBarHeight);
    this.getDevicePixelRatio = memoize(this.getDevicePixelRatio);
  }

  override get driverData() {
    // TODO fill out resource info here
    return {};
  }

  override validateDesiredCaps(caps: any): caps is Uiautomator2DriverCaps {
    return super.validateDesiredCaps(caps);
  }

  async createSession(
    w3cCaps1: W3CUiautomator2DriverCaps,
    w3cCaps2?: W3CUiautomator2DriverCaps,
    w3cCaps3?: W3CUiautomator2DriverCaps,
    driverData?: DriverData[],
  ): Promise<any> {
    try {
      // TODO handle otherSessionData for multiple sessions
      const [sessionId, caps] = (await BaseDriver.prototype.createSession.call(
        this,
        w3cCaps1,
        w3cCaps2,
        w3cCaps3,
        driverData,
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
      assignDefaults(this.opts as Record<string, unknown>, defaultOpts);

      this.opts.adbPort = this.opts.adbPort || DEFAULT_ADB_PORT;
      // get device udid for this session
      const {udid, emPort} = await this.getDeviceInfoFromCaps();
      this.opts.udid = udid;
      // @ts-expect-error do not put random stuff on opts
      this.opts.emPort = emPort;
      // now that we know our java version and device info, we can create our
      // ADB instance
      this.adb = await this.createADB();

      if (this.isChromeSession && this.opts.browserName) {
        this.log.info(`We're going to run a Chrome-based session`);
        const {pkg, activity: defaultActivity} = utils.getChromePkg(this.opts.browserName);
        let activity: string = defaultActivity;
        try {
          activity = await this.adb.resolveLaunchableActivity(pkg);
        } catch (e) {
          this.log.warn(
            `Using the default ${pkg} activity ${activity}. Original error: ${(e as Error).message}`,
          );
        }
        this.opts.appPackage = this.caps.appPackage = pkg;
        this.opts.appActivity = this.caps.appActivity = activity;
        this.log.info(`Chrome-type package and activity are ${pkg} and ${activity}`);
      }

      await this.prepareSessionApp();

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
    ] = await Promise.all([
      this.getDevicePixelRatio(),
      this.getStatusBarHeight(),
      this.getViewPortRect(),
      this.mobileGetDeviceInfo(),
    ]);

    return {
      pixelRatio,
      statBarHeight,
      viewportRect,
      deviceApiLevel: Number.parseInt(String(apiVersion), 10),
      platformVersion,
      deviceManufacturer: manufacturer,
      deviceModel: model,
      deviceScreenSize: realDisplaySize,
      deviceScreenDensity: displayDensity,
    };
  }

  override async getSession(): Promise<SingularSessionData<Uiautomator2Constraints>> {
    const sessionData = await BaseDriver.prototype.getSession.call(this);
    this.log.debug('Getting session details from server to mix in');
    const uia2Data = (await this.requireUiautomator2().jwproxy.command(
      '/',
      'GET',
      {},
    )) as StringRecord;
    return {...sessionData, ...uia2Data};
  }

  override async deleteSession() {
    this.log.debug('Deleting UiAutomator2 session');

    const screenRecordingStopTasks = [
      async () => {
        if (this._screenRecordingProperties) {
          await this.stopRecordingScreen();
        }
      },
      async () => {
        if (await this.mobileIsMediaProjectionRecordingRunning()) {
          await this.mobileStopMediaProjectionRecording();
        }
      },
      async () => {
        if (this._screenStreamingProps) {
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
      await Promise.all(
        screenRecordingStopTasks.map((task) =>
          (async () => {
            try {
              await task();
            } catch {}
          })(),
        ),
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
            `Capability 'fullReset' set to 'true', Uninstalling '${this.opts.appPackage}'`,
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
          this.log.warn(`Cannot restore the original IME: ${(e as Error).message}`);
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

  async onSettingsUpdate() {
    // intentionally do nothing here, since commands.updateSettings proxies
    // settings to the uiauto2 server already
  }

  override proxyActive(sessionId: string): boolean {
    void sessionId;
    // we always have an active proxy to the UiAutomator2 server
    return true;
  }

  override canProxy(sessionId: string): boolean {
    void sessionId;
    // we can always proxy to the uiautomator2 server
    return true;
  }

  override getProxyAvoidList(): RouteMatcher[] {
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

  // @ts-expect-error narrower parameter type than the base class override allows
  override async updateSettings(settings: Uiautomator2Settings) {
    await this.settings.update(settings);
    await this.requireUiautomator2().jwproxy.command('/appium/settings', 'POST', {settings});
  }

  override async getSettings(): Promise<StringRecord> {
    const driverSettings = this.settings.getSettings();
    const serverSettings = (await this.requireUiautomator2().jwproxy.command(
      '/appium/settings',
      'GET',
    )) as Partial<Uiautomator2Settings>;
    return {...driverSettings, ...serverSettings};
  }

  // needed to make the typechecker happy
  override async getAppiumSessionCapabilities(): Promise<
    SessionCapabilities<Uiautomator2Constraints>
  > {
    return (await super.getAppiumSessionCapabilities()) as SessionCapabilities<Uiautomator2Constraints>;
  }

  requireAdb(): ADB {
    const adb = this.adb;
    if (!adb) {
      throw this.log.errorWithException('ADB must be initialized before this operation');
    }
    return adb;
  }
}

export {AndroidUiautomator2Driver};
