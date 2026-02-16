import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Find - CSS', function () {
  let driver: Browser;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id (android resource-id)', async function () {
    await expect(driver.$('#android\\:id\\/text1').elementId).to.eventually.exist;
    await expect(driver.$('*[id="android:id/text1"]').elementId).to.eventually.exist;
    await expect(driver.$('*[resource-id="android:id/text1"]').elementId).to.eventually.exist;
  });
  it('should find an element by content description', async function () {
    await expect(driver.$('*[description="Animation"]').elementId).to.eventually.exist;
  });
  it('should return an array with findElements', async function () {
    const els = await driver.$$('*[content-desc="Animation"]');
    expect(els).to.be.an.instanceof(Array);
    expect(els).to.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    await expect(driver.$('*[content-description="Access\'ibility"]').elementId).to.eventually
      .exist;
  });
  it('should find an element by class name', async function () {
    const el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    expect(text.toLowerCase()).to.equal('api demos');
  });
  it('should find an element with a chain of attributes and pseudo-classes', async function () {
    // TODO: webdriver selects 'class name' strategy.
    // ref. https://github.com/webdriverio/webdriverio/blob/eba541a77dbc42173717e1c106a7c4d3ccb198f5/packages/webdriverio/src/utils/findStrategy.ts#L91-L96
    this.skip();
    const el = await driver.$('android.widget.TextView[clickable=true]:nth-child(1)');
    await expect(el.getText()).to.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    const els = await driver.$$('*[focused=true] *[clickable=true]');
    expect(els).to.have.length(1);
  });
  it('should find an element by a non-fully qualified class name using CSS tag name', async function () {
    const els = await driver.$$('android.widget.TextView');
    expect(els.length).to.be.above(0);
  });
  it('should find elements using starts with attribute', async function () {
    await expect(driver.$('*[description^="Animation"]').elementId).to.eventually.exist;
  });
  it('should find elements using ends with attribute', async function () {
    await expect(driver.$('*[description$="Animation"]').elementId).to.eventually.exist;
  });
  it('should find elements using word match attribute', async function () {
    await expect(driver.$('*[description~="Animation"]').elementId).to.eventually.exist;
  });
  it('should find elements using wildcard attribute', async function () {
    await expect(driver.$('*[description*="Animation"]').elementId).to.eventually.exist;
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    const selector = '*[text="عربي"]:instance(0)';
    const el = await driver.$(selector);
    await expect(el.getText()).to.eventually.equal('عربي');
  });
});
