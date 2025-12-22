import _ from 'lodash';
import {JWProxy, errors} from 'appium/driver';
import {waitForCondition} from 'asyncbox';
import {
  SERVER_APK_PATH as apkPath,
  TEST_APK_PATH as testApkPath,
  version as serverVersion,
} from 'appium-uiautomator2-server';
import {util, timing} from 'appium/support';
import type {
  AppiumLogger,
  StringRecord,
  HTTPMethod,
  HTTPBody,
  ProxyResponse,
  ProxyOptions,
} from '@appium/types';
import B from 'bluebird';
import axios from 'axios';
import type {ADB, InstallState} from 'appium-adb';
import type {SubProcess} from 'teen_process';

const SERVER_LAUNCH_TIMEOUT_MS = 30000;
const SERVER_INSTALL_RETRIES = 20;
const SERVICES_LAUNCH_TIMEOUT_MS = 30000;
const SERVER_SHUTDOWN_TIMEOUT_MS = 5000;
const SERVER_REQUEST_TIMEOUT_MS = 500;
export const SERVER_PACKAGE_ID = 'io.appium.uiautomator2.server';
export const SERVER_TEST_PACKAGE_ID = `${SERVER_PACKAGE_ID}.test`;
export const INSTRUMENTATION_TARGET = `${SERVER_TEST_PACKAGE_ID}/androidx.test.runner.AndroidJUnitRunner`;
const REQUIRED_OPTIONS: RequiredKeysOf<UiAutomator2ServerOptions>[] = [
  'adb',
  'host',
  'systemPort',
  'disableWindowAnimation',
] as const;

class UIA2Proxy extends JWProxy {
  public didInstrumentationExit: boolean = false;

  override async proxyCommand(
    url: string,
    method: HTTPMethod,
    body: HTTPBody = null,
  ): Promise<[ProxyResponse, HTTPBody]> {
    if (this.didInstrumentationExit) {
      throw new errors.InvalidContextError(
        `'${method} ${url}' cannot be proxied to UiAutomator2 server because ` +
          'the instrumentation process is not running (probably crashed). ' +
          'Check the server log and/or the logcat output for more details',
      );
    }
    return await super.proxyCommand(url, method, body);
  }
}

export class UiAutomator2Server {
  public readonly jwproxy: UIA2Proxy;
  public readonly proxyReqRes: typeof UIA2Proxy.prototype.proxyReqRes;
  public readonly proxyCommand: typeof UIA2Proxy.prototype.command;

  private readonly host: string;
  private readonly systemPort: number;
  private readonly adb: ADB;
  private readonly disableWindowAnimation: boolean;
  private readonly disableSuppressAccessibilityService?: boolean;
  private readonly log: AppiumLogger;
  private instrumentationProcess: SubProcess | null = null;

  constructor(log: AppiumLogger, opts: UiAutomator2ServerOptions) {
    // Validate and assign required properties from UiAutomator2ServerOptions
    // The keys are typed to match only the required (non-optional) properties of the interface
    for (const key of REQUIRED_OPTIONS) {
      if (!opts || !util.hasValue(opts[key])) {
        throw new Error(`Option '${key}' is required!`);
      }
      (this as any)[key] = opts[key];
    }
    this.log = log;
    this.disableSuppressAccessibilityService = opts.disableSuppressAccessibilityService;
    const proxyOpts: ProxyOptions = {
      log,
      server: this.host,
      port: this.systemPort,
      keepAlive: true,
    };
    if (opts.basePath) {
      proxyOpts.reqBasePath = opts.basePath;
    }
    if (opts.readTimeout && opts.readTimeout > 0) {
      proxyOpts.timeout = opts.readTimeout;
    }
    this.jwproxy = new UIA2Proxy(proxyOpts);
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);
    this.proxyCommand = this.jwproxy.command.bind(this.jwproxy);
    this.jwproxy.didInstrumentationExit = false;
    this.instrumentationProcess = null;
  }

  /**
   * Installs the apks on to the device or emulator.
   *
   * @param installTimeout - Installation timeout
   */
  async installServerApk(installTimeout: number = SERVER_INSTALL_RETRIES * 1000): Promise<void> {
    const packagesInfo = await B.all(
      [
        {
          appPath: apkPath,
          appId: SERVER_PACKAGE_ID,
        },
        {
          appPath: testApkPath,
          appId: SERVER_TEST_PACKAGE_ID,
        },
      ].map(({appPath, appId}) => this.prepareServerPackage(appPath, appId)),
    );

    this.log.debug(`Server packages status: ${JSON.stringify(packagesInfo)}`);
    const shouldUninstallServerPackages = this.shouldUninstallServerPackages(packagesInfo);
    // Install must always follow uninstall. Also, perform the install if
    // any of server packages is not installed or is outdated
    const shouldInstallServerPackages = shouldUninstallServerPackages || this.shouldInstallServerPackages(packagesInfo);
    this.log.info(`Server packages are ${shouldInstallServerPackages ? '' : 'not '}going to be (re)installed`);
    if (shouldInstallServerPackages && shouldUninstallServerPackages) {
      this.log.info('Full packages reinstall is going to be performed');
    }
    if (shouldUninstallServerPackages) {
      const silentUninstallPkg = async (pkgId: string): Promise<void> => {
        try {
          await this.adb.uninstallApk(pkgId);
        } catch (err: any) {
          this.log.info(`Cannot uninstall '${pkgId}': ${err.message}`);
        }
      };
      await B.all(packagesInfo.map(({appId}) => silentUninstallPkg(appId)));
    }
    if (shouldInstallServerPackages) {
      const installPkg = async (pkgPath: string): Promise<void> => {
        await this.adb.install(pkgPath, {
          noIncremental: true,
          replace: true,
          timeout: installTimeout,
          timeoutCapName: 'uiautomator2ServerInstallTimeout',
        });
      };
      await B.all(packagesInfo.map(({appPath}) => installPkg(appPath)));
    }

    await this.verifyServicesAvailability();
  }

  async startSession(caps: StringRecord): Promise<void> {
    await this.cleanupAutomationLeftovers();
    if (caps.skipServerInstallation) {
      this.log.info(`'skipServerInstallation' is set. Attempting to use UIAutomator2 server from the device`);
    } else {
      this.log.info(`Starting UIAutomator2 server ${serverVersion}`);
      this.log.info(`Using UIAutomator2 server from '${apkPath}' and test from '${testApkPath}'`);
    }

    const timeout = (caps.uiautomator2ServerLaunchTimeout as number) || SERVER_LAUNCH_TIMEOUT_MS;
    const timer = new timing.Timer().start();
    let retries = 0;
    const maxRetries = 2;
    const delayBetweenRetries = 3000;
    while (retries < maxRetries) {
      this.log.info(`Waiting up to ${timeout}ms for UiAutomator2 to be online...`);
      this.jwproxy.didInstrumentationExit = false;
      try {
        await this.stopInstrumentationProcess();
      } catch {}
      await this.startInstrumentationProcess();
      if (!this.jwproxy.didInstrumentationExit) {
        try {
          await waitForCondition(
            async () => {
              try {
                await this.jwproxy.command('/status', 'GET');
                return true;
              } catch {
                // short circuit to retry or fail fast
                return this.jwproxy.didInstrumentationExit;
              }
            },
            {
              waitMs: timeout,
              intervalMs: 1000,
            },
          );
        } catch {
          throw this.log.errorWithException(
            `The instrumentation process cannot be initialized within ${timeout}ms timeout. ` +
              'Make sure the application under test does not crash and investigate the logcat output. ' +
              `You could also try to increase the value of 'uiautomator2ServerLaunchTimeout' capability`,
          );
        }
      }
      if (!this.jwproxy.didInstrumentationExit) {
        break;
      }

      retries++;
      if (retries >= maxRetries) {
        throw this.log.errorWithException(
          'The instrumentation process cannot be initialized. ' +
            'Make sure the application under test does not crash and investigate the logcat output.',
        );
      }
      this.log.warn(
        `The instrumentation process has been unexpectedly terminated. ` +
          `Retrying UiAutomator2 startup (#${retries} of ${maxRetries - 1})`,
      );
      await this.cleanupAutomationLeftovers(true);
      await B.delay(delayBetweenRetries);
    }

    this.log.debug(
      `The initialization of the instrumentation process took ` +
        `${timer.getDuration().asMilliSeconds.toFixed(0)}ms`,
    );
    await this.jwproxy.command('/session', 'POST', {
      capabilities: {
        firstMatch: [caps],
        alwaysMatch: {},
      },
    });
  }

  async deleteSession(): Promise<void> {
    this.log.debug('Deleting UiAutomator2 server session');

    try {
      await this.jwproxy.command('/', 'DELETE');
    } catch (err: any) {
      this.log.warn(
        `Did not get the confirmation of UiAutomator2 server session deletion. ` +
          `Original error: ${err.message}`,
      );
    }

    // Theoretically we could also force kill instumentation and server processes
    // without waiting for them to properly quit on their own.
    // This may cause unexpected error reports in device logs though.
    await this._waitForTermination();

    try {
      await this.stopInstrumentationProcess();
    } catch (err: any) {
      this.log.warn(`Could not stop the instrumentation process. Original error: ${err.message}`);
    }

    try {
      await B.all([this.adb.forceStop(SERVER_PACKAGE_ID), this.adb.forceStop(SERVER_TEST_PACKAGE_ID)]);
    } catch {}
  }

  private async prepareServerPackage(appPath: string, appId: string): Promise<PackageInfo> {
    const resultInfo: PackageInfo = {
      installState: this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
      appPath,
      appId,
    };

    if (appId === SERVER_TEST_PACKAGE_ID && (await this.adb.isAppInstalled(appId))) {
      // There is no point in getting the state for the test server,
      // since it does not contain any version info
      resultInfo.installState = this.adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED;
    } else if (appId === SERVER_PACKAGE_ID) {
      resultInfo.installState = await this.adb.getApplicationInstallState(resultInfo.appPath, appId);
    }

    return resultInfo;
  }

  /**
   * Checks if server components must be installed from the device under test
   * in scope of the current driver session.
   *
   * For example, if one of servers on the device under test was newer than servers current UIA2 driver wants to
   * use for the session, the UIA2 driver should uninstall the installed ones in order to avoid
   * version mismatch between the UIA2 drier and servers on the device under test.
   * Also, if the device under test has missing servers, current UIA2 driver should uninstall all
   * servers once in order to install proper servers freshly.
   *
   * @param packagesInfo
   * @returns true if any of components is already installed and the other is not installed
   *                    or the installed one has a newer version.
   */
  private shouldUninstallServerPackages(packagesInfo: PackageInfo[] = []): boolean {
    const isAnyComponentInstalled = packagesInfo.some(
      ({installState}) => installState !== this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
    );
    const isAnyComponentNotInstalledOrNewer = packagesInfo.some(({installState}) =>
      [this.adb.APP_INSTALL_STATE.NOT_INSTALLED, this.adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED].includes(
        installState,
      ),
    );
    return isAnyComponentInstalled && isAnyComponentNotInstalledOrNewer;
  }

  /**
   * Checks if server components should be installed on the device under test in scope of the current driver session.
   *
   * @param packagesInfo
   * @returns true if any of components is not installed or older than currently installed in order to
   *                    install or upgrade the servers on the device under test.
   */
  private shouldInstallServerPackages(packagesInfo: PackageInfo[] = []): boolean {
    return packagesInfo.some(({installState}) =>
      [this.adb.APP_INSTALL_STATE.NOT_INSTALLED, this.adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED].includes(
        installState,
      ),
    );
  }

  private async verifyServicesAvailability(): Promise<void> {
    this.log.debug(`Waiting up to ${SERVICES_LAUNCH_TIMEOUT_MS}ms for services to be available`);
    let isPmServiceAvailable = false;
    let pmOutput = '';
    let pmError: Error | null = null;
    try {
      await waitForCondition(
        async () => {
          if (!isPmServiceAvailable) {
            pmError = null;
            pmOutput = '';
            try {
              pmOutput = await this.adb.shell(['pm', 'list', 'instrumentation']);
            } catch (e: any) {
              pmError = e;
            }
            if (pmOutput.includes('Could not access the Package Manager')) {
              pmError = new Error(`Problem running Package Manager: ${pmOutput}`);
              pmOutput = ''; // remove output, so it is not printed below
            } else if (pmOutput.includes(INSTRUMENTATION_TARGET)) {
              pmOutput = ''; // remove output, so it is not printed below
              this.log.debug(`Instrumentation target '${INSTRUMENTATION_TARGET}' is available`);
              isPmServiceAvailable = true;
            } else if (!pmError) {
              pmError = new Error('The instrumentation target is not listed by Package Manager');
            }
          }
          return isPmServiceAvailable;
        },
        {
          waitMs: SERVICES_LAUNCH_TIMEOUT_MS,
          intervalMs: 1000,
        },
      );
    } catch {
      const errorMessage = (pmError as any)?.message || 'Unknown error';
      this.log.error(
        `Unable to find instrumentation target '${INSTRUMENTATION_TARGET}': ${errorMessage}`,
      );
      if (pmOutput) {
        this.log.debug('Available targets:');
        for (const line of pmOutput.split('\n')) {
          this.log.debug(`    ${line.replace('instrumentation:', '')}`);
        }
      }
    }
  }

  private async startInstrumentationProcess(): Promise<void> {
    const cmd = ['am', 'instrument', '-w'];
    if (this.disableWindowAnimation) {
      cmd.push('--no-window-animation');
    }
    if (_.isBoolean(this.disableSuppressAccessibilityService)) {
      cmd.push('-e', 'DISABLE_SUPPRESS_ACCESSIBILITY_SERVICES', `${this.disableSuppressAccessibilityService}`);
    }
    // Disable Google analytics to prevent possible fatal exception
    cmd.push('-e', 'disableAnalytics', 'true');
    cmd.push(INSTRUMENTATION_TARGET);
    this.instrumentationProcess = this.adb.createSubProcess(['shell', ...cmd]);
    for (const streamName of ['stderr', 'stdout'] as const) {
      this.instrumentationProcess.on(`line-${streamName}`, (line: string) =>
        this.log.debug(`[Instrumentation] ${line}`),
      );
    }
    this.instrumentationProcess.once('exit', (code: number | null, signal: string | null) => {
      this.log.debug(`[Instrumentation] The process has exited with code ${code}, signal ${signal}`);
      this.jwproxy.didInstrumentationExit = true;
    });
    await this.instrumentationProcess.start(0);
  }

  private async stopInstrumentationProcess(): Promise<void> {
    try {
      if (this.instrumentationProcess?.isRunning) {
        await this.instrumentationProcess.stop();
      }
    } finally {
      this.instrumentationProcess?.removeAllListeners();
      this.instrumentationProcess = null;
    }
  }

  private async cleanupAutomationLeftovers(strictCleanup: boolean = false): Promise<void> {
    this.log.debug(`Performing ${strictCleanup ? 'strict' : 'shallow'} cleanup of automation leftovers`);

    const serverBase = `http://${this.host}:${this.systemPort}`;
    try {
      const {value} = (
        await axios({
          url: `${serverBase}/sessions`,
          timeout: SERVER_REQUEST_TIMEOUT_MS,
        })
      ).data as SessionsResponse;
      const activeSessionIds = value.map(({id}) => id).filter(Boolean);
      if (activeSessionIds.length) {
        this.log.debug(`The following obsolete sessions are still running: ${activeSessionIds}`);
        this.log.debug(`Cleaning up ${util.pluralize('obsolete session', activeSessionIds.length, true)}`);
        await B.all(
          activeSessionIds.map((id: string) =>
            axios.delete(`${serverBase}/session/${id}`, {
              timeout: SERVER_REQUEST_TIMEOUT_MS,
            }),
          ),
        );
        // Let the server to be properly terminated before continuing
        await this._waitForTermination();
      } else {
        this.log.debug('No obsolete sessions have been detected');
      }
    } catch (e: any) {
      this.log.debug(`No obsolete sessions have been detected (${e.message})`);
    }

    try {
      await B.all([this.adb.forceStop(SERVER_PACKAGE_ID), this.adb.forceStop(SERVER_TEST_PACKAGE_ID)]);
    } catch {}
    if (strictCleanup) {
      // https://github.com/appium/appium/issues/10749
      try {
        await this.adb.killProcessesByName('uiautomator');
      } catch {}
    }
  }

  /**
   * Blocks until UIA2 server stops running
   * or SERVER_SHUTDOWN_TIMEOUT_MS expires
   *
   * @returns {Promise<void>}
   */
  private async _waitForTermination(): Promise<void> {
    try {
      await waitForCondition(
        async () => {
          try {
            return !(await this.adb.processExists(SERVER_PACKAGE_ID));
          } catch {
            return true;
          }
        },
        {
          waitMs: SERVER_SHUTDOWN_TIMEOUT_MS,
          intervalMs: 300,
        },
      );
    } catch {
      this.log.warn(
        `The UIA2 server has not been terminated within ${SERVER_SHUTDOWN_TIMEOUT_MS}ms timeout. ` +
          `Continuing anyway`,
      );
    }
  }
}


export interface PackageInfo {
  installState: InstallState;
  appPath: string;
  appId: string;
}

export interface UiAutomator2ServerOptions {
  adb: ADB;
  host: string;
  systemPort: number;
  disableWindowAnimation: boolean;
  readTimeout?: number;
  disableSuppressAccessibilityService?: boolean;
  basePath?: string;
}

// Type helper to extract required (non-optional) keys from UiAutomator2ServerOptions
type RequiredKeysOf<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

interface SessionInfo {
  id: string;
}

interface SessionsResponse {
  value: SessionInfo[];
}

