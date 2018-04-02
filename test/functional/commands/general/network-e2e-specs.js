import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('wifi @skip-ci', function () {
  let driver;
  before(async function () {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
  });
  after(async function () {
    await driver.quit();
  });
  it.skip('should enable WIFI', async function () {
    // TODO: This is returning Permission Denial: not allowed to send broadcast android.intent.action.AIRPLANE_MODE from pid=25928, uid=2000; also isWifiOn is not a method
    let WIFI = 2;
    await driver.setNetworkConnection(WIFI);
    await driver.isWifiOn().should.eventually.equal(true);
  });
});
