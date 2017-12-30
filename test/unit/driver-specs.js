import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../..';
import sinon from 'sinon';
import path from 'path';
import B from 'bluebird';


chai.should();
chai.use(chaiAsPromised);

function defaultStub (driver) {
  sinon.stub(driver, 'fillDeviceDetails');
}

describe('driver.js', () => {
  describe('constructor', () => {
    it('calls BaseDriver constructor with opts', () => {
      let driver = new AndroidUiautomator2Driver({foo: 'bar'});
      driver.should.exist;
      driver.opts.foo.should.equal('bar');
    });
  });

  describe('createSession', () => {
    it('should throw an error if app can not be found', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      await driver.createSession({app: 'foo.apk'}).should.be.rejectedWith('app apk');
    });

    it('should set sessionId', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      sinon.mock(driver).expects('checkAppPresent')
          .once()
          .returns(B.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .once()
          .returns(B.resolve());
      await driver.createSession({cap: 'foo'});

      driver.sessionId.should.exist;
      driver.caps.cap.should.equal('foo');
    });

    it('should set the default context', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      sinon.mock(driver).expects('checkAppPresent')
          .returns(B.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(B.resolve());
      await driver.createSession({});
      driver.curContext.should.equal('NATIVE_APP');
    });
  });

  describe('checkAppPresent', async () => {
    it('should resolve if app present', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      let app = path.resolve('.');
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(B.resolve());
      sinon.mock(driver.helpers).expects('configureApp')
          .returns(app);

      await driver.createSession({app});

      await driver.checkAppPresent(); // should not error

      // configureApp is shared between the two,
      // so restore mock or the next test will fail
      driver.helpers.configureApp.restore();
    });

    it('should reject if app not present', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      let app = path.resolve('asdfasdf');
      sinon.mock(driver).expects('checkAppPresent')
          .returns(B.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(B.resolve());
      sinon.mock(driver.helpers).expects('configureApp')
          .returns(app);

      await driver.createSession({app});

      driver.checkAppPresent.restore();
      await driver.checkAppPresent().should.eventually.be.rejectedWith('Could not find');
    });
  });

  describe('proxying', () => {
    let driver;
    before(() => {
      driver = new AndroidUiautomator2Driver({}, false);
      defaultStub(driver);
      driver.sessionId = 'abc';
    });
    describe('#proxyActive', () => {
      it('should exist', () => {
        driver.proxyActive.should.be.an.instanceof(Function);
      });
      it('should return true', () => {
        driver.proxyActive('abc').should.be.true;
      });
      it('should throw an error if session id is wrong', () => {
        (() => {
          driver.proxyActive('aaa');
        }).should.throw;
      });
    });

    describe('#getProxyAvoidList', () => {
      it('should exist', () => {
        driver.getProxyAvoidList.should.be.an.instanceof(Function);
      });
      it('should return jwpProxyAvoid array', () => {
        let avoidList = driver.getProxyAvoidList('abc');
        avoidList.should.be.an.instanceof(Array);
        avoidList.should.eql(driver.jwpProxyAvoid);
      });
      it('should throw an error if session id is wrong', () => {
        (() => {
          driver.getProxyAvoidList('aaa');
        }).should.throw;
      });
      describe('nativeWebScreenshot', function () {
        let listLength;
        beforeEach(function () {
          driver = new AndroidUiautomator2Driver({}, false);
          defaultStub(driver);
          sinon.mock(driver).expects('checkAppPresent')
              .once()
              .returns(B.resolve());
          sinon.mock(driver).expects('startUiAutomator2Session')
              .once()
              .returns(B.resolve());
        });

        it('should proxy screenshot if nativeWebScreenshot is off', async function () {
          await driver.createSession({platformName: 'Android', deviceName: 'device', browserName: 'chrome', nativeWebScreenshot: false});
          driver.getProxyAvoidList().should.have.length.above(40);
          listLength = driver.getProxyAvoidList().length;
        });
        it('should not proxy screenshot if nativeWebScreenshot is on', async function () {
          await driver.createSession({platformName: 'Android', deviceName: 'device', browserName: 'chrome', nativeWebScreenshot: true});
          driver.getProxyAvoidList().should.have.length(listLength + 1);
        });
      });
    });

    describe('#canProxy', () => {
      it('should exist', () => {
        driver.canProxy.should.be.an.instanceof(Function);
      });
      it('should return true', () => {
        driver.canProxy('abc').should.be.true;
      });
      it('should throw an error if session id is wrong', () => {
        (() => {
          driver.canProxy('aaa');
        }).should.throw;
      });
    });
  });

  describe('magic first visible child xpath', () => {
    let driver = new AndroidUiautomator2Driver({}, false);
    it('should trap and proxy to special uia2 server endpoint', async () => {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      let proxySpy = sinon.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({strategy: 'xpath', selector: '/*[@firstVisible="true"]', context: 'foo'});
      proxySpy.firstCall.args.should.eql([`/appium/element/foo/first_visible`, 'GET', {}]);
    });
  });

  describe('magic scrollable view xpath', () => {
    let driver = new AndroidUiautomator2Driver({}, false);
    it('should trap and rewrite as uiautomator locator', async () => {
      defaultStub(driver);
      driver.uiautomator2 = {jwproxy: {command: () => {}}};
      let proxySpy = sinon.stub(driver.uiautomator2.jwproxy, 'command');
      await driver.doFindElementOrEls({strategy: 'xpath', selector: '//*[@scrollable="true"]', context: 'foo'});
      proxySpy.firstCall.args.should.eql(['/element', 'POST', {
        context: 'foo',
        strategy: '-android uiautomator',
        selector: 'new UiSelector().scrollable(true)',
      }]);
    });
  });


});
