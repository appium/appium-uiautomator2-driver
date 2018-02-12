import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
import { APIDEMOS_CAPS } from '../../desired';
import { initDriver } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

let assertSource = async (source) => {
  source.should.exist;
  let dom = new DOMParser().parseFromString(source);
  let nodes = xpath.select('//hierarchy', dom);
  nodes.length.should.equal(1);
};

describe('apidemo - source', function () {
  let driver;
  before(async function () {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async function () {
    await driver.quit();
  });
  it('should return the page source', async function () {
    let source = await driver.source();
    await assertSource(source);
  });
  it('should get less source when compression is enabled', async function () {
    let getSourceWithoutCompression = async () => {
      await driver.updateSettings({'ignoreUnimportantViews': false});
      return await driver.source();
    };
    let getSourceWithCompression = async () => {
      await driver.updateSettings({"ignoreUnimportantViews": true});
      return await driver.source();
    };
    let sourceWithoutCompression = await getSourceWithoutCompression();
    let sourceWithCompression = await getSourceWithCompression();
    sourceWithoutCompression.length.should.be.greaterThan(sourceWithCompression.length);
    await getSourceWithoutCompression().should.eventually.eql(sourceWithoutCompression);
  });
});
