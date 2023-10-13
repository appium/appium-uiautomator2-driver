import _ from 'lodash';
import path from 'path';
import {API_DEMOS_APK_PATH} from 'android-apidemos';

const uiautomator2ServerLaunchTimeout = process.env.CI ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = process.env.CI ? 120000 : 20000;

const ADB_EXEC_TIMEOUT = process.env.CI ? 60000 : 20000;

function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

function amendCapabilities(baseCaps, ...newCaps) {
  return deepFreeze({
    alwaysMatch: _.cloneDeep(Object.assign({}, baseCaps.alwaysMatch, ...newCaps)),
    firstMatch: [{}],
  });
}

const GENERIC_CAPS = deepFreeze({
  firstMatch: [{}],
  alwaysMatch: {
    'appium:deviceName': 'Android',
    platformName: 'Android',
    'appium:uiautomator2ServerLaunchTimeout': uiautomator2ServerLaunchTimeout,
    'appium:uiautomator2ServerInstallTimeout': uiautomator2ServerInstallTimeout,
    'appium:automationName': 'uiautomator2',
    'appium:adbExecTimeout': ADB_EXEC_TIMEOUT,
    'appium:ignoreHiddenApiPolicyError': true,
  },
});

// http://www.impressive-artworx.de/tutorials/android/gps_tutorial_1.zip
const gpsDemoApp = path.resolve(__dirname, 'assets', 'gpsDemo-debug.apk');

const APIDEMOS_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': API_DEMOS_APK_PATH,
  'appium:appPackage': 'io.appium.android.apis',
  'appium:appActivity': '.ApiDemos',
  'appium:disableWindowAnimation': true,
});

const SCROLL_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': API_DEMOS_APK_PATH,
  'appium:appPackage': 'io.appium.android.apis',
  'appium:appActivity': '.view.ScrollView2',
});

const GPS_DEMO_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': gpsDemoApp,
  'appium:appPackage': 'de.impressive.artworx.tutorials.gps',
  'appium:appActivity': '.GPSTest',
});

const BROWSER_CAPS = amendCapabilities(GENERIC_CAPS, {
  browserName: 'Chrome',
});

const SETTINGS_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:appPackage': 'com.android.settings',
  'appium:appActivity': '.Settings',
});

export {
  GENERIC_CAPS,
  APIDEMOS_CAPS,
  GPS_DEMO_CAPS,
  BROWSER_CAPS,
  SCROLL_CAPS,
  SETTINGS_CAPS,
  amendCapabilities,
};
