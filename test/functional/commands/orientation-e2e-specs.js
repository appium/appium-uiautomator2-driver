import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import sampleApps from 'sample-apps';
import B from 'bluebird';

chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  appActivity: '.view.TextFields'
};

describe('apidemo - orientation', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(caps);
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
