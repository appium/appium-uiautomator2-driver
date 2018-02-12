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
    contexts.join('').should.include('WEBVIEW_io.appium.android.apis');
  });
  it('should go into the webview', async function () {
    // TODO: Fix this on TestObject. Chromedriver does not exist error
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    let contexts = await driver.contexts();
    await driver.context(contexts[1]);
  });
});
