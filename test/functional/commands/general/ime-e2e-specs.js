import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const unicodeImeId = 'io.appium.android.ime/.UnicodeIME';

describe('apidemo - IME', function () {
  let driver;
  before(async function () {
    driver = await initDriver(Object.assign({}, APIDEMOS_CAPS, {unicodeKeyboard: true, resetKeyboard: true}));
  });
  beforeEach(async function () {
    await driver.startActivity({appPackage: 'io.appium.android.apis', appActivity: 'io.appium.android.apis.ApiDemos'});
  });
  after(async function () {
    await driver.quit();
  });
  it('should get the default (enabled) input method', async function () {
    await driver.activeIMEEngine().should.eventually.equal(unicodeImeId);
  });
  it('should activate an installed input method', async function () {
    await driver.activateIMEEngine(unicodeImeId).should.not.be.rejected;
  });
  it('should fail to activate an uninstalled input method', async function () {
    let invalidImeId = 'sdf.wer.gdasdfsf/.OsdfEfgd';
    await driver.activateIMEEngine(invalidImeId).should.eventually.be.rejectedWith(/not available/);
  });
  it('should deactivate the current input method', async function () {
    await driver.activateIMEEngine(unicodeImeId);
    await driver.activeIMEEngine().should.eventually.equal(unicodeImeId);
    await driver.deactivateIMEEngine();
    await driver.activeIMEEngine().should.eventually.not.equal(unicodeImeId);
  });
});
