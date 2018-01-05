import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - basic', function () {
  let driver;
  let singleResourceId = 'decor_content_parent';
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.quit();
  });
  it('should find a single element by content-description', async () => {
    let el = await driver.elementByAccessibilityId('Animation');
    await el.text().should.eventually.equal('Animation');
  });
  it('should find an element by class name', async () => {
    let el = await driver.elementByClassName('android.widget.TextView');
    const text = await el.text();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find multiple elements by class name', async () => {
    await driver.elementsByClassName('android.widget.TextView')
      .should.eventually.have.length.at.least(10);
  });
  it('should not find multiple elements that doesnt exist', async () => {
    await driver.elementsByClassName('blargimarg')
      .should.eventually.have.length(0);
  });
  it('should fail on empty locator', async () => {
    await driver.elementsByClassName('').should.be.rejectedWith(/selector/);
  });
  it('should find a single element by resource-id', async () => {
    await driver.elementById(`android:id/${singleResourceId}`)
      .should.eventually.exist;
  });
  it('should find multiple elements by resource-id', async () => {
    await driver.elementsById('android:id/text1')
      .should.eventually.have.length.at.least(10);
  });
  it('should find multiple elements by resource-id even when theres just one', async () => {
    await driver.elementsById(`android:id/${singleResourceId}`)
      .should.eventually.have.length(1);
  });

  describe('implicit wait', () => {
    let implicitWaitTimeout = 5000;
    before(async () => {
      await driver.setImplicitWaitTimeout(implicitWaitTimeout);
    });
    it('should respect implicit wait with multiple elements', async () => {
      let beforeMs = Date.now();
      await driver.elementsById('there_is_nothing_called_this')
        .should.eventually.have.length(0);
      let afterMs = Date.now();
      (afterMs - beforeMs).should.be.below(implicitWaitTimeout * 2);
    });
  });
});
