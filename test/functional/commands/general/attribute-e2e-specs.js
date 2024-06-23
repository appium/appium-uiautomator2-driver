import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('apidemo - attributes', function () {
  let chai;
  let driver;
  let animationEl;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
    animationEl = await driver.$('~Animation');
    await animationEl.waitForDisplayed({ timeout: 5000 });
  });
  after(async function () {
    await deleteSession();
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
  it('should be able to find content description attribute', async function () {
    await animationEl.getAttribute('contentDescription').should.eventually.become('Animation');
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
    const location = await animationEl.getLocation();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it.skip('should be able to get element location using getLocationInView', async function () {
    // TODO: 'getLocationInView' is not a function error
    const location = await animationEl.getLocationInView();
    location.x.should.be.at.least(0);
    location.y.should.be.at.least(0);
  });
  it('should be able to get element size', async function () {
    const size = await animationEl.getSize();
    size.width.should.be.at.least(0);
    size.height.should.be.at.least(0);
  });
});
