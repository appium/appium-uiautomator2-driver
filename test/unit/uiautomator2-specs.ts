import { ADB } from 'appium-adb';
import sinon from 'sinon';
import {
  UiAutomator2Server, INSTRUMENTATION_TARGET, SERVER_TEST_PACKAGE_ID
} from '../../lib/uiautomator2';
import * as helpers from '../../lib/helpers';
import {log} from '../../lib/logger';
import {expect} from 'chai';

describe('UiAutomator2', function () {
  let uiautomator2: UiAutomator2Server;

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
    systemPort: 4724,
    host: 'localhost',
    disableWindowAnimation: false
  };

  describe('shouldUninstallServerPackages', function () {
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server(log, {
        adb, ...defaultUIA2ServerOptions
      });
    });
    it('with newer servers are installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.true;
    }),
    it('with newer server is installed but the other could be old one', function () {
      // Then, enforce to uninstall all apks
      // @ts-expect-error - private method
      expect(uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.true;
    }),
    it('with newer server is installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.false;
    }),
    it('with older servers are installed', function () {
      // then, installing newer serves are sufficient.
      // @ts-expect-error - private method
      expect(uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.false;
    }),
    it('with no server are installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldUninstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.false;
    });
  });

  describe('shouldInstallServerPackages', function () {
    beforeEach(function () {
      uiautomator2 = new UiAutomator2Server(log, {
        adb, ...defaultUIA2ServerOptions
      });
    });
    it('with newer servers are installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverTestApk
        }
      // since installation may fail
      ])).to.be.false;
    }),
    it('with newer server is installed but the other could be old one', function () {
      // Then, enforce to uninstall all apks
      // @ts-expect-error - private method
      expect(uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.true;
    }),
    it('with newer server is installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.false;
    }),
    it('with older servers are installed', function () {
      // then, installing newer serves are sufficient.
      // @ts-expect-error - private method
      expect(uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.true;
    }),
    it('with no server are installed', function () {
      // @ts-expect-error - private method
      expect(uiautomator2.shouldInstallServerPackages([
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverApk
        },
        {
          'installState': adb.APP_INSTALL_STATE.NOT_INSTALLED,
          ...serverTestApk
        }
      ])).to.be.true;
    });
  });

  describe('installServerApk', function () {
    let mockAdb: sinon.SinonMock;
    let mockHelpers: sinon.SinonMock;
    let testAdb: ADB;

    beforeEach(function () {
      testAdb = new ADB();
      mockAdb = sinon.mock(testAdb);
      mockHelpers = sinon.mock(helpers);

      uiautomator2 = new UiAutomator2Server(log, {
        adb: testAdb, ...defaultUIA2ServerOptions
      });
    });
    afterEach(function () {
      mockAdb.verify();
      mockHelpers.verify();
      mockAdb.restore();
      mockHelpers.restore();
    });

    it('new server and server.test are older than installed version', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.NEWER_VERSION_INSTALLED);

      mockAdb.expects('uninstallApk').twice();
      mockAdb.expects('install').twice();

      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mockAdb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are newer than installed version', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.OLDER_VERSION_INSTALLED);

      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mockAdb.expects('uninstallApk').never();
      mockAdb.expects('install').twice();

      mockAdb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are the same as installed version', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED);

      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(true);

      mockAdb.expects('uninstallApk').never();
      mockAdb.expects('install').never();

      mockAdb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('new server and server.test are not installed', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.NOT_INSTALLED);

      // SERVER_TEST_PACKAGE_ID
      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mockAdb.expects('uninstallApk').never();
      mockAdb.expects('install').twice();

      mockAdb.expects('shell').withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('version numbers of new server and server.test are unknown', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.UNKNOWN);

      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mockAdb.expects('uninstallApk').twice();
      mockAdb.expects('install').twice();

      mockAdb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });

    it('a server is installed but server.test is not', async function () {
      mockHelpers.expects('isWriteable').never();

      // SERVER_PACKAGE_ID
      mockAdb.expects('getApplicationInstallState').once()
        .returns(adb.APP_INSTALL_STATE.SAME_VERSION_INSTALLED);

      mockAdb.expects('isAppInstalled')
        .withExactArgs(SERVER_TEST_PACKAGE_ID)
        .once().returns(false);

      mockAdb.expects('uninstallApk').twice();
      mockAdb.expects('install').twice();

      mockAdb.expects('shell')
        .withExactArgs(['pm', 'list', 'instrumentation'])
        .once().returns(INSTRUMENTATION_TARGET);
      await uiautomator2.installServerApk();
    });
  });
});

