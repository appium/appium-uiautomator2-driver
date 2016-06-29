import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import sampleApps from 'sample-apps';
import _ from 'lodash';


chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  appActivity: '.view.TextFields'
};

describe('element', function () {
  let el;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(caps);
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
