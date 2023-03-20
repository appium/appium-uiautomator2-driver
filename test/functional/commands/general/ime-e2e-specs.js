import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

const unicodeImeId = 'io.appium.settings/.UnicodeIME';

describe('apidemo - IME', function () {
  let driver;
  before(async function () {
    driver = await initSession(Object.assign(APIDEMOS_CAPS));
  });
  beforeEach(async function () {
    await driver.startActivity('io.appium.android.apis', 'io.appium.android.apis.ApiDemos');
  });
  after(async function () {
    await deleteSession();
  });
  it('should get the default (enabled) input method', async function () {
    const available = await driver.getAvailableEngines();
    available.should.have.length.at.least(1);
    const active = await driver.getActiveEngine();
    available.indexOf(active).should.not.equal(-1);
    available.indexOf(unicodeImeId).should.not.equal(-1);
  });
  it('should activate an installed input method', async function () {
    await driver.activateIME(unicodeImeId).should.eventually.not.be.rejected;
    const active = await driver.getActiveEngine();
    active.should.be.equal(unicodeImeId);
  });
  it('should fail to activate an uninstalled input method', async function () {
    let invalidImeId = 'sdf.wer.gdasdfsf/.OsdfEfgd';
    await driver.activateIME(invalidImeId).should.eventually.be.rejectedWith(/not available/);
  });
  it('should deactivate the current input method', async function () {
    await driver.activateIME(unicodeImeId);
    await driver.getActiveEngine().should.eventually.equal(unicodeImeId);
    await driver.deactivateIME();
    await driver.getActiveEngine().should.eventually.not.equal(unicodeImeId);
  });
});
