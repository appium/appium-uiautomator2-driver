import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { APIDEMOS_CAPS } from './desired';
import { initDriver } from './helpers/session';

chai.should();
chai.use(chaiAsPromised);

const APIDEMOS_PACKAGE = 'io.appium.android.apis';

async function killServer (adbPort) {
  let adb = await ADB.createADB({adbPort});
  await adb.killServer();
}

describe('createSession', function () {
  let driver;
  before(async function () {
    await killServer(5037);
  });

  describe('default adb port', function () {
    afterEach(async function () {
      if (driver) {
        await driver.quit();
      }
      driver = null;
    });

    it('should start android session focusing on default pkg and act', async () => {
      driver = await initDriver(APIDEMOS_CAPS);
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');
    });
    it('should start android session focusing on custom pkg and act', async () => {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      driver = await initDriver(caps);
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal(caps.appPackage);
      appActivity.should.equal(caps.appActivity);
    });
    it('should error out for not apk extension', async () => {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        app: 'foo',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      try {
        await initDriver(caps);
        throw new Error(`Call to 'initDriver' should not have succeeded`);
      } catch (e) {
        e.data.should.match(/New app path foo did not have extension \.apk/);
      }
    });
    it('should error out for invalid app path', async () => {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        app: 'foo.apk',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });

      try {
        await initDriver(caps);
        throw new Error(`Call to 'initDriver' should not have succeeded`);
      } catch (e) {
        e.data.should.match(/Could not find/);
      }
    });
    it('should get device model, manufacturer and screen size in session details', async () => {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      driver = await initDriver(caps);

      let serverCaps = await driver.sessionCapabilities();
      serverCaps.deviceScreenSize.should.exist;
      serverCaps.deviceModel.should.exist;
      serverCaps.deviceManufacturer.should.exist;
    });
  });

  describe('custom adb port', function () {
    // Don't do these tests on TestObject. Cannot use TestObject's ADB.
    if (process.env.TESTOBJECT_E2E_TESTS) {
      return;
    }

    let adbPort = 5042;
    let driver;

    before(async function () {
      await killServer(5037);
    });
    afterEach(async function () {
      await driver.quit();

      await killServer(adbPort);
    });

    it('should start android session with a custom adb port', async () => {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        adbPort,
      });
      driver = await initDriver(caps, adbPort);
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');
    });
  });
});

describe('close', function () {
  it('should close application', async () => {
    let driver = await initDriver(APIDEMOS_CAPS);
    await driver.closeApp();
    let appPackage = await driver.getCurrentPackage();
    if (appPackage) {
      appPackage.should.not.equal(APIDEMOS_PACKAGE);
    }
  });
});
