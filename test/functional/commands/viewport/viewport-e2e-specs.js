import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('testViewportCommands', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });

  it('should get device pixel ratio', async () => {
    let devicePixelRatio = await driver.getDevicePixelRatio();
    devicePixelRatio.should.not.equal(null);
    devicePixelRatio.should.not.equal(0);
  });

  it('should get status bar height', async () => {
    let statusBarHeight = await driver.getStatusBarHeight();
    statusBarHeight.should.not.equal(null);
    statusBarHeight.should.not.equal(0);
  });

  it('should get viewport screenshot', async () => {
    let statusBarHeight = await driver.getViewportScreenshot();
    statusBarHeight.should.not.equal(null);
  });
});