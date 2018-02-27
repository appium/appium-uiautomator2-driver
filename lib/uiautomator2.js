import { JWProxy } from 'appium-base-driver';
import { retryInterval } from 'asyncbox';
import logger from './logger';
import { SERVER_APK_PATH as apkPath, TEST_APK_PATH as testApkPath, version as serverVersion } from 'appium-uiautomator2-server';
import adbkit from 'adbkit';
import { getRetries } from './utils';
import { util } from 'appium-support';
import B from 'bluebird';


const REQD_PARAMS = ['adb', 'tmpDir', 'host', 'systemPort', 'devicePort', 'disableWindowAnimation'];
const SERVER_LAUNCH_RETRIES = 20;
const SERVER_INSTALL_RETRIES = 20;
const INSTRUMENTATION_TARGET = 'io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner';
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
      }];
    const shouldUninstallServerPackages = await B.reduce(
      packagesInfo,
      async (accumulator, pkgInfo) => (await this.checkAndSignCert(pkgInfo.appPath, pkgInfo.appId)) || accumulator,
      false);
    if (shouldUninstallServerPackages) {
      for (const {appId} of packagesInfo) {
        try {
          await this.adb.uninstallApk(appId);
        } catch (err) {
          logger.warn(`Error uninstalling '${appId}': ${err.message}`);
          logger.debug('Continuing');
        }
      }
    }
    for (const {appPath, appId} of packagesInfo) {
      await this.adb.installOrUpgrade(appPath, appId, {
        timeout: installTimeout,
      });
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

  async checkAndSignCert (apk, apkPackage) {
    let signed = await this.adb.checkApkCert(apk, apkPackage);
    if (!signed) {
      await this.adb.sign(apk);
    }
    return !signed;
  }

  async startSession (caps) {
    // kill any uiautomator existing processes
    await this.killUiAutomatorOnDevice();

    logger.info(`Starting uiautomator2 server ${serverVersion}`);

    logger.info(`Using UIAutomator2 server from '${apkPath}' and test from '${testApkPath}'`);

    // let cmd = ['am', 'instrument', '-w',
    //   'io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner'];
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

  async startSessionUsingAdbKit (deviceUDID) {
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
      await this.adb.forceStop('io.appium.uiautomator2.server');
    } catch (ignore) {
      logger.info("Unable to kill the io.appium.uiautomator2.server process, assuming it is already killed");
    }
  }
}

export default UiAutomator2Server;
