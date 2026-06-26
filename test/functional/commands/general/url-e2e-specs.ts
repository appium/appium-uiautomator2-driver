import {describe, it, before, after} from 'node:test';
import type {Browser} from 'webdriverio';
import {BROWSER_CAPS} from '../../desired.js';
import {isCi} from '../../helpers/ci-e2e.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {ADB} from 'appium-adb';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('setUrl', {skip: isCi()}, function () {
  let driver: Browser | undefined;

  before(async function () {
    const adb = new ADB();
    const hasChrome = await adb.isAppInstalled('com.android.chrome');
    if (!hasChrome) {
      return;
    }
    driver = await initSession(BROWSER_CAPS);
  });
  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });

  it('should be able to start a data uri via setUrl', async function (t) {
    if (!driver) {
      return t.skip();
    }
    try {
      // on some chrome systems, we always get the terms and conditions page
      let btn = await driver!.$('id=com.android.chrome:id/terms_accept');
      await btn.click();

      btn = await driver!.$('id=com.android.chrome:id/negative_button');
      await btn.click();
    } catch {
      // ignore
    }

    await driver!.url('https://autify.com');

    const el = await driver!.$('<title />');
    await el.waitForExist({timeout: 5000});
    await expect(el.getHTML()).to.eventually.include('Autify');
  });
});
