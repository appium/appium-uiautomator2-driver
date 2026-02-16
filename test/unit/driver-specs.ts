import {AndroidUiautomator2Driver} from '../../lib/driver';
import sinon from 'sinon';
import * as path from 'node:path';
import B from 'bluebird';
import {ADB} from 'appium-adb';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

const {expect} = chai;
chai.use(chaiAsPromised);

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
  this.afterEach(function () {
    sandbox.restore();
  });

  describe('constructor', function () {
    it('calls BaseDriver constructor with opts', function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      expect(driver).to.exist;
      expect(driver.opts).to.exist;
    });
  });

  describe('createSession', function () {
    it('should throw an error if app can not be found', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      await expect(
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
      ).to.be.rejectedWith('does not exist or is not accessible');
    });

    it('should set sessionId', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.mock(driver).expects('checkAppPresent').once().returns(B.resolve());
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(B.resolve());
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
      expect(driver.sessionId).to.exist;
    });

    it('should set the default context', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      sandbox.mock(driver).expects('checkAppPresent').returns(B.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
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
      expect(driver.curContext).to.equal('NATIVE_APP');
    });
  });

  describe('checkAppPresent', function () {
    it('should resolve if app present', async function () {
      const driver = new AndroidUiautomator2Driver({} as any, false);
      defaultStub(driver);
      const app = path.resolve('.');
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
      const configureAppStub = sandbox.stub(driver.helpers, 'configureApp').returns(app);

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
      const checkAppPresentStub = sandbox.stub(driver, 'checkAppPresent').returns(B.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
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
      await expect(driver.checkAppPresent()).to.be.rejectedWith('Could not find');
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
        expect(driver.proxyActive).to.be.an.instanceof(Function);
      });
      it('should return true', function () {
        expect(driver.proxyActive('abc')).to.be.true;
      });
      it('should throw an error if session id is wrong', function () {
        expect(() => {
          driver.proxyActive('aaa');
        }).to.throw;
      });
    });

    describe('#getProxyAvoidList', function () {
      it('should exist', function () {
        expect(driver.getProxyAvoidList).to.be.an.instanceof(Function);
      });
      it('should return jwpProxyAvoid array', function () {
        const avoidList = driver.getProxyAvoidList();
        expect(avoidList).to.be.an.instanceof(Array);
        expect(avoidList).to.eql(driver.jwpProxyAvoid);
      });
      it('should throw an error if session id is wrong', function () {
        expect(() => {
          driver.getProxyAvoidList();
        }).to.not.throw;
      });
      describe('nativeWebScreenshot', function () {
        let proxyAvoidList: Array<[string, RegExp]>;
        const nativeWebScreenshotFilter = (item: [string, RegExp]) =>
          item[0] === 'GET' && item[1].test('/session/xxx/screenshot/');
        beforeEach(function () {
          driver = new AndroidUiautomator2Driver({} as any, false);
          const adb = defaultStub(driver);
          sandbox.mock(driver).expects('checkAppPresent').once().returns(B.resolve());
          sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
          sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(B.resolve());
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
            expect(proxyAvoidList).to.be.empty;
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
            expect(proxyAvoidList).to.not.be.empty;
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
            expect(proxyAvoidList).to.not.be.empty;
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
            expect(proxyAvoidList).to.not.be.empty;
          });
        });
      });
    });

    describe('#canProxy', function () {
      it('should exist', function () {
        expect(driver.canProxy).to.be.an.instanceof(Function);
      });
      it('should return true', function () {
        expect(driver.canProxy('abc')).to.be.true;
      });
      it('should throw an error if session id is wrong', function () {
        expect(() => {
          driver.canProxy('aaa');
        }).to.throw;
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
      expect(proxySpy.firstCall.args).to.eql([`/appium/element/foo/first_visible`, 'GET', {}]);
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
      expect(proxySpy.firstCall.args).to.eql([
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
      sandbox.stub(driver.adb, 'getApiLevel').returns(28);
      const setDefaultHiddenApiPolicyStub = sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      expect(setDefaultHiddenApiPolicyStub.calledOnce).to.be.true;
    });
    it('should not call setDefaultHiddenApiPolicy', async function () {
      sandbox.stub(driver.adb, 'getApiLevel').returns(27);
      const setDefaultHiddenApiPolicyStub = sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      expect(setDefaultHiddenApiPolicyStub.calledOnce).to.be.false;
    });
  });
});
