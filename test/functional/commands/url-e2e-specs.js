import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import { BROWSER_CAPS } from '../desired';

chai.should();
chai.use(chaiAsPromised);

describe('setUrl', function (){
  let driver;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(BROWSER_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should be able to start a data uri via setUrl', async () => {
    await driver.setUrl('http://saucelabs.com');
    let el = await driver.findElOrEls('id', 'com.android.browser:id/url', false);
    await driver.getText(el.ELEMENT).should.eventually.include('saucelabs.com');
  });
});
