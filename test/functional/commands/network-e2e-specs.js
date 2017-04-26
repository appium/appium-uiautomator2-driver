import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import { APIDEMOS_CAPS } from '../desired';


chai.should();
chai.use(chaiAsPromised);

describe.skip('wifi', function () {
  let driver;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
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
