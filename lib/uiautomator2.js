import _ from 'lodash';
import { JWProxy, errors } from 'appium/driver';
import { waitForCondition } from 'asyncbox';
import {
  SERVER_APK_PATH as apkPath,
  TEST_APK_PATH as testApkPath,
  version as serverVersion
} from 'appium-uiautomator2-server';
import {
  util, logger, tempDir, fs, timing
} from 'appium/support';
import B from 'bluebird';
import {isWriteable, signApp} from './helpers';
import axios from 'axios';
import path from 'path';

const REQD_PARAMS = ['adb', 'tmpDir', 'host', 'systemPort', 'devicePort', 'disableWindowAnimation'];
const SERVER_LAUNCH_TIMEOUT = 30000;
const SERVER_INSTALL_RETRIES = 20;
const SERVICES_LAUNCH_TIMEOUT = 30000;
const SERVER_PACKAGE_ID = 'io.appium.uiautomator2.server';
const SERVER_TEST_PACKAGE_ID = `${SERVER_PACKAGE_ID}.test`;
const INSTRUMENTATION_TARGET = `${SERVER_TEST_PACKAGE_ID}/androidx.test.runner.AndroidJUnitRunner`;
const instrumentationLogger = logger.getLogger('Instrumentation');

class UIA2Proxy extends JWProxy {
  /** @type {boolean} */
  didInstrumentationExit;

  async proxyCommand (url, method, body = null) {
    if (this.didInstrumentationExit) {
      throw new errors.InvalidContextError(
        `'${method} ${url}' cannot be proxied to UiAutomator2 server because ` +
        'the instrumentation process is not running (probably crashed). ' +
        'Check the server log and/or the logcat output for more details');
    }
    return await super.proxyCommand(url, method, body);
  }
}

class UiAutomator2Server {
  /** @type {string} */
  host;

  /** @type {number} */
  systemPort;

  /** @type {import('appium-adb').ADB} */
  adb;

  /** @type {boolean} */
  disableWindowAnimation;

  /** @type {boolean|undefined} */
  disableSuppressAccessibilityService;

  constructor (log, opts = {}) {
    for (let req of REQD_PARAMS) {
      if (!opts || !util.hasValue(opts[req])) {
        throw new Error(`Option '${req}' is required!`);
      }
      this[req] = opts[req];
    }
    this.log = log;
    this.disableSuppressAccessibilityService = opts.disableSuppressAccessibilityService;
    const proxyOpts = {
      log,
      server: this.host,
      port: this.systemPort,
      keepAlive: true,
    };
    if (opts.readTimeout && opts.readTimeout > 0) {
      proxyOpts.timeout = opts.readTimeout;
    }
    this.jwproxy = new UIA2Proxy(proxyOpts);
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);
    this.proxyCommand = this.jwproxy.command.bind(this.jwproxy);
    this.jwproxy.didInstrumentationExit = false;
  }

  async prepareServerPackage(appPath, appId, tmpRoot) {
    const resultInfo = {
      wasSigned: false,
      installState: this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
      appPath,
      appId,
    };

    if (await this.adb.checkApkCert(resultInfo.appPath, appId)) {
      resultInfo.wasSigned = true;
    } else {
      if (!await isWriteable(appPath)) {
        this.log.warn(
          `Server package at '${appPath}' is not writeable. ` +
          `Will copy it into the temporary location at '${tmpRoot}' as a workaround. ` +
          `Consider making this file writeable manually in order to improve the performance of session startup.`
        );
        const dstPath = path.resolve(tmpRoot, path.basename(appPath));
        await fs.copyFile(appPath, dstPath);
        resultInfo.appPath = dstPath;
      }
      await signApp(this.adb, resultInfo.appPath);
    }

    if (appId === SERVER_TEST_PACKAGE_ID && await this.adb.isAppInstalled(appId)) {
      // There is no point in getting the state for the test server,
      // since it does not contain any version info
      resultInfo.installState = this.adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED;
    } else if (appId === SERVER_PACKAGE_ID) {
      resultInfo.installState = await this.adb.getApplicationInstallState(resultInfo.appPath, appId);
    }

    return resultInfo;
  }

  /**
   * Installs the apks on to the device or emulator.
   *
   * @param {number} installTimeout - Installation timeout
   */
  async installServerApk (installTimeout = SERVER_INSTALL_RETRIES * 1000) {
    const tmpRoot = await tempDir.openDir();
    try {
      const packagesInfo = await B.all(
        [
          {
            appPath: apkPath,
            appId: SERVER_PACKAGE_ID,
          }, {
            appPath: testApkPath,
            appId: SERVER_TEST_PACKAGE_ID,
          },
        ].map(({appPath, appId}) => this.prepareServerPackage(appPath, appId, tmpRoot))
      );

      this.log.debug(`Server packages status: ${JSON.stringify(packagesInfo)}`);
      // We want to enforce uninstall in case the current server package has not been signed properly
      // or if any of server packages is not installed, while the other does
      const shouldUninstallServerPackages = packagesInfo.some(({wasSigned}) => !wasSigned)
        || (packagesInfo.some(({installState}) => installState === this.adb.APP_INSTALL_STATE.NOT_INSTALLED)
            && !packagesInfo.every(({installState}) => installState === this.adb.APP_INSTALL_STATE.NOT_INSTALLED));
      // Install must always follow uninstall. Also, perform the install if
      // any of server packages is not installed or is outdated
      const shouldInstallServerPackages = shouldUninstallServerPackages || packagesInfo.some(({installState}) => [
        this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
        this.adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
      ].includes(installState));
      this.log.info(`Server packages are ${shouldInstallServerPackages ? '' : 'not '}going to be (re)installed`);
      if (shouldInstallServerPackages && shouldUninstallServerPackages) {
        this.log.info('Full packages reinstall is going to be performed');
      }
      if (shouldUninstallServerPackages) {
        const silentUninstallPkg = async (pkgId) => {
          try {
            await this.adb.uninstallApk(pkgId);
          } catch (err) {
            this.log.info(`Cannot uninstall '${pkgId}': ${err.message}`);
          }
        };
        await B.all(packagesInfo.map(({appId}) => silentUninstallPkg(appId)));
      }
      if (shouldInstallServerPackages) {
        const installPkg = async (pkgPath) => {
          await this.adb.install(pkgPath, {
            noIncremental: true,
            replace: true,
            timeout: installTimeout,
            timeoutCapName: 'uiautomator2ServerInstallTimeout'
          });
        };
        await B.all(packagesInfo.map(({appPath}) => installPkg(appPath)));
      }
    } finally {
      await fs.rimraf(tmpRoot);
    }

    await this.verifyServicesAvailability();
  }

  async verifyServicesAvailability () {
    this.log.debug(`Waiting up to ${SERVICES_LAUNCH_TIMEOUT}ms for services to be available`);
    let isPmServiceAvailable = false;
    let pmOutput = '';
    let pmError = null;
    try {
      await waitForCondition(async () => {
        if (!isPmServiceAvailable) {
          pmError = null;
          pmOutput = '';
          try {
            pmOutput = await this.adb.shell(['pm', 'list', 'instrumentation']);
          } catch (e) {
            pmError = e;
          }
          if (pmOutput.includes('Could not access the Package Manager')) {
            pmError = new Error(`Problem running Package Manager: ${pmOutput}`);
            pmOutput = ''; // remove output, so it is not printed below
          } else if (pmOutput.includes(INSTRUMENTATION_TARGET)) {
            pmOutput = ''; // remove output, so it is not printed below
            this.log.debug(`Instrumentation target '${INSTRUMENTATION_TARGET}' is available`);
            // eslint-disable-next-line require-atomic-updates
            isPmServiceAvailable = true;
          } else if (!pmError) {
            pmError = new Error('The instrumentation target is not listed by Package Manager');
          }
        }
        return isPmServiceAvailable;
      }, {
        waitMs: SERVICES_LAUNCH_TIMEOUT,
        intervalMs: 1000,
      });
    } catch (err) {
      // @ts-ignore It is ok if the attribute does not exist
      this.log.error(`Unable to find instrumentation target '${INSTRUMENTATION_TARGET}': ${(pmError || {}).message}`);
      if (pmOutput) {
        this.log.debug('Available targets:');
        for (const line of pmOutput.split('\n')) {
          this.log.debug(`    ${line.replace('instrumentation:', '')}`);
        }
      }
    }
  }

  async startSession (caps) {
    await this.cleanupAutomationLeftovers();
    if (caps.skipServerInstallation) {
      this.log.info(`'skipServerInstallation' is set. Attempting to use UIAutomator2 server from the device`);
    } else {
      this.log.info(`Starting UIAutomator2 server ${serverVersion}`);
      this.log.info(`Using UIAutomator2 server from '${apkPath}' and test from '${testApkPath}'`);
    }

    const timeout = caps.uiautomator2ServerLaunchTimeout || SERVER_LAUNCH_TIMEOUT;
    const timer = new timing.Timer().start();
    let retries = 0;
    const maxRetries = 2;
    const delayBetweenRetries = 3000;
    while (retries < maxRetries) {
      this.log.info(`Waiting up to ${timeout}ms for UiAutomator2 to be online...`);
      this.jwproxy.didInstrumentationExit = false;
      await this.startInstrumentationProcess();
      if (!this.jwproxy.didInstrumentationExit) {
        try {
          await waitForCondition(async () => {
            try {
              await this.jwproxy.command('/status', 'GET');
              return true;
            } catch (err) {
              // short circuit to retry or fail fast
              return this.jwproxy.didInstrumentationExit;
            }
          }, {
            waitMs: timeout,
            intervalMs: 1000,
          });
        } catch (err) {
          this.log.errorAndThrow(`The instrumentation process cannot be initialized within ${timeout}ms timeout. `
            + 'Make sure the application under test does not crash and investigate the logcat output. '
            + `You could also try to increase the value of 'uiautomator2ServerLaunchTimeout' capability`);
        }
      }
      if (!this.jwproxy.didInstrumentationExit) {
        break;
      }

      retries++;
      if (retries >= maxRetries) {
        this.log.errorAndThrow('The instrumentation process cannot be initialized. '
          + 'Make sure the application under test does not crash and investigate the logcat output.');
      }
      this.log.warn(`The instrumentation process has been unexpectedly terminated. `
        + `Retrying UiAutomator2 startup (#${retries} of ${maxRetries - 1})`);
      await this.cleanupAutomationLeftovers(true);
      await B.delay(delayBetweenRetries);
    }

    this.log.debug(`The initialization of the instrumentation process took `
      + `${timer.getDuration().asMilliSeconds.toFixed(0)}ms`);
    await this.jwproxy.command('/session', 'POST', {
      capabilities: {
        firstMatch: [caps],
        alwaysMatch: {},
      }
    });
  }

  async startInstrumentationProcess () {
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
    const instrumentationProcess = this.adb.createSubProcess(['shell', ...cmd]);
    instrumentationProcess.on('output', (stdout, stderr) => {
      const output = _.trim(stdout || stderr);
      if (output) {
        instrumentationLogger.debug(output);
      }
    });
    instrumentationProcess.on('exit', (code) => {
      instrumentationLogger.debug(`The process has exited with code ${code}`);
      this.jwproxy.didInstrumentationExit = true;
    });
    await instrumentationProcess.start(0);
  }

  async deleteSession () {
    this.log.debug('Deleting UiAutomator2 server session');
    // rely on jwproxy's intelligence to know what we're talking about and
    // delete the current session
    try {
      await this.jwproxy.command('/', 'DELETE');
    } catch (err) {
      this.log.warn(`Did not get confirmation UiAutomator2 deleteSession worked; ` +
          `Error was: ${err}`);
    }
  }

  async cleanupAutomationLeftovers (strictCleanup = false) {
    this.log.debug(`Performing ${strictCleanup ? 'strict' : 'shallow'} cleanup of automation leftovers`);

    const axiosTimeout = 500;

    const waitStop = async () => {
      // Wait for the process stop by sending a status request to the port.
      // We observed the process stop could be delayed, thus causing unexpected crashes
      // in the middle of the session preparation process. It caused an invalid session error response
      // by the uia2 server, but that was because the process stop's delay.
      const timeout = 3000;
      try {
        await waitForCondition(async () => {
          try {
            await axios({
              url: `http://${this.host}:${this.systemPort}/status`,
              timeout: axiosTimeout,
            });
          } catch (err) {
            return true;
          }
        }, {
          waitMs: timeout,
          intervalMs: 100,
        });
      } catch (err) {
        this.log.warn(`The ${SERVER_TEST_PACKAGE_ID} process might fail to stop within ${timeout}ms timeout.`);
      }
    };

    try {
      const {value} = (await axios({
        url: `http://${this.host}:${this.systemPort}/sessions`,
        timeout: axiosTimeout,
      })).data;
      const activeSessionIds = value.map(({id}) => id).filter(Boolean);
      if (activeSessionIds.length) {
        this.log.debug(`The following obsolete sessions are still running: ${JSON.stringify(activeSessionIds)}`);
        this.log.debug(`Cleaning up ${util.pluralize('obsolete session', activeSessionIds.length, true)}`);
        await B.all(activeSessionIds
          .map((id) => axios.delete(`http://${this.host}:${this.systemPort}/session/${id}`))
        );
        // Let all sessions to be properly terminated before continuing
        await B.delay(1000);
      } else {
        this.log.debug('No obsolete sessions have been detected');
      }
    } catch (e) {
      this.log.debug(`No obsolete sessions have been detected (${e.message})`);
    }

    try {
      await this.adb.forceStop(SERVER_TEST_PACKAGE_ID);
    } catch (ignore) {}
    if (strictCleanup) {
      // https://github.com/appium/appium/issues/10749
      try {
        await this.adb.killProcessesByName('uiautomator');
      } catch (ignore) {}
    }
    await waitStop();
  }
}

export { UiAutomator2Server, INSTRUMENTATION_TARGET, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID };
export default UiAutomator2Server;
