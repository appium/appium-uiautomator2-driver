import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';
import _ from 'lodash';


chai.should();
chai.use(chaiAsPromised);

const caps = _.defaults({
  appPackage: 'io.appium.android.apis',
  appActivity: '.view.WebView1',
  showChromedriverLog: true,
}, APIDEMOS_CAPS);
const WEBVIEW = 'WEBVIEW_io.appium.android.apis';
const NATIVE = 'NATIVE_APP';
const NATIVE_LOCATOR = "//*[@class='android.widget.TextView']";
const WEBVIEW_LOCATOR = "//*[text()='This page is a Selenium sandbox']";

describe('apidemo - context', function () {
  let driver;
  before(async function () {
    driver = await initDriver(caps);
  });
  after(async function () {
    await driver.quit();
  });
  it('should find webview context', async function () {
    let contexts = await driver.contexts();
    contexts.length.should.be.at.least(2);

    // make sure the process was found, otherwise it comes out as "undefined"
    contexts.join('').should.not.include('undefined');
    contexts.join('').should.include(WEBVIEW);
  });
  it('should go into the webview', async function () {
    // TODO: Fix this on TestObject. Chromedriver does not exist error
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    let contexts = await driver.contexts();
    await driver.context(contexts[1]);
  });
  it('should be able to go into native context and interact with it after restarting app', async function () {
    await driver.closeApp();
    await driver.launchApp();
    await driver.context(NATIVE);
    await driver.elementByXPath(NATIVE_LOCATOR);
  });
  it('should be able to go into native context and interact with it after resetting app', async function () {
    await driver.resetApp();
    await driver.context(NATIVE);
    await driver.elementByXPath(NATIVE_LOCATOR);
  });
  it('should be able to go into webview context and interact with it after restarting app', async function () {
    // TODO: Fix this on TestObject. Chromedriver does not exist error
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    await driver.closeApp();
    await driver.launchApp();
    await driver.context(WEBVIEW);
    await driver.elementByXPath(WEBVIEW_LOCATOR);
  });
  it('should be able to go into webview context and interact with it after resetting app', async function () {
    // TODO: Fix this on TestObject. Chromedriver does not exist error
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    await driver.resetApp();
    await driver.context(WEBVIEW);
    await driver.elementByXPath(WEBVIEW_LOCATOR);
  });
});
