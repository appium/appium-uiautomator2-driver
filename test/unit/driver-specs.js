import {AndroidUiautomator2Driver} from '../../lib/driver';
import sinon from 'sinon';
import path from 'path';
import B from 'bluebird';
import {ADB} from 'appium-adb';

const sandbox = sinon.createSandbox();

function defaultStub(driver) {
  sandbox.stub(driver, 'getDeviceDetails');
  const adb = new ADB();
  sandbox.stub(driver, 'createADB').returns(Promise.resolve(adb));
  sandbox.mock(driver).expects('getDeviceInfoFromCaps').once().returns(Promise.resolve({
    udid: '123',
    emPort: false
  }));
  return adb;
}

describe('driver.js', function () {
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);
  });

  this.afterEach(function() {
    sandbox.restore();
  });

  describe('constructor', function () {
    it('calls BaseDriver constructor with opts', function () {
      let driver = new AndroidUiautomator2Driver({foo: 'bar'});
      driver.should.exist;
      driver.opts.foo.should.equal('bar');
    });
  });

  describe('createSession', function () {
    it('should throw an error if app can not be found', async function () {
      let driver = new AndroidUiautomator2Driver({}, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      await driver
        .createSession(null, null, {
          firstMatch: [{}],
          alwaysMatch: {
            'appium:app': 'foo.apk',
          },
        })
        .should.be.rejectedWith('does not exist or is not accessible');
    });

    it('should set sessionId', async function () {
      let driver = new AndroidUiautomator2Driver({}, false);
      const adb = defaultStub(driver);
      sandbox.mock(driver).expects('checkAppPresent').once().returns(B.resolve());
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(B.resolve());
      await driver.createSession(null, null, {
        firstMatch: [{}],
        alwaysMatch: {
          'appium:cap': 'foo',
          browserName: 'chrome',
        },
      });
      driver.sessionId.should.exist;
      driver.caps.cap.should.equal('foo');
    });

    it('should set the default context', async function () {
      let driver = new AndroidUiautomator2Driver({}, false);
      const adb = defaultStub(driver);
      sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
      sandbox.mock(driver).expects('checkAppPresent').returns(B.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
      await driver.createSession(null, null, {
        firstMatch: [{}],
        alwaysMatch: {
          browserName: 'chrome',
        },
      });
      driver.curContext.should.equal('NATIVE_APP');
    });
  });

  describe('checkAppPresent', function () {
    it('should resolve if app present', async function () {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      let app = path.resolve('.');
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
      sandbox.mock(driver.helpers).expects('configureApp').returns(app);

      await driver.createSession(null, null, {
        firstMatch: [{}],
        alwaysMatch: {'appium:app': app},
      });

      await driver.checkAppPresent(); // should not error

      // configureApp is shared between the two,
      // so restore mock or the next test will fail
      driver.helpers.configureApp.restore();
    });

    it('should reject if app not present', async function () {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      let app = path.resolve('asdfasdf');
      sandbox.mock(driver).expects('checkAppPresent').returns(B.resolve());
      sandbox.mock(driver).expects('startUiAutomator2Session').returns(B.resolve());
      sandbox.mock(driver.helpers).expects('configureApp').returns(app);

      await driver.createSession(null, null, {
        firstMatch: [{}],
        alwaysMatch: {'appium:app': app},
      });

      driver.checkAppPresent.restore();
      await driver.checkAppPresent().should.eventually.be.rejectedWith('Could not find');
    });
  });

  describe('proxying', function () {
    let driver;
    before(function () {
      driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      driver.sessionId = 'abc';
    });
    describe('#proxyActive', function () {
      it('should exist', function () {
        driver.proxyActive.should.be.an.instanceof(Function);
      });
      it('should return true', function () {
        driver.proxyActive('abc').should.be.true;
      });
      it('should throw an error if session id is wrong', function () {
        (() => {
          driver.proxyActive('aaa');
        }).should.throw;
      });
    });

    describe('#getProxyAvoidList', function () {
      it('should exist', function () {
        driver.getProxyAvoidList.should.be.an.instanceof(Function);
      });
      it('should return jwpProxyAvoid array', function () {
        let avoidList = driver.getProxyAvoidList('abc');
        avoidList.should.be.an.instanceof(Array);
        avoidList.should.eql(driver.jwpProxyAvoid);
      });
      it('should throw an error if session id is wrong', function () {
        (() => {
          driver.getProxyAvoidList('aaa');
        }).should.throw;
      });
      describe('nativeWebScreenshot', function () {
        let proxyAvoidList;
        let nativeWebScreenshotFilter = (item) =>
          item[0] === 'GET' && item[1].test('/session/xxx/screenshot/');
        beforeEach(function () {
          driver = new AndroidUiautomator2Driver({}, false);
          const adb = defaultStub(driver);
          sandbox.mock(driver).expects('checkAppPresent').once().returns(B.resolve());
          sandbox.stub(adb, 'getApiLevel').onFirstCall().returns(B.resolve(24));
          sandbox.mock(driver).expects('startUiAutomator2Session').once().returns(B.resolve());
        });

        describe('on webview mode', function () {
          beforeEach(function () {
            driver.chromedriver = true;
          });
          it('should proxy screenshot if nativeWebScreenshot is off on chromedriver mode', async function () {
            await driver.createSession(null, null, {
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': false,
              },
            });
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            proxyAvoidList.should.be.empty;
          });
          it('should not proxy screenshot if nativeWebScreenshot is on on chromedriver mode', async function () {
            await driver.createSession(null, null, {
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': true,
              },
            });
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            proxyAvoidList.should.not.be.empty;
          });
        });

        describe('on native mode', function () {
          it('should never proxy screenshot regardless of nativeWebScreenshot setting (on)', async function () {
            // nativeWebScreenshot on
            await driver.createSession(null, null, {
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': true,
              },
            });
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            proxyAvoidList.should.not.be.empty;
          });

          it('should never proxy screenshot regardless of nativeWebScreenshot setting (off)', async function () {
            // nativeWebScreenshot off
            await driver.createSession(null, null, {
              firstMatch: [{}],
              alwaysMatch: {
                platformName: 'Android',
                'appium:deviceName': 'device',
                browserName: 'chrome',
                'appium:nativeWebScreenshot': false,
              },
            });
            proxyAvoidList = driver.getProxyAvoidList().filter(nativeWebScreenshotFilter);
            proxyAvoidList.should.not.be.empty;
          });
        });
      });
    });

    describe('#canProxy', function () {
      it('should exist', function () {
        driver.canProxy.should.be.an.instanceof(Function);
      });
      it('should return true', function () {
        driver.canProxy('abc').should.be.true;
      });
      it('should throw an error if session id is wrong', function () {
        (() => {
          driver.canProxy('aaa');
        }).should.throw;
      });
    });
  });

  describe('magic first visible child xpath', function () {
    let driver = new AndroidUiautomator2Driver({}, false);
    it('should trap and proxy to special uia2 server endpoint', async function () {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      let proxySpy = sandbox.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({
        strategy: 'xpath',
        selector: '/*[@firstVisible="true"]',
        context: 'foo',
      });
      proxySpy.firstCall.args.should.eql([`/appium/element/foo/first_visible`, 'GET', {}]);
    });
  });

  describe('magic scrollable view xpath', function () {
    let driver = new AndroidUiautomator2Driver({}, false);
    it('should trap and rewrite as uiautomator locator', async function () {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      let proxySpy = sandbox.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({
        strategy: 'xpath',
        selector: '//*[@scrollable="true"]',
        context: 'foo',
      });
      proxySpy.firstCall.args.should.eql([
        '/element',
        'POST',
        {
          context: 'foo',
          strategy: '-android uiautomator',
          selector: 'new UiSelector().scrollable(true)',
        },
      ]);
    });
  });

  describe('deleteSession', function () {
    let driver;
    beforeEach(function () {
      driver = new AndroidUiautomator2Driver({}, false);
      driver.adb = new ADB();
      driver.caps = {};
      sandbox.stub(driver.adb, 'stopLogcat');
    });
    afterEach(function () {
      sandbox.restore();
    });

    it('should call setDefaultHiddenApiPolicy', async function () {
      sandbox.stub(driver.adb, 'getApiLevel').returns(28);
      sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      driver.adb.setDefaultHiddenApiPolicy.calledOnce.should.be.true;
    });
    it('should not call setDefaultHiddenApiPolicy', async function () {
      sandbox.stub(driver.adb, 'getApiLevel').returns(27);
      sandbox.stub(driver.adb, 'setDefaultHiddenApiPolicy');
      await driver.deleteSession();
      driver.adb.setDefaultHiddenApiPolicy.calledOnce.should.be.false;
    });
  });
});
