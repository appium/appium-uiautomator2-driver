import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import {ADB} from 'appium-adb';
import type {Browser} from 'webdriverio';

import {BROWSER_CAPS} from '../../desired.js';
import {isCi} from '../../helpers/ci-e2e.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('w3c actions - webview', {skip: isCi()}, function () {
  let driver: Browser | undefined;

  before(async function () {
    const adb = new ADB();
    const hasChrome = await adb.isAppInstalled('com.android.chrome');
    if (!hasChrome) {
      return;
    }
    driver = await initSession(BROWSER_CAPS);
  });
  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });

  it('should perform a drag and drop via the W3C actions API while proxied to chromedriver', async function (t) {
    if (!driver) {
      return t.skip();
    }
    try {
      // on some chrome systems, we always get the terms and conditions page
      let btn = await driver!.$('id=com.android.chrome:id/terms_accept');
      await btn.click();

      btn = await driver!.$('id=com.android.chrome:id/negative_button');
      await btn.click();
    } catch {
      // ignore
    }

    await driver!.url('https://the-internet.herokuapp.com/drag_and_drop');

    // confirm the driver actually proxied us into the Chrome web content and not native context;
    // a pure browserName session reports 'CHROMIUM', an app's embedded webview reports 'WEBVIEW_<pkg>'
    const context = String(await driver!.getContext());
    assert.ok(context === 'CHROMIUM' || context.startsWith('WEBVIEW'), `Expected a web context, got "${context}"`);

    const columnA = await driver!.$('#column-a');
    const columnB = await driver!.$('#column-b');
    await columnA.waitForExist({timeout: 5000});
    await columnB.waitForExist({timeout: 5000});

    assert.strictEqual((await columnA.getText()).trim(), 'A');
    assert.strictEqual((await columnB.getText()).trim(), 'B');

    // the page relies on native HTML5 drag events (dragstart/dragover/drop/dragend), which
    // only fire off of real pointer input, so drive it with the low-level W3C actions API.
    // Chromedriver needs the pointer to be moved over the drop target repeatedly (not just
    // teleported there in one jump) to keep dispatching dragover and arm the drop.
    let action = driver!
      .action('pointer', {parameters: {pointerType: 'mouse'}})
      .move({duration: 0, origin: columnA})
      .down({button: 0})
      .pause(100);
    for (let i = 0; i < 10; i++) {
      action = action.move({duration: 60, origin: columnB}).pause(40);
    }
    await action.pause(300).up({button: 0}).perform();

    await driver!.waitUntil(async () => (await columnA.getText()).trim() === 'B', {
      timeout: 5000,
      timeoutMsg: 'columns did not swap content after performing the drag and drop actions',
    });

    // content swapped between the two columns
    assert.strictEqual((await columnA.getText()).trim(), 'B');
    assert.strictEqual((await columnB.getText()).trim(), 'A');

    // further validation: dragend must have fired too, resetting the opacity/hover
    // styling set by dragstart/dragenter, proving the full drag lifecycle ran to completion
    const aStyle = ((await columnA.getAttribute('style')) ?? '').replace(/\s/g, '');
    assert.ok(aStyle.includes('opacity:1'), `Expected column-a opacity to be reset, got style="${aStyle}"`);

    const aClass = (await columnA.getAttribute('class')) ?? '';
    const bClass = (await columnB.getAttribute('class')) ?? '';
    assert.ok(!aClass.includes('over'), `Expected column-a to not have the "over" class, got "${aClass}"`);
    assert.ok(!bClass.includes('over'), `Expected column-b to not have the "over" class, got "${bClass}"`);
  });
});
