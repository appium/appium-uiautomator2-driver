import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - invalid strategy', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async () => {
    await driver.findElOrEls('-ios uiautomation', '.elements()', false)
      .should.eventually.be.rejectedWith(/not supported/);
  });
});
