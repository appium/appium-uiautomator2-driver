import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const atv = 'android.widget.TextView';
const f = 'android.widget.FrameLayout';

describe('Find - xpath', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find element by type', async function () {
    const el = await driver.$(`//${atv}`);
    const text = await el.getText();
    expect(text.toLowerCase()).to.equal('api demos');
  });
  it('should find element by text', async function () {
    const el = await driver.$(`//${atv}[@text='Accessibility']`);
    await expect(el.getText()).to.eventually.equal('Accessibility');
  });
  it('should find element by attribute', async function () {
    const els = await driver.$$(`//*[@enabled='true' and @focused='true']`);
    expect(els).to.have.length(1);
  });
  it('should find exactly one element via elementsByXPath', async function () {
    const els = await driver.$$(`//${atv}[@text='Accessibility']`);
    expect(els.length).to.equal(1);
    await expect(els[0].getText()).to.eventually.equal('Accessibility');
  });
  it('should find element by partial text', async function () {
    const el = await driver.$(`//${atv}[contains(@text, 'Accessibility')]`);
    await expect(el.getText()).to.eventually.equal('Accessibility');
  });
  it('should find the last element', async function () {
    const el = await driver.$(`(//${atv})[last()]`);
    const text = await el.getText();
    expect(['OS', 'Text', 'Views', 'Preference']).to.include(text);
  });
  it('should find element by index and embedded desc', async function () {
    const el = await driver.$(`//${f}//${atv}[5]`);
    await expect(el.getText()).to.eventually.equal('Content');
  });
  it('should find all elements', async function () {
    const els = await driver.$$(`//*`);
    expect(els.length).to.be.above(2);
  });
  it('should find the first element when searching for all elements', async function () {
    await expect(driver.$(`//*`).elementId).to.eventually.exist;
  });
  it('should find less elements with compression turned on', async function () {
    await driver.updateSettings({ignoreUnimportantViews: false});
    const elementsWithoutCompression = await driver.$$(`//*`);
    await driver.updateSettings({ignoreUnimportantViews: true});
    const elementsWithCompression = await driver.$$(`//*`);
    expect(elementsWithoutCompression.length).to.be.greaterThan(elementsWithCompression.length);
  });
  it('should find toast message element by text', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.PopupMenu1');
    const popUpEl = await driver.$('~Make a Popup!');
    await popUpEl.waitForDisplayed({timeout: 5000});

    await popUpEl.click();
    const searchEl = await driver.$(`.//*[@text='Search']`);
    await searchEl.waitForDisplayed({timeout: 5000});
    await searchEl.click();
    await expect(driver.$(`//*[@text='Clicked popup menu item Search']`).elementId).to.eventually
      .exist;

    await popUpEl.click();
    const addEl = await driver.$(`.//*[@text='Add']`);
    await addEl.waitForDisplayed({timeout: 5000});
    await addEl.click();
    await expect(driver.$(`//*[@text='Clicked popup menu item Add']`).elementId).to.eventually
      .exist;
  });
});
