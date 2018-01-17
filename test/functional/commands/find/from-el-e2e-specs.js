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
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });
  it('should find a single element by tag name', async function () {
    let el = await driver.elementByClassName(alv);
    let innerEl = await el.elementByClassName(atv);
    await innerEl.text().should.eventually.equal("Access'ibility");
  });
  it('should find multiple elements by tag name', async function () {
    let el = await driver.elementByClassName(alv);
    let innerEls = await el.elementsByClassName(atv);
    await innerEls.should.have.length.above(9);
  });
});
