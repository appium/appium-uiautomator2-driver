import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - uiautomator', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
    await driver.updateSettings({'enableNotificationListener': false});
    await driver.setImplicitWaitTimeout(20000);
  });
  after(async function () {
    await driver.quit();
  });
  it('should find elements with a boolean argument', async function () {
    await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements within the context of another element', async function () {
    let els = await driver
      .elementsByAndroidUIAutomator('new UiSelector().className("android.widget.TextView")');
    els.length.should.be.above(8);
    els.length.should.be.below(14);
  });
  it('should find elements without prepending "new UiSelector()"', async function () {
    await driver.elementsByAndroidUIAutomator('.clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new UiSelector()"', async function () {
    await driver.elementsByAndroidUIAutomator('clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new "', async function () {
    await driver.elementsByAndroidUIAutomator('UiSelector().clickable(true)')
      .should.eventually.have.length.at.least(10);
  });
  it('should ignore trailing semicolons', async function () {
    await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true);')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with an int argument', async function () {
    let el = await driver.elementByAndroidUIAutomator('new UiSelector().index(0)');
    await el.getAttribute('className').should.eventually.equal('android.widget.FrameLayout');
  });
  it('should find an element with a string argument', async function () {
    await driver
      .elementByAndroidUIAutomator('new UiSelector().description("Animation")')
      .should.eventually.exist;
  });
  it('should find an element with an overloaded method argument', async function () {
    await driver.elementsByAndroidUIAutomator('new UiSelector().className("android.widget.TextView")')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a Class<T> method argument', async function () {
    await driver.elementsByAndroidUIAutomator('new UiSelector().className(android.widget.TextView)')
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a long chain of methods', async function () {
    let el = await driver.elementByAndroidUIAutomator('new UiSelector().clickable(true).className(android.widget.TextView).index(1)');
    await el.text().should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    await driver.elementsByAndroidUIAutomator('new UiSelector().childSelector(new UiSelector().clickable(true)).focused(true)')
      .should.eventually.have.length(1);
  });
  it('should not find an element which does not exist', async function () {
    await driver.setImplicitWaitTimeout(1000); // expect this to fail, so no need to wait too long
    await driver.elementsByAndroidUIAutomator('new UiSelector().description("chuckwudi")')
      .should.eventually.have.length(0);
    await driver.setImplicitWaitTimeout(20000); // restore implicit wait
  });
  it('should allow multiple selector statements and return the Union of the two sets', async function () {
    let clickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    let notClickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(false)');
    notClickableEls.length.should.be.above(0);
    let both = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true); new UiSelector().clickable(false);');
    both.should.have.length(clickableEls.length + notClickableEls.length);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async function () {
    let clickableEls = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    let clickableClickableEl = await driver.elementsByAndroidUIAutomator('new UiSelector().clickable(true); new UiSelector().clickable(true);');
    clickableClickableEl.length.should.be.above(0);
    clickableClickableEl.should.have.length(clickableEls.length);
  });
  it('should find an element in the second selector if the first finds no elements (when finding multiple elements)', async function () {
    let selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const els = await driver.elementsByAndroidUIAutomator(selector);
    els.length.should.be.above(0);
  });
  it.skip('should find an element in the second selector if the first finds no elements (when finding a single element)', async function () {
    // TODO: This test is broken.
    //  * The test above this one works and it proxies to 'POST /elements'.
    //  * This test doesn't work and the only difference is that it proxies to 'POST /element'
    //  (see find.js for reference)
    let selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    await driver.elementByAndroidUIAutomator(selector).should.eventually.exist;
  });
  it('should scroll to, and return elements using UiScrollable', async function () {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.view.List1'});
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Beer Cheese');
  });
  it('should allow chaining UiScrollable methods', async function () {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.view.List1'});
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).setMaxSearchSwipes(11).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Beer Cheese');
  });
  it('should allow UiScrollable scrollIntoView', async function () {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.view.List1'});
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0));';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('Beer Cheese');
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: '.text.Unicode'});
    let selector = 'new UiSelector().text("عربي").instance(0);';
    let el = await driver.elementByAndroidUIAutomator(selector);
    await el.text().should.eventually.equal('عربي');
  });
});
