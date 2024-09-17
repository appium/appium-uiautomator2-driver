import {DOMParser, XMLDom} from '@xmldom/xmldom';
import xpath from 'xpath';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';


describe('apidemo - source', function () {
  let driver;
  let chai;

  before(async function () {
    chai = await import('chai');
    const chaiAsPromised = await import('chai-as-promised');

    chai.should();
    chai.use(chaiAsPromised.default);

    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });

  function assertSource(source) {
    source.should.exist;
    const dom = new DOMParser().parseFromString(source, XMLDom.MIME_TYPE.XML_TEXT);
    const nodes = xpath.select('//hierarchy', dom);
    nodes.length.should.equal(1);
  }

  it('should return the page source', async function () {
    const source = await driver.getPageSource();
    assertSource(source);
  });
  it('should get less source when compression is enabled', async function () {
    const getSourceWithoutCompression = async () => {
      await driver.updateSettings({ignoreUnimportantViews: false});
      return await driver.getPageSource();
    };
    const getSourceWithCompression = async () => {
      await driver.updateSettings({ignoreUnimportantViews: true});
      return await driver.getPageSource();
    };
    const sourceWithoutCompression = await getSourceWithoutCompression();
    const sourceWithCompression = await getSourceWithCompression();
    sourceWithoutCompression.length.should.be.greaterThan(sourceWithCompression.length);
    await getSourceWithoutCompression().should.eventually.eql(sourceWithoutCompression);
  });
});
