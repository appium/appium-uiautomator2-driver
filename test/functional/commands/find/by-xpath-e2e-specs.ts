import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {waitForElementByXpath} from '../../helpers/wait-for-ui.js';

const atv = 'android.widget.TextView';
const f = 'android.widget.FrameLayout';

describe('Find - xpath', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find element by type', async function () {
    const el = await driver.$(`//${atv}`);
    const text = await el.getText();
    assert.strictEqual(text.toLowerCase(), 'api demos');
  });
  it('should find element by text', async function () {
    const el = await driver.$(`//${atv}[@text='Accessibility']`);
    assert.strictEqual(await el.getText(), 'Accessibility');
  });
  it('should find element by attribute', async function () {
    const els = await driver.$$(`//*[@enabled='true' and @focused='true']`);
    assert.strictEqual(await els.length, 1);
  });
  it('should find exactly one element via elementsByXPath', async function () {
    const els = await driver.$$(`//${atv}[@text='Accessibility']`);
    assert.strictEqual(await els.length, 1);
    assert.strictEqual(await els[0].getText(), 'Accessibility');
  });
  it('should find element by partial text', async function () {
    const el = await driver.$(`//${atv}[contains(@text, 'Accessibility')]`);
    assert.strictEqual(await el.getText(), 'Accessibility');
  });
  it('should find the last element', async function () {
    const el = await driver.$(`(//${atv})[last()]`);
    const text = await el.getText();
    assert.ok(['OS', 'Text', 'Views', 'Preference'].includes(text));
  });
  it('should find element by index and embedded desc', async function () {
    const el = await driver.$(`//${f}//${atv}[5]`);
    assert.strictEqual(await el.getText(), 'Content');
  });
  it('should find all elements', async function () {
    const els = await driver.$$(`//*`);
    assert.ok((await els.length) > 2);
  });
  it('should find the first element when searching for all elements', async function () {
    assert.ok(await driver.$(`//*`).elementId);
  });
  it('should find less elements with compression turned on', async function () {
    await driver.updateSettings({ignoreUnimportantViews: false});
    const elementsWithoutCompression = await driver.$$(`//*`);
    await driver.updateSettings({ignoreUnimportantViews: true});
    const elementsWithCompression = await driver.$$(`//*`);
    assert.ok((await elementsWithoutCompression.length) > (await elementsWithCompression.length));
  });
  it('should find toast message element by text', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.PopupMenu1');
    const popUpEl = await driver.$('~Make a Popup!');
    await popUpEl.waitForDisplayed({timeout: 5000});

    await popUpEl.click();
    const searchEl = await driver.$(`.//*[@text='Search']`);
    await searchEl.waitForDisplayed({timeout: 5000});
    await searchEl.click();
    await waitForElementByXpath(driver, `//*[@text='Clicked popup menu item Search']`);

    await popUpEl.click();
    const addEl = await driver.$(`.//*[@text='Add']`);
    await addEl.waitForDisplayed({timeout: 5000});
    await addEl.click();
    await waitForElementByXpath(driver, `//*[@text='Clicked popup menu item Add']`);
  });
});
