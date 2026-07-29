import assert from 'node:assert/strict';
import {describe, it, beforeEach, afterEach} from 'node:test';

import {ADB} from 'appium-adb';
import {retryInterval} from 'asyncbox';
import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS, amendCapabilities, APIDEMOS_PACKAGE, APIDEMOS_MAIN_ACTIVITY} from '../desired.js';
import {isCi} from '../helpers/ci-e2e.js';
import {initSession, deleteSession} from '../helpers/session.js';

const APIDEMOS_SPLIT_TOUCH_ACTIVITY = '.view.SplitTouchView';

const DEFAULT_ADB_PORT = 5037;

async function killAndPrepareServer(oldPort: number, newPort: number): Promise<void> {
  const oldAdb = await ADB.createADB({adbPort: oldPort});
  await oldAdb.killServer();
  const newAdb = await ADB.createADB({adbPort: newPort});
  await retryInterval(20, 500, async () => {
    await newAdb.getApiLevel();
  });
}

describe('createSession', {skip: isCi()}, function () {
  let driver!: Browser;

  describe('default adb port', function () {
    afterEach(async function () {
      await deleteSession();
    });

    it('should start android session focusing on default pkg and act', async function () {
      driver = await initSession(APIDEMOS_CAPS);
      assert.strictEqual(await driver.getCurrentPackage(), APIDEMOS_PACKAGE);
      assert.strictEqual(await driver.getCurrentActivity(), APIDEMOS_MAIN_ACTIVITY);
    });
    it('should start android session focusing on custom pkg and act', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      driver = await initSession(caps);
      assert.strictEqual(await driver.getCurrentPackage(), APIDEMOS_PACKAGE);
      assert.strictEqual(await driver.getCurrentActivity(), APIDEMOS_SPLIT_TOUCH_ACTIVITY);
    });
    it('should error out for not apk extension', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:app': 'foo',
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      await assert.rejects(initSession(caps), /does not exist or is not accessible/);
    });
    it('should error out for invalid app path', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:app': 'foo.apk',
        'appium:appPackage': APIDEMOS_PACKAGE,
        'appium:appActivity': APIDEMOS_SPLIT_TOUCH_ACTIVITY,
      });
      await assert.rejects(initSession(caps), /does not exist or is not accessible/);
    });
  });

  describe('custom adb port', function () {
    const adbPort = 5042;
    let driver!: Browser;

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
      driver = await initSession(caps, {adbPort} as any);
      assert.strictEqual(await driver.getCurrentPackage(), APIDEMOS_PACKAGE);
      assert.strictEqual(await driver.getCurrentActivity(), APIDEMOS_MAIN_ACTIVITY);
    });
  });
});
