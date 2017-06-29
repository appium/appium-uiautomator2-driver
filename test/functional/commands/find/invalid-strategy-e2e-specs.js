import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import { APIDEMOS_CAPS } from '../../desired';


chai.should();
chai.use(chaiAsPromised);

describe('Find - invalid strategy', function () {
  let driver;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async () => {
    await driver.findElOrEls('-ios uiautomation', '.elements()', false)
      .should.eventually.be.rejectedWith(/not supported/);
  });
});
