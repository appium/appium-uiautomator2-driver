import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { DOMParser } from 'xmldom';
import xpath from 'xpath';
import { APIDEMOS_CAPS } from '../desired';
import { initDriver } from '../helpers/session';


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
  before(async () => {
    driver = await initDriver(APIDEMOS_CAPS);
  });
  after(async () => {
    await driver.deleteSession();
  });
  it('should return the page source', async () => {
    let source = await driver.getPageSource();
    await assertSource(source);
  });
  it('should get less source when compression is enabled', async () => {
    let getSourceWithoutCompression = async () => {
      await driver.updateSettings({'ignoreUnimportantViews': false});
      return await driver.getPageSource();
    };
    let getSourceWithCompression = async () => {
      await driver.updateSettings({"ignoreUnimportantViews": true});
      return await driver.getPageSource();
    };
    let sourceWithoutCompression = await getSourceWithoutCompression();
    let sourceWithCompression = await getSourceWithCompression();
    sourceWithoutCompression.length.should.be.greaterThan(sourceWithCompression.length);
    await getSourceWithoutCompression().should.eventually.eql(sourceWithoutCompression);
  });
});
