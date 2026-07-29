import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('mobile', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  describe('mobile:shell', function () {
    it('should call execute command without proxy error, but require relaxed security flag', async function () {
      try {
        await driver.execute('mobile: shell', {command: 'echo', args: ['hello']});
      } catch (e: any) {
        assert.match(e.message, /Potentially insecure feature 'adb_shell' has not been enabled/);
      }
    });
  });
  describe('mobile:broadcast', function () {
    it('should call broadcast', async function () {
      const output = await driver.execute('mobile: broadcast', {
        action: 'io.appium.settings.sms.read',
        extras: [['s', 'max', '10']],
      });
      assert.ok((output as string).includes('result=-1'));
    });
  });
  describe('mobile:batteryInfo', function () {
    it('should get battery info', async function () {
      const {level, state} = (await driver.execute('mobile: batteryInfo', {})) as {
        level: number;
        state: number;
      };
      assert.ok(level > 0.0);
      assert.ok(state > 1);
    });
  });
});
