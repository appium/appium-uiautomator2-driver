import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android'
};
let atv = 'android.widget.TextView';
let alv = 'android.widget.ListView';

describe('Find - from element', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find a single element by tag name', async () => {
    let el = await driver.findElOrEls('class name', alv, false);
    let innerEl = await driver.findElOrEls('class name', atv, false, el.ELEMENT);
    await driver.getText(innerEl.ELEMENT).should.eventually.equal("Access'ibility");
  });
  it('should find multiple elements by tag name', async () => {
    let el = await driver.findElOrEls('class name', alv, false);
    let innerEl = await driver.findElOrEls('class name', atv, true, el.ELEMENT);
    await driver.getText(innerEl[0].ELEMENT).should.eventually.have.length.above(10);
  });
});
