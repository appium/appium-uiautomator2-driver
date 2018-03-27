import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

describe('mobile', function () {
  let driver;
  before(async function () {
    delete APIDEMOS_CAPS.app;
    driver = await initDriver({
      ...APIDEMOS_CAPS,

      // For deeplinking to work, it has to run a session in a native
      // context but it doesn't matter what native app is run so just
      // run io.appium.settings for simplicity
      appPackage: 'io.appium.settings',
      appActivity: '.Settings',
    });
  });
  after(async function () {
    await driver.quit();
  });
  describe('mobile:shell', function () {
    it('should call execute command without proxy error, but require relaxed security flag', async function () {
      try {
        await driver.execute('mobile: shell', {command: 'echo', args: ['hello']});
      } catch (e) {
        e.message.should.match(/Original error: Appium server must have relaxed security flag set in order to run any shell commands/);
      }
    });
  });
  describe('mobile:deepLink', function () {
    it('should be able to launch apps using Instant Apps', async function () {
      try {
        await driver.execute("mobile: deepLink", {url: 'https://www.realtor.com/realestateandhomes-search/San-Jose_CA', package: 'com.move.realtor'});
      } catch (e) {
        // Note: Currently no emulators have this feature enabled so for this test to make it past this try-catch
        // block it has to be run on a local emulator/device that has Instant Apps enabled
        // (https://developer.android.com/topic/instant-apps/getting-started/setup.html)
        e.message.should.match(/unable to resolve intent/i);
        return;
      }

      // Check that the source has the package name somewhere
      await driver.source().should.eventually.match(/com\.move\.realtor/);

      // Check that we can find a native element and interact with it
      const btn = await driver.elementsByXPath('//android.widget.Button');
      btn.length.should.be.above(0);
      await btn[0].click();
    });
  });
});
