import assert from 'node:assert/strict';
import {once} from 'node:events';
import {createServer, type AddressInfo} from 'node:net';
import * as path from 'node:path';
import {describe, it, before, beforeEach, afterEach} from 'node:test';

import {ADB} from 'appium-adb';
import sinon from 'sinon';

import {AndroidUiautomator2Driver} from '../../lib/driver.js';
import {UiAutomator2Server} from '../../lib/uiautomator2-server/core.js';

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

    it('accepts the strategies that are evaluated by the server', function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      for (const strategy of ['-android uiautomator', '-android class chain', '-android predicate string']) {
        assert.ok(driver.locatorStrategies.includes(strategy), strategy);
      }
    });
  });

  describe('createSession', function () {
    it('rejects equal explicit ports before preparing the device', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const getDeviceInfo = sandbox.stub(driver, 'getDeviceInfoFromCaps').rejects(new Error('Unexpected device setup'));

      await assert.rejects(
        driver.createSession({
          firstMatch: [{}],
          alwaysMatch: {
            'appium:systemPort': 8317,
            'appium:mjpegServerPort': 8317,
          },
        } as any),
        /appium:systemPort and appium:mjpegServerPort must use different ports.*8317/,
      );

      sinon.assert.notCalled(getDeviceInfo);
    });

    it('should throw an error if app can not be found', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      await assert.rejects(
        driver.createSession({
          firstMatch: [{}],
          alwaysMatch: {
            'appium:app': 'foo.apk',
          },
        } as any),
        /does not exist or is not accessible/,
      );
    });

    it('should set sessionId', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.mock(driver).expects('checkAppPresent').once().returns(Promise.resolve());
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(Promise.resolve());
      await driver.createSession({
        firstMatch: [{}],
        alwaysMatch: {
          browserName: 'chrome',
        },
      } as any);
      assert.ok(driver.sessionId);
    });

    it('should set the default context', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(Promise.resolve(24));
      sandbox.mock(driver).expects('checkAppPresent').returns(Promise.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(Promise.resolve());
      await driver.createSession({
        firstMatch: [{}],
        alwaysMatch: {
          browserName: 'chrome',
        },
      } as any);
      assert.strictEqual(driver.curContext, 'NATIVE_APP');
    });
  });

  describe('checkAppPresent', function () {
    it('should resolve if app present', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      defaultStub(driver);
      const app = path.resolve('.');
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(Promise.resolve());
      // `driver.helpers` is a frozen ES module namespace object shared across instances, so it
      // can't be stubbed in place - swap in a mutable shallow copy on this instance first.
      driver.helpers = {...driver.helpers};
      const configureAppStub = sandbox.stub(driver.helpers, 'configureApp').resolves(app);

      await driver.createSession({
        firstMatch: [{}],
        alwaysMatch: {'appium:app': app},
      } as any);

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
      driver.helpers = {...driver.helpers};
      sandbox.mock(driver.helpers).expects('configureApp').returns(app);

      await driver.createSession({
        firstMatch: [{}],
        alwaysMatch: {'appium:app': app},
      } as any);

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
            await driver.createSession({
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': false,
              },
            } as any);
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.strictEqual(proxyAvoidList.length, 0);
          });
          it('should not proxy screenshot if nativeWebScreenshot is on on chromedriver mode', async function () {
            await driver.createSession({
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': true,
              },
            } as any);
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.ok(proxyAvoidList.length > 0);
          });
        });

        describe('on native mode', function () {
          it('should never proxy screenshot regardless of nativeWebScreenshot setting (on)', async function () {
            // nativeWebScreenshot on
            await driver.createSession({
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': true,
              },
            } as any);
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            assert.ok(proxyAvoidList.length > 0);
          });

          it('should never proxy screenshot regardless of nativeWebScreenshot setting (off)', async function () {
            // nativeWebScreenshot off
            await driver.createSession({
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': false,
              },
            } as any);
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
    it('should trap and rewrite as predicate string locator', async function () {
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
          strategy: '-android predicate string',
          selector: 'scrollable == true',
        },
      ]);
    });
  });

  describe('ADB port forwarding', function () {
    let driver: AndroidUiautomator2Driver;
    let adb: ADB;

    beforeEach(function () {
      driver = new AndroidUiautomator2Driver();
      adb = new ADB();
      driver.adb = adb;
      driver.opts.remoteAdbHost = 'adb.example.test';
    });

    it('skips ports already forwarded or in use and releases only the reserved port', async function () {
      const forward = sandbox.stub(adb, 'adbExec');
      forward.onFirstCall().rejects(new Error('adb: error: cannot rebind existing socket'));
      forward.onSecondCall().rejects(new Error('adb: error: cannot bind listener: Address already in use'));
      forward.onThirdCall().rejects(new Error("adb: error: cannot bind 'tcp:8202'"));
      forward.onCall(3).rejects(new Error('adb: error: cannot bind listener: Adresse bereits verwendet'));
      forward.onCall(4).resolves('');
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await driver.allocateSystemPort();
      assert.deepEqual(
        forward.getCalls().map((call) => call.args[0]),
        [
          ['forward', '--no-rebind', 'tcp:8200', 'tcp:6790'],
          ['forward', '--no-rebind', 'tcp:8201', 'tcp:6790'],
          ['forward', '--no-rebind', 'tcp:8202', 'tcp:6790'],
          ['forward', '--no-rebind', 'tcp:8203', 'tcp:6790'],
          ['forward', '--no-rebind', 'tcp:8204', 'tcp:6790'],
        ],
      );
      assert.equal(driver.systemPort, 8204);
      await driver.releaseSystemPort();
      await driver.releaseSystemPort();
      sinon.assert.calledOnceWithExactly(remove, 8204);
    });

    it('keeps the requested MJPEG port free during automatic system port selection', async function () {
      driver.opts.mjpegServerPort = 8200;
      const forward = sandbox.stub(adb, 'adbExec').resolves('');
      const server = sandbox.createStubInstance(UiAutomator2Server);
      sandbox.stub(driver, 'initUiAutomator2Server').resolves(server);
      sandbox.stub(driver, 'initAUT').resolves();

      await driver.performSessionExecution({});

      assert.deepEqual(
        forward.getCalls().map((call) => call.args[0]),
        [
          ['forward', '--no-rebind', 'tcp:8201', 'tcp:6790'],
          ['forward', '--no-rebind', 'tcp:8200', 'tcp:7810'],
        ],
      );
      assert.equal(driver.systemPort, 8201);
      assert.equal(driver.mjpegServerPort, 8200);
      sinon.assert.calledOnce(server.startSession);
    });

    for (const host of ['127.0.0.1', '::1', '0:0:0:0:0:0:0:1']) {
      it(`checks an occupied ${host} listener only for a local ADB connection`, async function (t) {
        const listener = createServer((socket) => socket.end());
        const listening = once(listener, 'listening');
        listener.listen(0, host);
        try {
          await listening;
        } catch (err) {
          if (
            host.includes(':') &&
            ['EADDRNOTAVAIL', 'EAFNOSUPPORT'].includes((err as NodeJS.ErrnoException).code ?? '')
          ) {
            t.skip('IPv6 loopback is unavailable');
            return;
          }
          throw err;
        }
        try {
          const {port} = listener.address() as AddressInfo;
          driver.opts.systemPort = port;
          driver.opts.remoteAdbHost = host;
          const forward = sandbox.stub(adb, 'adbExec').resolves('');
          await assert.rejects(driver.allocateSystemPort(), /unavailable.*already in use/);
          sinon.assert.notCalled(forward);

          driver.opts.remoteAdbHost = 'adb.example.test';
          await driver.allocateSystemPort();
          sinon.assert.calledOnceWithExactly(forward, ['forward', '--no-rebind', `tcp:${port}`, 'tcp:6790']);
        } finally {
          await listener[Symbol.asyncDispose]();
        }
      });
    }

    it('skips a port in the Windows excluded port range', async function () {
      const forward = sandbox.stub(adb, 'adbExec');
      forward.onFirstCall().rejects(new Error('cannot bind listener: cannot bind to 127.0.0.1:8200: (10013)'));
      forward.onSecondCall().resolves('');
      await driver.allocateSystemPort();
      assert.equal(driver.systemPort, 8201);
    });

    it('forwards the explicitly requested port without substituting another one', async function () {
      driver.opts.systemPort = 8317;
      const forward = sandbox.stub(adb, 'adbExec').resolves('');
      await driver.allocateSystemPort();
      sinon.assert.calledOnceWithExactly(forward, ['forward', '--no-rebind', 'tcp:8317', 'tcp:6790']);
      assert.equal(driver.systemPort, 8317);
    });

    it('leaves an occupied explicit port alone during cleanup', async function () {
      driver.opts.systemPort = 8317;
      const forward = sandbox.stub(adb, 'adbExec').rejects(new Error('adb: error: cannot rebind existing socket'));
      const remove = sandbox.stub(adb, 'removePortForward').resolves();
      await assert.rejects(driver.allocateSystemPort(), /8317.*choose a free port.*cannot rebind existing socket/i);
      await driver.releaseSystemPort();
      sinon.assert.calledOnce(forward);
      sinon.assert.notCalled(remove);
    });

    it('reports an unconfirmed system forward without retrying or removing it', async function () {
      const error = new Error('device offline');
      const forward = sandbox.stub(adb, 'adbExec').rejects(error);
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await assert.rejects(driver.allocateSystemPort(), {
        message: /tcp:8200 on adb\.example\.test: device offline.*adb forward --list.*adb forward --remove tcp:8200/,
        cause: error,
      });
      await driver.releaseSystemPort();
      sinon.assert.calledOnce(forward);
      sinon.assert.notCalled(remove);
      assert.equal(driver.systemPort, undefined);
    });

    it('leaves a configured MJPEG forward alone when the system port reservation fails', async function () {
      driver.opts.systemPort = 8317;
      driver.opts.mjpegServerPort = 9100;
      sandbox.stub(adb, 'adbExec').rejects(new Error('cannot rebind existing socket'));
      sandbox.stub(adb, 'getApiLevel').resolves(27);
      sandbox.stub(adb, 'stopLogcat');
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await assert.rejects(driver.performSessionExecution({}), /8317.*unavailable/);
      await driver.deleteSession();
      sinon.assert.notCalled(remove);
    });

    it('releases only the system port when the MJPEG port is already forwarded', async function () {
      driver.opts.systemPort = 8317;
      driver.opts.mjpegServerPort = 9100;
      const forward = sandbox.stub(adb, 'adbExec');
      forward.onFirstCall().resolves('');
      forward.onSecondCall().rejects(new Error('cannot rebind existing socket'));
      sandbox.stub(adb, 'getApiLevel').resolves(27);
      sandbox.stub(adb, 'stopLogcat');
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await assert.rejects(driver.performSessionExecution({}), /mjpegServerPort #9100.*cannot rebind/);
      assert.deepEqual(forward.secondCall.args[0], ['forward', '--no-rebind', 'tcp:9100', 'tcp:7810']);
      await driver.deleteSession();
      sinon.assert.calledOnceWithExactly(remove, 8317);
    });

    it('releases only the confirmed system forward after an ambiguous MJPEG timeout', async function () {
      driver.opts.systemPort = 8317;
      driver.opts.mjpegServerPort = 9100;
      const timeout = new Error('ADB command timed out');
      const forward = sandbox.stub(adb, 'adbExec');
      forward.onFirstCall().resolves('');
      forward.onSecondCall().rejects(timeout);
      sandbox.stub(adb, 'getApiLevel').resolves(27);
      sandbox.stub(adb, 'stopLogcat');
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await assert.rejects(driver.performSessionExecution({}), {
        message: /tcp:9100 on adb\.example\.test: ADB command timed out.*adb forward --list/,
        cause: timeout,
      });
      assert.equal(driver.mjpegServerPort, undefined);
      await driver.deleteSession();
      sinon.assert.calledTwice(forward);
      sinon.assert.calledOnceWithExactly(remove, 8317);
    });

    it('removes a successfully reserved MJPEG forward only once', async function () {
      driver.opts.mjpegServerPort = 9100;
      const forward = sandbox.stub(adb, 'adbExec').resolves('');
      const remove = sandbox.stub(adb, 'removePortForward').resolves();

      await driver.allocateMjpegServerPort();
      sinon.assert.calledOnceWithExactly(forward, ['forward', '--no-rebind', 'tcp:9100', 'tcp:7810']);
      await driver.releaseMjpegServerPort();
      await driver.releaseMjpegServerPort();
      sinon.assert.calledOnceWithExactly(remove, 9100);
    });

    it('reports exhaustion without allocating outside the documented range', async function () {
      const forward = sandbox.stub(adb, 'adbExec').rejects(new Error('adb: error: cannot rebind existing socket'));
      await assert.rejects(driver.allocateSystemPort(), /8200\.\.8299/);
      assert.equal(forward.callCount, 100);
      assert.deepEqual(forward.lastCall.args[0], ['forward', '--no-rebind', 'tcp:8299', 'tcp:6790']);
      assert.equal(driver.systemPort, undefined);
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

  describe('accessibility events service', function () {
    let driver: AndroidUiautomator2Driver;
    let setServiceState: sinon.SinonStub;
    let initDevice: sinon.SinonStub;

    beforeEach(function () {
      driver = new AndroidUiautomator2Driver({} as any, false);
      driver.adb = new ADB();
      driver.caps = {} as any;
      sandbox.stub(driver.adb, 'getApiLevel').resolves(27);
      sandbox.stub(driver.adb, 'stopLogcat');
      sandbox.stub(driver, 'getLaunchInfo').resolves(undefined);
      initDevice = sandbox.stub(driver, 'initDevice').resolves();
      setServiceState = sandbox.stub(driver.settingsApp, 'setAccessibilityEventsServiceState');
    });

    describe('startup', function () {
      it('should not enable the service by default', async function () {
        await driver.performSessionPreExecSetup();
        assert.strictEqual(setServiceState.called, false);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
      it('should enable the service after initDevice', async function () {
        driver.opts.enableAccessibilityEventsService = true;
        setServiceState.resolves(true);
        await driver.performSessionPreExecSetup();
        sinon.assert.calledOnceWithExactly(setServiceState, true);
        sinon.assert.callOrder(initDevice, setServiceState);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, true);
      });
      it('should not remember the service if it was already enabled', async function () {
        driver.opts.enableAccessibilityEventsService = true;
        setServiceState.resolves(false);
        await driver.performSessionPreExecSetup();
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
      it('should let the cleanup disable the service if another preflight step fails', async function () {
        driver.opts.enableAccessibilityEventsService = true;
        setServiceState.resolves(true);
        // initDevice() is slower than the failing step
        initDevice.callsFake(async () => await new Promise((resolve) => setTimeout(resolve, 20)));
        (driver.getLaunchInfo as sinon.SinonStub).rejects(new Error('boom'));
        await assert.rejects(driver.performSessionPreExecSetup(), /boom/);
        // The service flag must be final by the time the failure reaches the cleanup
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, true);
      });
      it('should throw if the service cannot be enabled', async function () {
        driver.opts.enableAccessibilityEventsService = true;
        setServiceState.rejects(new Error('denied'));
        await assert.rejects(driver.performSessionPreExecSetup(), /Cannot enable the accessibility service.+denied/);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
    });

    describe('cleanup', function () {
      it('should disable the service if it was enabled by the session', async function () {
        driver._wasAccessibilityEventsServiceEnabled = true;
        await driver.deleteSession();
        sinon.assert.calledOnceWithExactly(setServiceState, false);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
      it('should not touch the service if it was not enabled by the session', async function () {
        await driver.deleteSession();
        assert.strictEqual(setServiceState.called, false);
      });
      it('should disable the service even if the window animation cannot be restored', async function () {
        driver._wasAccessibilityEventsServiceEnabled = true;
        driver._wasWindowAnimationDisabled = true;
        sandbox.stub(driver.settingsApp, 'setAnimationState').rejects(new Error('denied'));
        await driver.deleteSession();
        sinon.assert.calledOnceWithExactly(setServiceState, false);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
      it('should retry disabling the service once and then forget it', async function () {
        driver._wasAccessibilityEventsServiceEnabled = true;
        setServiceState.onFirstCall().rejects(new Error('denied')).onSecondCall().resolves(true);
        await driver.deleteSession();
        sinon.assert.calledTwice(setServiceState);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, false);
      });
      it('should not fail the teardown and keep the service marker if it cannot be disabled', async function () {
        driver._wasAccessibilityEventsServiceEnabled = true;
        setServiceState.rejects(new Error('denied'));
        await driver.deleteSession();
        sinon.assert.calledTwice(setServiceState);
        assert.strictEqual(driver._wasAccessibilityEventsServiceEnabled, true);
      });
    });

    describe('suppression of accessibility services', function () {
      async function getServerOption(opts: Record<string, any>): Promise<boolean | undefined> {
        driver.systemPort = 4724;
        Object.assign(driver.opts, {skipServerInstallation: true}, opts);
        const server = await driver.initUiAutomator2Server();
        // @ts-expect-error - private field
        return server.disableSuppressAccessibilityService;
      }

      it('should keep the default if the service is not requested', async function () {
        assert.strictEqual(await getServerOption({}), undefined);
      });
      it('should disable the suppression if the service is requested', async function () {
        assert.strictEqual(await getServerOption({enableAccessibilityEventsService: true}), true);
      });
      it('should respect an explicit true value', async function () {
        assert.strictEqual(
          await getServerOption({enableAccessibilityEventsService: true, disableSuppressAccessibilityService: true}),
          true,
        );
      });
      it('should respect an explicit false value', async function () {
        assert.strictEqual(
          await getServerOption({enableAccessibilityEventsService: true, disableSuppressAccessibilityService: false}),
          false,
        );
      });
    });
  });

  describe('command overrides', function () {
    it('should expose commands as prototype methods', function () {
      for (const name of ['getAlertText', 'mobileGetBatteryInfo', 'requireUiautomator2', 'mobileGetContexts']) {
        assert.strictEqual(Object.hasOwn(new AndroidUiautomator2Driver(), name), false, name);
      }
    });
    it('should allow descendants to override a command and call super', async function () {
      class CustomDriver extends AndroidUiautomator2Driver {
        override async getPageSource(): Promise<string> {
          return `custom:${await super.getPageSource()}`;
        }
      }
      const driver = new CustomDriver();
      driver.uiautomator2 = {jwproxy: {command: sandbox.stub().resolves('<xml/>')}} as any;
      assert.strictEqual(await driver.getPageSource(), 'custom:<xml/>');
    });
  });
});
