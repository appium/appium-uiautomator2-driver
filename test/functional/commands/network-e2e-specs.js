import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sampleApps from 'sample-apps';
import AndroidUiautomator2Driver from '../../..';

chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  appActivity: '.view.TextFields'
};

describe.skip('wifi', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(caps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should enable WIFI @skip-ci', async () => {
    let WIFI = 2;
    await driver.setNetworkConnection(WIFI);
    await driver.isWifiOn().should.eventually.equal(true);
  });
});
