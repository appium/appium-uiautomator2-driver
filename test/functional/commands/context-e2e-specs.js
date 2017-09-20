import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';
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
  before(async () => {
    driver = await initDriver(caps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find webview context', async () => {
    let contexts = await driver.getContexts();
    contexts.length.should.be.at.least(2);

    // make sure the process was found, otherwise it comes out as "undefined"
    contexts.join('').should.not.include('undefined');
    contexts.join('').should.include('WEBVIEW_io.appium.android.apis');
  });
  it('should go into the webview', async () => {
    let contexts = await driver.getContexts();
    await driver.setContext(contexts[1]);
  });
});
