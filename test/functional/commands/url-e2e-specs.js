import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  appPackage: 'com.android.browser',
  appActivity: '.BrowserActivity',
  deviceName: 'Android',
  platformName: 'Android'
};

describe('setUrl', function (){
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
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
