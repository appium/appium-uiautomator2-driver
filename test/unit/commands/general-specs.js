// @ts-check

import sinon from 'sinon';
import {AndroidUiautomator2Driver} from '../../../lib/driver';
import ADB from 'appium-adb';
import sinonChai from 'sinon-chai';


describe('General', function () {
  let driver;
  /** @type {import('sinon').SinonSandbox} */
  let sandbox;
  let chai;
  let expect;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
    chai.use(sinonChai);

    expect = chai.expect;
  });

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    driver = new AndroidUiautomator2Driver();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('getWindowRect', function () {
    it('should get window size', async function () {
      sandbox.stub(driver, 'getWindowSize').resolves({width: 300, height: 400});
      const result = await driver.getWindowRect();
      expect(result).to.eql({
        width: 300,
        height: 400,
        x: 0,
        y: 0,
      });
    });
  });

  it('should raise error on non-existent mobile command', async function () {
    await expect(driver.execute('mobile: fruta', {})).to.be.rejectedWith(
      /Unknown mobile command "fruta"/
    );
  });

  describe('mobile: sensorSet', function () {
    // note: this test does not depend on whether or not isEmulator returns
    // true, because the "am I an emulator?" check happens in the sensorSet
    // implementation, which is stubbed out.
    it('should call sensorSet', async function () {
      sandbox.stub(driver, 'sensorSet');
      await driver.execute('mobile: sensorSet', {
        sensorType: 'acceleration',
        value: '0:9.77631:0.812349',
      });
      expect(driver.sensorSet).to.have.been.calledOnceWithExactly({
        sensorType: 'acceleration',
        value: '0:9.77631:0.812349',
      });
    });
  });

  describe('mobile: installMultipleApks', function () {
    /** @type {ADB} */
    let adb;

    beforeEach(function () {
      adb = new ADB();
      driver = new AndroidUiautomator2Driver();
      driver.adb = adb;
      sandbox.stub(driver.helpers, 'configureApp').resolves('/path/to/test/apk.apk');
      sandbox.stub(adb, 'installMultipleApks');
    });

    it('should call mobileInstallMultipleApks', async function () {
      await driver.execute('mobile: installMultipleApks', {apks: ['/path/to/test/apk.apk']});
      expect(adb.installMultipleApks).to.have.been.calledOnceWith(['/path/to/test/apk.apk']);
    });

    it('should reject if no apks were given', async function () {
      await expect(
        driver.execute('mobile: installMultipleApks', {apks: []})
      ).to.be.rejectedWith('No apks are given to install');
    });

    it('should reject if no apks were given', async function () {
      await expect(driver.execute('mobile: installMultipleApks')).to.be.rejectedWith(
        'No apks are given to install'
      );
    });
  });
});
