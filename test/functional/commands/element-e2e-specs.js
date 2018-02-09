import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';
import { retryInterval } from 'asyncbox';


chai.should();
chai.use(chaiAsPromised);

describe('element', function () {
  let driver;
  let el;
  before(async function () {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
    el = await retryInterval(5, 1000, async function () {
      let appPackage = await driver.getCurrentPackage();
      let appActivity = await driver.getCurrentActivity();
      console.log('\n\n\nCURRENT:', appPackage, appActivity); // eslint-disable-line
      const els = await driver.elementsByClassName('android.widget.EditText');
      els.should.have.length.at.least(1);
      return _.last(els);
    });
  });
  after(async function () {
    await driver.quit();
  });

  describe('setValue', function () {
    it('should set the text on the element', async function () {
      await el.sendKeys('original value');
      await el.text().should.eventually.equal('original value');
    });
  });
});
