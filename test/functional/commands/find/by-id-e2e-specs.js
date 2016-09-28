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
  platformName: 'Android'
};

describe('Find - ID', function (){
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(defaultCaps);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find an element by id', async () => {
    await driver.findElOrEls('id', 'android:id/text1', false).should.eventually.exist;
  });
  it('should return an array of one element if the `multi` param is true', async () => {
    // TODO: this returns an object instead of an array. Investigate.
    let els = await driver.findElOrEls('id', 'android:id/text1', true);
    els.should.be.an.instanceof(Array);
    els.should.have.length.above(1);
  });
});
