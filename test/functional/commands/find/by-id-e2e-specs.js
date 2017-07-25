import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - ID', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
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
