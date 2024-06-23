import { ADB } from 'appium-adb';
import { withMocks } from '@appium/test-support';
import {
  UiAutomator2Server, INSTRUMENTATION_TARGET, SERVER_TEST_PACKAGE_ID
} from '../../lib/uiautomator2';
import * as helpers from '../../lib/helpers';
import log from '../../lib/logger';


describe('UiAutomator2', function () {
  let uiautomator2;
  let chai;

  const adb = new ADB();
  const serverApk = {
    'appPath': 'path/to/appium-uiautomator2-server.apk',
    'appId': 'io.appium.uiautomator2.server'
  };
  const serverTestApk = {
    'appPath': 'path/to/appium-uiautomator2-server-test.apk',
    'appId': 'io.appium.uiautomator2.server.test'
  };
  const defaultUIA2ServerOptions = {
    tmpDir: 'tmp',
    systemPort: 4724,
    host: 'localhost',
    devicePort: 6790,
    disableWindowAnimation: false
  };

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  describe('shouldUninstallServerPackages', function () {
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server(log, {
        adb, ...defaultUIA2ServerOptions
      });
    });
    it('with newer servers are installed', function () {
      uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.true;
    }),
    it('with newer server is installed but the other could be old one', function () {
      // Then, enforce to uninstall all apks
      uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.true;
    }),
    it('with newer server is installed', function () {
      uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.false;
    }),
    it('with older servers are installed', function () {
      // then, installing newer serves are sufficient.
      uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.false;
    }),
    it('with no server are installed', function () {
      uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.false;
    });
  });

  describe('shouldInstallServerPackages', function () {
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server(log, {
        adb, ...defaultUIA2ServerOptions
      });
    });
    it('with newer servers are installed', function () {
      uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverTestApk
        }
      // since installation may fail
      ]).should.be.false;
    }),
    it('with newer server is installed but the other could be old one', function () {
      // Then, enforce to uninstall all apks
      uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.true;
    }),
    it('with newer server is installed', function () {
      uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.false;
    }),
    it('with older servers are installed', function () {
      // then, installing newer serves are sufficient.
      uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.true;
    }),
    it('with no server are installed', function () {
      uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverTestApk
        }
      ]).should.be.true;
    });
  });

  describe('installServerApk', withMocks({adb, helpers}, (mocks) => {
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server(log, {
        adb, ...defaultUIA2ServerOptions
      });
    });
    afterEach(function () {
      mocks.verify();
    });

    it('new server and server.test are older than installed version', async function () {
      mocks.helpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED);

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
      mocks.helpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mocks.adb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED);

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
      mocks.helpers.expects('isWriteable').never();

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
      mocks.helpers.expects('isWriteable').atLeast(1)
        .returns(true);

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
      mocks.helpers.expects('isWriteable').never();

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
      mocks.helpers.expects('isWriteable').never();

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
