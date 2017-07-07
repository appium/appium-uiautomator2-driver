import { exec } from 'teen_process';
import { JWProxy } from 'appium-base-driver';
import { retryInterval } from 'asyncbox';
import logger from './logger';
import { UI2_SERVER_APK_PATH as apkPath, UI2_TEST_APK_PATH as testApkPath, UI2_VER} from './installer';
import adbkit from 'adbkit';
import { getRetries } from './utils';


const REQD_PARAMS = ['adb', 'tmpDir', 'host', 'systemPort', 'devicePort'];
const SERVER_LAUNCH_RETRIES = 20;
const SERVER_INSTALL_RETRIES = 20;
const INSTRUMENTATION_TARGET = 'io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner';

class UiAutomator2Server {
  constructor (opts = {}) {
    for (let req of REQD_PARAMS) {
      if (!opts || !opts[req]) {
        throw new Error(`Option '${req}' is required!`);
      }
      this[req] = opts[req];
    }
    this.jwproxy = new JWProxy({host: this.host, port: this.systemPort});
    this.proxyReqRes = this.jwproxy.proxyReqRes.bind(this.jwproxy);

    this.client = adbkit.createClient({
      port: this.adb.adbPort,
    });
  }

  async installServerApk (installRetries) {
    // Installs the apks on to the device or emulator
    let apkPackage = await this.getPackageName(apkPath);
    // appending .test to apkPackage name to get test apk package name
    let testApkPackage = `${apkPackage}.test`;
    let isApkInstalled = await this.adb.isAppInstalled(apkPackage);
    let isTestApkInstalled = await this.adb.isAppInstalled(testApkPackage);
    if (isApkInstalled || isTestApkInstalled) {
      //check server apk versionName
      let apkVersion = await this.getAPKVersion(apkPath);
      let pkgVersion = await this.getInstalledPackageVersion(apkPackage);
      if (apkVersion !== pkgVersion) {
        logger.debug(`Server installed but version ${pkgVersion} instead of ${apkVersion}. Re-installing`);
        isApkInstalled = isTestApkInstalled = false;
        await this.uninstallServerAndTest(apkPackage, testApkPackage);
      }
    }

    if (!isApkInstalled) {
      await this.signAndInstall(apkPath, apkPackage);
    }
    if (!isTestApkInstalled) {
      await this.signAndInstall(testApkPath, testApkPackage, true);
    }

    let retries = getRetries('Server install', installRetries, SERVER_INSTALL_RETRIES);

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

  async uninstallServerAndTest (apkPackage, testApkPackage) {
    try {
      await this.adb.uninstallApk(apkPackage);
    } catch (err) {
      logger.warn(`Error uninstalling '${apkPackage}': ${err.message}`);
      logger.debug('Continuing');
    }
    try {
      await this.adb.uninstallApk(testApkPackage);
    } catch (err) {
      logger.warn(`Error uninstalling '${testApkPackage}': ${err.message}`);
      logger.debug('Continuing');
    }
  }

  async signAndInstall (apk, apkPackage, test = false) {
    await this.checkAndSignCert(apk, apkPackage);
    await this.adb.install(apk);
    logger.info(`Installed UiAutomator2 server${test ? ' test' : ''} apk`);
  }

  async getPackageName (apk) {
    let args = ['dump', 'badging', apk];
    await this.adb.initAapt();
    let {stdout} = await exec(this.adb.binaries.aapt, args);
    let apkPackage = new RegExp(/package: name='([^']+)'/g).exec(stdout);
    if (apkPackage && apkPackage.length >= 2) {
      apkPackage = apkPackage[1];
    } else {
      apkPackage = null;
    }
    return apkPackage;
  }

  async getAPKVersion (apk) {
    let args = ['dump', 'badging', apk];
    await this.adb.initAapt();
    let {stdout} = await exec(this.adb.binaries.aapt, args);
    let apkVersion = new RegExp(/versionName='([^']+)'/g).exec(stdout);
    if (apkVersion && apkVersion.length >= 2) {
      apkVersion = apkVersion[1];
    } else {
      apkVersion = null;
    }
    return apkVersion.toString();
  }

  async getInstalledPackageVersion (pkg) {
    let stdout =  await this.adb.shell(['dumpsys', 'package', pkg]);
    let pkgVersion = new RegExp(/versionName=([^\s\s]+)/g).exec(stdout);
    if (pkgVersion && pkgVersion.length >= 2) {
      pkgVersion = pkgVersion[1];
    } else {
      pkgVersion = null;
    }
    return pkgVersion.toString();
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

    logger.info(`Starting uiautomator2 server ${UI2_VER}`);

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
    logger.info(`Running command: 'adb -s ${deviceUDID} shell am instrument -w ${INSTRUMENTATION_TARGET}'`);
    this.client.shell(deviceUDID, `am instrument -w ${INSTRUMENTATION_TARGET}`)
      .then(adbkit.util.readAll)
      .then(function (output) {
        for (let line of output.toString().split('\n')) {
          if (line.length) {
            logger.debug(`[UIAutomator2] ${line}`);
          }
        }
      }).catch(function (err) {
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
