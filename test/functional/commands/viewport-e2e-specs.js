import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sharp from 'sharp';
import { SCROLL_CAPS } from '../desired';
import { initSession, deleteSession, attemptToDismissAlert } from '../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;

describe('testViewportCommands', function () {

  const caps = SCROLL_CAPS;

  before(async function () {
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
    const {viewportRect, statBarHeight, pixelRatio} = await driver.getSession();
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
    let scrollableEl = await driver.$('//*[@scrollable="true"]');
    scrollableEl.should.exist;
  });

  it('should get content size from scrollable element found as uiobject', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//*[@scrollable="true"]');
    let contentSize = await scrollableEl.getAttribute('contentSize');
    contentSize.should.exist;
    JSON.parse(contentSize).scrollableOffset.should.exist;
  });

  it('should get content size from scrollable element found as uiobject2', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//android.widget.ScrollView');
    let contentSize = await scrollableEl.getAttribute('contentSize');
    contentSize.should.exist;
    JSON.parse(contentSize).scrollableOffset.should.exist;
  });

  it('should get first element from scrollable element', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    let scrollableEl = await driver.$('//*[@scrollable="true"]');
    let element = await scrollableEl.$('/*[@firstVisible="true"]');
    element.should.exist;
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
