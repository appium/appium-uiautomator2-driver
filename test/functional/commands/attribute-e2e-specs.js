import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;
let animationEl;

describe('apidemo - attributes', function () {
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
    animationEl = await driver.elementByAccessibilityId('Animation');
  });
  after(async () => {
    await driver.quit();
  });
  it('should be able to find resourceId attribute', async () => {
    await driver.getAttribute(animationEl, 'resourceId').should.eventually.become('android:id/text1');
  });
  it('should be able to find text attribute', async () => {
    await driver.getAttribute(animationEl, 'text').should.eventually.become('Animation');
  });
  it('should be able to find name attribute', async () => {
    await driver.getAttribute(animationEl, 'name').should.eventually.become('Animation');
  });
  it('should be able to find name attribute, falling back to text', async () => {
    await animationEl.click();
    await driver.waitForElementByAccessibilityId('Bouncing Balls');
    let textViewEl = await driver.elementByAccessibilityId('Bouncing Balls');
    await driver.getAttribute(textViewEl, 'name');
    await driver.back();
    await driver.waitForElementByAccessibilityId('Animation');
  });
  it('should be able to find content description attribute', async () => {
    await driver.getAttribute(animationEl, 'contentDescription').should.eventually.become("Animation");
  });
  it('should be able to find displayed attribute', async () => {
    await driver.getAttribute(animationEl, 'displayed').should.eventually.become('true');
  });
  it('should be able to find enabled attribute', async () => {
    await driver.getAttribute(animationEl, 'enabled').should.eventually.become('true');
    const displayed = await driver.getAttribute(animationEl, 'displayed');

    // Cast displayed as string because sometimes it returns a boolean
    (displayed + '').should.equal('true');
  });
  it('should be able to find displayed attribute through normal func', async () => {
    const displayed = await animationEl.isDisplayed();
    (displayed + '').should.equal('true');
  });
  it('should be able to get element location using getLocation', async () => {
    let location = await animationEl.getLocation();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it('should be able to get element location using getLocationInView', async () => {
    // TODO: 'getLocationInView' is returning a 404 not found error
    let location = await animationEl.getLocationInView();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it('should be able to get element size', async () => {
    let size = await driver.getSize(animationEl);
    size.width.should.be.at.least(0);
    size.height.should.be.at.least(0);
  });
});