import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { initDriver } from '../helpers/session';
import { APIDEMOS_CAPS } from '../desired';
import { androidHelpers } from 'appium-android-driver';
import { getLocale } from '../helpers/helpers';


chai.should();
chai.use(chaiAsPromised);

describe('Localization - locale @skip-ci @skip-real-device', function () {
  let initialLocale;
  let adb;

  before(async function () {
    adb = new ADB();
    initialLocale = await getLocale(adb);
  });

  let driver;
  after(async function () {
    if (driver) {
      if (await adb.getApiLevel() > 23) {
        let split_locale = initialLocale.split("-");
        await androidHelpers.ensureDeviceLocale(driver.adb, split_locale[0], split_locale[1]);
      } else {
        await androidHelpers.ensureDeviceLocale(driver.adb, null, initialLocale);
      }
      await driver.quit();
    }
  });

  it('should start as FR', async () => {
    let frCaps = Object.assign({}, APIDEMOS_CAPS, {
      language: 'fr',
      locale: 'FR',
    });
    driver = await initDriver(frCaps);
    await getLocale(driver.adb).should.eventually.equal('fr-FR');
  });
  it('should start as US', async () => {
    let usCaps = Object.assign({}, APIDEMOS_CAPS, {
      language: 'en',
      locale: 'US',
    });
    driver = await initDriver(usCaps);
    await getLocale(driver.adb).should.eventually.equal('en-US');
  });
});
