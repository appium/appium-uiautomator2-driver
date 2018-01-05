import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _ from 'lodash';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('element', function () {
  let driver;
  let el;
  before(async () => {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
    el = _.last(await driver.elementsByClassName('android.widget.EditText'));
  });
  after(async () => {
    await driver.quit();
  });

  describe('setValue', () => {
    it('should set the text on the element', async () => {
      await el.sendKeys('original value');
      await el.text().should.eventually.equal('original value');
    });
  });
});
