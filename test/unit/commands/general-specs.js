// @ts-check

import sinon from 'sinon';
import {AndroidUiautomator2Driver} from '../../../lib/driver';
import { ADB } from 'appium-adb';


describe('General', function () {
  let driver;
  let chai;
  let expect;
  let mockDriver;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    expect = chai.expect;
  });

  beforeEach(function () {
    driver = new AndroidUiautomator2Driver();
    mockDriver = sinon.mock(driver);
  });

  afterEach(function () {
    mockDriver.verify();
  });

  describe('getWindowRect', function () {
    it('should get window size', async function () {
      mockDriver.expects('getWindowSize').once().returns({width: 300, height: 400});
      const result = await driver.getWindowRect();
      expect(result).to.eql({
        width: 300,
        height: 400,
        x: 0,
        y: 0,
      });
    });
  });

  describe('mobile command', function () {
    it('should raise error on non-existent mobile command', async function () {
      await expect(driver.execute('mobile: fruta', {})).to.be.rejectedWith(
        /Unsupported/
      );
    });
  });

  describe('mobile: sensorSet', function () {
    // note: this test does not depend on whether or not isEmulator returns
    // true, because the "am I an emulator?" check happens in the sensorSet
    // implementation, which is stubbed out.
    it('should call sensorSet', async function () {
      mockDriver.expects('sensorSet').once().withArgs(
        'acceleration',
        '0:9.77631:0.812349',
      );
      await driver.execute('mobile: sensorSet', {
        sensorType: 'acceleration',
        value: '0:9.77631:0.812349',
      });
    });
  });

  describe('mobile: installMultipleApks', function () {
    /** @type {ADB} */
    let adb;
    let mockHelpers;
    let mockAdb;

    beforeEach(function () {
      adb = new ADB();
      mockAdb = sinon.mock(adb);

      driver = new AndroidUiautomator2Driver();
      driver.adb = adb;

      mockHelpers = sinon.mock(driver.helpers);
      mockHelpers.expects('configureApp').returns('/path/to/test/apk.apk');
    });

    afterEach(function () {
      mockHelpers.restore();
      mockAdb.verify();
    });

    it('should call mobileInstallMultipleApks', async function () {
      mockAdb.expects('installMultipleApks').once().withExactArgs(['/path/to/test/apk.apk'], undefined);
      await driver.execute('mobile: installMultipleApks', {apks: ['/path/to/test/apk.apk']});
    });

    it('should reject if no apks were given', async function () {
      await expect(
        driver.execute('mobile: installMultipleApks', {apks: []})
      ).to.be.rejectedWith('No apks are given to install');
    });

    it('should reject with default args', async function () {
      await expect(driver.execute('mobile: installMultipleApks')).to.be.rejected;
    });
  });
});
