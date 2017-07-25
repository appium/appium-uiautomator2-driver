import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import ADB from 'appium-adb';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - basic', function () {
  let driver;
  let singleResourceId;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
    let adb = new ADB({});
    // the app behaves differently on different api levels when it comes to
    // which resource ids are available for testing, so we switch here to make
    // sure we're using the right resource id below
    singleResourceId = await adb.getApiLevel() >= 21 ? 'decor_content_parent' : 'home';
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find a single element by content-description', async () => {
    let el = await driver.findElOrEls('accessibility id', 'Animation', false);
    await driver.getText(el.ELEMENT).should.eventually.equal('Animation');
  });
  it('should find an element by class name', async () => {
    let el = await driver.findElOrEls('class name', 'android.widget.TextView', false);
    await driver.getText(el.ELEMENT).should.eventually.equal('API Demos');
  });
  it('should find multiple elements by class name', async () => {
    await driver.findElOrEls('class name', 'android.widget.TextView', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should not find multiple elements that doesnt exist', async () => {
    await driver.findElOrEls('class name', 'blargimarg', true)
      .should.eventually.have.length(0);
  });
  it('should fail on empty locator', async () => {
    await driver.findElOrEls('class name', '', true).should.be.rejectedWith(/selector/);
  });
  it('should find a single element by resource-id', async () => {
    await driver.findElOrEls('id', `android:id/${singleResourceId}`, false)
      .should.eventually.exist;
  });
  it('should find multiple elements by resource-id', async () => {
    await driver.findElOrEls('id', 'android:id/text1', true)
      .should.eventually.have.length.at.least(10);
  });
  it('should find multiple elements by resource-id even when theres just one', async () => {
    await driver.findElOrEls('id', `android:id/${singleResourceId}`, true)
      .should.eventually.have.length(1);
  });

  describe('implicit wait', () => {
    let implicitWait = 5000;
    before(async () => {
      await driver.implicitWait(implicitWait);
    });
    it('should respect implicit wait with multiple elements', async () => {
      let beforeMs = Date.now();
      await driver.findElOrEls('id', 'there_is_nothing_called_this', true)
        .should.eventually.have.length(0);
      let afterMs = Date.now();
      (afterMs - beforeMs).should.be.below(implicitWait + 5000);
      (afterMs - beforeMs).should.be.above(implicitWait);
    });
  });
});
