import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { initDriver } from '../helpers/session';
import { APIDEMOS_CAPS } from '../desired';
import { androidHelpers } from 'appium-android-driver';
import { getLocale } from '../helpers/helpers';


chai.should();
chai.use(chaiAsPromised);

// Skip ci since the command restart emulator when the test device's API is 22-.
describe('Localization - locale @skip-ci @skip-real-device', function () {
  let initialLocale;
  let adb;

  before(async function () {
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }

    // restarting doesn't work on Android 7+
    let adb = new ADB();
    if (await adb.getApiLevel() > 23) return this.skip(); //eslint-disable-line curly

    initialLocale = await getLocale(adb);
  });

  let driver;
  after(async function () {
    if (driver) {
      if (await adb.getApiLevel() > 23) {
        let [language, country] = initialLocale.split("-");
        await androidHelpers.ensureDeviceLocale(driver.adb, language, country);
      } else {
        await androidHelpers.ensureDeviceLocale(driver.adb, null, initialLocale);
      }
      await driver.quit();
    }
  });

  it('should start as FR', async function () {
    let frCaps = Object.assign({}, APIDEMOS_CAPS, {
      language: 'fr',
      locale: 'FR',
    });
    driver = await initDriver(frCaps);
    await getLocale(driver.adb).should.eventually.equal('fr-FR');
  });
  it('should start as US', async function () {
    let usCaps = Object.assign({}, APIDEMOS_CAPS, {
      language: 'en',
      locale: 'US',
    });
    driver = await initDriver(usCaps);
    await getLocale(driver.adb).should.eventually.equal('en-US');
  });
});
