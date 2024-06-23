import B from 'bluebird';
import path from 'path';
import { APIDEMOS_CAPS, amendCapabilities } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


const START_IMG = path.resolve(__dirname, '..', '..', 'assets', 'start-button.png');
const STOP_IMG = path.resolve(__dirname, '..', '..', 'assets', 'stop-button.png');
const SQUARES_IMG = path.resolve(__dirname, '..', '..', 'assets', 'checkered-squares.png');

describe('Find - Image', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    // TODO: @appium/images-plugin needs to be installed
    this.skip();
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
    els.should.have.length(1);
  });
  it('should find an image element', async function () {
    const el = await driver.$(START_IMG);
    el.getValue().should.match(/appium-image-element/);
  });
  it('should not find an image element that is not matched', async function () {
    await driver.$(SQUARES_IMG)
      .should.eventually.be.rejectedWith(/Error response status: 7/);
  });
  it('should find anything with a threshold low enough', async function () {
    const {imageMatchThreshold} = await driver.getSettings();
    await driver.updateSettings({imageMatchThreshold: 0});
    try {
      await driver.$(SQUARES_IMG).should.eventually.exist;
    } finally {
      await driver.updateSettings({imageMatchThreshold});
    }
  });
  it('should be able to get basic element properties', async function () {
    let el = await driver.$(START_IMG);
    await el.isDisplayed().should.eventually.be.true;
    let size = await el.getSize();
    size.width.should.be.above(0);
    size.height.should.be.above(0);
    let loc = await el.getLocation();
    loc.x.should.be.at.least(0);
    loc.y.should.be.at.least(0);
    let locInView = await el.getLocationInView();
    locInView.x.should.eql(loc.x);
    locInView.y.should.eql(loc.y);
  });
  it('should be able to click an element', async function () {
    // start and stop the chronometer using images, and then verify the time
    await driver.$(START_IMG).click();
    await B.delay(3000);
    await driver.$(STOP_IMG).click();
    let readout = await driver.$("//*[contains(@text, 'Initial format')]");
    let text = await readout.getText();
    let match = /Initial format: \d\d:(\d\d)/.exec(text);
    let secs = parseInt(match[1], 10);
    secs.should.be.above(2);
    secs.should.be.below(20);
  });
});
