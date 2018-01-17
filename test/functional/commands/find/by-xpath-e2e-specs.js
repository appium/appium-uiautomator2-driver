import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const atv = 'android.widget.TextView';
const f = "android.widget.FrameLayout";

describe('Find - xpath', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });
  it('should find element by type', async function () {
    let el = await driver.elementByXPath(`//${atv}`);
    const text = await el.text();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find element by text', async function () {
    let el = await driver.elementByXPath(`//${atv}[@text='Accessibility']`);
    await el.text().should.eventually.equal('Accessibility');
  });
  it('should find element by attribute', async function () {
    await driver.elementsByXPath(`//*[@enabled='true' and @focused='true']`)
      .should.eventually.have.length(1);
  });
  it('should find exactly one element via elementsByXPath', async function () {
    let els = await driver.elementsByXPath(`//${atv}[@text='Accessibility']`);
    els.length.should.equal(1);
    await els[0].text().should.eventually.equal('Accessibility');
  });
  it('should find element by partial text', async function () {
    let el = await driver.elementByXPath(`//${atv}[contains(@text, 'Accessibility')]`);
    await el.text().should.eventually.equal('Accessibility');
  });
  it('should find the last element', async function () {
    let el = await driver.elementByXPath(`(//${atv})[last()]`);
    let text = await el.text();
    ["OS", "Text", "Views", "Preference"].should.include(text);
  });
  it('should find element by index and embedded desc', async function () {
    let el = await driver.elementByXPath(`//${f}//${atv}[5]`);
    await el.text().should.eventually.equal('Content');
  });
  it('should find all elements', async function () {
    let els = await driver.elementsByXPath(`//*`);
    els.length.should.be.above(2);
  });
  it('should find the first element when searching for all elements', async function () {
    let el = await driver.elementByXPath(`//*`);
    el.should.exist;
  });
  it('should find less elements with compression turned on', async function () {
    await driver.updateSettings({"ignoreUnimportantViews": false});
    let elementsWithoutCompression = await driver.elementsByXPath(`//*`);
    await driver.updateSettings({"ignoreUnimportantViews": true});
    let elementsWithCompression = await driver.elementsByXPath(`//*`);
    elementsWithoutCompression.length.should.be.greaterThan(elementsWithCompression.length);
  });
  it('should find toast message element by text @skip-ci', async function () {
    // skip on travis, as it is too slow and the message is removed before
    // we can find it
    if (process.env.TESTOBJECT_E2E_TESTS) {
      this.skip();
    }

    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.view.PopupMenu1'});
    await driver.waitForElementByAccessibilityId('Make a Popup!');
    let popUpEl = await driver.elementByAccessibilityId('Make a Popup!');

    await popUpEl.click();
    await driver.waitForElementByXPath(`.//*[@text='Search']`);
    let searchEl = await driver.elementByXPath(`.//*[@text='Search']`);
    await searchEl.click();
    await driver.elementByXPath(`//*[@text='Clicked popup menu item Search']`)
        .should.eventually.exist;

    await popUpEl.click();
    await driver.waitForElementByXPath(`.//*[@text='Add']`);
    let addEl = await driver.elementByXPath(`.//*[@text='Add']`);
    await addEl.click();
    await driver.elementByXPath(`//*[@text='Clicked popup menu item Add']`)
        .should.eventually.exist;
  });
});
