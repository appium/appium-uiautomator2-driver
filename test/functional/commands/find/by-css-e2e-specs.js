import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - CSS', function () {
  let driver;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id (android resource-id)', async function () {
    await driver.elementByCss('#text1').should.eventually.exist;
    await driver.elementByCss('*[id="android:id/text1"]').should.eventually.exist;
    await driver.elementByCss('*[resource-id="text1"]').should.eventually.exist;
  });
  it('should find an element by content description', async function () {
    await driver.elementByCss('*[description="Animation"]').should.eventually.exist;
  });
  it('should return an array of one element if the `multi` param is true', async function () {
    let els = await driver.elementsByCss('*[content-desc="Animation"]');
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    await driver.elementByCss('*[content-description="Access\'ibility"]').should.eventually.exist;
  });
  it('should find an element by class name', async function () {
    let el = await driver.elementByCss('android.widget.TextView');
    const text = await el.text();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find an element with a chain of attributes and pseudo-classes', async function () {
    let el = await driver.elementByCss('android.widget.TextView[clickable=true]:nth-child(1)');
    await el.text().should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    await driver.elementsByCss('*[focused=true] *[clickable=true]')
      .should.eventually.have.length(1);
  });
});
