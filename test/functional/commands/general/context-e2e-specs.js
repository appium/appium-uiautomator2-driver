import { APIDEMOS_CAPS, amendCapabilities } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';

const WEBVIEW = 'WEBVIEW_io.appium.android.apis';
const NATIVE = 'NATIVE_APP';
const NATIVE_LOCATOR = "//*[@class='android.widget.TextView']";
const WEBVIEW_LOCATOR = "//*[text()='This page is a Selenium sandbox']";


describe('apidemo - context', function () {
  let chai;
  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  describe('general', function () {
    let driver;
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
      contexts.length.should.be.at.least(2);

      // make sure the process was found, otherwise it comes out as "undefined"
      contexts.join('').should.not.include('undefined');
      contexts.join('').should.include(WEBVIEW);
    });
    it('should go into the webview', async function () {
      const contexts = await driver.getContexts();
      await driver.switchContext(contexts[1]);
    });
    it('should be able to go into native context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      await driver.switchContext(NATIVE);
      await driver.$(NATIVE_LOCATOR).elementId.should.eventually.exist;
    });
    it.skip('should be able to go into webview context and interact with it after resetting app', async function () {
      await driver.terminateApp('io.appium.android.apis');
      await driver.activateApp('io.appium.android.apis');
      // TODO: WEBVIEW context doesn't exist at this point
      await driver.switchContext(WEBVIEW);
      await driver.$(WEBVIEW_LOCATOR).elementId.should.eventually.exist;
    });
  });

  describe('autoWebview', function () {
    let driver;
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
      context.should.not.eql('NATIVE_APP');
    });
  });
});
