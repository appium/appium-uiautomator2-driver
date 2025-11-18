import _ from 'lodash';

const uiautomator2ServerLaunchTimeout = process.env.CI ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = process.env.CI ? 120000 : 20000;

const ADB_EXEC_TIMEOUT = process.env.CI ? 60000 : 20000;

// ApiDemos APK URL from GitHub releases
const API_DEMOS_APK_URL = 'https://github.com/appium/android-apidemos/releases/download/v6.0.2/ApiDemos-debug.apk';

// ApiDemos package and activity constants
export const APIDEMOS_PACKAGE = 'io.appium.android.apis';
export const APIDEMOS_MAIN_ACTIVITY = '.ApiDemos';
export const APIDEMOS_SCROLL_ACTIVITY = '.view.ScrollView2';

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

export function amendCapabilities(baseCaps, ...newCaps) {
  return deepFreeze({
    alwaysMatch: _.cloneDeep(Object.assign({}, baseCaps.alwaysMatch, ...newCaps)),
    firstMatch: [{}],
  });
}

export const GENERIC_CAPS = deepFreeze({
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

export const APIDEMOS_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': API_DEMOS_APK_URL,
  'appium:appPackage': APIDEMOS_PACKAGE,
  'appium:appActivity': APIDEMOS_MAIN_ACTIVITY,
  'appium:disableWindowAnimation': true,
});

export const SCROLL_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': API_DEMOS_APK_URL,
  'appium:appPackage': APIDEMOS_PACKAGE,
  'appium:appActivity': APIDEMOS_SCROLL_ACTIVITY,
});

export const BROWSER_CAPS = amendCapabilities(GENERIC_CAPS, {
  browserName: 'Chrome',
});

export const SETTINGS_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:appPackage': 'com.android.settings',
  'appium:appActivity': '.Settings',
});
