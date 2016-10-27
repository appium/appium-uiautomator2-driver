import path from 'path';
import { fs } from 'appium-support';
import request from 'request-promise';
import log from './logger';
import crypto from 'crypto';

/**
 * UI2_VER, SERVER_DOWNLOAD_SHA512, SERVER_TEST_DOWNLOAD_SHA512 should be updated for every appium-uiautomator2-server release.
 */
const UI2_VER = "v0.0.4";
const SERVER_DOWNLOAD_SHA512 = "1160426f94e3be2342ab6e3c3f20c69197bd334d292b658fda5b24e8f3feb88ddd5f157372e2c4a1861b02ec93e9555c80c0a6a68c53c60fb53d2f0db596d929";
const SERVER_TEST_DOWNLOAD_SHA512 = "d5a55a0f30f6a8a4ace7da670b4704db5459a99545d45a3a8219b021e36c685490201b4c5e3d5c27c7eaf4b4ea9525904e4ef84db66e5175e07b31e8ce421eb0";


const UI2_SERVER_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/appium-uiautomator2-server-${UI2_VER}.apk`;
const UI2_SERVER_TEST_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/appium-uiautomator2-server-debug-androidTest.apk`;
const UI2_DIR = path.resolve(__dirname, "..", "..", "uiautomator2");
const UI2_SERVER_APK_PATH = path.resolve(UI2_DIR, `appium-uiautomator2-server-${UI2_VER}.apk`);
const UI2_TEST_APK_PATH = path.resolve(UI2_DIR, `appium-uiautomator2-server-debug-androidTest.apk`);



async function setupUiAutomator2 () {
  if (await fileExist(UI2_SERVER_APK_PATH, SERVER_DOWNLOAD_SHA512) && await fileExist(UI2_TEST_APK_PATH, SERVER_TEST_DOWNLOAD_SHA512)) {
    log.info("UiAutomator2 apk exists and has correct hash, skipping download");
    return;
  } else {
    await downloadUiAutomator2ServerApk();
  }

  if (!(await serverExists())) {
    throw new Error("Something went wrong in setting up UiAutomator2");
  }
}

async function fileExist (fileName, SHA512) {
  if (await fs.exists(fileName)) {
    var buffer = require("fs").readFileSync(fileName);
    let fingerprint =  await sha512(buffer);
    if ( fingerprint === SHA512 ) {
      return true;
    } else {
      return false;
    }
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
    log.errorAndThrow("bad Server SHA512 fingerprint: " + serverFingerprint );
    log.error("Stopping the installation" );
    return;
  }
  if ( serverTestFingerprint !== SERVER_TEST_DOWNLOAD_SHA512 ){
    log.errorAndThrow("bad Server test SHA512 fingerprint: " + serverTestFingerprint );
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
