import {describe, it, before, after} from 'node:test';
import type {Browser} from 'webdriverio';
import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('Find - invalid strategy', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });
  it('should not accept -ios uiautomation locator strategy', async function () {
    await expect(driver.$$('ios=.elements()')).to.eventually.be.rejected;
  });
});
