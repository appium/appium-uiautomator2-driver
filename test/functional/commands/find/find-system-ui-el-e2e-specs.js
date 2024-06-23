import { initSession, deleteSession } from '../../helpers/session';
import { SETTINGS_CAPS } from '../../desired';


describe('Find - android ui elements', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(SETTINGS_CAPS);
  });
  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });
  it('should not find statusBarBackground element via xpath', async function () {
    const statusBar = await driver.$$(`//*[@resource-id='android:id/statusBarBackground']`); //check server (NPE) if allowInvisibleElements is unset on server side
    statusBar.length.should.be.equal(0);
    await driver.updateSettings({allowInvisibleElements: false});
    const statusBarWithInvisibleEl = await driver.$$(`//*[@resource-id='android:id/statusBarBackground']`);
    statusBarWithInvisibleEl.length.should.be.equal(0);
  });
  it('should find statusBarBackground element via xpath', async function () {
    await driver.updateSettings({allowInvisibleElements: true});
    await driver.$(`//*[@resource-id='android:id/statusBarBackground']`).elementId.should.eventually.exist;
  });
});
