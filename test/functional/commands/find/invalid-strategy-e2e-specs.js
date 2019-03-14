import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - invalid strategy', function () {
  let driver;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async function () {
    await driver.elementsByIosUIAutomation('.elements()', false)
      .should.eventually.be.rejectedWith(/not supported/);
  });
});
