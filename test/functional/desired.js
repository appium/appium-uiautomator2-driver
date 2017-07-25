import _ from 'lodash';


const uiautomator2ServerLaunchTimeout = process.env.TRAVIS ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = process.env.TRAVIS ? 30000 : 20000;

const GENERIC_CAPS = {
  deviceName: 'Android',
  platformName: 'Android',
  uiautomator2ServerLaunchTimeout,
  uiautomator2ServerInstallTimeout,
};

const APIDEMOS_CAPS = _.defaults({
  app: require.resolve('android-apidemos'),
  appPackage: 'io.appium.android.apis',
  appActivity: 'io.appium.android.apis.ApiDemos',
}, GENERIC_CAPS);

const GPS_DEMO_CAPS = _.defaults({
  app: require.resolve('gps-demo-app'),
}, GENERIC_CAPS);

const BROWSER_CAPS = _.defaults({
  browserName: 'Browser'
}, GENERIC_CAPS);

export { APIDEMOS_CAPS, GPS_DEMO_CAPS, BROWSER_CAPS };
