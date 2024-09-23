import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('Find - invalid strategy', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async function () {
    await chai.expect(driver.$$('ios=.elements()'))
      .to.eventually.be.rejected;
  });
});
