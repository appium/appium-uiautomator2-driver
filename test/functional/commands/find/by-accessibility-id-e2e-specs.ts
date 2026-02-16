import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired';
import {initSession, deleteSession} from '../../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

describe('Find - accessibility ID', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should find an element by name', async function () {
    await expect(driver.$('~Animation').elementId).to.eventually.exist;
  });
  it('should return an array of one element with findElements', async function () {
    const els = await driver.$$('~Animation');
    expect(els).to.be.an.instanceof(Array);
    expect(els).to.have.length(1);
  });
  it('should find an element with a content-desc property containing an apostrophe', async function () {
    await expect(driver.$("~Access'ibility").elementId).to.eventually.exist;
  });
});
