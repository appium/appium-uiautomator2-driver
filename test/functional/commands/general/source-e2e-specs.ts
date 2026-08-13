import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import {DOMParser} from '@xmldom/xmldom';
import type {Browser} from 'webdriverio';
import xpath from 'xpath';

import {APIDEMOS_CAPS} from '../../desired.js';
import {initSession, deleteSession} from '../../helpers/session.js';

describe('apidemo - source', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });

  function assertSource(source: string): void {
    assert.ok(source != null);
    const dom = new DOMParser().parseFromString(source, 'text/xml');
    const nodes = xpath.select('//hierarchy', dom as unknown as Node);
    if (nodes && Array.isArray(nodes)) {
      assert.strictEqual(nodes.length, 1);
    } else {
      assert.ok(nodes != null);
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
    assert.ok(sourceWithoutCompression.length > sourceWithCompression.length);
    assert.strictEqual(await getSourceWithoutCompression(), sourceWithoutCompression);
  });
});
