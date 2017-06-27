import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../..';
import sampleApps from 'sample-apps';
import ADB from 'appium-adb';


chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android'
};

describe('createSession', function () {
  before(function () {
    driver = new AndroidUiautomator2Driver();
  });

  describe('default adb port', function () {
    afterEach(async function () {
      await driver.deleteSession();
    });

    it('should start android session focusing on default pkg and act', async () => {
      await driver.createSession(defaultCaps);
      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');
    });
    it('should start android session focusing on custom pkg and act', async () => {
      let caps = Object.assign({}, defaultCaps, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      await driver.createSession(caps);
      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal(caps.appPackage);
      appActivity.should.equal(caps.appActivity);
    });
    it('should error out for not apk extension', async () => {
      let caps = Object.assign({}, defaultCaps, {
        app: 'foo',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      await driver.createSession(caps).should.eventually.be.rejectedWith(/New app path foo did not have extension \.apk/);
    });
    it('should error out for invalid app path', async () => {
      let caps = Object.assign({}, defaultCaps, {
        app: 'foo.apk',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      await driver.createSession(caps).should.eventually.be.rejectedWith(/Could not find/);
    });
    it('should get device model, manufacturer and screen size in session details', async () => {
      let caps = Object.assign({}, defaultCaps, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      await driver.createSession(caps);

      let serverCaps = await driver.getSession();
      serverCaps.deviceScreenSize.should.exist;
      serverCaps.deviceModel.should.exist;
      serverCaps.deviceManufacturer.should.exist;
    });
  });

  describe('custom adb port', function () {
    let adbPort = 5042;

    async function killServer (adbPort) {
      let adb = await ADB.createADB({adbPort});
      // await exec(adb.executable.path, adb.executable.defaultArgs.concat('kill-server'));
      await adb.killServer();
    }

    before(async function () {
      await killServer(5037);
    });
    afterEach(async function () {
      await driver.deleteSession();

      await killServer(adbPort);
    });

    it('should start android session with a custom adb port', async () => {
      let caps = Object.assign({}, defaultCaps, {
        adbPort,
      });
      await driver.createSession(caps);
      let {appPackage, appActivity} = await driver.adb.getFocusedPackageAndActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');
    });
  });
});

describe('close', function () {
  before(() => {
    driver = new AndroidUiautomator2Driver();
  });
  afterEach(async () => {
    await driver.deleteSession();
  });
  it('should close application', async () => {
    await driver.createSession(defaultCaps);
    await driver.closeApp();
    let {appPackage} = await driver.adb.getFocusedPackageAndActivity();
    if (appPackage) {
      appPackage.should.not.equal("io.appium.android.apis");
    }
  });
});
