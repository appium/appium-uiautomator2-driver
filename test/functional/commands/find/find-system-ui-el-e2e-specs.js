import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  appPackage: 'com.android.settings',
  appActivity: '.Settings',
  deviceName: 'Android',
  platformName: 'Android'
};

describe('Find - android ui elements @skip-ci', function () {
  before(async function () {
    // TODO: why does travis fail on this?

    driver = await initDriver(defaultCaps);
  });
  after(async () => {
    if (driver) {
      await driver.deleteSession();
    }
  });
  it('should not find statusBarBackground element via xpath', async () => {
    let statusBar = await driver.findElOrEls('xpath', `//*[@resource-id='android:id/statusBarBackground']`, true); //check server (NPE) if allowInvisibleElements is unset on server side
    statusBar.length.should.be.equal(0);
    await driver.updateSettings({"allowInvisibleElements": false});
    let statusBarWithInvisibleEl = await driver.findElOrEls('xpath', `//*[@resource-id='android:id/statusBarBackground']`, true);
    statusBarWithInvisibleEl.length.should.be.equal(0);
  });
  it('should find statusBarBackground element via xpath', async () => {
    await driver.updateSettings({"allowInvisibleElements": true});
    await driver.findElOrEls('xpath', `//*[@resource-id='android:id/statusBarBackground']`, false).should.eventually.exist;
  });
});
