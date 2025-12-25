import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('apidemo - attributes', function () {
  let driver: Browser;
  let animationEl: Awaited<ReturnType<Browser['$']>>;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
    animationEl = await driver.$('~Animation');
    await animationEl.waitForDisplayed({timeout: 5000});
  });
  after(async function () {
    await deleteSession();
  });
  it('should be able to find resourceId attribute', async function () {
    await expect(animationEl.getAttribute('resourceId')).to.eventually.become('android:id/text1');
  });
  it('should be able to find text attribute', async function () {
    await expect(animationEl.getAttribute('text')).to.eventually.become('Animation');
  });
  it('should be able to find name attribute', async function () {
    await expect(animationEl.getAttribute('name')).to.eventually.become('Animation');
  });
  it('should be able to find content description attribute', async function () {
    await expect(animationEl.getAttribute('contentDescription')).to.eventually.become('Animation');
  });
  it('should be able to find displayed attribute', async function () {
    await expect(animationEl.getAttribute('displayed')).to.eventually.become('true');
  });
  it('should be able to find enabled attribute', async function () {
    await expect(animationEl.getAttribute('enabled')).to.eventually.become('true');
  });
  it('should be able to find displayed attribute through normal func', async function () {
    const displayed = await animationEl.isDisplayed();
    expect(String(displayed)).to.equal('true');
  });
  it('should be able to get element location using getLocation', async function () {
    const location = await animationEl.getLocation();
    expect(location.x).to.be.at.least(0);
    expect(location.y).to.be.at.least(0);
  });
  it.skip('should be able to get element location using getLocationInView', async function () {
    // TODO: 'getLocationInView' requires an argument - skipping implementation
    // const location = await animationEl.getLocationInView();
    // expect(location.x).to.be.at.least(0);
    // expect(location.y).to.be.at.least(0);
  });
  it('should be able to get element size', async function () {
    const size = await animationEl.getSize();
    expect(size.width).to.be.at.least(0);
    expect(size.height).to.be.at.least(0);
  });
});

