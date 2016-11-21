import path from 'path';
import { fs } from 'appium-support';
import request from 'request-promise';
import log from './logger';
import crypto from 'crypto';

/**
 * UI2_VER, SERVER_DOWNLOAD_SHA512, SERVER_TEST_DOWNLOAD_SHA512 should be updated for every appium-uiautomator2-server release.
 */
const UI2_VER = "v0.0.6";
const SERVER_DOWNLOAD_SHA512 = "9a80abc2c1bbcfbe5e30d2bd4bf4fbae9f212fe988b697402c80c41739c942a38c9b64c19366480b8dbb00d9533624301f27414f32e97ee9b4cf1a43ccbce105";
const SERVER_TEST_DOWNLOAD_SHA512 = "570a3bca38216c44419fec6765ea1ff1da9a024076702309ad9aaa8662cf0d12e0f6bafffc770000ef8f817d84658fca5ca2016f9b947eed8233e88a4748eb8f";


const UI2_SERVER_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/appium-uiautomator2-server-${UI2_VER}.apk`;
const UI2_SERVER_TEST_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/appium-uiautomator2-server-debug-androidTest.apk`;
const UI2_DIR = path.resolve(__dirname, "..", "..", "uiautomator2");
const UI2_SERVER_APK_PATH = path.resolve(UI2_DIR, `appium-uiautomator2-server-${UI2_VER}.apk`);
const UI2_TEST_APK_PATH = path.resolve(UI2_DIR, `appium-uiautomator2-server-debug-androidTest.apk`);



async function setupUiAutomator2 () {
  if (await hashCheck(UI2_SERVER_APK_PATH, SERVER_DOWNLOAD_SHA512) && await hashCheck(UI2_TEST_APK_PATH, SERVER_TEST_DOWNLOAD_SHA512)) {
    log.info("UiAutomator2 apk exists and has correct hash, skipping download");
    return;
  } else {
    await downloadUiAutomator2ServerApk();
  }

  if (!(await serverExists())) {
    throw new Error("Something went wrong in setting up UiAutomator2");
  }
}

async function hashCheck (fileName, SHA512) {
  if (await fs.exists(fileName)) {
    var buffer = require("fs").readFileSync(fileName);
    let fingerprint =  await sha512(buffer);
    return fingerprint === SHA512;
  } else {
    return false;
  }
}

async function downloadUiAutomator2ServerApk () {

  await fs.mkdir(UI2_DIR);
  log.info(`downloading UiAutomator2 Server APK ${UI2_VER} : ${UI2_SERVER_DOWNLOAD}`);
  log.info(`downloading UiAutomator2 Server test APK ${UI2_VER} : ${UI2_SERVER_TEST_DOWNLOAD}`);
  let serverApk = await request.get({url: UI2_SERVER_DOWNLOAD, encoding: null});
  let serverTestApk = await request.get({url: UI2_SERVER_TEST_DOWNLOAD, encoding: null});
  if (!serverApk instanceof Buffer ) {
    throw new Error(Object.prototype.toString.call(serverApk));
  }
  if (!serverTestApk instanceof Buffer ) {
    throw new Error(Object.prototype.toString.call(serverTestApk));
  }
  let serverFingerprint = await sha512(serverApk);
  let serverTestFingerprint = await sha512(serverTestApk);

  if ( serverFingerprint !== SERVER_DOWNLOAD_SHA512 ) {
    log.errorAndThrow(`bad Server SHA512 fingerprint: ${serverFingerprint}`);
    log.error("Stopping the installation" );
    return;
  }
  if ( serverTestFingerprint !== SERVER_TEST_DOWNLOAD_SHA512 ){
    log.errorAndThrow(`bad Server test SHA512 fingerprint: ${serverTestFingerprint}`);
    log.error("Stopping the installation");
    return;
  }
  await fs.writeFile(UI2_SERVER_APK_PATH, serverApk, {encoding: 'binary'});
  await fs.writeFile(UI2_TEST_APK_PATH, serverTestApk, {encoding: 'binary'});

  await fs.chmod(UI2_SERVER_APK_PATH, 0o0644);
  await fs.chmod(UI2_TEST_APK_PATH, 0o0644);

  log.info("UiAutomator2 Server APKs downloaded");
}

async function sha512 (buffer) {
  const hash = crypto.createHash('sha512');
  return hash.update(buffer).digest('hex');
}

async function serverExists () {
  try {
    return (await fs.exists(UI2_SERVER_APK_PATH) &&
    await fs.exists(UI2_TEST_APK_PATH));
  } catch (e) {
    if (e.code.indexOf("ENOENT") !== -1) {
      return false;
    }
    throw e;
  }
}

export { setupUiAutomator2, serverExists, UI2_SERVER_APK_PATH, UI2_TEST_APK_PATH, UI2_VER };
