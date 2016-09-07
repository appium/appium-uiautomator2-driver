import path from 'path';
import { fs } from 'appium-support';
import request from 'request-promise';
import log from './logger';

const UI2_VER = "vBeta0.0.1";
const UI2_SERVER_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/app-server-debug-unaligned.apk`;
const UI2_SERVER_TEST_DOWNLOAD = `https://github.com/appium/appium-uiautomator2-server/releases/download` +
    `/${UI2_VER}/app-server-debug-androidTest-unaligned.apk`;
const UI2_DIR = path.resolve(__dirname, "..", "..", "uiautomator2");
const UI2_SERVER_APK_PATH = path.resolve(UI2_DIR, "appium-uiautomator2-server.apk");
const UI2_TEST_APK_PATH = path.resolve(UI2_DIR, "appium-uiautomator2-server-test.apk");

const SERVER_DOWNLOAD_MD5 = "83e9d7b9944ef122e58f1d74d15ee061";
const SERVER_TEST_DOWNLOAD_MD5 = "078869c7ee7f5828f3f7189f51940c49";


async function setupUiAutomator2 () {
  if (await fs.exists(UI2_SERVER_APK_PATH) &&
      await fs.md5(UI2_SERVER_APK_PATH) === SERVER_DOWNLOAD_MD5) {
    log.info("UiAutomator2 apk exists and has correct hash, skipping download");
  } else {
    await downloadUiAutomator2ServerApk();
  }

  if (!(await serverExists())) {
    throw new Error("Something went wrong in setting up UiAutomator2");
  }
}

async function downloadUiAutomator2ServerApk () {

  await fs.mkdir(UI2_DIR);
  log.info("downloading UiAutomator2 Server APKs ");
  let serverApk = await request.get({url: UI2_SERVER_DOWNLOAD, encoding: 'binary'});
  let serverTestApk = await request.get({url: UI2_SERVER_TEST_DOWNLOAD, encoding: 'binary'});

  await fs.writeFile(UI2_SERVER_APK_PATH, serverApk, {encoding: 'binary'});
  await fs.writeFile(UI2_TEST_APK_PATH, serverTestApk, {encoding: 'binary'});

  await fs.chmod(UI2_SERVER_APK_PATH, 0o0644);
  await fs.chmod(UI2_TEST_APK_PATH, 0o0644);

  if (await fs.md5(UI2_SERVER_APK_PATH) === SERVER_DOWNLOAD_MD5 &&
      await fs.md5(UI2_TEST_APK_PATH) === SERVER_TEST_DOWNLOAD_MD5) {
    log.info("UiAutomator2 Server APKs downloaded");
  } else {
    log.warn("UiAutomator2 Server APKs downloaded, but MD5 hash did not " +
        "match, please be careful");
    log.warn("fs.md5(UI2_SERVER_APK_PATH):"+ await fs.md5(UI2_SERVER_APK_PATH));
    log.warn("fs.md5(UI2_TEST_APK_PATH):"+ await fs.md5(UI2_TEST_APK_PATH));
  }
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

export { setupUiAutomator2, UI2_SERVER_APK_PATH , UI2_TEST_APK_PATH };
