import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - uiautomator', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
    await driver.setImplicitWaitTimeout(20000);
  });
  after(async () => {
    await driver.quit();
  });
  it('should find elements with a boolean argument', async () => {
    await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements within the context of another element', async () => {
    let els = await driver
      .elementsByAndroidUIAutomator('new UiSelector().className("android.widget.TextView")');
    els.length.should.be.above(8);
    els.length.should.be.below(14);
  });
  it('should find elements without prepending "new UiSelector()"', async () => {
    await driver.elementsByAndroidUIAutomator('.clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new UiSelector()"', async () => {
    await driver.elementsByAndroidUIAutomator('clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new "', async () => {
    await driver.elementsByAndroidUIAutomator('UiSelector().clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should ignore trailing semicolons', async () => {
    await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true);')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with an int argument', async () => {
    let el = await driver.elementByAndroidUIAutomator('new UiSelector().index(0)');
    await el.getAttribute('className').should.eventually.equal('android.widget.FrameLayout');
  });
  it('should find an element with a string argument', async () => {
    await driver
      .elementByAndroidUIAutomator('new UiSelector().description("Animation")')
      .should.eventually.exist;
  });
  it('should find an element with an overloaded method argument', async () => {
    await driver.elementsByAndroidUIAutomator('new UiSelector().className("android.widget.TextView")')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a Class<T> method argument', async () => {
    await driver.elementsByAndroidUIAutomator('new UiSelector().className(android.widget.TextView)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a long chain of methods', async () => {
    let el = await driver.elementByAndroidUIAutomator('new UiSelector().clickable(true).className(android.widget.TextView).index(1)');
    await el.text().should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async () => {
    await driver.elementsByAndroidUIAutomator('new UiSelector().childSelector(new UiSelector().clickable(true)).focused(true)')
      .should.eventually.have.length(1);
  });
  it('should not find an element which does not exist', async () => {
    await driver.setImplicitWaitTimeout(1000); // expect this to fail, so no need to wait too long
    await driver.elementsByAndroidUIAutomator('new UiSelector().description("chuckwudi")')
      .should.eventually.have.length(0);
    await driver.setImplicitWaitTimeout(20000); // restore implicit wait
  });
  it('should allow multiple selector statements and return the Union of the two sets', async () => {
    let clickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    let notClickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(false)');
    notClickableEls.length.should.be.above(0);
    let both = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true); new UiSelector().clickable(false);');
    both.should.have.length(clickableEls.length + notClickableEls.length);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async () => {
    let clickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    let clickableClickableEl = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true); new UiSelector().clickable(true);');
    clickableClickableEl.length.should.be.above(0);
    clickableClickableEl.should.have.length(clickableEls.length);
  });
  it('should find an element in the second selector if the first finds no elements (when finding multiple elements)', async () => {
    let selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const els = await driver.elementsByAndroidUIAutomator(selector);
    els.length.should.be.above(0);
  });
  it.skip('should find an element in the second selector if the first finds no elements (when finding a single element)', async () => {
    // TODO: This test is broken.
    //  * The test above this one works and it proxies to 'POST /elements'.
    //  * This test doesn't work and the only difference is that it proxies to 'POST /element'
    //  (see find.js for reference)
    let selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    await driver.elementByAndroidUIAutomator(selector).should.eventually.exist;
  });
  it('should scroll to, and return elements using UiScrollable', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Views").instance(0))';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Views');
  });
  it('should allow chaining UiScrollable methods', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).setMaxSearchSwipes(10).scrollIntoView(new UiSelector().text("Views").instance(0))';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Views');
  });
  it('should allow UiScrollable scrollIntoView', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Views").instance(0));';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Views');
  });
  it('should allow UiScrollable with unicode string', async () => {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.text.Unicode'});
    let selector = 'new UiSelector().text("عربي").instance(0);';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('عربي');
  });
});
