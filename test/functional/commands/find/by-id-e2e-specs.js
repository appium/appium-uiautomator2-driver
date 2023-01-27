import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


chai.should();
chai.use(chaiAsPromised);

describe('Find - ID', function () {
  let driver;
  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id', async function () {
    await driver.$('id=android:id/text1').elementId.should.eventually.exist;
  });
  it('should return an array of one element with findElements', async function () {
    let els = await driver.$$('id=android:id/text1');
    els.should.be.an.instanceof(Array);
    els.should.have.length.above(1);
  });
});
