import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import ADB from 'appium-adb';
import { initDriver } from '../helpers/session';
import { getLocale } from '../helpers/helpers';
import _ from 'lodash';
import { androidHelpers } from 'appium-android-driver';


chai.should();
chai.use(chaiAsPromised);

describe('strings', function () {
  let driver;

  describe('specific language', function () {
    before(async () => {
      driver = await initDriver(APIDEMOS_CAPS);
    });
    after(async function () {
      await driver.quit();
    });

    it('should return app strings', async function () {
      let strings = await driver.getAppStrings('en');
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });

    it('should return app strings for different language', async function () {
      let strings = await driver.getAppStrings('fr');
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });

  describe('device language', function () {
    let initialLocale;
    let adb;
    before(async function () {
      adb = new ADB();
      initialLocale = await getLocale(adb);
    });
    afterEach(async function () {
      if (driver) {
        if (await adb.getApiLevel() > 23) {
          let [language, country] = initialLocale.split("-");
          await androidHelpers.ensureDeviceLocale(adb, language, country);
        } else {
          await androidHelpers.ensureDeviceLocale(adb, null, initialLocale);
        }

        await driver.quit();
      }
    });

    it('should return app strings with default locale/language', async function () {
      driver = await initDriver(APIDEMOS_CAPS);

      let strings = await driver.getAppStrings();
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });
    it('should return app strings when language/locale set @skip-ci', async function () {
      driver = await initDriver(_.defaults({
        language: 'fr',
        locale: 'CA',
      }, APIDEMOS_CAPS));

      let strings = await driver.getAppStrings();
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });
});
