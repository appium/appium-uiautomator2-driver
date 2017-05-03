import { exec } from 'teen_process';
import { JWProxy } from 'appium-base-driver';
import { retryInterval } from 'asyncbox';
import logger from './logger';
import { UI2_SERVER_APK_PATH as apkPath, UI2_TEST_APK_PATH as testApkPath, UI2_VER} from './installer';
import Promise from 'bluebird';
import _ from 'lodash';


const REQD_PARAMS = ['adb', 'tmpDir', 'host', 'systemPort', 'devicePort'];
const SERVER_LAUNCH_RETRIES = 20;

var adbkit = require('adbkit');
var client = adbkit.createClient();

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
  }

  async installServerApk () {
    // Installs the apks on to the device or emulator
    let apkPackage = await this.getPackageName(apkPath);
    // appending .test to apkPackage name to get test apk package name
    let testApkPackage = apkPackage + '.test';
    let isApkInstalled = await this.adb.isAppInstalled(apkPackage);
    let isTestApkInstalled = await this.adb.isAppInstalled(testApkPackage);
    if (isApkInstalled || isTestApkInstalled) {
      //check server apk versionName
      let apkVersion = await this.getAPKVersion(apkPath);
      let pkgVersion = await this.getInstalledPackageVersion(apkPackage);
      if (apkVersion !== pkgVersion) {
        isApkInstalled = false;
        isTestApkInstalled = false;
        await this.adb.uninstallApk(apkPackage);
        await this.adb.uninstallApk(testApkPackage);
      }
    }
    if (!isApkInstalled) {
      await this.signAndInstall(apkPath, apkPackage);
    }
    if (!isTestApkInstalled) {
      await this.signAndInstall(testApkPath, testApkPackage);
    }
  }

  async signAndInstall (apk, apkPackage) {
    await this.checkAndSignCert(apk, apkPackage);
    await this.adb.install(apk);
    logger.info("Installed UiAutomator2 server apk");
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
    let cmd = ['am', 'instrument', '-w',
      'io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner'];

    // killing any uiautomator existing processes
    await this.killUiAutomatorOnDevice();

    logger.info(`Starting uiautomator2 server ${UI2_VER} with cmd: ` +
        `${cmd}`);
    //this.adb.shell(cmd);
    //using 3rd party module called 'adbKit' for time being as using 'appium-adb'
    //facing IllegalStateException: UiAutomation not connected exception
    //https://github.com/appium/appium-uiautomator2-driver/issues/19

    if (caps.deviceUDID) {
      this.startSessionOnSpecificDeviceUsingAdbKit(caps.deviceUDID);
    } else {
      this.startSessionUsingAdbkit();
    }

    let retries = SERVER_LAUNCH_RETRIES;
    if (caps.uiautomator2ServerLaunchTimeout) {
      retries = Math.round(caps.uiautomator2ServerLaunchTimeout / 1000);
      if (_.isNaN(retries)) {
        logger.warn(`Server launch timeout of ${caps.uiautomator2ServerLaunchTimeout}ms ` +
                 `specified, but unable to parse interval. Using default.`);
        retries = SERVER_LAUNCH_RETRIES;
      }
    }

    logger.info(`Waiting up to ${retries * 1000}ms for UiAutomator2 to be online...`);
    // wait 20s for UiAutomator2 to be online
    await retryInterval(retries, 1000, this.jwproxy.command.bind(this.jwproxy), '/status', 'GET');
    await this.jwproxy.command('/session', 'POST', {desiredCapabilities: caps});
  }

  async startSessionOnSpecificDeviceUsingAdbKit (deviceUDID) {
    Promise.try(function (){
      logger.info(`running command...\n adb -s ${deviceUDID} shell am instrument -w io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner... `);
      client.shell(deviceUDID, "am instrument -w io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner");
    })
      .catch(function (err) {
        logger.error('Something went wrong while executing instrument test:', err.stack);
      });
  }

  async startSessionUsingAdbkit () {
    client.listDevices()
        .then(function (devices) {
          Promise.map(devices, function (device) {
            logger.info("running command...\n adb shell am instrument -w io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner... ");
            client.shell(device.id, "am instrument -w io.appium.uiautomator2.server.test/android.support.test.runner.AndroidJUnitRunner");
          });
        })
        .catch(function (err) {
          logger.error('Something went wrong while executing instrument test:', err.stack);
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
