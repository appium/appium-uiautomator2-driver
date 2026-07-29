import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('apidemo - attributes', function () {
  let driver: Browser;
  let animationEl: Awaited<ReturnType<Browser['$']>>;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
    animationEl = await driver.$('~Animation');
    await animationEl.waitForDisplayed({timeout: 5000});
  });
  after(async function () {
    await deleteSession();
  });
  it('should be able to find resourceId attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('resourceId'), 'android:id/text1');
  });
  it('should be able to find text attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('text'), 'Animation');
  });
  it('should be able to find name attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('name'), 'Animation');
  });
  it('should be able to find content description attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('contentDescription'), 'Animation');
  });
  it('should be able to find displayed attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('displayed'), 'true');
  });
  it('should be able to find enabled attribute', async function () {
    assert.strictEqual(await animationEl.getAttribute('enabled'), 'true');
  });
  it('should be able to find displayed attribute through normal func', async function () {
    const displayed = await animationEl.isDisplayed();
    assert.strictEqual(String(displayed), 'true');
  });
  it('should be able to get element location using getLocation', async function () {
    const location = await animationEl.getLocation();
    assert.ok(location.x >= 0);
    assert.ok(location.y >= 0);
  });
  it.skip('should be able to get element location using getLocationInView', async function () {
    // TODO: 'getLocationInView' requires an argument - skipping implementation
    // const location = await animationEl.getLocationInView();
    // expect(location.x).to.be.at.least(0);
    // expect(location.y).to.be.at.least(0);
  });
  it('should be able to get element size', async function () {
    const size = await animationEl.getSize();
    assert.ok(size.width >= 0);
    assert.ok(size.height >= 0);
  });
});
