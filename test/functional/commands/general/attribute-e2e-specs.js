import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';

chai.should();
chai.use(chaiAsPromised);

let driver;
let animationEl;

describe('apidemo - attributes', function () {
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
    animationEl = await driver.waitForElementByAccessibilityId('Animation');
  });
  after(async function () {
    await driver.quit();
  });
  it('should be able to find resourceId attribute', async function () {
    await animationEl.getAttribute('resourceId').should.eventually.become('android:id/text1');
  });
  it('should be able to find text attribute', async function () {
    await animationEl.getAttribute('text').should.eventually.become('Animation');
  });
  it('should be able to find name attribute', async function () {
    await animationEl.getAttribute('name').should.eventually.become('Animation');
  });
  it('should be able to find name attribute, falling back to text', async function () {
    await animationEl.click();
    await driver.waitForElementByAccessibilityId('Bouncing Balls');
    let textViewEl = await driver.elementByAccessibilityId('Bouncing Balls');
    await textViewEl.getAttribute('name');
    await driver.back();
    await driver.waitForElementByAccessibilityId('Animation');
  });
  it('should be able to find content description attribute', async function () {
    await animationEl.getAttribute('contentDescription').should.eventually.become("Animation");
  });
  it('should be able to find displayed attribute', async function () {
    await animationEl.getAttribute('displayed').should.eventually.become('true');
  });
  it('should be able to find enabled attribute', async function () {
    await animationEl.getAttribute('enabled').should.eventually.become('true');
  });
  it('should be able to find displayed attribute through normal func', async function () {
    const displayed = await animationEl.isDisplayed();
    (displayed + '').should.equal('true');
  });
  it('should be able to get element location using getLocation', async function () {
    let location = await animationEl.getLocation();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it('should be able to get element location using getLocationInView', async function () {
    // TODO: 'getLocationInView' is returning a 404 not found error
    let location = await animationEl.getLocationInView();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it('should be able to get element size', async function () {
    let size = await animationEl.getSize();
    size.width.should.be.at.least(0);
    size.height.should.be.at.least(0);
  });
});