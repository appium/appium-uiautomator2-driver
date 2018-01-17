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
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    // TODO: why does travis fail on this?

    driver = await initDriver(defaultCaps);
  });
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });
  it('should not find statusBarBackground element via xpath', async function () {
    let statusBar = await driver.elementsByXPath(`//*[@resource-id='android:id/statusBarBackground']`); //check server (NPE) if allowInvisibleElements is unset on server side
    statusBar.length.should.be.equal(0);
    await driver.updateSettings({"allowInvisibleElements": false});
    let statusBarWithInvisibleEl = await driver.elementsByXPath(`//*[@resource-id='android:id/statusBarBackground']`);
    statusBarWithInvisibleEl.length.should.be.equal(0);
  });
  it('should find statusBarBackground element via xpath', async function () {
    await driver.updateSettings({"allowInvisibleElements": true});
    await driver.elementByXPath(`//*[@resource-id='android:id/statusBarBackground']`).should.eventually.exist;
  });
});
