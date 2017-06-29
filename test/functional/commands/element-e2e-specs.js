import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import _ from 'lodash';
import { APIDEMOS_CAPS } from '../desired';


chai.should();
chai.use(chaiAsPromised);

describe('element', function () {
  let driver;
  let el;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.TextFields'}));
    el = _.last(await driver.findElOrEls('class name', 'android.widget.EditText', true));
    el.should.exist;
  });
  after(async () => {
    await driver.deleteSession();
  });

  describe('setValue', () => {
    it('should set the text on the element', async () => {
      await driver.setValue('original value', el.ELEMENT);
      await driver.getText(el.ELEMENT).should.eventually.equal('original value');
    });
  });
});
