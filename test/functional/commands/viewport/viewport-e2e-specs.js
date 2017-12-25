import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
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
    await driver.deleteSession();
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
