import assert from 'node:assert/strict';
import {describe, it, before, after, afterEach} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS, amendCapabilities} from '../../desired.js';
import {isCiApiLevel} from '../../helpers/ci-e2e.js';
import {initSession, deleteSession} from '../../helpers/session.js';

const WEBVIEW = 'WEBVIEW_io.appium.android.apis';
const NATIVE = 'NATIVE_APP';
const NATIVE_LOCATOR = "//*[@class='android.widget.TextView']";
const WEBVIEW_LOCATOR = "//*[text()='This page is a Selenium sandbox']";

// WebView1 activity reliably times out to launch on the API 26 CI emulator (no hw acceleration).
describe('apidemo - context', {skip: isCiApiLevel(26)}, function () {
  describe('general', function () {
    let driver: Browser;
    before(async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:appPackage': 'io.appium.android.apis',
        'appium:appActivity': '.view.WebView1',
        'appium:showChromedriverLog': true,
      });
      driver = await initSession(caps);
    });
    after(async function () {
      await deleteSession();
    });
    it('should find webview context', async function () {
      const contexts = await driver.getContexts();
      assert.ok(contexts.length >= 2);

      // make sure the process was found, otherwise it comes out as "undefined"
      assert.ok(!contexts.join('').includes('undefined'));
      assert.ok(contexts.join('').includes(WEBVIEW));
    });
    it('should go into the webview', async function () {
      const contexts = await driver.getContexts();
      await driver.switchContext(contexts[1]);
    });
    it('should be able to go into native context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      await driver.switchContext(NATIVE);
      assert.ok(await driver.$(NATIVE_LOCATOR).elementId);
    });
    it.skip('should be able to go into webview context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      // TODO: WEBVIEW context doesn't exist at this point
      await driver.switchContext(WEBVIEW);
      assert.ok(await driver.$(WEBVIEW_LOCATOR).elementId);
    });
  });

  describe('autoWebview', function () {
    let driver: Browser;
    afterEach(async function () {
      await deleteSession();
    });
    it('should enter into the webview', async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:appPackage': 'io.appium.android.apis',
        'appium:appActivity': '.view.WebView1',
        'appium:showChromedriverLog': true,
        'appium:autoWebview': true,
        'appium:autoWebviewTimeout': 20000,
      });
      driver = await initSession(caps);
      const context = await driver.getContext();
      assert.notStrictEqual(context, 'NATIVE_APP');
    });
  });
});
