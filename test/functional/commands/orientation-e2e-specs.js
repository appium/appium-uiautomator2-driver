import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - orientation -', function () {
  let driver;

  describe('initial -', function () {
    afterEach(async function () {
      await driver.setOrientation('PORTRAIT');
      await driver.quit();
    });
    it('should have portrait orientation if requested', async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appActivity: '.view.TextFields',
        orientation: 'PORTRAIT',
      }));
      await driver.getOrientation().should.eventually.eql('PORTRAIT');
    });
    it('should have landscape orientation if requested', async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appActivity: '.view.TextFields',
        orientation: 'LANDSCAPE',
      }));
      await driver.getOrientation().should.eventually.eql('LANDSCAPE');
    });
    it('should have portrait orientation if nothing requested', async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appActivity: '.view.TextFields',
      }));
      await driver.getOrientation().should.eventually.eql('PORTRAIT');
    });
  });
  describe('setting -', function () {
    before(async function () {
      driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {
        appActivity: '.view.TextFields'
      }));
    });
    after(async function () {
      await driver.quit();
    });
    it('should rotate screen to landscape', async function () {
      await driver.setOrientation('PORTRAIT');
      await B.delay(3000);
      await driver.setOrientation('LANDSCAPE');
      await B.delay(3000);
      await driver.getOrientation().should.eventually.become('LANDSCAPE');
    });
    it('should rotate screen to landscape', async function () {
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
