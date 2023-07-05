// @ts-check

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import {AndroidUiautomator2Driver} from '../../../lib/driver';
import ADB from 'appium-adb';
import sinonChai from 'sinon-chai';

const {expect} = chai;
chai.use(chaiAsPromised).use(sinonChai);

describe('General', function () {
  /** @type {AndroidUiautomator2Driver} */
  let driver;
  /** @type {import('sinon').SinonSandbox} */
  let sandbox;

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
    await expect(driver.executeMobile('mobile: fruta', {})).to.be.rejectedWith(
      /Unknown mobile command "mobile: fruta"/
    );
  });

  describe('mobile: sensorSet', function () {
    // note: this test does not depend on whether or not isEmulator returns
    // true, because the "am I an emulator?" check happens in the sensorSet
    // implementation, which is stubbed out.
    it('should call sensorSet', async function () {
      sandbox.stub(driver, 'sensorSet');
      await driver.executeMobile('mobile: sensorSet', {
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
      await driver.executeMobile('mobile: installMultipleApks', {apks: ['/path/to/test/apk.apk']});
      expect(adb.installMultipleApks).to.have.been.calledOnceWith(['/path/to/test/apk.apk']);
    });

    it('should reject if no apks were given', async function () {
      await expect(
        driver.executeMobile('mobile: installMultipleApks', {apks: []})
      ).to.be.rejectedWith('No apks are given to install');
    });

    it('should reject if no apks were given', async function () {
      await expect(driver.executeMobile('mobile: installMultipleApks')).to.be.rejectedWith(
        'No apks are given to install'
      );
    });
  });
});
