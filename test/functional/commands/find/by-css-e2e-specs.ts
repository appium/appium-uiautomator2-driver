import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - CSS', function () {
  let driver: Browser;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id (android resource-id)', async function () {
    assert.ok(await driver.$('#android\\:id\\/text1').elementId);
    assert.ok(await driver.$('*[id="android:id/text1"]').elementId);
    assert.ok(await driver.$('*[resource-id="android:id/text1"]').elementId);
  });
  it('should find an element by content description', async function () {
    assert.ok(await driver.$('*[description="Animation"]').elementId);
  });
  it('should return an array with findElements', async function () {
    const els = await driver.$$('*[content-desc="Animation"]');
    assert.ok(Array.isArray(els));
    assert.strictEqual(await els.length, 1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    assert.ok(await driver.$('*[content-description="Access\'ibility"]').elementId);
  });
  it('should find an element by class name', async function () {
    const el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    assert.strictEqual(text.toLowerCase(), 'api demos');
  });
  it.skip('should find an element with a chain of attributes and pseudo-classes', async function () {
    // TODO: webdriver selects 'class name' strategy.
    // ref. https://github.com/webdriverio/webdriverio/blob/eba541a77dbc42173717e1c106a7c4d3ccb198f5/packages/webdriverio/src/utils/findStrategy.ts#L91-L96
    const el = await driver.$('android.widget.TextView[clickable=true]:nth-child(1)');
    assert.strictEqual(await el.getText(), 'Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    const els = await driver.$$('*[focused=true] *[clickable=true]');
    assert.strictEqual(await els.length, 1);
  });
  it('should find an element by a non-fully qualified class name using CSS tag name', async function () {
    const els = await driver.$$('android.widget.TextView');
    assert.ok((await els.length) > 0);
  });
  it('should find elements using starts with attribute', async function () {
    assert.ok(await driver.$('*[description^="Animation"]').elementId);
  });
  it('should find elements using ends with attribute', async function () {
    assert.ok(await driver.$('*[description$="Animation"]').elementId);
  });
  it('should find elements using word match attribute', async function () {
    assert.ok(await driver.$('*[description~="Animation"]').elementId);
  });
  it('should find elements using wildcard attribute', async function () {
    assert.ok(await driver.$('*[description*="Animation"]').elementId);
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    const selector = '*[text="عربي"]:instance(0)';
    const el = await driver.$(selector);
    assert.strictEqual(await el.getText(), 'عربي');
  });
});
