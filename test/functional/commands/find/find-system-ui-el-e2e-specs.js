import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { initSession, deleteSession } from '../../helpers/session';
import { SETTINGS_CAPS } from '../../desired';


chai.should();
chai.use(chaiAsPromised);

describe('Find - android ui elements', function () {
  let driver;

  before(async function () {
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
