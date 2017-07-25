import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - orientation', function () {
  let driver;
  before(async () => {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should rotate screen to landscape', async () => {
    await driver.setOrientation('PORTRAIT');
    await B.delay(3000);
    await driver.setOrientation('LANDSCAPE');
    await B.delay(3000);
    await driver.getOrientation().should.eventually.become('LANDSCAPE');
  });
  it('should rotate screen to landscape', async () => {
    await driver.setOrientation('LANDSCAPE');
    await B.delay(3000);
    await driver.setOrientation('PORTRAIT');
    await B.delay(3000);
    await driver.getOrientation().should.eventually.become('PORTRAIT');
  });
  it('should not error when trying to rotate to portrait again', async () => {
    await driver.setOrientation('PORTRAIT');
    await B.delay(3000);
    await driver.setOrientation('PORTRAIT');
    await B.delay(3000);
    await driver.getOrientation().should.eventually.become('PORTRAIT');
  });
});
