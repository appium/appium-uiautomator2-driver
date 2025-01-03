import { ADB } from 'appium-adb';
import { APIDEMOS_CAPS, amendCapabilities } from './desired';
import { initSession, deleteSession } from './helpers/session';
import B from 'bluebird';
import { retryInterval } from 'asyncbox';


const APIDEMOS_PACKAGE = 'io.appium.android.apis';
const APIDEMOS_MAIN_ACTIVITY = '.ApiDemos';
const APIDEMOS_SPLIT_TOUCH_ACTIVITY = '.view.SplitTouchView';

const DEFAULT_ADB_PORT = 5037;

async function killAndPrepareServer (oldPort, newPort) {
  const oldAdb = await ADB.createADB({adbPort: oldPort});
  await oldAdb.killServer();
  if (process.env.CI) {
    // on Travis this takes a while to get into a good state
    await B.delay(10000);
  }
  const newAdb = await ADB.createADB({adbPort: newPort});
  await retryInterval(5, 500, async () => await newAdb.getApiLevel());
}

describe('createSession', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  describe('default adb port', function () {
    afterEach(async function () {
      await deleteSession();
    });

    it('should start android session focusing on default pkg and act', async function () {
      driver = await initSession(APIDEMOS_CAPS);
      await driver.getCurrentPackage().should.eventually.equal(APIDEMOS_PACKAGE);
      await driver.getCurrentActivity().should.eventually.equal(APIDEMOS_MAIN_ACTIVITY);
    });
    it('should start android session focusing on custom pkg and act', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      driver = await initSession(caps);
      await driver.getCurrentPackage().should.eventually.equal(APIDEMOS_PACKAGE);
      await driver.getCurrentActivity().should.eventually.equal(APIDEMOS_SPLIT_TOUCH_ACTIVITY);
    });
    it('should error out for not apk extension', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:app': 'foo',
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      await initSession(caps).should.eventually.be.rejectedWith(/does not exist or is not accessible/);
    });
    it('should error out for invalid app path', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:app': 'foo.apk',
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      await initSession(caps).should.eventually.be.rejectedWith(/does not exist or is not accessible/);
    });
  });

  describe('custom adb port', function () {
    let adbPort = 5042;
    let driver;

    beforeEach(async function () {
      await killAndPrepareServer(DEFAULT_ADB_PORT, adbPort);
    });
    afterEach(async function () {
      await deleteSession();

      await killAndPrepareServer(adbPort, DEFAULT_ADB_PORT);
    });

    it('should start android session with a custom adb port', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:adbPort': adbPort,
        'appium:allowOfflineDevices': true,
      });
      driver = await initSession(caps, adbPort);
      await driver.getCurrentPackage().should.eventually.equal(APIDEMOS_PACKAGE);
      await driver.getCurrentActivity().should.eventually.equal(APIDEMOS_MAIN_ACTIVITY);
    });
  });
});
