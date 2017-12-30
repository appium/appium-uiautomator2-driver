import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import B from 'bluebird';
import { PNG } from 'pngjs';
import { retryInterval } from 'asyncbox';
import { SCROLL_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;

async function waitForElement (strategy, selector) {
  return await retryInterval(10, 3000, driver.findElOrEls.bind(driver), strategy, selector, false);
}

describe('testViewportCommands', function () {
  before(async () => {
    driver = await initDriver(SCROLL_CAPS);
  });
  after(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  it('should get device pixel ratio', async () => {
    let devicePixelRatio = await driver.getDevicePixelRatio();
    devicePixelRatio.should.exist;
    devicePixelRatio.should.not.equal(0);
  });

  it('should get status bar height', async () => {
    let statusBarHeight = await driver.getStatusBarHeight();
    statusBarHeight.should.exist;
    statusBarHeight.should.not.equal(0);
  });

  it('should get viewport rect', async () => {
    let viewportRect = await driver.getViewPortRect();
    viewportRect.should.exist;
    viewportRect.left.should.exist;
    viewportRect.top.should.exist;
    viewportRect.width.should.exist;
    viewportRect.height.should.exist;
  });

  let scrollableElementId;
  it('should get scrollable element', async () => {
    await waitForElement('-android uiautomator', 'new UiSelector().scrollable(true)');
    let element = await driver.findElement('-android uiautomator', 'new UiSelector().scrollable(true)');
    element.should.exist;
  });

  it('should get content size from scrollable element', async () => {
    let contentSize = await driver.getAttribute("contentSize", scrollableElementId);
    contentSize.should.exist;
  });

  it('should get a cropped screenshot of the viewport without statusbar', async () => {
    const {viewportRect, statBarHeight, pixelRatio} = await driver.sessionCapabilities();
    const fullScreen = await driver.takeScreenshot();
    const viewScreen = await driver.execute("mobile: viewportScreenshot");
    const fullB64 = new Buffer(fullScreen, 'base64');
    const viewB64 = new Buffer(viewScreen, 'base64');
    const fullImg = new PNG({filterType: 4});
    await B.promisify(fullImg.parse).call(fullImg, fullB64);
    const viewImg = new PNG({filterType: 4});
    await B.promisify(viewImg.parse).call(viewImg, viewB64);
    viewportRect.top.should.eql(statBarHeight);
    // viewport rect and status bar height are in downscaled pixels, whereas
    // screenshot dimensions are in upscaled pixels. because the downscaled
    // pixels are rounded up, we can't simply multiply them by the pixel ratio
    // to verify the screenshot dimensions. instead we test for a range
    const viewHeightLowBound = Math.floor(viewportRect.height) * 0.99 * pixelRatio;
    const viewHeightHighBound = Math.ceil(viewportRect.height) * 1.01 * pixelRatio;
    viewImg.height.should.be.above(viewHeightLowBound);
    viewImg.height.should.be.below(viewHeightHighBound);
    viewImg.height.should.be.below(fullImg.height);
    viewImg.width.should.eql(fullImg.width);
  });
});

describe('testFirstVisibleElement', function () {
  before(async () => {
    driver = await initDriver(SCROLL_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });

  let scrollableElementId;
  it('should get scrollable element', async () => {
    await waitForElement('-android uiautomator', 'new UiSelector().scrollable(true)');
    let element = await driver.findElement('-android uiautomator', 'new UiSelector().scrollable(true)');
    element.should.exist;
  });

  it('should get first element from scrollable element', async () => {
    let element = await driver.findElOrEls('xpath', '/*[@firstVisible="true"]', false, scrollableElementId);
    element.should.exist;
  });
});
