import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import ADB from 'appium-adb';
import AndroidUiautomator2Driver from '../../..';

let driver;
let sandbox = sinon.sandbox.create();
chai.should();
chai.use(chaiAsPromised);

describe('Network', () => {
  describe('SetNetworkConnection', () => {
    beforeEach(async () => {
      driver = new AndroidUiautomator2Driver();
      driver.adb = new ADB();
      sandbox.stub(driver, 'getNetworkConnection');
      sandbox.stub(driver, 'wrapBootstrapDisconnect', async (fn) => {
        await fn();
      });
      sandbox.stub(driver.adb, 'setAirplaneMode');
      sandbox.stub(driver.adb, 'broadcastAirplaneMode');
      sandbox.stub(driver, 'setWifiState');
      sandbox.stub(driver.adb, 'setDataState');
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('should turn off wifi and data', async () => {
      await driver.setNetworkConnection(0);
      driver.adb.setAirplaneMode.calledWithExactly(0).should.be.true;
      driver.adb.broadcastAirplaneMode.calledWithExactly(0).should.be.true;
      driver.setWifiState.calledWithExactly(0).should.be.true;
      driver.adb.setDataState.calledWithExactly(0, false).should.be.true;
    });
    it('should turn on and broadcast airplane mode', async () => {
      await driver.setNetworkConnection(1);
      driver.adb.setAirplaneMode.calledWithExactly(1).should.be.true;
      driver.adb.broadcastAirplaneMode.calledWithExactly(1).should.be.true;
      driver.setWifiState.called.should.be.false;
      driver.adb.setDataState.called.should.be.false;
    });
    it('should turn on wifi', async () => {
      await driver.setNetworkConnection(2);
      driver.adb.setAirplaneMode.calledWithExactly(0).should.be.true;
      driver.adb.broadcastAirplaneMode.calledWithExactly(0).should.be.true;
      driver.setWifiState.calledWithExactly(1).should.be.true;
      driver.adb.setDataState.calledWithExactly(0, false).should.be.true;
    });
    it('should turn on data on emulator', async () => {
      driver.opts.avd = 'something';
      try {
        await driver.setNetworkConnection(4);
        driver.adb.setAirplaneMode.calledWithExactly(0).should.be.true;
        driver.adb.broadcastAirplaneMode.calledWithExactly(0).should.be.true;
        driver.setWifiState.calledWithExactly(0).should.be.true;
        driver.adb.setDataState.calledWithExactly(1, true).should.be.true;
      } finally {
        driver.opts.avd = undefined;
      }
    });
    it('should turn on data and wifi', async () => {
      await driver.setNetworkConnection(6);
      driver.adb.setAirplaneMode.calledWithExactly(0).should.be.true;
      driver.adb.broadcastAirplaneMode.calledWithExactly(0).should.be.true;
      driver.setWifiState.calledWithExactly(1).should.be.true;
      driver.adb.setDataState.calledWithExactly(1, false).should.be.true;
    });
  });
});
