import _ from 'lodash';

const uiautomator2ServerLaunchTimeout = (process.env.TRAVIS || process.env.CI) ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = (process.env.TRAVIS || process.env.CI) ? 120000 : 20000;

const ADB_EXEC_TIMEOUT = (process.env.TRAVIS || process.env.CI) ? 60000 : 20000;

function deepFreeze (object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

function amendCapabilities (baseCaps, ...newCaps) {
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
  }
});


const apiDemosApp = require.resolve('android-apidemos');
const gpsDemoApp = require('gps-demo-app');

const APIDEMOS_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': apiDemosApp,
  'appium:appPackage': 'io.appium.android.apis',
  'appium:appActivity': '.ApiDemos',
  'appium:disableWindowAnimation': true,
});

const SCROLL_CAPS = amendCapabilities(GENERIC_CAPS, {
  'appium:app': apiDemosApp,
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

export {
  GENERIC_CAPS, APIDEMOS_CAPS, GPS_DEMO_CAPS, BROWSER_CAPS, SCROLL_CAPS,
  amendCapabilities
};
