import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import axios from 'axios';
import { DEFAULT_HOST, DEFAULT_PORT } from '../..';
import { APIDEMOS_CAPS } from './desired';
import { initSession, deleteSession } from './helpers/session';
import B from 'bluebird';
import { retryInterval } from 'asyncbox';


const should = chai.should();
chai.use(chaiAsPromised);

const APIDEMOS_PACKAGE = 'io.appium.android.apis';
const APIDEMOS_MAIN_ACTIVITY = '.ApiDemos';
const APIDEMOS_SPLIT_TOUCH_ACTIVITY = '.view.SplitTouchView';

const DEFAULT_ADB_PORT = 5037;

async function killAndPrepareServer (oldPort, newPort) {
  if (!process.env.TESTOBJECT_E2E_TESTS) {
    let adb = await ADB.createADB({adbPort: oldPort});
    await adb.killServer();
    if (process.env.CI) {
      // on Travis this takes a while to get into a good state
      await B.delay(10000);
    }
    adb = await ADB.createADB({adbPort: newPort});
    await retryInterval(5, 500, async () => await adb.getApiLevel());
  }
}

describe('createSession', function () {
  let driver;
  describe('default adb port', function () {
    afterEach(async function () {
      if (driver) {
        await deleteSession();
      }
      driver = null;
    });

    it('should start android session focusing on default pkg and act', async function () {
      driver = await initSession(APIDEMOS_CAPS);
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal(APIDEMOS_PACKAGE);
      appActivity.should.equal(APIDEMOS_MAIN_ACTIVITY);
    });
    it('should start android session focusing on custom pkg and act', async function () {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        appPackage: APIDEMOS_PACKAGE,
        appActivity: APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      driver = await initSession(caps);
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
        appPackage: APIDEMOS_PACKAGE,
        appActivity: APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      try {
        await initSession(caps);
        throw new Error(`Call to 'initSession' should not have succeeded`);
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
        appPackage: APIDEMOS_PACKAGE,
        appActivity: APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });

      try {
        await initSession(caps);
        throw new Error(`Call to 'initSession' should not have succeeded`);
      } catch (e) {
        e.data.should.match(/does not exist or is not accessible/);
      }
    });
    it('should get device model, manufacturer and screen size in session details', async function () {
      let caps = Object.assign({}, APIDEMOS_CAPS, {
        appPackage: APIDEMOS_PACKAGE,
        appActivity: APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      driver = await initSession(caps);

      let serverCaps = await driver.sessionCapabilities();
      serverCaps.deviceScreenSize.should.exist;
      serverCaps.deviceScreenDensity.should.exist;
      serverCaps.deviceModel.should.exist;
      serverCaps.deviceManufacturer.should.exist;
      serverCaps.deviceApiLevel.should.be.greaterThan(0);
    });
  });

  describe('custom adb port', function () {
    // Don't do these tests on TestObject. Cannot use TestObject's ADB.
    if (process.env.TESTOBJECT_E2E_TESTS) {
      return;
    }

    let adbPort = 5042;
    let driver;

    beforeEach(async function () {
      await killAndPrepareServer(DEFAULT_ADB_PORT, adbPort);
    });
    afterEach(async function () {
      if (driver) {
        await deleteSession();
      }

      await killAndPrepareServer(adbPort, DEFAULT_ADB_PORT);
    });

    it('should start android session with a custom adb port', async function () {
      const caps = Object.assign({}, APIDEMOS_CAPS, {
        adbPort,
        allowOfflineDevices: true,
      });
      driver = await initSession(caps, adbPort);
      const appPackage = await driver.getCurrentPackage();
      const appActivity = await driver.getCurrentDeviceActivity();
      appPackage.should.equal(APIDEMOS_PACKAGE);
      appActivity.should.equal(APIDEMOS_MAIN_ACTIVITY);
    });
  });

  describe('w3c compliance', function () {
    it('should start a session with W3C caps', async function () {
      const { value, sessionId, status } = (await axios({
        url: `http://${DEFAULT_HOST}:${DEFAULT_PORT}/wd/hub/session`,
        method: 'POST',
        data: {
          capabilities: {
            alwaysMatch: APIDEMOS_CAPS,
            firstMatch: [{}],
          }
        }
      })).data;
      value.should.exist;
      value.capabilities.should.exist;
      value.sessionId.should.exist;
      should.not.exist(sessionId);
      should.not.exist(status);
      await axios.delete(`http://${DEFAULT_HOST}:${DEFAULT_PORT}/wd/hub/session/${value.sessionId}`);
    });
  });
});

describe('close', function () {
  it('should close application', async function () {
    let driver = await initSession(APIDEMOS_CAPS);
    await driver.closeApp();
    let appPackage = await driver.getCurrentPackage();
    if (appPackage) {
      appPackage.should.not.equal(APIDEMOS_PACKAGE);
    }
  });
});
