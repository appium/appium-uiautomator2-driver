import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - accessibility ID', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });
  it('should find an element by name', async function () {
    await driver.elementByAccessibilityId('Animation').should.eventually.exist;
  });
  it('should return an array of one element if the `multi` param is true', async function () {
    let els = await driver.elementsByAccessibilityId('Animation');
    els.should.be.an.instanceof(Array);
    els.should.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    await driver.elementByAccessibilityId("Access'ibility").should.eventually.exist;
  });
});
