import B from 'bluebird';
import { APIDEMOS_CAPS, amendCapabilities } from '../desired';
import { initSession, deleteSession } from '../helpers/session';


describe('apidemo - orientation -', function () {
  let driver;
  let chai;

  describe('initial -', function () {
    before(async function () {
      chai = await import('chai');
      const chaiAsPromised = await import('chai-as-promised');

      chai.should();
      chai.use(chaiAsPromised.default);
    });

    afterEach(async function () {
      await driver.setOrientation('PORTRAIT');
      await deleteSession();
    });
    it('should have portrait orientation if requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
        'appium:orientation': 'PORTRAIT',
      }));
      await driver.getOrientation().should.eventually.eql('PORTRAIT');
    });
    it('should have landscape orientation if requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
        'appium:orientation': 'LANDSCAPE',
      }));
      await driver.getOrientation().should.eventually.eql('LANDSCAPE');
    });
    it('should have portrait orientation if nothing requested', async function () {
      driver = await initSession(amendCapabilities(APIDEMOS_CAPS, {
        'appium:appActivity': '.view.TextFields',
      }));
      await driver.getOrientation().should.eventually.eql('PORTRAIT');
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
      await driver.getOrientation().should.eventually.become('LANDSCAPE');
    });
    it('should rotate screen to portrait', async function () {
      await driver.setOrientation('LANDSCAPE');
      await B.delay(3000);
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.getOrientation().should.eventually.become('PORTRAIT');
    });
    it('should not error when trying to rotate to portrait again', async function () {
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.getOrientation().should.eventually.become('PORTRAIT');
    });
  });
});
