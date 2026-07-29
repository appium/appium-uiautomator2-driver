import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - ID', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id', async function () {
    assert.ok(await driver.$('id=android:id/text1').elementId);
  });
  it('should return an array of one element with findElements', async function () {
    const els = await driver.$$('id=android:id/text1');
    assert.ok(Array.isArray(els));
    assert.ok((await els.length) > 1);
  });
});
