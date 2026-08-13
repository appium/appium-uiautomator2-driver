import assert from 'node:assert/strict';
import {describe, it, before, after, beforeEach} from 'node:test';

import sharp from 'sharp';
import type {Browser} from 'webdriverio';

import {SCROLL_CAPS} from '../desired.js';
import {isCi} from '../helpers/ci-e2e.js';
import {initSession, deleteSession, attemptToDismissAlert} from '../helpers/session.js';

describe('testViewportCommands', {skip: isCi()}, function () {
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
    const {viewportRect, statBarHeight, pixelRatio} = (await driver.getSession()) as any;

    assert.ok(pixelRatio.length > 0);
    assert.ok(statBarHeight > 0);
    assert.deepStrictEqual(Object.keys(viewportRect).sort(), ['left', 'top', 'width', 'height'].sort());
  });

  it('should get scrollable element', async function () {
    assert.ok(await driver.$('//*[@scrollable="true"]').elementId);
  });

  it('should get content size from scrollable element found as uiobject', async function () {
    const scrollableEl = await driver.$('//*[@scrollable="true"]');
    const contentSize = await scrollableEl.getAttribute('contentSize');
    assert.ok(contentSize != null);
    assert.ok(JSON.parse(contentSize as string).scrollableOffset != null);
  });

  it('should get content size from scrollable element found as uiobject2', async function () {
    const scrollableEl = await driver.$('//android.widget.ScrollView');
    const contentSize = await scrollableEl.getAttribute('contentSize');
    assert.ok(contentSize != null);
    assert.ok(JSON.parse(contentSize as string).scrollableOffset != null);
  });

  it('should get first element from scrollable element', async function () {
    const scrollableEl = await driver.$('//*[@scrollable="true"]');
    assert.ok(await scrollableEl.$('/*[@firstVisible="true"]').elementId);
  });

  it('should get a cropped screenshot of the viewport without statusbar', async function () {
    // TODO: fails on CI with a `Does the current view have 'secure' flag set?` error
    const {viewportRect, statBarHeight} = (await driver.getSession()) as any;
    const fullScreen = await driver.takeScreenshot();
    const viewScreen = await driver.execute('mobile: viewportScreenshot');
    const fullB64 = Buffer.from(fullScreen, 'base64');
    const viewB64 = Buffer.from(viewScreen as string, 'base64');
    const fullImgMeta = await sharp(fullB64).metadata();
    const viewImgMeta = await sharp(viewB64).metadata();
    assert.strictEqual(viewportRect.top, statBarHeight);
    assert.strictEqual(viewImgMeta.height, viewportRect.height);
    assert.strictEqual(viewImgMeta.width, fullImgMeta.width);
    assert.ok(fullImgMeta.height > viewImgMeta.height!);
  });
});
