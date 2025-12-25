import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Find - ID', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by id', async function () {
    await expect(driver.$('id=android:id/text1').elementId).to.eventually.exist;
  });
  it('should return an array of one element with findElements', async function () {
    const els = await driver.$$('id=android:id/text1');
    expect(els).to.be.an.instanceof(Array);
    expect(els).to.have.length.above(1);
  });
});

