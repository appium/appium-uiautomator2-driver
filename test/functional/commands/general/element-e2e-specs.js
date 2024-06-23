import _ from 'lodash';
import { APIDEMOS_CAPS, amendCapabilities } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';
import { retryInterval } from 'asyncbox';
import { util } from 'appium/support';


const textFieldsActivity = '.view.TextFields';

describe('apidemo - element', function () {
  let driver;
  let el;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    const caps = amendCapabilities(APIDEMOS_CAPS, {
      'appium:appActivity': textFieldsActivity,
    });
    driver = await initSession(caps);
    el = await retryInterval(5, 1000, async function () {
      const els = await driver.$$('android.widget.EditText');
      els.should.have.length.at.least(1);
      return _.last(els);
    });
  });
  after(async function () {
    await deleteSession();
  });

  describe('setValue', function () {
    it('should set the text on the element', async function () {
      await el.setValue('original value');
      await el.getText().should.eventually.equal('original value');
    });
  });

  describe('active', function () {
    it('should active element be equal to clicked element', async function () {
      await el.click();
      const activeElement = await driver.getActiveElement();
      util.unwrapElement(activeElement).should.equal(el.elementId);
    });
  });
});
