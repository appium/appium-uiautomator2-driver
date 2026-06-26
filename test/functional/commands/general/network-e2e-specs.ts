import {describe, it, before, after} from 'node:test';
import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS, amendCapabilities} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('wifi @skip-ci', function () {
  let driver: Browser;
  before(async function () {
    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': '.view.TextFields',
    });
    driver = await initSession(caps);
  });
  after(async function () {
    await deleteSession();
  });
  it.skip('should enable WIFI', async function () {
    // TODO: This is returning Permission Denial: not allowed to send broadcast android.intent.action.AIRPLANE_MODE from pid=25928, uid=2000; also isWifiOn is not a method
    const WIFI = 2;
    await driver.setNetworkConnection({type: WIFI} as any);
    await expect((driver as any).isWifiOn()).to.eventually.equal(true);
  });
});
