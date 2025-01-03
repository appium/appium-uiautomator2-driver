import { BROWSER_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';
import { ADB } from 'appium-adb';


describe('setUrl', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    const adb = new ADB();
    const hasChrome = await adb.isAppInstalled('com.android.chrome');
    if (!hasChrome) {
      return this.skip();
    }
    driver = await initSession(BROWSER_CAPS);
  });
  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });

  it('should be able to start a data uri via setUrl', async function () {
    try {
      // on some chrome systems, we always get the terms and conditions page
      let btn = await driver.$('id=com.android.chrome:id/terms_accept');
      await btn.click();

      btn = await driver.$('id=com.android.chrome:id/negative_button');
      await btn.click();
    } catch {}

    await driver.url('https://autify.com');

    const el = await driver.$('<title />');
    await el.waitForExist({ timeout: 5000 });
    await el.getHTML().should.eventually.include('Autify');
  });
});
