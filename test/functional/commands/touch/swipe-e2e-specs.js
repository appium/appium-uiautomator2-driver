import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../../..';
import { APIDEMOS_CAPS } from '../../desired';


chai.should();
chai.use(chaiAsPromised);

describe('apidemo - touch - swipe-action', function () {
  let driver;
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(Object.assign({}, APIDEMOS_CAPS, {appActivity: '.view.SplitTouchView'}));
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
