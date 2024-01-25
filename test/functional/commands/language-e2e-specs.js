import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { initSession, deleteSession } from '../helpers/session';
import { APIDEMOS_CAPS, amendCapabilities } from '../desired';
import { getLocale } from '../helpers/helpers';


chai.should();
chai.use(chaiAsPromised);

describe('Localization - locale @skip-ci @skip-real-device', function () {
  /** @type {ADB} */
  let adb;
  /** @type {import('../../../lib/driver').AndroidUiautomator2Driver} */
  let driver;

  beforeEach(async function () {
    adb = new ADB();
    if (await adb.getApiLevel() <= 23) {
      return this.skip();
    }
  });

  afterEach(async function () {
    if (driver) {
      await deleteSession();
      driver = null;
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
});
