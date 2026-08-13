import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - basic', function () {
  let driver: Browser;
  const singleResourceId = 'decor_content_parent';

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find a single element by content-description', async function () {
    const el = await driver.$('~Animation');
    assert.strictEqual(await el.getText(), 'Animation');
  });
  it('should find an element by class name', async function () {
    const el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    assert.strictEqual(text.toLowerCase(), 'api demos');
  });
  it('should find multiple elements by class name', async function () {
    const els = await driver.$$('android.widget.TextView');
    assert.ok((await els.length) >= 10);
  });
  it('should not find multiple elements that doesnt exist', async function () {
    const els = await driver.$$('blargimarg');
    assert.strictEqual(await els.length, 0);
  });
  it('should fail on empty locator', async function () {
    await assert.rejects(async () => {
      await driver.$('');
    }, /selector/);
  });
  it('should find a single element by resource-id', async function () {
    const el = await driver.$(`id=android:id/${singleResourceId}`);
    assert.ok(el.elementId);
  });
  it('should find multiple elements by resource-id', async function () {
    const els = await driver.$$('id=android:id/text1');
    assert.ok((await els.length) > 1);
  });
  it('should find multiple elements by resource-id even when theres just one', async function () {
    const els = await driver.$$(`id=android:id/${singleResourceId}`);
    assert.strictEqual(await els.length, 1);
  });

  describe('implicit wait', function () {
    const implicitWaitTimeout = 5000;
    before(async function () {
      await driver.setTimeout({implicit: implicitWaitTimeout});
    });
    it('should respect implicit wait with multiple elements', async function () {
      const beforeMs = Date.now();
      const els = await driver.$$('id=android:id/there_is_nothing_called_this');
      assert.strictEqual(await els.length, 0);
      const afterMs = Date.now();
      assert.ok(afterMs - beforeMs < implicitWaitTimeout * 2);
    });
  });
});
