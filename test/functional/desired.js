import _ from 'lodash';


const uiautomator2ServerLaunchTimeout = process.env.TRAVIS ? 60000 : 20000;
const uiautomator2ServerInstallTimeout = process.env.TRAVIS ? 120000 : 20000;

const GENERIC_CAPS = {
  deviceName: process.env.DEVICE_NAME || 'Samsung Galaxy S6 GoogleAPI Emulator',
  platformName: 'Android',
  platformVersion: process.env.PLATFORM_VERSION || '7.1',
  uiautomator2ServerLaunchTimeout,
  uiautomator2ServerInstallTimeout,
  automationName: 'uiautomator2',
  appiumUrl: process.env.APPIUM_URL,
  appiumVersion: process.env.APPIUM_URL ? '' : '1.7.2',
};

const useUrl = process.env.SAUCE_LABS; // TODO: include TestObject too
const apiDemos = useUrl ? 'http://appium.github.io/appium/assets/ApiDemos-debug.apk' : require.resolve('android-apidemos');

const APIDEMOS_CAPS = _.defaults({
  app: apiDemos,
  appPackage: 'io.appium.android.apis',
  appActivity: '.ApiDemos',
  disableWindowAnimation: true,
}, GENERIC_CAPS);

const SCROLL_CAPS = _.defaults({
  app: apiDemos,
  appPackage: 'io.appium.android.apis',
  appActivity: '.view.ScrollView2',
}, GENERIC_CAPS);

const GPS_DEMO_CAPS = _.defaults({
  app: require.resolve('gps-demo-app'),
  appPackage: 'de.impressive.artworx.tutorials.gps',
  appActivity: '.GPSTest',
}, GENERIC_CAPS);

const BROWSER_CAPS = _.defaults({
  browserName: 'Chrome',
}, GENERIC_CAPS);

export { GENERIC_CAPS, APIDEMOS_CAPS, GPS_DEMO_CAPS, BROWSER_CAPS, SCROLL_CAPS };
