import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android'
};

describe('Find - uiautomator', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find elements with a boolean argument', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements within the context of another element', async () => {
    let els = await driver
      .findElOrEls('-android uiautomator', 'new UiSelector().className("android.widget.TextView")', true);
    els.length.should.be.above(8);
    els.length.should.be.below(14);
  });
  it('should find elements without prepending "new UiSelector()"', async () => {
    await driver.findElOrEls('-android uiautomator', '.clickable(true)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new UiSelector()"', async () => {
    await driver.findElOrEls('-android uiautomator', '.clickable(true)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new UiSelector()"', async () => {
    await driver.findElOrEls('-android uiautomator', 'clickable(true)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find elements without prepending "new "', async () => {
    await driver.findElOrEls('-android uiautomator', 'UiSelector().clickable(true)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should ignore trailing semicolons', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true);', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with an int argument', async () => {
    let el = await driver.findElOrEls('-android uiautomator', 'new UiSelector().index(0)', false);
    await driver.getName(el.ELEMENT).should.eventually.equal('android.widget.FrameLayout');
  });
  it('should find an element with a string argument', async () => {
    await driver
      .findElOrEls('-android uiautomator', 'new UiSelector().description("Animation")', false)
      .should.eventually.exist;
  });
  it('should find an element with an overloaded method argument', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().className("android.widget.TextView")', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a Class<T> method argument', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().className(android.widget.TextView)', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find an element with a long chain of methods', async () => {
    let el = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true).className(android.widget.TextView).index(1)', false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Accessibility');
  });
  it('should find an element with recursive UiSelectors', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().childSelector(new UiSelector().clickable(true)).clickable(true)', true)
      .should.eventually.have.length(1);
  });
  it('should not find an element which does not exist', async () => {
    await driver.findElOrEls('-android uiautomator', 'new UiSelector().description("chuckwudi")', true)
      .should.eventually.have.length(0);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async () => {
    let clickable = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true)', true);
    clickable.length.should.be.above(0);
    let notClickable = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(false)', true);
    notClickable.length.should.be.above(0);
    let both = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true); new UiSelector().clickable(false);', true);
    both.should.have.length(clickable.length + notClickable.length);
  });
  it('should allow multiple selector statements and return the Union of the two sets', async () => {
    let clickable = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true)', true);
    clickable.length.should.be.above(0);
    let clickableClickable = await driver.findElOrEls('-android uiautomator', 'new UiSelector().clickable(true); new UiSelector().clickable(true);', true);
    clickableClickable.length.should.be.above(0);
    clickableClickable.should.have.length(clickable.length);
  });
  it('should find an element in the second selector if the first finds no elements', async () => {
    let selector = 'new UiSelector().className("not.a.class"); new UiSelector().className("android.widget.TextView")';
    await driver.findElOrEls('-android uiautomator', selector, true)
      .should.eventually.exist;
  });
  it('should scroll to, and return elements using UiScrollable', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Views").instance(0))';
    let el = await driver.findElOrEls('-android uiautomator', selector, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Views');
  });
  it('should allow chaining UiScrollable methods', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).setMaxSearchSwipes(10).scrollIntoView(new UiSelector().text("Views").instance(0))';
    let el = await driver.findElOrEls('-android uiautomator', selector, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Views');
  });
  it('should allow UiScrollable scrollIntoView', async () => {
    let selector = 'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("Views").instance(0));';
    let el = await driver.findElOrEls('-android uiautomator', selector, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Views');
  });
  it('should allow UiScrollable with unicode string', async () => {
    await driver.startActivity('io.appium.android.apis', '.text.Unicode');
    let selector = 'new UiSelector().text("عربي").instance(0);';
    let el = await driver.findElOrEls('-android uiautomator', selector, false);
    await driver.getText(el.ELEMENT).should.eventually.equal('عربي');
  });
});
