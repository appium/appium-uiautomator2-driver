import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('Find - uiautomator', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
    await driver.updateSettings({'enableNotificationListener': false});
    await driver.setTimeout({ implicit: 20000 });
  });
  after(async function () {
    await deleteSession();
  });
  it('should find elements with a boolean argument', async function () {
    const els = await driver.$$('android=new UiSelector().clickable(true)');
    els.should.have.length.at.least(8);
  });
  it('should find elements within the context of another element', async function () {
    const els = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
    els.length.should.be.above(8);
    els.length.should.be.below(14);
  });
  it('should find elements without prepending "new UiSelector()" relative', async function () {
    const els = await driver.$$('android=.clickable(true)');
    els.should.have.length.at.least(8);
  });
  it('should find elements without prepending "new UiSelector()" absolute', async function () {
    const els = await driver.$$('android=clickable(true)');
    els.should.have.length.at.least(8);
  });
  it('should find elements without prepending "new "', async function () {
    const els = await driver.$$('android=UiSelector().clickable(true)');
    els.should.have.length.at.least(8);
  });
  it('should ignore trailing semicolons', async function () {
    const els = await driver.$$('android=new UiSelector().clickable(true);');
    els.should.have.length.at.least(8);
  });
  it('should find an element with an int argument', async function () {
    const el = await driver.$('android=new UiSelector().index(0)');
    await el.getAttribute('className').should.eventually.equal('android.widget.FrameLayout');
  });
  it('should find an element with a string argument', async function () {
    const el = await driver.$('android=new UiSelector().description("Animation")');
    el.elementId.should.exist;
  });
  it('should find an element with an overloaded method argument', async function () {
    const els = await driver.$$('android=new UiSelector().className("android.widget.TextView")');
    els.should.have.length.at.least(8);
  });
  it('should find an element with a Class<T> method argument', async function () {
    const els = await driver.$$('android=new UiSelector().className(android.widget.TextView)');
    els.should.have.length.at.least(8);
  });
  it('should find an element with a long chain of methods', async function () {
    const el = await driver.$('android=new UiSelector().clickable(true).className(android.widget.TextView).index(1)');
    await el.getText().should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async function () {
    const els = await driver.$$('android=new UiSelector().childSelector(new UiSelector().clickable(true)).focused(true)');
    els.should.have.length(1);
  });
  it('should not find an element which does not exist', async function () {
    await driver.setTimeout({ implicit: 1000 }); // expect this to fail, so no need to wait too long
    const els = await driver.$$('android=new UiSelector().description("chuckwudi")');
    els.should.have.length(0);
    await driver.setTimeout({ implicit: 20000 }); // restore implicit wait
  });
  it('should allow multiple selector statements and return the Union of the two sets containing non clickable elements', async function () {
    const clickableEls = await driver.$$('android=new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    const notClickableEls = await driver.$$('android=new UiSelector().clickable(false)');
    notClickableEls.length.should.be.above(0);
    const both = await driver.$$('android=new UiSelector().clickable(true); new UiSelector().clickable(false);');
    both.should.have.length(clickableEls.length + notClickableEls.length);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async function () {
    const clickableEls = await driver.$$('android=new UiSelector().clickable(true)');
    clickableEls.length.should.be.above(0);
    const clickableClickableEl = await driver.$$('android=new UiSelector().clickable(true); new UiSelector().clickable(true);');
    clickableClickableEl.length.should.be.above(0);
    clickableClickableEl.should.have.length(clickableEls.length);
  });
  it('should find an element in the second selector if the first finds no elements (when finding multiple elements)', async function () {
    const selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const els = await driver.$$(`android=${selector}`);
    els.length.should.be.above(0);
  });
  it.skip('should find an element in the second selector if the first finds no elements (when finding a single element)', async function () {
    // TODO: This test is broken.
    //  * The test above this one works and it proxies to 'POST /elements'.
    //  * This test doesn't work and the only difference is that it proxies to 'POST /element'
    //  (see find.js for reference)
    const selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    const el = await driver.$(`android=${selector}`);
    el.elementId.should.exist;
  });
  it('should allow selectors using fromParent contruct', async function () {
    const selector = 'new UiSelector().className("android.widget.ListView").fromParent(new UiSelector().resourceId("android:id/text1"))';
    const el = await driver.$(`android=${selector}`);
    el.elementId.should.exist;
  });
  it('should scroll to, and return elements using UiScrollable', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    const el = await driver.$(`android=${selector}`);
    await el.getText().should.eventually.equal('Beer Cheese');
  });
  it('should allow chaining UiScrollable methods', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).setMaxSearchSwipes(11).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0))';
    const el = await driver.$(`android=${selector}`);
    el.elementId.should.exist;
  });
  it('should allow UiScrollable scrollIntoView', async function () {
    await driver.startActivity('io.appium.android.apis', '.view.List1');
    const selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Beer Cheese").instance(0));';
    const el = await driver.$(`android=${selector}`);
    await el.getText().should.eventually.equal('Beer Cheese');
  });
  it('should allow UiScrollable with unicode string', async function () {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    const selector = 'new UiSelector().text("عربي").instance(0);';
    const el = await driver.$(`android=${selector}`);
    await el.getText().should.eventually.equal('عربي');
  });
});
