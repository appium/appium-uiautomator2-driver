import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as helpers from '../../lib/helpers';
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
});
