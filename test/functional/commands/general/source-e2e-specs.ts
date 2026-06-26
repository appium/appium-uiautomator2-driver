import {describe, it, before, after} from 'node:test';
import type {Browser} from 'webdriverio';
import {DOMParser} from '@xmldom/xmldom';
import xpath from 'xpath';
import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('apidemo - source', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });

  function assertSource(source: string): void {
    expect(source).to.exist;
    const dom = new DOMParser().parseFromString(source, 'text/xml');
    const nodes = xpath.select('//hierarchy', dom as unknown as Node);
    if (nodes && Array.isArray(nodes)) {
      expect(nodes.length).to.equal(1);
    } else {
      expect(nodes).to.exist;
    }
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
    expect(sourceWithoutCompression.length).to.be.greaterThan(sourceWithCompression.length);
    await expect(getSourceWithoutCompression()).to.eventually.eql(sourceWithoutCompression);
  });
});
