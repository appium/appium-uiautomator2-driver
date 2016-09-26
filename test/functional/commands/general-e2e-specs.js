import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android'
};

describe('general', function () {
  describe('startActivity', function () {
    before(async () => {
      driver = new AndroidUiautomator2Driver();
      await driver.createSession(defaultCaps);
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
    before(async () => {
      driver = new AndroidUiautomator2Driver();
      let contactCaps = Object.assign({}, defaultCaps, {app: sampleApps('ContactManager')});
      await driver.createSession(contactCaps);
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
