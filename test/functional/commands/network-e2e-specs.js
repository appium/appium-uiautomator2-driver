import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('wifi @skip-ci', function () {
  let driver;
  before(async () => {
    driver = initDriver(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should enable WIFI', async () => {
    let WIFI = 2;
    await driver.setNetworkConnection(WIFI);
    await driver.isWifiOn().should.eventually.equal(true);
  });
});
