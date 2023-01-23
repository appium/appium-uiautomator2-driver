import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS, amendCapabilities } from '../desired';
import ADB from 'appium-adb';
import { initSession, deleteSession } from '../helpers/session';
import { getLocale } from '../helpers/helpers';
import { androidHelpers } from 'appium-android-driver';


chai.should();
chai.use(chaiAsPromised);

describe('strings', function () {
  let driver;

  describe('specific language', function () {
    before(async function () {
      driver = await initSession(APIDEMOS_CAPS);
    });
    after(async function () {
      await deleteSession();
    });

    it('should return app strings', async function () {
      let strings = await driver.getStrings('en');
      strings.hello_world.should.equal('Hello, World!');
    });

    it('should return app strings for different language', async function () {
      let strings = await driver.getStrings('fr');
      strings.hello_world.should.equal('Bonjour, Monde!');
    });
  });

  describe('device language', function () {
    let initialLocale;
    let adb;
    before(async function () {
      // restarting doesn't work on Android 7+
      adb = new ADB();
      initialLocale = await getLocale(adb);
    });
    afterEach(async function () {
      if (driver) {
        if (await adb.getApiLevel() > 23) {
          let [language, country] = initialLocale.split('-');
          await androidHelpers.ensureDeviceLocale(adb, language, country);
        } else {
          // This method is flakey in CI
          if (!process.env.CI) {
            await androidHelpers.ensureDeviceLocale(adb, null, initialLocale);
          }
        }

        await deleteSession();
      }
    });

    it('should return app strings with default locale/language', async function () {
      driver = await initSession(APIDEMOS_CAPS);

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('Hello, World!');
    });
    it('should return app strings when language/locale set @skip-ci', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:language': 'fr',
        'appium:locale': 'CA',
      });
      const driver = await initSession(caps);

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('Bonjour, Monde!');
    });
  });
});
