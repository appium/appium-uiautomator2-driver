import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import helpers from '../../lib/helpers';
import ADB from 'appium-adb';
import { withMocks } from 'appium-test-support';


chai.should();
chai.use(chaiAsPromised);

describe('UiAutomator2 Driver Helpers', function () {
  const adb = new ADB();

  describe('ensureInternetPermissionForApp', withMocks({adb}, (mocks) => {
    const app = '/path/to/app.apk';
    afterEach(function () {
      mocks.verify();
    });
    it('should do nothing if app has internet perms', async function () {
      mocks.adb.expects('hasInternetPermissionFromManifest')
        .once()
        .withExactArgs(app)
        .returns(true);
      await helpers.ensureInternetPermissionForApp(adb, app);
    });
    it('should throw an error if app does not have internet perms', async function () {
      mocks.adb.expects('hasInternetPermissionFromManifest')
        .once()
        .withExactArgs(app)
        .returns(false);
      await helpers.ensureInternetPermissionForApp(adb, app)
        .should.be.rejectedWith(/INTERNET/);
    });
  }));

  describe('parseChromeDriverPort', function () {
    it('should return null if driverArgs is empty', function () {
      (helpers.parseChromeDriverPort({}) === null).should.be.true;
    });
    it('should throw error if value of port is not an int', function () {
      (() => helpers.parseChromeDriverPort({'chromedriver-port': 'foo'})).should.throw();
    });
    it(`should return null if 'chromedriver-port' key doesnt exist`, function () {
      (helpers.parseChromeDriverPort({'foo': 'bar'}) === null).should.be.true;
    });
    it('should return port when passed in as driver arg', function () {
      helpers.parseChromeDriverPort({'chromedriver-port': 5555}).should.equal(5555);
    });
  });

  describe('parseChromedriverExecutable', function () {
    it('should return null if driverArgs is empty', function () {
      (helpers.parseChromedriverExecutable({}) === null).should.be.true;
    });
    it('should throw error if value of port is not a string', function () {
      (() => helpers.parseChromedriverExecutable({'chromedriver-executable': 4322})).should.throw();
    });
    it(`should return null if 'chromedriver-executable' key doesnt exist`, function () {
      (helpers.parseChromedriverExecutable({'foo': 'bar'}) === null).should.be.true;
    });
    it('should return path when passed in as driver arg', function () {
      helpers.parseChromedriverExecutable({'chromedriver-executable': '/path/to/foo'}).should.equal('/path/to/foo');
    });
  });
});
