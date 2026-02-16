import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS, amendCapabilities} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const WEBVIEW = 'WEBVIEW_io.appium.android.apis';
const NATIVE = 'NATIVE_APP';
const NATIVE_LOCATOR = "//*[@class='android.widget.TextView']";
const WEBVIEW_LOCATOR = "//*[text()='This page is a Selenium sandbox']";

describe('apidemo - context', function () {
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
      expect(contexts.length).to.be.at.least(2);

      // make sure the process was found, otherwise it comes out as "undefined"
      expect(contexts.join('')).to.not.include('undefined');
      expect(contexts.join('')).to.include(WEBVIEW);
    });
    it('should go into the webview', async function () {
      const contexts = await driver.getContexts();
      await driver.switchContext(contexts[1]);
    });
    it('should be able to go into native context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      await driver.switchContext(NATIVE);
      await expect(driver.$(NATIVE_LOCATOR).elementId).to.eventually.exist;
    });
    it.skip('should be able to go into webview context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      // TODO: WEBVIEW context doesn't exist at this point
      await driver.switchContext(WEBVIEW);
      await expect(driver.$(WEBVIEW_LOCATOR).elementId).to.eventually.exist;
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
      expect(context).to.not.eql('NATIVE_APP');
    });
  });
});
