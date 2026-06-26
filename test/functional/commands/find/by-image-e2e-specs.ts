import {describe, it, before, after} from 'node:test';
import type {Browser} from 'webdriverio';
import {sleep} from 'asyncbox';
import {node} from 'appium/support.js';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {APIDEMOS_CAPS, amendCapabilities} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

const MODULE_NAME = 'appium-uiautomator2-driver';
const FILENAME = fileURLToPath(import.meta.url);
const MODULE_ROOT = node.getModuleRootSync(MODULE_NAME, FILENAME);
if (!MODULE_ROOT) {
  throw new Error(`Cannot find the root folder of the ${MODULE_NAME} Node.js module`);
}

const ASSETS_DIR = path.resolve(MODULE_ROOT, 'test', 'functional', 'assets');
const START_IMG = path.resolve(ASSETS_DIR, 'start-button.png');
const STOP_IMG = path.resolve(ASSETS_DIR, 'stop-button.png');
const SQUARES_IMG = path.resolve(ASSETS_DIR, 'checkered-squares.png');

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
    expect(els).to.have.length(1);
  });
  it('should find an image element', async function () {
    const el = await driver.$(START_IMG);
    const value = await el.getValue();
    expect(value).to.match(/appium-image-element/);
  });
  it('should not find an image element that is not matched', async function () {
    await expect(driver.$(SQUARES_IMG)).to.eventually.be.rejectedWith(/Error response status: 7/);
  });
  it('should find anything with a threshold low enough', async function () {
    const {imageMatchThreshold} = await driver.getSettings();
    await driver.updateSettings({imageMatchThreshold: 0});
    try {
      await expect(driver.$(SQUARES_IMG).elementId).to.eventually.exist;
    } finally {
      await driver.updateSettings({imageMatchThreshold});
    }
  });
  it('should be able to get basic element properties', async function () {
    const el = await driver.$(START_IMG);
    await expect(el.isDisplayed()).to.eventually.be.true;
    const size = await el.getSize();
    expect(size.width).to.be.above(0);
    expect(size.height).to.be.above(0);
    const loc = await el.getLocation();
    expect(loc.x).to.be.at.least(0);
    expect(loc.y).to.be.at.least(0);
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
    expect(secs).to.be.above(2);
    expect(secs).to.be.below(20);
  });
});
