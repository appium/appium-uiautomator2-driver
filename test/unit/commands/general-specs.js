import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import AndroidUiautomator2Driver from '../../..';

let driver;
let sandbox = sinon.createSandbox();
chai.should();
chai.use(chaiAsPromised);

describe('General', function () {
  describe('getWindowRect', function () {
    beforeEach(function () {
      driver = new AndroidUiautomator2Driver();
    });
    afterEach(function () {
      sandbox.restore();
    });

    it('should get window size', async function () {
      sandbox.stub(driver, 'getWindowSize')
          .withArgs().returns({width: 300, height: 400});
      const result = await driver.getWindowRect();
      result.width.should.be.equal(300);
      result.height.should.be.equal(400);
      result.x.should.be.equal(0);
      result.y.should.be.equal(0);
    });
  });

  describe('mobileGetDeviceInfo', function () {
    driver = new AndroidUiautomator2Driver({}, false);

    afterEach(function () {
      sandbox.restore();
    });

    it('should device all info', async function () {
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      const proxyStub = sinon.stub(driver.uiautomator2.jwproxy, 'command');
      proxyStub.returns({model: 'Android SDK built for x86_64'});

      driver.adb = {
        getDeviceLocale: () => {},
        getTimeZone: () => {},
      };
      sinon.stub(driver.adb, 'getDeviceLocale').returns('ja_EN');
      sinon.stub(driver.adb, 'getTimeZone').returns('US/Pacific');

      const out = await driver.mobileGetDeviceInfo();
      out.model.should.eq('Android SDK built for x86_64');
      out.locale.should.eq('ja_EN');
      out.timeZone.should.eq('US/Pacific');
    });

    it('should device without locale and timeZone', async function () {
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      const proxyStub = sinon.stub(driver.uiautomator2.jwproxy, 'command');
      proxyStub.returns({model: 'Android SDK built for x86_64'});

      driver.adb = {
        getDeviceLocale: () => {},
        getTimeZone: () => {},
      };
      const proxyStub2 = sinon.stub(driver.adb, 'getDeviceLocale');
      proxyStub2.throws();

      const proxyStub3 = sinon.stub(driver.adb, 'getTimeZone');
      proxyStub3.throws();

      await driver.mobileGetDeviceInfo().should.eventually.be.rejected;
    });
  });
});
