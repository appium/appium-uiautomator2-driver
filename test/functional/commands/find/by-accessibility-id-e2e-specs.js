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
    await driver.quit();
  });
  it('should find an element by name', async () => {
    await driver.elementByAccessibilityId('Animation').should.eventually.exist;
  });
  it('should return an array of one element if the `multi` param is true', async () => {
    let els = await driver.elementsByAccessibilityId('Animation');
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async () => {
    await driver.elementByAccessibilityId("Access'ibility").should.eventually.exist;
  });
});
