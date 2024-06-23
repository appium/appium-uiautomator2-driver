import { APIDEMOS_CAPS } from '../../desired';
import { initSession, deleteSession } from '../../helpers/session';


describe('Find - ID', function () {
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
  it('should find an element by id', async function () {
    await driver.$('id=android:id/text1').elementId.should.eventually.exist;
  });
  it('should return an array of one element with findElements', async function () {
    let els = await driver.$$('id=android:id/text1');
    els.should.be.an.instanceof(Array);
    els.should.have.length.above(1);
  });
});
