import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android'
};

describe('Find - invalid strategy', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async () => {
    await driver.findElOrEls('-ios uiautomation', '.elements()', false)
      .should.eventually.be.rejectedWith(/not supported/);
  });
});
