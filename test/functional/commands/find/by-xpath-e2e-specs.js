import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


const atv = 'android.widget.TextView';
const f = 'android.widget.FrameLayout';

describe('Find - xpath', function () {
  let driver;
  let chai;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);

    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find element by type', async function () {
    const el = await driver.$(`//${atv}`);
    const text = await el.getText();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find element by text', async function () {
    const el = await driver.$(`//${atv}[@text='Accessibility']`);
    await el.getText().should.eventually.equal('Accessibility');
  });
  it('should find element by attribute', async function () {
    const els = await driver.$$(`//*[@enabled='true' and @focused='true']`);
    els.should.have.length(1);
  });
  it('should find exactly one element via elementsByXPath', async function () {
    const els = await driver.$$(`//${atv}[@text='Accessibility']`);
    els.length.should.equal(1);
    await els[0].getText().should.eventually.equal('Accessibility');
  });
  it('should find element by partial text', async function () {
    const el = await driver.$(`//${atv}[contains(@text, 'Accessibility')]`);
    await el.getText().should.eventually.equal('Accessibility');
  });
  it('should find the last element', async function () {
    const el = await driver.$(`(//${atv})[last()]`);
    const text = await el.getText();
    ['OS', 'Text', 'Views', 'Preference'].should.include(text);
  });
  it('should find element by index and embedded desc', async function () {
    const el = await driver.$(`//${f}//${atv}[5]`);
    await el.getText().should.eventually.equal('Content');
  });
  it('should find all elements', async function () {
    const els = await driver.$$(`//*`);
    els.length.should.be.above(2);
  });
  it('should find the first element when searching for all elements', async function () {
    await driver.$(`//*`).elementId.should.eventually.exist;
  });
  it('should find less elements with compression turned on', async function () {
    await driver.updateSettings({'ignoreUnimportantViews': false});
    const elementsWithoutCompression = await driver.$$(`//*`);
    await driver.updateSettings({'ignoreUnimportantViews': true});
    const elementsWithCompression = await driver.$$(`//*`);
    elementsWithoutCompression.length.should.be.greaterThan(elementsWithCompression.length);
  });
  it('should find toast message element by text', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.PopupMenu1');
    const popUpEl = await driver.$('~Make a Popup!');
    await popUpEl.waitForDisplayed({ timeout: 5000 });

    await popUpEl.click();
    const searchEl = await driver.$(`.//*[@text='Search']`);
    await searchEl.waitForDisplayed({ timeout: 5000 });
    await searchEl.click();
    await driver.$(`//*[@text='Clicked popup menu item Search']`)
        .elementId.should.eventually.exist;

    await popUpEl.click();
    const addEl = await driver.$(`.//*[@text='Add']`);
    await addEl.waitForDisplayed({ timeout: 5000 });
    await addEl.click();
    await driver.$(`//*[@text='Clicked popup menu item Add']`)
        .elementId.should.eventually.exist;
  });
});
