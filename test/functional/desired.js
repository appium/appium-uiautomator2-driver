import _ from 'lodash';
import '../env';


const uiautomator2ServerLaunchTimeout = (process.env.TRAVIS || process.env.CI) ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = (process.env.TRAVIS || process.env.CI) ? 120000 : 20000;

const ADB_EXEC_TIMEOUT = (process.env.TRAVIS || process.env.CI) ? 60000 : 20000;

const GENERIC_CAPS = {
  deviceName: 'Android',
  platformName: 'Android',
  uiautomator2ServerLaunchTimeout,
  uiautomator2ServerInstallTimeout,
  automationName: 'uiautomator2',
  adbExecTimeout: ADB_EXEC_TIMEOUT,
};

if (process.env.CLOUD) {
  GENERIC_CAPS.platformVersion = process.env.CLOUD_PLATFORM_VERSION;
  GENERIC_CAPS.deviceName = process.env.CLOUD_DEVICE_NAME;
  GENERIC_CAPS.build = process.env.SAUCE_BUILD;
  GENERIC_CAPS[process.env.APPIUM_BUNDLE_CAP] = {'appium-url': 'sauce-storage:appium.zip'};
}



const apiDemosApp = process.env.CLOUD
  ? 'http://appium.github.io/appium/assets/ApiDemos-debug.apk'
  : require.resolve('android-apidemos');
const gpsDemoApp = process.env.CLOUD
  ? 'http://appium.github.io/appium/assets/gpsDemo-debug.apk'
  : require('gps-demo-app');

const APIDEMOS_CAPS = _.defaults({
  app: apiDemosApp,
  appPackage: 'io.appium.android.apis',
  appActivity: '.ApiDemos',
  disableWindowAnimation: true,
}, GENERIC_CAPS);

const SCROLL_CAPS = _.defaults({
  app: apiDemosApp,
  appPackage: 'io.appium.android.apis',
  appActivity: '.view.ScrollView2',
}, GENERIC_CAPS);

const GPS_DEMO_CAPS = _.defaults({
  app: gpsDemoApp,
  appPackage: 'de.impressive.artworx.tutorials.gps',
  appActivity: '.GPSTest',
}, GENERIC_CAPS);

const BROWSER_CAPS = _.defaults({
  browserName: 'Chrome',
}, GENERIC_CAPS);

export { GENERIC_CAPS, APIDEMOS_CAPS, GPS_DEMO_CAPS, BROWSER_CAPS, SCROLL_CAPS };
