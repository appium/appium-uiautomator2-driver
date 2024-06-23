import sharp from 'sharp';
import {SCROLL_CAPS} from '../desired';
import {initSession, deleteSession, attemptToDismissAlert} from '../helpers/session';


describe('testViewportCommands', function () {
  /** @type {import('../../../lib/driver').AndroidUiautomator2Driver} */
  let driver;
  let chai;
  let expect;

  const caps = SCROLL_CAPS;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
    expect = chai.expect;

    driver = await initSession(caps);
  });

  after(async function () {
    if (driver) {
      await deleteSession();
    }
  });

  beforeEach(function () {
    attemptToDismissAlert(caps);
  });

  it('should get device pixel ratio, status bar height, and viewport rect', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    const {viewportRect, statBarHeight, pixelRatio} = await driver.getSession();

    expect(pixelRatio).not.to.be.empty;
    expect(statBarHeight).to.be.greaterThan(0);
    expect(viewportRect).to.have.keys(['left', 'top', 'width', 'height']);
  });

  it('should get scrollable element', async function () {
    await expect(driver.$('//*[@scrollable="true"]')).to.eventually.exist;
  });

  it('should get content size from scrollable element found as uiobject', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//*[@scrollable="true"]');
    let contentSize = await scrollableEl.getAttribute('contentSize');
    expect(contentSize).to.exist;
    expect(JSON.parse(contentSize).scrollableOffset).to.exist;
  });

  it('should get content size from scrollable element found as uiobject2', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//android.widget.ScrollView');
    let contentSize = await scrollableEl.getAttribute('contentSize');
    expect(contentSize).to.exist;
    expect(JSON.parse(contentSize).scrollableOffset).to.exist;
  });

  it('should get first element from scrollable element', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//*[@scrollable="true"]');
    expect(await scrollableEl.$('/*[@firstVisible="true"]')).to.eventually.exist;
  });

  it('should get a cropped screenshot of the viewport without statusbar', async function () {
    // TODO: fails on CI with a `Does the current view have 'secure' flag set?` error
    if (process.env.CI) {
      return this.skip();
    }
    const {viewportRect, statBarHeight} = await driver.getSession();
    const fullScreen = await driver.takeScreenshot();
    const viewScreen = await driver.execute('mobile: viewportScreenshot');
    const fullB64 = Buffer.from(fullScreen, 'base64');
    const viewB64 = Buffer.from(viewScreen, 'base64');
    const fullImgMeta = await sharp(fullB64).metadata();
    const viewImgMeta = await sharp(viewB64).metadata();
    viewportRect.top.should.eql(statBarHeight);
    viewImgMeta.height.should.eql(viewportRect.height);
    viewImgMeta.width.should.eql(fullImgMeta.width);
    fullImgMeta.height.should.be.above(viewImgMeta.height);
  });
});
