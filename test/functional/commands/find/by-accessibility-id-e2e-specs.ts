import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - accessibility ID', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by name', async function () {
    assert.ok(await driver.$('~Animation').elementId);
  });
  it('should return an array of one element with findElements', async function () {
    const els = await driver.$$('~Animation');
    assert.ok(Array.isArray(els));
    assert.strictEqual(await els.length, 1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    assert.ok(await driver.$("~Access'ibility").elementId);
  });
});
