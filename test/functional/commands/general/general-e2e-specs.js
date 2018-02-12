import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

describe('general', function () {

  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  describe('startActivity', function () {
    it('should launch a new package and activity', async function () {
      let appPackage =  await driver.getCurrentPackage();
      let appActivity =  await driver.getCurrentActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');

      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.view.SplitTouchView';

      await driver.startActivity({appPackage: startAppPackage, appActivity: startAppActivity});

      let newAppPackage =  await driver.getCurrentPackage();
      let newAppActivity =  await driver.getCurrentActivity();
      newAppPackage.should.equal(startAppPackage);
      newAppActivity.should.equal(startAppActivity);
    });
    it('should be able to launch activity with custom intent parameter category', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = 'io.appium.android.apis.app.HelloWorld';
      let startIntentCategory = 'appium.android.intent.category.SAMPLE_CODE';

      await driver.startActivity({appPackage: startAppPackage, appActivity: startAppActivity, intentCategory: startIntentCategory});

      let appActivity =  await driver.getCurrentActivity();
      appActivity.should.include('HelloWorld');
    });
    it('should be able to launch activity with dontStopAppOnReset = true', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity({appPackage: startAppPackage, appActivity: startAppActivity});

      let appPackage =  await driver.getCurrentPackage();
      let appActivity =  await driver.getCurrentActivity();
      appPackage.should.equal(startAppPackage);
      appActivity.should.equal(startAppActivity);
    });
    it('should be able to launch activity with dontStopAppOnReset = false', async function () {
      let startAppPackage = 'io.appium.android.apis';
      let startAppActivity = '.os.MorseCode';
      await driver.startActivity({appPackage: startAppPackage, appActivity: startAppActivity});

      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentActivity();
      appPackage.should.equal(startAppPackage);
      appActivity.should.equal(startAppActivity);
    });
  });
});
