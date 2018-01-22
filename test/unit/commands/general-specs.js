import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import AndroidUiautomator2Driver from '../../..';

let driver;
let sandbox = sinon.sandbox.create();
chai.should();
chai.use(chaiAsPromised);

describe('General', function () {
  describe('getWindowRect', function () {
    beforeEach(async function () {
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
});
