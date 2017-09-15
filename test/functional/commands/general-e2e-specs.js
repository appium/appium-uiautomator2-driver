import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('general', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });

  describe('startActivity', function () {
    it('should launch a new package and activity', async () => {
      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');

      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.view.SplitTouchView';

      await driver.startActivity(startAppPackage, startAppActivity);

      let {appPackage: newAppPackage, appActivity: newAppActivity} = await driver.adb.getFocusedPackageAndActivity();
      newAppPackage.should.equal(startAppPackage);
      newAppActivity.should.equal(startAppActivity);
    });
    it('should be able to launch activity with custom intent parameter category', async () => {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = 'io.appium.android.apis.app.HelloWorld';
      let startIntentCategory = 'appium.android.intent.category.SAMPLE_CODE';

      await driver.startActivity(startAppPackage, startAppActivity, undefined, undefined, startIntentCategory);

      let {appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appActivity.should.include('HelloWorld');
    });
    it('should be able to launch activity with dontStopAppOnReset = true', async () => {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity,
                                 startAppPackage, startAppActivity,
                                 undefined, undefined,
                                 undefined, undefined,
                                 true);

      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal(startAppPackage);
      appActivity.should.equal(startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = false', async () => {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity(startAppPackage, startAppActivity,
                                 startAppPackage, startAppActivity,
                                 undefined, undefined,
                                 undefined, undefined,
                                 false);

      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal(startAppPackage);
      appActivity.should.equal(startAppActivity);
    });
  });
});
