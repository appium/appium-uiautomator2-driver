import {SocketAddress} from 'node:net';

import type {Orientation, StringRecord} from '@appium/types';
import type {ADB} from 'appium-adb';
import type {ADBLaunchInfo} from 'appium-android-driver';
import {net, util} from 'appium/support.js';
import {retryInterval} from 'asyncbox';
import {SETTINGS_HELPER_ID} from 'io.appium.settings';
import type {ExecError} from 'teen_process';

import type {AndroidUiautomator2Driver} from '../driver.js';
import type {
  EmptyObject,
  Uiautomator2DeviceDetails,
  Uiautomator2SessionCaps,
  Uiautomator2SessionInfo,
  Uiautomator2StartSessionOpts,
} from '../types.js';
import {UiAutomator2Server, type UiAutomator2ServerOptions} from './core.js';
import {SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID} from './packages.js';

declare module '../driver.js' {
  interface AndroidUiautomator2Driver {
    allocateSystemPort(...args: Parameters<typeof allocateSystemPort>): ReturnType<typeof allocateSystemPort>;
    releaseSystemPort(...args: Parameters<typeof releaseSystemPort>): ReturnType<typeof releaseSystemPort>;
    allocateMjpegServerPort(
      ...args: Parameters<typeof allocateMjpegServerPort>
    ): ReturnType<typeof allocateMjpegServerPort>;
    releaseMjpegServerPort(
      ...args: Parameters<typeof releaseMjpegServerPort>
    ): ReturnType<typeof releaseMjpegServerPort>;
    performSessionPreExecSetup(...args: Parameters<typeof performPreExecSetup>): ReturnType<typeof performPreExecSetup>;
    performSessionExecution(...args: Parameters<typeof performExecution>): ReturnType<typeof performExecution>;
    performSessionPostExecSetup(
      ...args: Parameters<typeof performPostExecSetup>
    ): ReturnType<typeof performPostExecSetup>;
    startUiAutomator2Session(...args: Parameters<typeof startSession>): ReturnType<typeof startSession>;
    initUiAutomator2Server(...args: Parameters<typeof initServer>): ReturnType<typeof initServer>;
    requireUiautomator2(...args: Parameters<typeof requireServer>): ReturnType<typeof requireServer>;
  }
}

// The range of ports we can use on the system for communicating to the
// UiAutomator2 HTTP server on the device
const DEVICE_PORT_RANGE = [8200, 8299];
// Match ADB's bind errors independently of the platform or localized OS error that follows.
const PORT_UNAVAILABLE = /cannot rebind|cannot bind (?:listener\b|'tcp:\d+')/i;

// This is the port that UiAutomator2 listens to on the device. We will forward
// one of the ports above on the system to this port on the device.
const DEVICE_PORT = 6790;
// This is the port that the UiAutomator2 MJPEG server listens to on the device.
// We will forward one of the ports above on the system to this port on the
// device.
const MJPEG_SERVER_DEVICE_PORT = 7810;
const MIN_SUPPORTED_API_LEVEL = 26;
const LOCALHOST_IP4 = '127.0.0.1';

function isLoopbackHost(host: string): boolean {
  return host === 'localhost' || host === LOCALHOST_IP4 || SocketAddress.parse(`[${host}]`)?.address === '::1';
}

/** Returns a collision error or undefined on success. Throws for other failures. */
async function tryReservePort(adb: ADB, host: string, port: number, devicePort: number): Promise<Error | undefined> {
  // ADB may bind one loopback address family while another service owns the address the driver uses.
  if (isLoopbackHost(host) && (await net.checkPortStatus(port, {host})) === 'open') {
    return new Error(`Port ${port} is already in use on ${host}`);
  }
  try {
    await adb.adbExec(['forward', '--no-rebind', `tcp:${port}`, `tcp:${devicePort}`]);
  } catch (err) {
    const cause = err instanceof Error ? err : new Error(String(err));
    if (PORT_UNAVAILABLE.test(cause.message)) {
      return cause;
    }
    // A transport error can hide a successful forward. ADB cannot tell us which
    // client owns the mapping, so removing an unconfirmed forward is unsafe.
    throw new Error(
      `Could not confirm the ADB forward for tcp:${port} on ${host}: ${cause.message}. ` +
        'Check the same ADB server with adb forward --list. ' +
        `If you confirm the mapping is stale, remove it with adb forward --remove tcp:${port} for its device.`,
      {cause: err},
    );
  }
}

function occupiedPortError(capability: 'systemPort' | 'mjpegServerPort', port: number, cause: Error) {
  return new Error(
    `Requested ${capability} #${port} is unavailable on the ADB host. ` +
      `Choose a free port for the appium:${capability} capability or close the session using it. ` +
      `Original error: ${cause.message}`,
    {cause},
  );
}

/** Reserves a port on the ADB server host and forwards it to the UiAutomator2 server. */
export async function allocateSystemPort(this: AndroidUiautomator2Driver) {
  const adb = this.requireAdb();
  const requestedPort = this.opts.systemPort;
  const [startPort, endPort] = requestedPort ? [requestedPort, requestedPort] : DEVICE_PORT_RANGE;
  let lastPortError: unknown;
  for (let port = startPort; port <= endPort; port++) {
    // Leave the explicitly requested MJPEG port available for the next reservation.
    if (!requestedPort && port === this.opts.mjpegServerPort) {
      continue;
    }
    // All clients of this ADB server compete for the same ports, even across Appium hosts.
    const collision = await tryReservePort(adb, this.opts.remoteAdbHost || LOCALHOST_IP4, port, DEVICE_PORT);
    if (collision) {
      if (requestedPort) {
        throw occupiedPortError('systemPort', port, collision);
      }
      lastPortError = collision;
      continue;
    }
    this.systemPort = port;
    this.log.debug(`Forwarded system port ${port} to UiAutomator2 Server port ${DEVICE_PORT}`);
    return;
  }
  throw new Error(
    `Cannot find any free port in range ${startPort}..${endPort} on the ADB host. Set an available systemPort for this session.`,
    {cause: lastPortError},
  );
}

/** Removes the UiAutomator2 server port forward. */
export async function releaseSystemPort(this: AndroidUiautomator2Driver) {
  if (this.systemPort && this.adb) {
    await this.adb.removePortForward(this.systemPort);
    this.systemPort = undefined;
  }
}

/** Reserves a port on the ADB server host for the UiAutomator2 MJPEG server. */
export async function allocateMjpegServerPort(this: AndroidUiautomator2Driver) {
  const port = this.opts.mjpegServerPort;
  if (!port) {
    return;
  }

  const collision = await tryReservePort(
    this.requireAdb(),
    this.opts.remoteAdbHost || LOCALHOST_IP4,
    port,
    MJPEG_SERVER_DEVICE_PORT,
  );
  if (collision) {
    throw occupiedPortError('mjpegServerPort', port, collision);
  }
  this.mjpegServerPort = port;
  this.log.debug(`Forwarded port ${port} to UiAutomator2 MJPEG server port ${MJPEG_SERVER_DEVICE_PORT}`);
}

/** Removes the MJPEG port forward created by this session. */
export async function releaseMjpegServerPort(this: AndroidUiautomator2Driver) {
  if (this.mjpegServerPort && this.adb) {
    await this.adb.removePortForward(this.mjpegServerPort);
    this.mjpegServerPort = undefined;
  }
}

/** Runs device preparation steps before the UiAutomator2 server session starts. */
export async function performPreExecSetup(this: AndroidUiautomator2Driver): Promise<StringRecord | undefined> {
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
        this.log.info(`Trying to ${this.opts.gpsEnabled ? 'enable' : 'disable'} gps location provider`);
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
  let appInfo: ADBLaunchInfo | undefined;
  preflightPromises.push(
    (async () => {
      // get appPackage et al from manifest if necessary
      appInfo = await this.getLaunchInfo();
    })(),
  );
  // start settings app, set the language/locale, start logcat etc...
  preflightPromises.push(
    (async () => {
      await this.initDevice();
      // Requires io.appium.settings, which is installed by initDevice()
      await enableAccessibilityEventsService.call(this);
    })(),
  );

  // Wait for all the steps to finish, so the session cleanup never races with a pending one
  const failure = (await Promise.allSettled(preflightPromises)).find((r) => r.status === 'rejected');
  if (failure) {
    throw failure.reason;
  }

  if (appInfo) {
    this.opts = {...this.opts, ...appInfo};
  }
  return appInfo;
}

/** Installs and starts the UiAutomator2 server for the current session. */
export async function performExecution(
  this: AndroidUiautomator2Driver,
  capsWithSessionInfo: StringRecord,
): Promise<void> {
  // Finish each reservation before a startup failure can trigger port cleanup.
  await this.allocateSystemPort();
  await this.allocateMjpegServerPort();

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
    const orientation = this.opts.orientation as Orientation;
    this.log.debug(`Setting initial orientation to '${orientation}'`);
    await this.setOrientation(orientation);
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
    // Enabled accessibility services must not be suppressed to be able to emit events
    disableSuppressAccessibilityService:
      this.opts.disableSuppressAccessibilityService ?? (this.opts.enableAccessibilityEventsService ? true : undefined),
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
      await this.requireAdb().addToDeviceIdleWhitelist(SETTINGS_HELPER_ID, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID);
    } catch (e) {
      const err = e as ExecError;
      this.log.warn(`Cannot add server packages to the Doze whitelist. Original error: ` + (err.stderr || err.message));
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

/** Enables the no-op accessibility service of io.appium.settings if requested. */
async function enableAccessibilityEventsService(this: AndroidUiautomator2Driver): Promise<void> {
  if (!this.opts.enableAccessibilityEventsService) {
    return;
  }
  // Chrome only emits accessibility events if an accessibility service is enabled
  try {
    this._wasAccessibilityEventsServiceEnabled = await this.settingsApp.setAccessibilityEventsServiceState(true);
  } catch (err) {
    throw this.log.errorWithException(
      `Cannot enable the accessibility service of io.appium.settings: ${(err as Error).message}`,
    );
  }
}
