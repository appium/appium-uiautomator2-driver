import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BROWSER_CAPS } from '../desired';
import ADB from 'appium-adb';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = Object.assign({}, BROWSER_CAPS);

describe('setUrl @skip-ci', function () {
  let urlId = 'com.android.browser:id/url';
  before(async function () {
    let adb = new ADB();
    if (!await adb.isAppInstalled('com.android.browser')) {
      if (!await adb.isAppInstalled('com.android.chrome')) {
        throw new Error('Neither default browser nor chrome available');
      }
      // `browser` is not available, so use `Chrome`
      caps.browserName = 'Chrome';
      urlId = 'com.android.chrome:id/url_bar';
    }

    driver = await initDriver(caps);
  });
  after(async () => {
    if (driver) {
      await driver.deleteSession();
    }
  });

  it('should be able to start a data uri via setUrl', async () => {
    if (caps.browserName === 'Chrome') {
      try {
        // on some chrome systems, we always get the terms and conditions page
        let btn = await driver.findElOrEls('id', 'com.android.chrome:id/terms_accept', false);
        await driver.click(btn.ELEMENT);

        btn = await driver.findElOrEls('id', 'com.android.chrome:id/negative_button', false);
        await driver.click(btn.ELEMENT);
      } catch (ign) {}
    }

    await driver.setUrl('http://saucelabs.com');

    let el = await driver.findElOrEls('id', urlId, false);
    await driver.getText(el.ELEMENT).should.eventually.include('saucelabs.com');
  });
});
