import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../..';
import sinon from 'sinon';
import path from 'path';


chai.should();
chai.use(chaiAsPromised);

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
      await driver.createSession({app: 'foo.apk'}).should.be.rejectedWith('app apk');
    });

    it('should set sessionId', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      sinon.mock(driver).expects('checkAppPresent')
          .once()
          .returns(Promise.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .once()
          .returns(Promise.resolve());
      await driver.createSession({cap: 'foo'});

      driver.sessionId.should.exist;
      driver.caps.cap.should.equal('foo');
    });

    it('should set the default context', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      sinon.mock(driver).expects('checkAppPresent')
          .returns(Promise.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(Promise.resolve());
      await driver.createSession({});
      driver.curContext.should.equal('NATIVE_APP');
    });
  });

  describe('checkAppPresent', async () => {
    it('should resolve if app present', async () => {
      let driver = new AndroidUiautomator2Driver({}, false);
      let app = path.resolve('.');
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(Promise.resolve());
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
      let app = path.resolve('asdfasdf');
      sinon.mock(driver).expects('checkAppPresent')
          .returns(Promise.resolve());
      sinon.mock(driver).expects('startUiAutomator2Session')
          .returns(Promise.resolve());
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
});
