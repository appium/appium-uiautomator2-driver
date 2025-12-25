import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Find - basic', function () {
  let driver: Browser;
  const singleResourceId = 'decor_content_parent';

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find a single element by content-description', async function () {
    const el = await driver.$('~Animation');
    await expect(el.getText()).to.eventually.equal('Animation');
  });
  it('should find an element by class name', async function () {
    const el = await driver.$('android.widget.TextView');
    const text = await el.getText();
    expect(text.toLowerCase()).to.equal('api demos');
  });
  it('should find multiple elements by class name', async function () {
    const els = await driver.$$('android.widget.TextView');
    expect(els).to.have.length.at.least(10);
  });
  it('should not find multiple elements that doesnt exist', async function () {
    const els = await driver.$$('blargimarg');
    expect(els).to.have.length(0);
  });
  it('should fail on empty locator', async function () {
    await expect(driver.$('')).to.eventually.be.rejectedWith(/selector/);
  });
  it('should find a single element by resource-id', async function () {
    const el = await driver.$(`id=android:id/${singleResourceId}`);
    expect(el.elementId).to.exist;
  });
  it('should find multiple elements by resource-id', async function () {
    const els = await driver.$$('id=android:id/text1');
    expect(els).to.have.length.above(1);
  });
  it('should find multiple elements by resource-id even when theres just one', async function () {
    const els = await driver.$$(`id=android:id/${singleResourceId}`);
    expect(els).to.have.length(1);
  });

  describe('implicit wait', function () {
    const implicitWaitTimeout = 5000;
    before(async function () {
      await driver.setTimeout({implicit: implicitWaitTimeout});
    });
    it('should respect implicit wait with multiple elements', async function () {
      const beforeMs = Date.now();
      const els = await driver.$$('id=android:id/there_is_nothing_called_this');
      expect(els).to.have.length(0);
      const afterMs = Date.now();
      expect(afterMs - beforeMs).to.be.below(implicitWaitTimeout * 2);
    });
  });
});

