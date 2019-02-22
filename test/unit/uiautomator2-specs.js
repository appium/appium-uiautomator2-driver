import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { ADB } from 'appium-adb';
import { withMocks } from 'appium-test-support';
import { UiAutomator2Server, INSTRUMENTATION_TARGET,
         SERVER_TEST_PACKAGE_ID } from '../../lib/uiautomator2';

chai.should();
chai.use(chaiAsPromised);

describe('UiAutomator2', function () {
  const adb = new ADB();
  describe('installServerApk', withMocks({adb}, (mocks) => {
    let uiautomator2;
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server({
        adb, tmpDir: 'tmp', systemPort: 4724,
        host: 'localhost', devicePort: 6790, disableWindowAnimation: false
      });
    });
    afterEach(function () {
      mocks.verify();
    });

    it('new server and server.test are older than installed version', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(true);

      mocks.adb.expects('uninstallApk').twice();
      mocks.adb.expects('install').twice();

      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mocks.adb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are newer than installed version', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(true);

      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mocks.adb.expects('uninstallApk').twice();
      mocks.adb.expects('install').twice();

      mocks.adb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are the same as installed version', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(true);

      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mocks.adb.expects('uninstallApk').never();
      mocks.adb.expects('install').never();

      mocks.adb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are not installed', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.NOT_INSTALLED);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(false);
      mocks.adb.expects('sign').twice();

      // SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mocks.adb.expects('uninstallApk').never();
      mocks.adb.expects('install').twice();

      mocks.adb.expects('shell').withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('version numbers of new server and server.test are unknown', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.UNKNOWN);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(true);

      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mocks.adb.expects('uninstallApk').twice();
      mocks.adb.expects('install').twice();

      mocks.adb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });


    it('a server is installed but server.test is not', async function () {
      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED);

      // SERVER_PACKAGE_ID and SERVER_TEST_PACKAGE_ID
      mocks.adb.expects('checkApkCert').twice().returns(true);

      mocks.adb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mocks.adb.expects('uninstallApk').never();
      mocks.adb.expects('install').twice();

      mocks.adb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });
  }));
});
