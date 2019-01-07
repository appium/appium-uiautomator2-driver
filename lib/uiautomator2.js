import _ from 'lodash';
import { JWProxy } from 'appium-base-driver';
import { retryInterval } from 'asyncbox';
import logger from './logger';
import { SERVER_APK_PATH as apkPath, TEST_APK_PATH as testApkPath, version as serverVersion } from 'appium-uiautomator2-server';
import adbkit from 'adbkit';
import { getRetries } from './utils';
import { util } from 'appium-support';


const REQD_PARAMS = ['adb', 'tmpDir', 'host', 'systemPort', 'devicePort', 'disableWindowAnimation'];
const SERVER_LAUNCH_RETRIES = 20;
const SERVER_INSTALL_RETRIES = 20;
const INSTRUMENTATION_TARGET = 'io.appium.uiautomator2.server.test/androidx.test.runner.AndroidJUnitRunner';
const SERVER_PACKAGE_ID = 'io.appium.uiautomator2.server';
const SERVER_TEST_PACKAGE_ID = `${SERVER_PACKAGE_ID}.test`;


class UiAutomator2Server {
  constructor (opts = {}) {
    for (let req of REQD_PARAMS) {
      if (!opts || !util.hasValue(opts[req])) {
        throw new Error(`Option '${req}' is required!`);
      }
      this[req] = opts[req];
    }
    this.jwproxy = new JWProxy({server: this.host, port: this.systemPort});
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);

    this.client = adbkit.createClient({
      port: this.adb.adbPort,
      host: this.host
    });
  }

  /**
   * Installs the apks on to the device or emulator.
   *
   * @param {number} installTimeout - Installation timeout
   */
  async installServerApk (installTimeout = SERVER_INSTALL_RETRIES * 1000) {
    const packagesInfo = [
      {
        appPath: apkPath,
        appId: SERVER_PACKAGE_ID,
      }, {
        appPath: testApkPath,
        appId: SERVER_TEST_PACKAGE_ID,
      },
    ];
    let shouldUninstallServerPackages = false;
    let shouldInstallServerPackages = false;
    for (const {appId, appPath} of packagesInfo) {
      if (appId === SERVER_TEST_PACKAGE_ID) {
        // There is no point in getting the state for test server,
        // since it does not contain version info
        if (!await this.adb.checkApkCert(appPath, appId)) {
          await this.adb.sign(appPath);
          shouldUninstallServerPackages = shouldUninstallServerPackages
            || await this.adb.isAppInstalled(appId);
          shouldInstallServerPackages = true;
        }
        continue;
      }

      const appState = await this.adb.getApplicationInstallState(appPath, appId);
      logger.debug(`${appId} installation state: ${appState}`);
      if (await this.adb.checkApkCert(appPath, appId)) {
        shouldUninstallServerPackages = shouldUninstallServerPackages || [
          this.adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          this.adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
        ].includes(appState);
      } else {
        await this.adb.sign(appPath);
        shouldUninstallServerPackages = shouldUninstallServerPackages || ![
          this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
        ].includes(appState);
      }
      shouldInstallServerPackages = shouldInstallServerPackages || shouldUninstallServerPackages || [
        this.adb.APP_INSTALL_STATE.NOT_INSTALLED,
      ].includes(appState);
    }
    logger.info(`Server packages are ${shouldInstallServerPackages ? '' : 'not '}going to be (re)installed`);
    if (shouldInstallServerPackages && shouldUninstallServerPackages) {
      logger.info('Full packages reinstall is going to be performed');
    }
    for (const {appId, appPath} of packagesInfo) {
      if (shouldUninstallServerPackages) {
        try {
          await this.adb.uninstallApk(appId);
        } catch (err) {
          logger.warn(`Error uninstalling '${appId}': ${err.message}`);
        }
      }
      if (shouldInstallServerPackages) {
        await this.adb.install(appPath, {
          replace: false,
          timeout: installTimeout,
        });
      }
    }
    let retries = getRetries('Server install', installTimeout, SERVER_INSTALL_RETRIES);

    logger.debug(`Waiting up to ${retries * 1000}ms for instrumentation '${INSTRUMENTATION_TARGET}' to be available`);
    let output;
    try {
      await retryInterval(retries, 1000, async () => {
        output = await this.adb.shell(['pm', 'list', 'instrumentation']);
        if (output.indexOf('Could not access the Package Manager') !== -1) {
          let err = new Error(`Problem running package manager: ${output}`);
          output = null; // remove output, so it is not printed below
          throw err;
        } else if (output.indexOf(INSTRUMENTATION_TARGET) === -1) {
          throw new Error('No instrumentation process found. Retrying...');
        }
        logger.debug(`Instrumentation '${INSTRUMENTATION_TARGET}' available`);
      });
    } catch (err) {
      logger.error(`Unable to find instrumentation target '${INSTRUMENTATION_TARGET}': ${err.message}`);
      if (output) {
        logger.debug('Available targets:');
        for (let line of output.split('\n')) {
          logger.debug(`    ${line.replace('instrumentation:', '')}`);
        }
      }
    }
  }

  async startSession (caps) {
    // kill any uiautomator existing processes
    await this.killUiAutomatorOnDevice();

    if (caps.skipServerInstallation) {
      logger.info(`'skipServerInstallation' is set. Attempting to use UIAutomator2 server from the device.`);
    } else {
      logger.info(`Starting UIAutomator2 server ${serverVersion}`);
      logger.info(`Using UIAutomator2 server from '${apkPath}' and test from '${testApkPath}'`);
    }

    // let cmd = ['am', 'instrument', '-w',
    //   'io.appium.uiautomator2.server.test/androidx.test.runner.AndroidJUnitRunner'];
    // this.adb.shell(cmd);
    // using 3rd party module called 'adbKit' for time being as using 'appium-adb'
    // facing IllegalStateException: UiAutomation not connected exception
    // https://github.com/appium/appium-uiautomator2-driver/issues/19

    await this.startSessionUsingAdbKit(caps.deviceUDID);

    let retries = getRetries('Server launch', caps.uiautomator2ServerLaunchTimeout, SERVER_LAUNCH_RETRIES);

    logger.info(`Waiting up to ${retries * 1000}ms for UiAutomator2 to be online...`);
    // wait for UiAutomator2 to be online
    await retryInterval(retries, 1000, this.jwproxy.command.bind(this.jwproxy), '/status', 'GET');
    await this.jwproxy.command('/session', 'POST', {desiredCapabilities: caps});
  }

  async startSessionUsingAdbKit (deviceUDID) { // eslint-disable-line require-await
    let cmd = 'am instrument -w';
    if (this.disableWindowAnimation) {
      cmd = `${cmd} --no-window-animation`;
    }
    cmd = `${cmd} ${INSTRUMENTATION_TARGET}`;
    logger.info(`Running command: 'adb -s ${deviceUDID} shell ${cmd}'`);
    this.client.shell(deviceUDID, cmd)
      .then(adbkit.util.readAll) // eslint-disable-line promise/prefer-await-to-then
      .then(function (output) { // eslint-disable-line promise/prefer-await-to-then
        for (let line of output.toString().split('\n')) {
          if (line.length) {
            logger.debug(`[UIAutomator2] ${line}`);
          }
        }
      }).catch(function (err) { // eslint-disable-line promise/prefer-await-to-callbacks
        logger.error(`[UIAutomator2 Error] ${err.message}`);
        logger.debug(`Full error: ${err.stack}`);
      });
  }

  async deleteSession () {
    logger.debug('Deleting UiAutomator2 server session');
    // rely on jwproxy's intelligence to know what we're talking about and
    // delete the current session
    try {
      await this.jwproxy.command('/', 'DELETE');
    } catch (err) {
      logger.warn(`Did not get confirmation UiAutomator2 deleteSession worked; ` +
          `Error was: ${err}`);
    }
  }

  async killUiAutomatorOnDevice () {
    try {
      const pids = (await this.adb.getPIDsByName('uiautomator')).map((p) => `${p}`);
      if (!_.isEmpty(pids)) {
        const isRoot = await this.adb.root();
        try {
          await this.adb.shell(['kill', '-9', ...pids]);
        } finally {
          if (isRoot) {
            await this.adb.unroot();
          }
        }
      }
    } catch (err) {
      logger.warn(`Unable to stop uiautomator process: ${err.message}`);
    }

    try {
      await this.adb.forceStop('io.appium.uiautomator2.server');
    } catch (ignore) {
      logger.info('Unable to kill the io.appium.uiautomator2.server process, assuming it is already killed');
    }
  }
}

export { UiAutomator2Server, INSTRUMENTATION_TARGET };
export default UiAutomator2Server;
