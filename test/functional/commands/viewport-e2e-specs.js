import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';
import { PNG } from 'pngjs';
import { SCROLL_CAPS } from '../desired';
import { initDriver } from '../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;

describe('testViewportCommands', function () {
  before(async function () {
    driver = await initDriver(SCROLL_CAPS);
  });
  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('should get device pixel ratio, status bar height, and viewport rect', async function () {
    const {viewportRect, statBarHeight, pixelRatio} = await driver.sessionCapabilities();
    pixelRatio.should.exist;
    pixelRatio.should.not.equal(0);
    statBarHeight.should.exist;
    statBarHeight.should.not.equal(0);
    viewportRect.should.exist;
    viewportRect.left.should.exist;
    viewportRect.top.should.exist;
    viewportRect.width.should.exist;
    viewportRect.height.should.exist;
  });

  it('should get scrollable element', async function () {
    let scrollableEl = await driver.elementByXPath('//*[@scrollable="true"]');
    scrollableEl.should.exist;
  });

  it('should get content size from scrollable element found as uiobject', async function () {
    let scrollableEl = await driver.elementByXPath('//*[@scrollable="true"]');
    let contentSize = await scrollableEl.getAttribute("contentSize");
    contentSize.should.exist;
    JSON.parse(contentSize).scrollableOffset.should.exist;
  });

  it('should get content size from scrollable element found as uiobject2', async function () {
    let scrollableEl = await driver.elementByXPath('//android.widget.ScrollView');
    let contentSize = await scrollableEl.getAttribute("contentSize");
    contentSize.should.exist;
    JSON.parse(contentSize).scrollableOffset.should.exist;
  });

  it('should get first element from scrollable element', async function () {
    let scrollableEl = await driver.elementByXPath('//*[@scrollable="true"]');
    let element = await scrollableEl.elementByXPath('/*[@firstVisible="true"]');
    element.should.exist;
  });

  it('should get a cropped screenshot of the viewport without statusbar', async function () {
    // TODO: fails on CI with a `Does the current view have 'secure' flag set?` error
    if (process.env.CI) {
      return this.skip();
    }
    const {viewportRect, statBarHeight} = await driver.sessionCapabilities();
    const fullScreen = await driver.takeScreenshot();
    const viewScreen = await driver.execute("mobile: viewportScreenshot");
    const fullB64 = new Buffer(fullScreen, 'base64');
    const viewB64 = new Buffer(viewScreen, 'base64');
    const fullImg = new PNG({filterType: 4});
    await B.promisify(fullImg.parse).call(fullImg, fullB64);
    const viewImg = new PNG({filterType: 4});
    await B.promisify(viewImg.parse).call(viewImg, viewB64);
    viewportRect.top.should.eql(statBarHeight);
    viewImg.height.should.eql(viewportRect.height);
    viewImg.width.should.eql(fullImg.width);
    fullImg.height.should.be.above(viewImg.height);
  });
});
