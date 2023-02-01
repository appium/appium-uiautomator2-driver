import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - from element', function () {
  const atv = 'android.widget.TextView';
  const alv = 'android.widget.ListView';
  let driver;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find a single element by tag name', async function () {
    const el = await driver.$(alv);
    const innerEl = await el.$(atv);
    await innerEl.getText().should.eventually.equal("Access'ibility");
  });
  it('should find multiple elements by tag name', async function () {
    const el = await driver.$(alv);
    const innerEls = await el.$$(atv);
    innerEls.should.have.length.above(1);
  });
});
