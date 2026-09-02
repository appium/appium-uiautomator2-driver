import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import {sleep} from 'asyncbox';
import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS, amendCapabilities} from '../../desired.js';
import {getAssetPath} from '../../helpers/fixtures.js';
import {initSession, deleteSession} from '../../helpers/session.js';

const START_IMG = getAssetPath('start-button.png');
const STOP_IMG = getAssetPath('stop-button.png');
const SQUARES_IMG = getAssetPath('checkered-squares.png');

describe('Find - Image', {skip: true}, function () {
  let driver: Browser;

  before(async function () {
    // TODO: @appium/images-plugin needs to be installed
    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': '.view.ChronometerDemo',
    });
    driver = await initSession(caps);
    // use the driver settings that cause the most code paths to be exercised
    await driver.updateSettings({
      fixImageTemplateSize: true,
      autoUpdateImageElementPosition: true,
    });
  });

  after(async function () {
    await deleteSession();
  });

  it('should find image elements', async function () {
    const els = await driver.$$(START_IMG);
    assert.strictEqual(await els.length, 1);
  });
  it('should find an image element', async function () {
    const el = await driver.$(START_IMG);
    const value = await el.getValue();
    assert.match(value, /appium-image-element/);
  });
  it('should not find an image element that is not matched', async function () {
    await assert.rejects(async () => {
      await driver.$(SQUARES_IMG);
    }, /Error response status: 7/);
  });
  it('should find anything with a threshold low enough', async function () {
    const {imageMatchThreshold} = await driver.getSettings();
    await driver.updateSettings({imageMatchThreshold: 0});
    try {
      assert.ok(await driver.$(SQUARES_IMG).elementId);
    } finally {
      await driver.updateSettings({imageMatchThreshold});
    }
  });
  it('should be able to get basic element properties', async function () {
    const el = await driver.$(START_IMG);
    assert.strictEqual(await el.isDisplayed(), true);
    const size = await el.getSize();
    assert.ok(size.width > 0);
    assert.ok(size.height > 0);
    const loc = await el.getLocation();
    assert.ok(loc.x >= 0);
    assert.ok(loc.y >= 0);
    // TODO: getLocationInView requires an argument - skipping for now
    // const locInView = await el.getLocationInView();
    // expect(locInView.x).to.eql(loc.x);
    // expect(locInView.y).to.eql(loc.y);
  });
  it('should be able to click an element', async function () {
    // start and stop the chronometer using images, and then verify the time
    await driver.$(START_IMG).click();
    await sleep(3000);
    await driver.$(STOP_IMG).click();
    const readout = await driver.$("//*[contains(@text, 'Initial format')]");
    const text = await readout.getText();
    const match = /Initial format: \d\d:(\d\d)/.exec(text);
    const secs = parseInt(match![1], 10);
    assert.ok(secs > 2);
    assert.ok(secs < 20);
  });
});
