import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - accessibility ID', function () {
  let driver;
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should find an element by name', async () => {
    await driver.findElOrEls('accessibility id', 'Animation', false).should.eventually.exist;
  });
  it('should return an array of one element if the `multi` param is true', async () => {
    let els = await driver.findElOrEls('accessibility id', 'Animation', true);
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async () => {
    await driver.findElOrEls('accessibility id', "Access'ibility", false).should.eventually.exist;
  });
});
