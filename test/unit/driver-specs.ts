import assert from 'node:assert/strict';
import * as path from 'node:path';
import {describe, it, before, beforeEach, afterEach} from 'node:test';

import {ADB} from 'appium-adb';
import sinon from 'sinon';

import {AndroidUiautomator2Driver} from '../../lib/driver.js';

const sandbox = sinon.createSandbox();

function defaultStub(driver: AndroidUiautomator2Driver): ADB {
  sandbox.stub(driver, 'getDeviceDetails');
  const adb = new ADB();
  sandbox.stub(driver, 'createADB').returns(Promise.resolve(adb));
  sandbox
    .mock(driver)
    .expects('getDeviceInfoFromCaps')
    .once()
    .returns(
      Promise.resolve({
        udid: '123',
        emPort: false,
      }),
    );
  return adb;
}

describe('driver.js', function () {
  afterEach(function () {
    sandbox.restore();
  });

  describe('constructor', function () {
    it('calls BaseDriver constructor with opts', function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      assert.ok(driver);
      assert.ok(driver.opts);
    });
  });

  describe('createSession', function () {
    it('should throw an error if app can not be found', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      await assert.rejects(
        driver.createSession(
          {} as any,
          {} as any,
          {
            firstMatch: [{}],
            alwaysMatch: {
              'appium:app': 'foo.apk',
            },
          } as any,
        ),
        /does not exist or is not accessible/,
      );
    });

    it('should set sessionId', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.mock(driver).expects('checkAppPresent').once().returns(Promise.resolve());
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(Promise.resolve());
      await driver.createSession(
        {} as any,
        {} as any,
        {
          firstMatch: [{}],
          alwaysMatch: {
            browserName: 'chrome',
          },
        } as any,
      );
      assert.ok(driver.sessionId);
    });

    it('should set the default context', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      sandbox.mock(driver).expects('checkAppPresent').returns(Promise.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(Promise.resolve());
      await driver.createSession(
        {} as any,
        {} as any,
        {
          firstMatch: [{}],
          alwaysMatch: {
            browserName: 'chrome',
          },
        } as any,
      );
      assert.strictEqual(driver.curContext, 'NATIVE_APP');
    });
  });

  describe('checkAppPresent', function () {
    it('should resolve if app present', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      defaultStub(driver);
      const app = path.resolve('.');
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(Promise.resolve());
      const configureAppStub = sandbox.stub(driver.helpers, 'configureApp').resolves(app);

      await driver.createSession(
        {} as any,
        {} as any,
        {
          firstMatch: [{}],
          alwaysMatch: {'appium:app': app},
        } as any,
      );

      await driver.checkAppPresent(); // should not error

      // configureApp is shared between the two,
      // so restore mock or the next test will fail
      configureAppStub.restore();
    });

    it('should reject if app not present', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      defaultStub(driver);
      const app = path.resolve('asdfasdf');
      const checkAppPresentStub = sandbox.stub(driver, 'checkAppPresent').returns(Promise.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(Promise.resolve());
      sandbox.mock(driver.helpers).expects('configureApp').returns(app);

      await driver.createSession(
        {} as any,
        {} as any,
        {
          firstMatch: [{}],
          alwaysMatch: {'appium:app': app},
        } as any,
      );

      checkAppPresentStub.restore();
      await assert.rejects(driver.checkAppPresent(), /Could not find/);
    });
  });

  describe('proxying', function () {
    let driver: AndroidUiautomator2Driver;
    before(function () {
      driver = new AndroidUiautomator2Driver({} as any, false);
      defaultStub(driver);
      driver.sessionId = 'abc';
    });
    describe('#proxyActive', function () {
      it('should exist', function () {
        assert.ok(driver.proxyActive instanceof Function);
      });
      it('should return true', function () {
        assert.strictEqual(driver.proxyActive('abc'), true);
      });
    });

    describe('#getProxyAvoidList', function () {
      it('should exist', function () {
        assert.ok(driver.getProxyAvoidList instanceof Function);
      });
      it('should return jwpProxyAvoid array', function () {
        const avoidList = driver.getProxyAvoidList();
        assert.ok(Array.isArray(avoidList));
        assert.deepStrictEqual(avoidList, driver.jwpProxyAvoid);
      });
      it('should throw an error if session id is wrong', function () {
        assert.doesNotThrow(() => {
          driver.getProxyAvoidList();
        });
      });
      describe('nativeWebScreenshot', function () {
        let proxyAvoidList: Array<[string, RegExp]>;
        const nativeWebScreenshotFilter = (item: [string, RegExp]) =>
          item[0] === 'GET' && item[1].test('/session/xxx/screenshot/');
        beforeEach(function () {
          driver = new AndroidUiautomator2Driver({} as any, false);
          const adb = defaultStub(driver);
          sandbox.mock(driver).expects('checkAppPresent').once().returns(Promise.resolve());
          sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
          sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(Promise.resolve());
        });

        describe('on webview mode', function () {
          beforeEach(function () {
            driver.chromedriver = true as any;
          });
          it('should proxy screenshot if nativeWebScreenshot is off on chromedriver mode', async function () {
            await driver.createSession(
              {} as any,
              {} as any,
              {
                firstMatch: [{}],
                alwaysMatch: {
                  platformName: 'Android',
                  'appium:deviceName': 'device',
                  browserName: 'chrome',
                  'appium:nativeWebScreenshot': false,
                },
              } as any,
            );
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.strictEqual(proxyAvoidList.length, 0);
          });
          it('should not proxy screenshot if nativeWebScreenshot is on on chromedriver mode', async function () {
            await driver.createSession(
              {} as any,
              {} as any,
              {
                firstMatch: [{}],
                alwaysMatch: {
                  platformName: 'Android',
                  'appium:deviceName': 'device',
                  browserName: 'chrome',
                  'appium:nativeWebScreenshot': true,
                },
              } as any,
            );
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.ok(proxyAvoidList.length > 0);
          });
        });

        describe('on native mode', function () {
          it('should never proxy screenshot regardless of nativeWebScreenshot setting (on)', async function () {
            // nativeWebScreenshot on
            await driver.createSession(
              {} as any,
              {} as any,
              {
                firstMatch: [{}],
                alwaysMatch: {
                  platformName: 'Android',
                  'appium:deviceName': 'device',
                  browserName: 'chrome',
                  'appium:nativeWebScreenshot': true,
                },
              } as any,
            );
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.ok(proxyAvoidList.length > 0);
          });

          it('should never proxy screenshot regardless of nativeWebScreenshot setting (off)', async function () {
            // nativeWebScreenshot off
            await driver.createSession(
              {} as any,
              {} as any,
              {
                firstMatch: [{}],
                alwaysMatch: {
                  platformName: 'Android',
                  'appium:deviceName': 'device',
                  browserName: 'chrome',
                  'appium:nativeWebScreenshot': false,
                },
              } as any,
            );
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.ok(proxyAvoidList.length > 0);
          });
        });
      });
    });

    describe('#canProxy', function () {
      it('should exist', function () {
        assert.ok(driver.canProxy instanceof Function);
      });
      it('should return true', function () {
        assert.strictEqual(driver.canProxy('abc'), true);
      });
    });
  });

  describe('magic first visible child xpath', function () {
    const driver = new AndroidUiautomator2Driver({} as any, false);
    it('should trap and proxy to special uia2 server endpoint', async function () {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}} as any;
      const proxySpy = sandbox.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({
        strategy: 'xpath',
        selector: '/*[@firstVisible="true"]',
        context: 'foo',
        multiple: false,
      });
      assert.deepStrictEqual(proxySpy.firstCall.args, [`/appium/element/foo/first_visible`, 'GET', {}]);
    });
  });

  describe('magic scrollable view xpath', function () {
    const driver = new AndroidUiautomator2Driver({} as any, false);
    it('should trap and rewrite as uiautomator locator', async function () {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}} as any;
      const proxySpy = sandbox.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({
        strategy: 'xpath',
        selector: '//*[@scrollable="true"]',
        context: 'foo',
        multiple: false,
      });
      assert.deepStrictEqual(proxySpy.firstCall.args, [
        '/element',
        'POST',
        {
          context: 'foo',
          multiple: false,
          strategy: '-android uiautomator',
          selector: 'new UiSelector().scrollable(true)',
        },
      ]);
    });
  });

  describe('deleteSession', function () {
    let driver: AndroidUiautomator2Driver;
    beforeEach(function () {
      driver = new AndroidUiautomator2Driver({} as any, false);
      driver.adb = new ADB();
      driver.caps = {} as any;
      sandbox.stub(driver.adb, 'stopLogcat');
    });
    afterEach(function () {
      sandbox.restore();
    });

    it('should call setDefaultHiddenApiPolicy', async function () {
      sandbox.stub(driver.adb, 'getApiLevel').resolves(28);
      const setDefaultHiddenApiPolicyStub = sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      assert.strictEqual(setDefaultHiddenApiPolicyStub.calledOnce, true);
    });
    it('should not call setDefaultHiddenApiPolicy', async function () {
      sandbox.stub(driver.adb, 'getApiLevel').resolves(27);
      const setDefaultHiddenApiPolicyStub = sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      assert.strictEqual(setDefaultHiddenApiPolicyStub.calledOnce, false);
    });
  });
});
