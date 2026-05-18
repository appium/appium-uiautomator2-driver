import type {Orientation, StringRecord} from '@appium/types';
import {SETTINGS_HELPER_ID} from 'io.appium.settings';
import {util} from 'appium/support';
import {retryInterval} from 'asyncbox';
import os from 'node:os';
import path from 'node:path';
import {checkPortStatus, findAPortNotInUse} from 'portscanner';
import type {ExecError} from 'teen_process';
import type {AndroidUiautomator2Driver} from '../driver';
import type {
  EmptyObject,
  Uiautomator2DeviceDetails,
  Uiautomator2SessionCaps,
  Uiautomator2SessionInfo,
  Uiautomator2StartSessionOpts,
} from '../types';
import {UiAutomator2Server, type UiAutomator2ServerOptions} from './core';
import {SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID} from './packages';

// The range of ports we can use on the system for communicating to the
// UiAutomator2 HTTP server on the device
const DEVICE_PORT_RANGE = [8200, 8299];

// The guard is needed to avoid dynamic system port allocation conflicts for
// parallel driver sessions
const DEVICE_PORT_ALLOCATION_GUARD = util.getLockFileGuard(
  path.resolve(os.tmpdir(), 'uia2_device_port_guard'),
  {timeout: 25, tryRecovery: true},
);

// This is the port that UiAutomator2 listens to on the device. We will forward
// one of the ports above on the system to this port on the device.
const DEVICE_PORT = 6790;
// This is the port that the UiAutomator2 MJPEG server listens to on the device.
// We will forward one of the ports above on the system to this port on the
// device.
const MJPEG_SERVER_DEVICE_PORT = 7810;
const MIN_SUPPORTED_API_LEVEL = 26;
const LOCALHOST_IP4 = '127.0.0.1';

/** Forwards a local port to the UiAutomator2 server port on the device. */
export async function allocateSystemPort(this: AndroidUiautomator2Driver) {
  const adb = this.requireAdb();
  const forwardPort = async (localPort: number) => {
    this.log.debug(`Forwarding UiAutomator2 Server port ${DEVICE_PORT} to local port ${localPort}`);
    if ((await checkPortStatus(localPort, LOCALHOST_IP4)) === 'open') {
      throw this.log.errorWithException(
        `UiAutomator2 Server cannot start because the local port #${localPort} is busy. ` +
          `Make sure the port you provide via 'systemPort' capability is not occupied. ` +
          `This situation might often be a result of an inaccurate sessions management, e.g. ` +
          `old automation sessions on the same device must always be closed before starting new ones.`,
      );
    }
    await adb.forwardPort(localPort, DEVICE_PORT);
  };

  if (this.opts.systemPort) {
    this.systemPort = this.opts.systemPort;
    return await forwardPort(this.systemPort);
  }

  await DEVICE_PORT_ALLOCATION_GUARD(async () => {
    const [startPort, endPort] = DEVICE_PORT_RANGE;
    try {
      this.systemPort = await findAPortNotInUse(startPort, endPort);
    } catch {
      throw this.log.errorWithException(
        `Cannot find any free port in range ${startPort}..${endPort}}. ` +
          `Please set the available port number by providing the systemPort capability or ` +
          `double check the processes that are locking ports within this range and terminate ` +
          `these which are not needed anymore`,
      );
    }
    await forwardPort(this.systemPort);
  });
}

/** Removes the UiAutomator2 server port forward. */
export async function releaseSystemPort(this: AndroidUiautomator2Driver) {
  const adb = this.adb;
  const systemPort = this.systemPort;
  if (!systemPort || !adb) {
    return;
  }

  if (this.opts.systemPort) {
    // We assume if the systemPort is provided manually then it must be unique,
    // so there is no need for the explicit synchronization
    await adb.removePortForward(systemPort);
  } else {
    await DEVICE_PORT_ALLOCATION_GUARD(async () => await adb.removePortForward(systemPort));
  }
}

/** Forwards a local port to the UiAutomator2 MJPEG server port on the device. */
export async function allocateMjpegServerPort(this: AndroidUiautomator2Driver) {
  if (this.opts.mjpegServerPort) {
    const adb = this.requireAdb();
    this.log.debug(
      `MJPEG broadcasting requested, forwarding MJPEG server port ${MJPEG_SERVER_DEVICE_PORT} ` +
        `to local port ${this.opts.mjpegServerPort}`,
    );
    await adb.forwardPort(this.opts.mjpegServerPort, MJPEG_SERVER_DEVICE_PORT);
  }
}

/** Removes the UiAutomator2 MJPEG server port forward. */
export async function releaseMjpegServerPort(this: AndroidUiautomator2Driver) {
  if (this.opts.mjpegServerPort && this.adb) {
    await this.adb.removePortForward(this.opts.mjpegServerPort);
  }
}

/** Runs device preparation steps before the UiAutomator2 server session starts. */
export async function performPreExecSetup(
  this: AndroidUiautomator2Driver,
): Promise<StringRecord | undefined> {
  const apiLevel = await this.adb.getApiLevel();
  if (apiLevel < MIN_SUPPORTED_API_LEVEL) {
    throw this.log.errorWithException('UIAutomator2 only supports Android 8.0 (Oreo) and above');
  }

  const preflightPromises: Promise<any>[] = [];
  if (apiLevel >= 28) {
    // Android P
    preflightPromises.push(
      (async () => {
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
              `the automation server. Original error: ${(err as Error).message}`,
          );
        }
      })(),
    );
  }
  if (util.hasValue(this.opts.gpsEnabled)) {
    preflightPromises.push(
      (async () => {
        this.log.info(
          `Trying to ${this.opts.gpsEnabled ? 'enable' : 'disable'} gps location provider`,
        );
        await this.adb.toggleGPSLocationProvider(Boolean(this.opts.gpsEnabled));
      })(),
    );
  }
  if (this.opts.hideKeyboard) {
    preflightPromises.push(
      (async () => {
        this._originalIme = await this.adb.defaultIME();
      })(),
    );
  }
  let appInfo;
  preflightPromises.push(
    (async () => {
      // get appPackage et al from manifest if necessary
      appInfo = await this.getLaunchInfo();
    })(),
  );
  // start settings app, set the language/locale, start logcat etc...
  preflightPromises.push(this.initDevice());

  await Promise.all(preflightPromises);

  this.opts = {...this.opts, ...(appInfo ?? {})};
  return appInfo;
}

/** Installs and starts the UiAutomator2 server for the current session. */
export async function performExecution(
  this: AndroidUiautomator2Driver,
  capsWithSessionInfo: StringRecord,
): Promise<void> {
  await Promise.all([
    // Prepare the device by forwarding the UiAutomator2 port
    // This call mutates this.systemPort if it is not set explicitly
    this.allocateSystemPort(),
    // Prepare the device by forwarding the UiAutomator2 MJPEG server port (if
    // applicable)
    this.allocateMjpegServerPort(),
  ]);

  const [uiautomator2] = await Promise.all([
    // set up the modified UiAutomator2 server etc
    this.initUiAutomator2Server(),
    (async () => {
      // Should be after installing io.appium.settings
      if (this.opts.disableWindowAnimation && (await this.adb.getApiLevel()) < 26) {
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

/** Runs post-start steps after the UiAutomator2 server session is online. */
export async function performPostExecSetup(this: AndroidUiautomator2Driver): Promise<void> {
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
  if ((await this.getCurrentContext()) === this.defaultContextName()) {
    await this.notifyBiDiContextChange();
  }
}

/** Orchestrates UiAutomator2 server session startup and returns session capabilities. */
export async function startSession(
  this: AndroidUiautomator2Driver,
  caps: Uiautomator2StartSessionOpts,
): Promise<Uiautomator2SessionCaps> {
  const appInfo = await this.performSessionPreExecSetup();
  // set actual device name, udid, platform version, screen size, screen density, model and manufacturer details
  const deviceName = this.adb?.curDeviceId;
  const deviceUDID = this.opts.udid;
  if (!deviceName) {
    throw this.log.errorWithException('Could not determine device name (ADB curDeviceId is empty)');
  }
  if (!deviceUDID) {
    throw this.log.errorWithException('Device UDID is not set in session options');
  }
  const sessionInfo: Uiautomator2SessionInfo = {
    deviceName,
    deviceUDID,
  };
  const capsWithSessionInfo = {
    ...caps,
    ...sessionInfo,
  };
  // Adding AUT info in the capabilities if it does not exist in caps
  if (appInfo) {
    for (const capName of ['appPackage', 'appActivity'] as const) {
      if (!(capsWithSessionInfo as StringRecord)[capName] && appInfo[capName]) {
        (capsWithSessionInfo as StringRecord)[capName] = appInfo[capName];
      }
    }
  }

  await this.performSessionExecution(capsWithSessionInfo);

  const deviceInfoPromise: Promise<Uiautomator2DeviceDetails | EmptyObject> = (async () => {
    try {
      return await this.getDeviceDetails();
    } catch (e) {
      this.log.warn(`Cannot fetch device details. Original error: ${(e as Error).message}`);
      return {};
    }
  })();

  await this.performSessionPostExecSetup();

  return {...capsWithSessionInfo, ...(await deviceInfoPromise)};
}

/** Creates the UiAutomator2 server client and installs server APKs when needed. */
export async function initServer(this: AndroidUiautomator2Driver) {
  const uiautomator2Opts: UiAutomator2ServerOptions = {
    host: this.opts.remoteAdbHost || LOCALHOST_IP4,
    systemPort: this.systemPort as number,
    adb: this.adb,
    disableWindowAnimation: !!this.opts.disableWindowAnimation,
    disableSuppressAccessibilityService: this.opts.disableSuppressAccessibilityService,
    readTimeout: this.opts.uiautomator2ServerReadTimeout,
    basePath: this.basePath,
  };
  // now that we have package and activity, we can create an instance of
  // uiautomator2 with the appropriate options
  this.uiautomator2 = new UiAutomator2Server(this.log, uiautomator2Opts);
  this.proxyReqRes = this.uiautomator2.proxyReqRes.bind(this.uiautomator2);
  this.proxyCommand = this.uiautomator2.proxyCommand.bind(this.uiautomator2);

  if (this.opts.skipServerInstallation) {
    this.log.info(`'skipServerInstallation' is set. Skipping UIAutomator2 server installation.`);
  } else {
    await this.uiautomator2.installServerApk(this.opts.uiautomator2ServerInstallTimeout);
    try {
      await this.requireAdb().addToDeviceIdleWhitelist(
        SETTINGS_HELPER_ID,
        SERVER_PACKAGE_ID,
        SERVER_TEST_PACKAGE_ID,
      );
    } catch (e) {
      const err = e as ExecError;
      this.log.warn(
        `Cannot add server packages to the Doze whitelist. Original error: ` +
          (err.stderr || err.message),
      );
    }
  }

  return this.uiautomator2;
}

/** Returns the initialized UiAutomator2 server client or throws if it is missing. */
export function requireServer(this: AndroidUiautomator2Driver): UiAutomator2Server {
  const server = this.uiautomator2;
  if (!server) {
    throw this.log.errorWithException('UiAutomator2 server is not initialized');
  }
  return server;
}
