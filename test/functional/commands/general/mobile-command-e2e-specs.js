import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('mobile', function () {
  let driver;
  let chai;

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
  describe('mobile:shell', function () {
    it('should call execute command without proxy error, but require relaxed security flag', async function () {
      try {
        await driver.execute('mobile: shell', {command: 'echo', args: ['hello']});
      } catch (e) {
        e.message.should.match(/Potentially insecure feature 'adb_shell' has not been enabled/);
      }
    });
  });
  describe('mobile:broadcast', function () {
    it('should call broadcast', async function () {
      const output = await driver.execute('mobile: broadcast', {
        action: 'io.appium.settings.sms.read',
        extras: [['s', 'max', '10']],
      });
      output.should.include('result=-1');
    });
  });
  describe('mobile:batteryInfo', function () {
    it('should get battery info', async function () {
      const {level, state} = await driver.execute('mobile: batteryInfo', {});
      level.should.be.greaterThan(0.0);
      state.should.be.greaterThan(1);
    });
  });
});
