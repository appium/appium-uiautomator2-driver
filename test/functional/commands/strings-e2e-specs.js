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
      await driver.deleteSession();
    });

    it('should return app strings', async function () {
      let strings = await driver.getStrings('en');
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });

    it('should return app strings for different language', async function () {
      let strings = await driver.getStrings('fr');
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });

  describe('device language', function () {
    let initialLocale;
    before(async function () {
      // restarting doesn't work on Android 7+
      let adb = new ADB();
      if (await adb.getApiLevel() > 23) return this.skip(); //eslint-disable-line curly

      initialLocale = await getLocale(adb);
    });
    afterEach(async function () {
      if (driver) {
        await androidHelpers.ensureDeviceLocale(driver.adb, null, initialLocale);

        await driver.deleteSession();
      }
    });

    it('should return app strings with default locale/language', async function () {
      driver = await initDriver(APIDEMOS_CAPS);

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('<b>Hello, <i>World!</i></b>');
    });
    it('should return app strings when language/locale set @skip-ci', async function () {
      driver = await initDriver(_.defaults({
        language: 'fr',
        locale: 'CA',
      }, APIDEMOS_CAPS));

      let strings = await driver.getStrings();
      strings.hello_world.should.equal('<b>Bonjour, <i>Monde!</i></b>');
    });
  });
});
