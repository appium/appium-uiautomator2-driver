import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';
import { waitForCondition } from 'asyncbox';


async function expectPackageAndActivity(driver, pkg, activity, timeoutMs = 5000) {
  await waitForCondition(async () =>
    (await driver.getCurrentPackage() === pkg)
    && (await driver.getCurrentActivity() === activity), {
      waitMs: timeoutMs,
      intervalMs: 300,
    }
  );
}

describe('general', function () {

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

  describe('startActivity', function () {
    it('should launch a new package and activity', async function () {
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');

      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.view.SplitTouchView';

      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with custom intent parameter category', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = 'io.appium.android.apis.app.HelloWorld';
      let startIntentCategory = 'appium.android.intent.category.SAMPLE_CODE';

      await driver.startActivity(startAppPackage, startAppActivity, undefined, undefined, startIntentCategory);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = true', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = false', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity);

      await expectPackageAndActivity(driver, startAppPackage, startAppActivity);
    });
  });
});
