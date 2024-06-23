import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('Find - CSS', function () {
  let driver;
  let chai;
  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id (android resource-id)', async function () {
    await driver.$('#android\\:id\\/text1').elementId.should.eventually.exist;
    await driver.$('*[id="android:id/text1"]').elementId.should.eventually.exist;
    await driver.$('*[resource-id="android:id/text1"]').elementId.should.eventually.exist;
  });
  it('should find an element by content description', async function () {
    await driver.$('*[description="Animation"]').elementId.should.eventually.exist;
  });
  it('should return an array with findElements', async function () {
    let els = await driver.$$('*[content-desc="Animation"]');
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    await driver.$('*[content-description="Access\'ibility"]').elementId.should.eventually.exist;
  });
  it('should find an element by class name', async function () {
    let el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find an element with a chain of attributes and pseudo-classes', async function () {
    // TODO: webdriver selects 'class name' strategy.
    // ref. https://github.com/webdriverio/webdriverio/blob/eba541a77dbc42173717e1c106a7c4d3ccb198f5/packages/webdriverio/src/utils/findStrategy.ts#L91-L96
    this.skip();
    let el = await driver.$('android.widget.TextView[clickable=true]:nth-child(1)');
    await el.getText().should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    const els = await driver.$$('*[focused=true] *[clickable=true]');
    els.should.have.length(1);
  });
  it('should find an element by a non-fully qualified class name using CSS tag name', async function () {
    const els = await driver.$$('android.widget.TextView');
    els.length.should.be.above(0);
  });
  it('should find elements using starts with attribute', async function () {
    await driver.$('*[description^="Animation"]').elementId.should.eventually.exist;
  });
  it('should find elements using ends with attribute', async function () {
    await driver.$('*[description$="Animation"]').elementId.should.eventually.exist;
  });
  it('should find elements using word match attribute', async function () {
    await driver.$('*[description~="Animation"]').elementId.should.eventually.exist;
  });
  it('should find elements using wildcard attribute', async function () {
    await driver.$('*[description*="Animation"]').elementId.should.eventually.exist;
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    let selector = '*[text="عربي"]:instance(0)';
    let el = await driver.$(selector);
    await el.getText().should.eventually.equal('عربي');
  });
});
