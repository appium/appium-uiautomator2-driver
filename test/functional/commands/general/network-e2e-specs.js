import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS, amendCapabilities } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('wifi @skip-ci', function () {
  let driver;
  before(async function () {
    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': '.view.TextFields',
    });
    driver = await initSession(caps);
  });
  after(async function () {
    await deleteSession();
  });
  it.skip('should enable WIFI', async function () {
    // TODO: This is returning Permission Denial: not allowed to send broadcast android.intent.action.AIRPLANE_MODE from pid=25928, uid=2000; also isWifiOn is not a method
    let WIFI = 2;
    await driver.setNetworkConnection(WIFI);
    await driver.isWifiOn().should.eventually.equal(true);
  });
});
