import type {Browser} from 'webdriverio';
import B from 'bluebird';
import stream from 'node:stream';
import unzipper from 'unzipper';
import {APIDEMOS_CAPS} from '../desired';
import {initSession, deleteSession} from '../helpers/session';
import chai, {expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);

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
    expect(remoteData).to.equal(stringData);
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
    const zipPromise = new B<number>((resolve) => {
      let entryCount = 0;
      const zipStream = new stream.Readable();
      zipStream._read = () => {};
      zipStream
        .pipe(unzipper.Parse())
        .on('entry', function (entry) {
          if (entry.type === 'File') {
            entryCount++;
          }
          entry.autodrain();
        })
        .on('close', function () {
          resolve(entryCount);
        });
      zipStream.push(data, 'base64');
      zipStream.push(null);
    });

    expect(await zipPromise).to.equal(2);
  });
});

