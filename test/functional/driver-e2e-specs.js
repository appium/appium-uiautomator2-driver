import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import request from 'request-promise';
import { DEFAULT_HOST, DEFAULT_PORT } from '../..';
import { APIDEMOS_CAPS } from './desired';
import { initDriver } from './helpers/session';

const should = chai.should();
chai.use(chaiAsPromised);

const APIDEMOS_PACKAGE = 'io.appium.android.apis';

async function killServer (adbPort) {
  if (!process.env.TESTOBJECT_E2E_TESTS) {
    let adb = await ADB.createADB({adbPort});
    await adb.killServer();
  }
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

    it('should start android session focusing on default pkg and act', async function () {
      driver = await initDriver(APIDEMOS_CAPS);
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal('io.appium.android.apis');
      appActivity.should.equal('.ApiDemos');
    });
    it('should start android session focusing on custom pkg and act', async function () {
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
    it('should error out for not apk extension', async function () {
      // Don't test this on TestObject. The 'app' cap gets stripped out and can't be tested
      if (process.env.TESTOBJECT_E2E_TESTS) {
        return;
      }
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        app: 'foo',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      try {
        await initDriver(caps);
        throw new Error(`Call to 'initDriver' should not have succeeded`);
      } catch (e) {
        e.data.should.match(/does not exist or is not accessible/);
      }
    });
    it('should error out for invalid app path', async function () {
      // Don't test this on TestObject. The 'app' cap gets stripped out and can't be tested
      if (process.env.TESTOBJECT_E2E_TESTS) {
        return;
      }
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        app: 'foo.apk',
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });

      try {
        await initDriver(caps);
        throw new Error(`Call to 'initDriver' should not have succeeded`);
      } catch (e) {
        e.data.should.match(/does not exist or is not accessible/);
      }
    });
    it('should get device model, manufacturer and screen size in session details', async function () {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        appPackage: 'io.appium.android.apis',
        appActivity: '.view.SplitTouchView',
      });
      driver = await initDriver(caps);

      let serverCaps = await driver.sessionCapabilities();
      serverCaps.deviceScreenSize.should.exist;
      serverCaps.deviceScreenDensity.should.exist;
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
      if (driver) {
        await driver.quit();
      }

      await killServer(adbPort);
    });

    it('should start android session with a custom adb port', async function () {
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

  describe('w3c compliance', function () {
    it('should start a session with W3C caps', async function () {
      const { value, sessionId, status } = await request.post({url: `http://${DEFAULT_HOST}:${DEFAULT_PORT}/wd/hub/session`, json: {
        capabilities: {
          alwaysMatch: APIDEMOS_CAPS,
          firstMatch: [{}],
        }
      }});
      value.should.exist;
      value.capabilities.should.exist;
      value.sessionId.should.exist;
      should.not.exist(sessionId);
      should.not.exist(status);
      await request.delete({url: `http://${DEFAULT_HOST}:${DEFAULT_PORT}/wd/hub/session/${value.sessionId}`});
    });
  });
});

describe('close', function () {
  it('should close application', async function () {
    let driver = await initDriver(APIDEMOS_CAPS);
    await driver.closeApp();
    let appPackage = await driver.getCurrentPackage();
    if (appPackage) {
      appPackage.should.not.equal(APIDEMOS_PACKAGE);
    }
  });
});
