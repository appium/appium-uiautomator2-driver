import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import {util} from 'appium/support.js';
import {retryInterval} from 'asyncbox';
import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS, amendCapabilities} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

const textFieldsActivity = '.view.TextFields';

describe('apidemo - element', function () {
  let driver: Browser;
  let el: Awaited<ReturnType<Browser['$']>>;

  before(async function () {
    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': textFieldsActivity,
    });
    driver = await initSession(caps);
    const elResult = await retryInterval(5, 1000, async function () {
      const elsPromise = driver.$$('android.widget.EditText');
      const elsArray = await elsPromise;
      const length = await elsArray.length;
      assert.ok(length >= 1);
      return elsArray[length - 1];
    });
    if (!elResult) {
      throw new Error('Element not found after retries');
    }
    el = elResult;
  });
  after(async function () {
    await deleteSession();
  });

  describe('setValue', function () {
    it('should set the text on the element', async function () {
      await el.setValue('original value');
      assert.strictEqual(await el.getText(), 'original value');
    });
  });

  describe('active', function () {
    it('should active element be equal to clicked element', async function () {
      await el.click();
      const activeElement = await driver.getActiveElement();
      assert.strictEqual(util.unwrapElement(activeElement as any), el.elementId);
    });
  });
});
