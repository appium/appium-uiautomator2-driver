import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import {waitForCondition} from 'asyncbox';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

async function expectPackageAndActivity(driver: Browser, pkg: string, activity: string, timeoutMs = 5000): Promise<void> {
  await waitForCondition(async () =>
    (await driver.getCurrentPackage() === pkg)
    && (await driver.getCurrentActivity() === activity), {
      waitMs: timeoutMs,
      intervalMs: 300,
    }
  );
}

describe('general', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });

  describe('startActivity', function () {
    it('should launch a new package and activity', async function () {
      const appPackage = await driver.getCurrentPackage();
      const appActivity = await driver.getCurrentActivity();
      expect(appPackage).to.equal('io.appium.android.apis');
      expect(appActivity).to.equal('.ApiDemos');

      const startAppPackage = 'io.appium.android.apis';
      const startAppActivity = '.view.SplitTouchView';

      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with custom intent parameter category', async function () {
      const startAppPackage = 'io.appium.android.apis';
      const startAppActivity = 'io.appium.android.apis.app.HelloWorld';
      const startIntentCategory = 'appium.android.intent.category.SAMPLE_CODE';

      await driver.startActivity(startAppPackage, startAppActivity, undefined, undefined, startIntentCategory);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = true', async function () {
      const startAppPackage = 'io.appium.android.apis';
      const startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = false', async function () {
      const startAppPackage = 'io.appium.android.apis';
      const startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
  });
});

