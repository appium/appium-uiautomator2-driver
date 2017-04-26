import _ from 'lodash';
import sampleApps from 'sample-apps';


const GENERIC_CAPS = {
  deviceName: 'Android',
  platformName: 'Android',
};

const APIDEMOS_CAPS = _.defaults({
  app: require.resolve('android-apidemos'),
}, GENERIC_CAPS);

const CONTACT_MANAGER_CAPS = _.defaults({
  app: sampleApps('ContactManager'),
}, GENERIC_CAPS);

const GPS_DEMO_CAPS = _.defaults({
  app: require.resolve('gps-demo-app'),
}, GENERIC_CAPS);

const BROWSER_CAPS = _.defaults({
  appPackage: 'com.android.browser',
  appActivity: '.BrowserActivity',
}, GENERIC_CAPS);

export { APIDEMOS_CAPS, CONTACT_MANAGER_CAPS, GPS_DEMO_CAPS, BROWSER_CAPS };
