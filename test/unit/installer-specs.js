//import _ from 'lodash';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { fs } from 'appium-support';
import { withMocks } from 'appium-test-support';
import { serverExists, UI2_SERVER_APK_PATH, UI2_TEST_APK_PATH, setupUiAutomator2 } from '../../lib/installer';
import log from '../../lib/logger';


chai.should();
chai.use(chaiAsPromised);

describe('appium-uiautomator2-installer', () => {
  describe('setupUiAutomator2', withMocks({log}, (mocks) => {
    it('should download the server APKs', async () => {
      mocks.log.expects("error").never();
      await setupUiAutomator2();
      mocks.log.verify();
    });
  }));

  describe('serverExists', withMocks({fs}, (mocks) => {
    it('should return true if both server apk and test apk exist', async () => {
      mocks.fs.expects("exists").once()
        .withExactArgs(UI2_SERVER_APK_PATH)
        .returns(Promise.resolve(true));
      mocks.fs.expects("exists").once()
        .withExactArgs(UI2_TEST_APK_PATH)
        .returns(Promise.resolve(true));
      (await serverExists()).should.be.true;
      mocks.fs.verify();
    });
    it('should return false if apk does not exist', async () => {
      mocks.fs.expects("exists").once()
        .withExactArgs(UI2_SERVER_APK_PATH)
        .returns(Promise.resolve(false));
      (await serverExists()).should.be.false;
      mocks.fs.verify();
    });
    it('should return false if fs.exists throws a ENOENT error', async () => {
      mocks.fs.expects("exists").once()
        .withExactArgs(UI2_SERVER_APK_PATH)
        .throws({code:'ENOENT'});
      (await serverExists()).should.be.false;
      mocks.fs.verify();
    });
    it('should throw an error if fs.exists throws a non-ENOENT error', async () => {
      let error = new Error();
      error.code = 'EACCES';
      mocks.fs.expects("exists").once()
        .withExactArgs(UI2_SERVER_APK_PATH)
        .throws(error);
      await serverExists().should.eventually.be.rejectedWith(error);
      mocks.fs.verify();
    });
  }));
});
