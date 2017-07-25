import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const unicodeImeId = 'io.appium.android.ime/.UnicodeIME';

describe('apidemo - IME', function () {
  let driver;
  before(async () => {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {unicodeKeyboard: true, resetKeyboard: true}));
  });
  beforeEach(async () => {
    await driver.startActivity('io.appium.android.apis', 'io.appium.android.apis.ApiDemos');
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should get the default (enabled) input method', async () => {
    await driver.getActiveIMEEngine().should.eventually.equal(unicodeImeId);
  });
  it('should activate an installed input method', async () => {
    await driver.activateIMEEngine(unicodeImeId).should.not.be.rejected;
  });
  it('should fail to activate an uninstalled input method', async () => {
    let invalidImeId = 'sdf.wer.gdasdfsf/.OsdfEfgd';
    await driver.activateIMEEngine(invalidImeId).should.eventually.be.rejectedWith(/not available/);
  });
  it('should deactivate the current input method', async () => {
    await driver.activateIMEEngine(unicodeImeId);
    await driver.getActiveIMEEngine().should.eventually.equal(unicodeImeId);
    await driver.deactivateIMEEngine();
    await driver.getActiveIMEEngine().should.eventually.not.equal(unicodeImeId);
  });
});
