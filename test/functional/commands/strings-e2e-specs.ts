import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS, amendCapabilities} from '../desired';
import {initSession, deleteSession} from '../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('strings', function () {
  let driver: Browser;

  describe('specific language', function () {
    before(async function () {
      driver = await initSession(APIDEMOS_CAPS);
    });
    after(async function () {
      await deleteSession();
    });

    it('should return app strings', async function () {
      const strings = await driver.getStrings('en');
      expect(strings.hello_world).to.equal('Hello, World!');
    });

    it('should return app strings for different language', async function () {
      const strings = await driver.getStrings('fr');
      expect(strings.hello_world).to.equal('Bonjour, Monde!');
    });
  });

  describe('device language', function () {
    afterEach(async function () {
      await deleteSession();
    });

    it('should return app strings with default locale/language', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:language': 'en',
        'appium:locale': 'US',
      });
      driver = await initSession(caps);

      const strings = await driver.getStrings();
      expect(strings.hello_world).to.equal('Hello, World!');
    });
  });
});

