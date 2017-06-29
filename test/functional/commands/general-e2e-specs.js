import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import { APIDEMOS_CAPS, CONTACT_MANAGER_CAPS } from '../desired';


chai.should();
chai.use(chaiAsPromised);

describe('general', function () {
  describe('startActivity', function () {
    let driver;
    before(async () => {
      driver = new AndroidUiautomator2Driver();
      await driver.createSession(APIDEMOS_CAPS);
    });
    after(async () => {
      await driver.deleteSession();
    });

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
  describe('getStrings', function () {
    let driver;
    before(async () => {
      driver = new AndroidUiautomator2Driver();
      await driver.createSession(CONTACT_MANAGER_CAPS);
    });
    after(async () => {
      await driver.deleteSession();
    });

    it('should return app strings', async () => {
      let strings = await driver.getStrings('en');
      strings.save.should.equal('Save');
    });
    it('should return app strings for the device language', async () => {
      let strings = await driver.getStrings();
      strings.save.should.equal('Save');
    });
  });
});
