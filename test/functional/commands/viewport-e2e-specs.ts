import type {Browser} from 'webdriverio';
import sharp from 'sharp';
import {SCROLL_CAPS} from '../desired';
import {initSession, deleteSession, attemptToDismissAlert} from '../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('testViewportCommands', function () {
  let driver: Browser;
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
    if (process.env.CI) {
      return this.skip();
    }

    const {viewportRect, statBarHeight, pixelRatio} = (await driver.getSession()) as any;

    expect(pixelRatio).not.to.be.empty;
    expect(statBarHeight).to.be.greaterThan(0);
    expect(viewportRect).to.have.keys(['left', 'top', 'width', 'height']);
  });

  it('should get scrollable element', async function () {
    await expect(driver.$('//*[@scrollable="true"]').elementId).to.eventually.exist;
  });

  it('should get content size from scrollable element found as uiobject', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    const scrollableEl = await driver.$('//*[@scrollable="true"]');
    const contentSize = await scrollableEl.getAttribute('contentSize');
    expect(contentSize).to.exist;
    expect(JSON.parse(contentSize as string).scrollableOffset).to.exist;
  });

  it('should get content size from scrollable element found as uiobject2', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    const scrollableEl = await driver.$('//android.widget.ScrollView');
    const contentSize = await scrollableEl.getAttribute('contentSize');
    expect(contentSize).to.exist;
    expect(JSON.parse(contentSize as string).scrollableOffset).to.exist;
  });

  it('should get first element from scrollable element', async function () {
    if (process.env.CI) {
      return this.skip();
    }

    const scrollableEl = await driver.$('//*[@scrollable="true"]');
    await expect(scrollableEl.$('/*[@firstVisible="true"]').elementId).to.eventually.exist;
  });

  it('should get a cropped screenshot of the viewport without statusbar', async function () {
    // TODO: fails on CI with a `Does the current view have 'secure' flag set?` error
    if (process.env.CI) {
      return this.skip();
    }
    const {viewportRect, statBarHeight} = (await driver.getSession()) as any;
    const fullScreen = await driver.takeScreenshot();
    const viewScreen = await driver.execute('mobile: viewportScreenshot');
    const fullB64 = Buffer.from(fullScreen, 'base64');
    const viewB64 = Buffer.from(viewScreen as string, 'base64');
    const fullImgMeta = await sharp(fullB64).metadata();
    const viewImgMeta = await sharp(viewB64).metadata();
    expect(viewportRect.top).to.eql(statBarHeight);
    expect(viewImgMeta.height).to.eql(viewportRect.height);
    expect(viewImgMeta.width).to.eql(fullImgMeta.width);
    expect(fullImgMeta.height).to.be.above(viewImgMeta.height!);
  });
});
