import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import sampleApps from 'sample-apps';

chai.should();
chai.use(chaiAsPromised);

let driver;
let defaultCaps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  appActivity: '.view.SplitTouchView'
};

describe('apidemo - touch - swipe-action', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should swipe', async () => {
    await driver.swipe(100, 650, 100, 330, 1);
    let els = await driver.findElOrEls('xpath', "//*[@text='Abertam']", true);
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
});
