import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import {fs, tempDir, zip} from '@appium/support';
import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS} from '../desired.js';
import {initSession, deleteSession} from '../helpers/session.js';

describe('file movement', function () {
  let driver: Browser;

  before(async function () {
    driver = await initSession(APIDEMOS_CAPS);
  });
  after(async function () {
    await deleteSession();
  });

  function getRandomDir(): string {
    return `/data/local/tmp/test${Math.random()}`;
  }

  it('should push and pull a file', async function () {
    const stringData = `random string data ${Math.random()}`;
    const base64Data = Buffer.from(stringData).toString('base64');
    const remotePath = `${getRandomDir()}/remote.txt`;

    await driver.pushFile(remotePath, base64Data);

    // get the file and its contents, to check
    const remoteData64 = await driver.pullFile(remotePath);
    const remoteData = Buffer.from(remoteData64, 'base64').toString();
    assert.strictEqual(remoteData, stringData);
  });

  it('should pull a folder', async function () {
    const stringData = `random string data ${Math.random()}`;
    const base64Data = Buffer.from(stringData).toString('base64');

    // send the files, then pull the whole folder
    const remoteDir = getRandomDir();
    await driver.pushFile(`${remoteDir}/remote0.txt`, base64Data);
    await driver.pushFile(`${remoteDir}/remote1.txt`, base64Data);

    // TODO: 'pullFolder' is returning 404 error
    const data = await driver.pullFolder(remoteDir);

    // go through the folder we pulled and make sure the
    // two files we pushed are in it
    const zipPath = await tempDir.path({prefix: 'pulled-folder', suffix: '.zip'});
    let entryCount = 0;
    try {
      await fs.writeFile(zipPath, Buffer.from(data, 'base64'));
      await zip.readEntries(zipPath, ({entry}) => {
        if (!entry.fileName.endsWith('/')) {
          entryCount++;
        }
      });
    } finally {
      await fs.rimraf(zipPath);
    }

    assert.strictEqual(entryCount, 2);
  });
});
