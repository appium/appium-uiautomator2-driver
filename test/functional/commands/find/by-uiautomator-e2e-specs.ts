import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('Find - uiautomator', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
    await driver.updateSettings({enableNotificationListener: false});
    await driver.setTimeout({implicit: 20000});
  });
  after(async function () {
    await deleteSession();
  });
  it('should find elements with a boolean argument', async function () {
    const els = await driver.$$('android=new UiSelector().clickable(true)');
    assert.ok((await els.length) >= 8);
  });
  it('should find elements within the context of another element', async function () {
    const els = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
    assert.ok((await els.length) > 8);
    assert.ok((await els.length) < 14);
  });
  it('should find elements without prepending "new UiSelector()" relative', async function () {
    const els = await driver.$$('android=.clickable(true)');
    assert.ok((await els.length) >= 8);
  });
  it('should find elements without prepending "new UiSelector()" absolute', async function () {
    const els = await driver.$$('android=clickable(true)');
    assert.ok((await els.length) >= 8);
  });
  it('should find elements without prepending "new "', async function () {
    const els = await driver.$$('android=UiSelector().clickable(true)');
    assert.ok((await els.length) >= 8);
  });
  it('should ignore trailing semicolons', async function () {
    const els = await driver.$$('android=new UiSelector().clickable(true);');
    assert.ok((await els.length) >= 8);
  });
  it('should find an element with an int argument', async function () {
    const el = await driver.$('android=new UiSelector().index(0)');
    assert.strictEqual(await el.getAttribute('className'), 'android.widget.FrameLayout');
  });
  it('should find an element with a string argument', async function () {
    const el = await driver.$('android=new UiSelector().description("Animation")');
    assert.ok(el.elementId);
  });
  it('should find an element with an overloaded method argument', async function () {
    const els = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
    assert.ok((await els.length) >= 8);
  });
  it('should find an element with a Class<T> method argument', async function () {
    const els = await driver.$$('android=new UiSelector().className(android.widget.TextView)');
    assert.ok((await els.length) >= 8);
  });
  it('should find an element with a long chain of methods', async function () {
    const el = await driver.$('android=new UiSelector().clickable(true).className(android.widget.TextView).index(1)');
    assert.strictEqual(await el.getText(), 'Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    const els = await driver.$$(
      'android=new UiSelector().childSelector(new UiSelector().clickable(true)).focused(true)',
    );
    assert.strictEqual(await els.length, 1);
  });
  it('should not find an element which does not exist', async function () {
    await driver.setTimeout({implicit: 1000}); // expect this to fail, so no need to wait too long
    const els = await driver.$$('android=new UiSelector().description("chuckwudi")');
    assert.strictEqual(await els.length, 0);
    await driver.setTimeout({implicit: 20000}); // restore implicit wait
  });
  it('should allow multiple selector statements and return the Union of the two sets containing non clickable elements', async function () {
    const clickableEls = await driver.$$('android=new UiSelector().clickable(true)');
    assert.ok((await clickableEls.length) > 0);
    const notClickableEls = await driver.$$('android=new UiSelector().clickable(false)');
    assert.ok((await notClickableEls.length) > 0);
    const both = await driver.$$('android=new UiSelector().clickable(true); new UiSelector().clickable(false);');
    const clickableLength = await clickableEls.length;
    const notClickableLength = await notClickableEls.length;
    const bothLength = await both.length;
    assert.strictEqual(bothLength, clickableLength + notClickableLength);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async function () {
    const clickableEls = await driver.$$('android=new UiSelector().clickable(true)');
    assert.ok((await clickableEls.length) > 0);
    const clickableClickableEl = await driver.$$(
      'android=new UiSelector().clickable(true); new UiSelector().clickable(true);',
    );
    assert.ok((await clickableClickableEl.length) > 0);
    assert.strictEqual(await clickableClickableEl.length, await clickableEls.length);
  });
  it('should find an element in the second selector if the first finds no elements (when finding multiple elements)', async function () {
    const selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const els = await driver.$$(`android=${selector}`);
    assert.ok((await els.length) > 0);
  });
  it.skip('should find an element in the second selector if the first finds no elements (when finding a single element)', async function () {
    // TODO: This test is broken.
    //  * The test above this one works and it proxies to 'POST /elements'.
    //  * This test doesn't work and the only difference is that it proxies to 'POST /element'
    //  (see find.js for reference)
    const selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const el = await driver.$(`android=${selector}`);
    assert.ok(el.elementId);
  });
  it('should allow selectors using fromParent contruct', async function () {
    const selector =
      'new UiSelector().className("android.widget.ListView").fromParent(new UiSelector().resourceId("android:id/text1"))';
    const el = await driver.$(`android=${selector}`);
    assert.ok(el.elementId);
  });
  it('should scroll to, and return elements using UiScrollable', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector =
      'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    const el = await driver.$(`android=${selector}`);
    assert.strictEqual(await el.getText(), 'Beer Cheese');
  });
  it('should allow chaining UiScrollable methods', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector =
      'new UiScrollable(new UiSelector().scrollable(true).instance(0)).setMaxSearchSwipes(11).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    const el = await driver.$(`android=${selector}`);
    assert.ok(el.elementId);
  });
  it('should allow UiScrollable scrollIntoView', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector =
      'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0));';
    const el = await driver.$(`android=${selector}`);
    assert.strictEqual(await el.getText(), 'Beer Cheese');
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    const selector = 'new UiSelector().text("عربي").instance(0);';
    const el = await driver.$(`android=${selector}`);
    assert.strictEqual(await el.getText(), 'عربي');
  });
});
