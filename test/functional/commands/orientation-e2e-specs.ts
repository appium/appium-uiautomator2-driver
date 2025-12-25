import type {Browser} from 'webdriverio';
import B from 'bluebird';
import {APIDEMOS_CAPS, amendCapabilities} from '../desired';
import {initSession, deleteSession} from '../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('apidemo - orientation -', function () {
  let driver: Browser;

  describe('initial -', function () {
    afterEach(async function () {
      await driver.setOrientation('PORTRAIT');
      await deleteSession();
    });
    it('should have portrait orientation if requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
        'appium:orientation': 'PORTRAIT',
      }));
      await expect(driver.getOrientation()).to.eventually.eql('PORTRAIT');
    });
    it('should have landscape orientation if requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
        'appium:orientation': 'LANDSCAPE',
      }));
      await expect(driver.getOrientation()).to.eventually.eql('LANDSCAPE');
    });
    it('should have portrait orientation if nothing requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
      }));
      await expect(driver.getOrientation()).to.eventually.eql('PORTRAIT');
    });
  });
  describe('setting -', function () {
    before(async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields'
      }));
    });
    after(async function () {
      await deleteSession();
    });
    it('should rotate screen to landscape', async function () {
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.setOrientation('LANDSCAPE');
      await B.delay(3000);
      await expect(driver.getOrientation()).to.eventually.become('LANDSCAPE');
    });
    it('should rotate screen to portrait', async function () {
      await driver.setOrientation('LANDSCAPE');
      await B.delay(3000);
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await expect(driver.getOrientation()).to.eventually.become('PORTRAIT');
    });
    it('should not error when trying to rotate to portrait again', async function () {
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await expect(driver.getOrientation()).to.eventually.become('PORTRAIT');
    });
  });
});

