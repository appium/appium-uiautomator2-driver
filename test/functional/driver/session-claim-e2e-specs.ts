import {ADB} from 'appium-adb';
import {retryInterval} from 'asyncbox';
import type {Browser} from 'webdriverio';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {amendCapabilities, APIDEMOS_CAPS, APIDEMOS_PACKAGE} from '../desired';
import {assertSessionClaimIpcTraces, readAppiumLog} from '../helpers/appium-log';
import {getFreePort} from '../helpers/ports';
import {createRemoteSession, deleteRemoteSession, MOCHA_TIMEOUT} from '../helpers/session';

chai.use(chaiAsPromised);

describe('AndroidUiautomator2Driver - session udid claim', function () {
  this.timeout(MOCHA_TIMEOUT);

  let udid: string;
  let baseCaps: ReturnType<typeof amendCapabilities>;
  let firstDriver: Browser | undefined;
  let secondDriver: Browser | undefined;

  before(async function () {
    const adb = await ADB.createADB();
    const devices = (await adb.getConnectedDevices()).filter(({state}) => state === 'device');
    if (devices.length === 0) {
      this.skip();
      return;
    }

    udid = devices[0].udid;
    baseCaps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:udid': udid,
      'appium:noReset': true,
    });
  });

  afterEach(async function () {
    await deleteRemoteSession(secondDriver);
    await deleteRemoteSession(firstDriver);
    secondDriver = undefined;
    firstDriver = undefined;
  });

  it('should terminate the previous session when a new session claims the same udid', async function () {
    firstDriver = await createRemoteSession(baseCaps);
    expect(firstDriver.sessionId).to.be.a('string').that.is.not.empty;
    await expect(firstDriver.getCurrentPackage()).to.eventually.equal(APIDEMOS_PACKAGE);

    const firstSessionId = firstDriver.sessionId;
    const systemPort = await getFreePort();
    secondDriver = await createRemoteSession(
      amendCapabilities(baseCaps, {
        'appium:systemPort': systemPort,
      }),
    );

    expect(secondDriver.sessionId).to.be.a('string').that.is.not.empty;
    expect(secondDriver.sessionId).to.not.equal(firstSessionId);

    await retryInterval(20, 500, async () => {
      await expect(firstDriver!.getCurrentPackage()).to.be.rejectedWith(
        /invalid session id|session is either terminated or not started/i,
      );
    });

    await expect(secondDriver.getCurrentPackage()).to.eventually.equal(APIDEMOS_PACKAGE);

    const appiumLog = await readAppiumLog();
    if (appiumLog) {
      assertSessionClaimIpcTraces(appiumLog);
    }
  });
});
