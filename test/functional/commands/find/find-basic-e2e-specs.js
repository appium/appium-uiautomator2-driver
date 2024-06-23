import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('Find - basic', function () {
  let driver;
  let chai;
  let singleResourceId = 'decor_content_parent';

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find a single element by content-description', async function () {
    const el = await driver.$('~Animation');
    await el.getText().should.eventually.equal('Animation');
  });
  it('should find an element by class name', async function () {
    const el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    text.toLowerCase().should.equal('api demos');
  });
  it('should find multiple elements by class name', async function () {
    const els = await driver.$$('android.widget.TextView');
    els.should.have.length.at.least(10);
  });
  it('should not find multiple elements that doesnt exist', async function () {
    const els = await driver.$$('blargimarg');
    els.should.have.length(0);
  });
  it('should fail on empty locator', async function () {
    await chai.expect(driver.$(''))
      .to.eventually.be.rejectedWith(/selector/);
  });
  it('should find a single element by resource-id', async function () {
    const el = await driver.$(`id=android:id/${singleResourceId}`);
    el.elementId.should.exist;
  });
  it('should find multiple elements by resource-id', async function () {
    const els = await driver.$$('id=android:id/text1');
    els.should.have.length.above(1);
  });
  it('should find multiple elements by resource-id even when theres just one', async function () {
    const els = await driver.$$(`id=android:id/${singleResourceId}`);
    els.should.have.length(1);
  });

  describe('implicit wait', function () {
    const implicitWaitTimeout = 5000;
    before(async function () {
      await driver.setTimeout({ implicit: implicitWaitTimeout });
    });
    it('should respect implicit wait with multiple elements', async function () {
      let beforeMs = Date.now();
      const els = await driver.$$('id=android:id/there_is_nothing_called_this');
      els.should.have.length(0);
      let afterMs = Date.now();
      (afterMs - beforeMs).should.be.below(implicitWaitTimeout * 2);
    });
  });
});
