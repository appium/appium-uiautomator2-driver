import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { BROWSER_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = Object.assign({}, BROWSER_CAPS);

describe('setUrl @skip-ci', function () {
  before(async function () {
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }
    driver = await initDriver(caps);
  });
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should be able to start a data uri via setUrl', async function () {
    if (caps.browserName === 'Chrome') {
      try {
        // on some chrome systems, we always get the terms and conditions page
        let btn = await driver.elementById('com.android.chrome:id/terms_accept');
        await btn.click();

        btn = await driver.elementById('com.android.chrome:id/negative_button');
        await btn.click();
      } catch (ign) {}
    }

    await driver.get('http://saucelabs.com');

    await driver.waitForElementByTagName("title");
    let el = await driver.elementByTagName("title");
    await el.getAttribute("innerHTML").should.eventually.include('Sauce Labs');
  });
});
