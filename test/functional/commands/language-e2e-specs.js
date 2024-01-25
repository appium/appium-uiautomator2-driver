import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { initSession, deleteSession } from '../helpers/session';
import { APIDEMOS_CAPS, amendCapabilities } from '../desired';
import { getLocale } from '../helpers/helpers';


chai.should();
chai.use(chaiAsPromised);

// Skip ci since the command restart emulator when the test device's API is 22-.
describe('Localization - locale @skip-ci @skip-real-device', function () {
  let initialLocale;
  /** @type {ADB} */
  let adb;

  before(async function () {
    // restarting doesn't work on Android 7+
    adb = new ADB();
    if (await adb.getApiLevel() <= 23) return this.skip(); //eslint-disable-line curly

    initialLocale = await getLocale(adb);
  });

  let driver;
  after(async function () {
    if (driver) {
      const [language, country] = initialLocale.split('-');
      const isLocaleOk = await adb.ensureCurrentLocale(language, country);
      await deleteSession();
      isLocaleOk.should.be.true;
    }
  });

  it('should start as FR', async function () {
    let frCaps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:language': 'fr',
      'appium:locale': 'FR',
    });
    const driver = await initSession(frCaps);
    await getLocale(driver.adb).should.eventually.equal('fr-FR');
  });
  it('should start as US', async function () {
    let usCaps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:language': 'en',
      'appium:locale': 'US',
    });
    driver = await initSession(usCaps);
    await getLocale(driver.adb).should.eventually.equal('en-US');
  });
});
