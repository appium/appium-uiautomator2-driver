import _ from 'lodash';
import { JWProxy, errors } from 'appium-base-driver';
import { waitForCondition } from 'asyncbox';
import log from './logger';
import {
  SERVER_APK_PATH as apkPath,
  TEST_APK_PATH as testApkPath,
  version as serverVersion
} from 'appium-uiautomator2-server';
import {
  util, logger, tempDir, fs, timing
} from 'appium-support';
import B from 'bluebird';
import helpers from './helpers';
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
  constructor (opts = {}) {
    for (let req of REQD_PARAMS) {
      if (!opts || !util.hasValue(opts[req])) {
        throw new Error(`Option '${req}' is required!`);
      }
      this[req] = opts[req];
    }
    this.disableSuppressAccessibilityService = opts.disableSuppressAccessibilityService;
    const proxyOpts = {
      server: this.host,
      port: this.systemPort,
      keepAlive: true,
    };
    if (opts.readTimeout && opts.readTimeout > 0) {
      proxyOpts.timeout = opts.readTimeout;
    }
    this.jwproxy = new UIA2Proxy(proxyOpts);
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);
    this.jwproxy.didInstrumentationExit = false;
  }

  /**
   * Installs the apks on to the device or emulator.
   *
   * @param {number} installTimeout - Installation timeout
   */
  async installServerApk (installTimeout = SERVER_INSTALL_RETRIES * 1000) {
    const tmpRoot = await tempDir.openDir();
    const packageInfosMapper = async ({appPath, appId}) => {
      if (await helpers.isWriteable(appPath)) {
        return { appPath, appId };
      }

      log.info(`Server package at '${appPath}' is not writeable. ` +
        `Will copy it into the temporary location at '${tmpRoot}' as a workaround. ` +
        `Consider making this file writeable manually in order to improve the performance of session startup.`);
      const dstPath = path.resolve(tmpRoot, path.basename(appPath));
      await fs.copyFile(appPath, dstPath);
      return {
        appPath: dstPath,
        appId,
      };
    };

    try {
      const packagesInfo = await B.all(B.map([
        {
          appPath: apkPath,
          appId: SERVER_PACKAGE_ID,
        }, {
          appPath: testApkPath,
          appId: SERVER_TEST_PACKAGE_ID,
        },
      ], packageInfosMapper));

      let shouldUninstallServerPackages = false;
      let shouldInstallServerPackages = false;
      for (const {appId, appPath} of packagesInfo) {
        if (appId === SERVER_TEST_PACKAGE_ID) {
          const isAppInstalled = await this.adb.isAppInstalled(appId);

          // There is no point in getting the state for test server,
          // since it does not contain version info
          if (!await this.adb.checkApkCert(appPath, appId)) {
            await helpers.signApp(this.adb, appPath);
            shouldUninstallServerPackages = shouldUninstallServerPackages || isAppInstalled;
            shouldInstallServerPackages = true;
          }

          if (!isAppInstalled) {
            shouldInstallServerPackages = true;
          }
          continue;
        }

        const appState = await this.adb.getApplicationInstallState(appPath, appId);
        log.debug(`${appId} installation state: ${appState}`);
        if (await this.adb.checkApkCert(appPath, appId)) {
          shouldUninstallServerPackages = shouldUninstallServerPackages || [
            this.adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
            this.adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ].includes(appState);
        } else {
          await helpers.signApp(this.adb, appPath);
          shouldUninstallServerPackages = shouldUninstallServerPackages || ![
            this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ].includes(appState);
        }
        shouldInstallServerPackages = shouldInstallServerPackages || shouldUninstallServerPackages || [
          this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
        ].includes(appState);
      }
      log.info(`Server packages are ${shouldInstallServerPackages ? '' : 'not '}going to be (re)installed`);
      if (shouldInstallServerPackages && shouldUninstallServerPackages) {
        log.info('Full packages reinstall is going to be performed');
      }
      for (const {appId, appPath} of packagesInfo) {
        if (shouldUninstallServerPackages) {
          try {
            await this.adb.uninstallApk(appId);
          } catch (err) {
            log.warn(`Error uninstalling '${appId}': ${err.message}`);
          }
        }
        if (shouldInstallServerPackages) {
          await this.adb.install(appPath, {
            noIncremental: true,
            replace: true,
            timeout: installTimeout,
            timeoutCapName: 'uiautomator2ServerInstallTimeout'
          });
        }
      }
    } finally {
      await fs.rimraf(tmpRoot);
    }

    await this.verifyServicesAvailability();
  }

  async verifyServicesAvailability () {
    log.debug(`Waiting up to ${SERVICES_LAUNCH_TIMEOUT}ms for services to be available`);
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
            log.debug(`Instrumentation target '${INSTRUMENTATION_TARGET}' is available`);
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
      log.error(`Unable to find instrumentation target '${INSTRUMENTATION_TARGET}': ${(pmError || {}).message}`);
      if (pmOutput) {
        log.debug('Available targets:');
        for (const line of pmOutput.split('\n')) {
          log.debug(`    ${line.replace('instrumentation:', '')}`);
        }
      }
    }
  }

  async startSession (caps) {
    await this.cleanupAutomationLeftovers();
    if (caps.skipServerInstallation) {
      log.info(`'skipServerInstallation' is set. Attempting to use UIAutomator2 server from the device`);
    } else {
      log.info(`Starting UIAutomator2 server ${serverVersion}`);
      log.info(`Using UIAutomator2 server from '${apkPath}' and test from '${testApkPath}'`);
    }

    const timeout = caps.uiautomator2ServerLaunchTimeout || SERVER_LAUNCH_TIMEOUT;
    const timer = new timing.Timer().start();
    let retries = 0;
    const maxRetries = 2;
    const delayBetweenRetries = 3000;
    while (retries < maxRetries) {
      log.info(`Waiting up to ${timeout}ms for UiAutomator2 to be online...`);
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
          log.errorAndThrow(`The instrumentation process cannot be initialized within ${timeout}ms timeout. `
            + 'Make sure the application under test does not crash and investigate the logcat output. '
            + `You could also try to increase the value of 'uiautomator2ServerLaunchTimeout' capability`);
        }
      }
      if (!this.jwproxy.didInstrumentationExit) {
        break;
      }

      retries++;
      if (retries >= maxRetries) {
        log.errorAndThrow('The instrumentation process cannot be initialized. '
          + 'Make sure the application under test does not crash and investigate the logcat output.');
      }
      log.warn(`The instrumentation process has been unexpectedly terminated. `
        + `Retrying UiAutomator2 startup (#${retries} of ${maxRetries - 1})`);
      await this.cleanupAutomationLeftovers(true);
      await B.delay(delayBetweenRetries);
    }

    log.debug(`The initialization of the instrumentation process took `
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
      cmd.push('-e', 'DISABLE_SUPPRESS_ACCESSIBILITY_SERVICES', this.disableSuppressAccessibilityService);
    }
    // Disable Google analytics to prevent possible fatal exception
    cmd.push('-e', 'disableAnalytics', true);
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
    log.debug('Deleting UiAutomator2 server session');
    // rely on jwproxy's intelligence to know what we're talking about and
    // delete the current session
    try {
      await this.jwproxy.command('/', 'DELETE');
    } catch (err) {
      log.warn(`Did not get confirmation UiAutomator2 deleteSession worked; ` +
          `Error was: ${err}`);
    }
  }

  async cleanupAutomationLeftovers (strictCleanup = false) {
    log.debug(`Performing ${strictCleanup ? 'strict' : 'shallow'} cleanup of automation leftovers`);

    try {
      const {value} = (await axios({
        url: `http://${this.host}:${this.systemPort}/wd/hub/sessions`,
        timeout: 500,
      })).data;
      const activeSessionIds = value.map(({id}) => id).filter(Boolean);
      if (activeSessionIds.length) {
        log.debug(`The following obsolete sessions are still running: ${JSON.stringify(activeSessionIds)}`);
        log.debug(`Cleaning up ${util.pluralize('obsolete session', activeSessionIds.length, true)}`);
        await B.all(activeSessionIds
          .map((id) => axios.delete(`http://${this.host}:${this.systemPort}/wd/hub/session/${id}`))
        );
        // Let all sessions to be properly terminated before continuing
        await B.delay(1000);
      } else {
        log.debug('No obsolete sessions have been detected');
      }
    } catch (e) {
      log.debug(`No obsolete sessions have been detected (${e.message})`);
    }

    try {
      await this.adb.forceStop(SERVER_TEST_PACKAGE_ID);
    } catch (ignore) {}
    if (!strictCleanup) {
      return;
    }
    // https://github.com/appium/appium/issues/10749
    try {
      await this.adb.killProcessesByName('uiautomator');
    } catch (ignore) {}
  }
}

export { UiAutomator2Server, INSTRUMENTATION_TARGET, SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID };
export default UiAutomator2Server;
