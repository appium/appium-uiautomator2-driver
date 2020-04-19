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
    it('should raise error on non-existent mobile command', async function () {
      await driver.executeMobile('fruta', {}).should.eventually.be.rejectedWith('Unknown mobile command "fruta"');
    });
    it('should accept sensorSet on emulator', async function () {
      sandbox.stub(driver, 'isEmulator').returns(true);
      let stub = sandbox.stub(driver, 'sensorSet');
      await driver.executeMobile('sensorSet', { sensorType: 'acceleration', value: '0:9.77631:0.812349' });
      stub.calledOnce.should.equal(true);
      stub.calledWithExactly({ sensorType: 'acceleration', value: '0:9.77631:0.812349' });
    });
  });
});
