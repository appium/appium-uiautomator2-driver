import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - from element', function () {
  const atv = 'android.widget.TextView';
  const alv = 'android.widget.ListView';
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find a single element by tag name', async function () {
    const el = await driver.$(alv);
    const innerEl = await el.$(atv);
    assert.strictEqual(await innerEl.getText(), "Access'ibility");
  });
  it('should find multiple elements by tag name', async function () {
    const el = await driver.$(alv);
    const innerEls = await el.$$(atv);
    assert.ok((await innerEls.length) > 1);
  });
});
