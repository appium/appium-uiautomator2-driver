import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const atv = 'android.widget.TextView';
const alv = 'android.widget.ListView';

describe('Find - from element', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
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
