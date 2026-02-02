import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS, amendCapabilities} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import {retryInterval} from 'asyncbox';
import {util} from 'appium/support';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

const textFieldsActivity = '.view.TextFields';

describe('apidemo - element', function () {
  let driver: Browser;
  let el: Awaited<ReturnType<Browser['$']>>;

  before(async function () {
    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': textFieldsActivity,
    });
    driver = await initSession(caps);
    const elResult = await retryInterval(5, 1000, async function () {
      const elsPromise = driver.$$('android.widget.EditText');
      const elsArray = await elsPromise;
      const length = await elsArray.length;
      expect(length).to.be.at.least(1);
      return elsArray[length - 1];
    });
    if (!elResult) {
      throw new Error('Element not found after retries');
    }
    el = elResult;
  });
  after(async function () {
    await deleteSession();
  });

  describe('setValue', function () {
    it('should set the text on the element', async function () {
      await el.setValue('original value');
      await expect(el.getText()).to.eventually.equal('original value');
    });
  });

  describe('active', function () {
    it('should active element be equal to clicked element', async function () {
      await el.click();
      const activeElement = await driver.getActiveElement();
      expect(
        util.unwrapElement(activeElement as any),
      ).to.equal(el.elementId);
    });
  });
});

