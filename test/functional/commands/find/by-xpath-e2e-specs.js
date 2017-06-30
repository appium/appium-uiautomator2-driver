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
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find element by type', async () => {
    let el = await driver.findElOrEls('xpath', `//${atv}`, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('API Demos');
  });
  it('should find element by text', async () => {
    let el = await driver.findElOrEls('xpath', `//${atv}[@text='Accessibility']`, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Accessibility');
  });
  it('should find element by attribute', async () => {
    await driver.findElOrEls('xpath', `//*[@enabled='true' and @focused='true']`, true)
      .should.eventually.have.length(1);
  });
  it('should find exactly one element via elementsByXPath', async () => {
    let el = await driver.findElOrEls('xpath', `//${atv}[@text='Accessibility']`, true);
    el.length.should.equal(1);
    await driver.getText(el[0].ELEMENT).should.eventually.equal('Accessibility');
  });
  it('should find element by partial text', async () => {
    let el = await driver.findElOrEls('xpath', `//${atv}[contains(@text, 'Accessibility')]`, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Accessibility');
  });
  it('should find the last element', async () => {
    let el = await driver.findElOrEls('xpath', `(//${atv})[last()]`, false);
    let text = await driver.getText(el.ELEMENT);
    ["OS", "Text", "Views", "Preference"].should.include(text);
  });
  it('should find element by index and embedded desc', async () => {
    let el = await driver.findElOrEls('xpath', `//${f}//${atv}[5]`, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Content');
  });
  it('should find all elements', async () => {
    let el = await driver.findElOrEls('xpath', `//*`, true);
    el.length.should.be.above(2);
  });
  it('should find the first element when searching for all elements', async () => {
    let el = await driver.findElOrEls('xpath', `//*`, true);
    el[0].should.exist;
  });
  it('should find less elements with compression turned on', async () => {
    await driver.updateSettings({"ignoreUnimportantViews": false});
    let elementsWithoutCompression = await driver.findElOrEls('xpath', `//*`, true);
    await driver.updateSettings({"ignoreUnimportantViews": true});
    let elementsWithCompression = await driver.findElOrEls('xpath', `//*`, true);
    elementsWithoutCompression.length.should.be.greaterThan(elementsWithCompression.length);
  });
  it('should find toast message element by text @skip-ci', async function () {
    // skip on travis, as it is too slow and the message is removed before
    // we can find it

    await driver.startActivity(`io.appium.android.apis`, `.view.PopupMenu1`);
    await driver.implicitWait(20000);
    let popUp = await driver.findElOrEls('accessibility id', 'Make a Popup!', false);
    let  popUpEl = popUp.ELEMENT;

    await driver.click(popUpEl);
    let search = await driver.findElOrEls('xpath', `.//*[@text='Search']`, false);
    await driver.click(search.ELEMENT);
    await driver.findElOrEls('xpath', `//*[@text='Clicked popup menu item Search']`, false)
        .should.eventually.exist;

    await driver.click(popUpEl);
    let add =await driver.findElOrEls('xpath', `.//*[@text='Add']`, false);
    await driver.click(add.ELEMENT);
    await driver.findElOrEls('xpath', `//*[@text='Clicked popup menu item Add']`, false)
        .should.eventually.exist;
  });
});
