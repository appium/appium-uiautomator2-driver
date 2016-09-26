import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import AndroidUiautomator2Driver from '../../..';
import sampleApps from 'sample-apps';
import _ from 'lodash';
import B from 'bluebird';
import stream from 'stream';
import Unzip from 'unzip';


chai.should();
chai.use(chaiAsPromised);

let driver;
let caps = {
  app: sampleApps('ApiDemos-debug'),
  deviceName: 'Android',
  platformName: 'Android',
  autoLaunch: false
};

describe('file movement', function () {
  before(async () => {
    driver = new AndroidUiautomator2Driver();
    await driver.createSession(caps);
  });
  after(async () => {
    await driver.deleteSession();
  });

  function getRandomDir () {
    return `/data/local/tmp/test${Math.random()}`;
  }

  it('should push and pull a file', async () => {
    let stringData = `random string data ${Math.random()}`;
    let base64Data = new Buffer(stringData).toString('base64');
    let remotePath = `${getRandomDir()}/remote.txt`;

    await driver.pushFile(remotePath, base64Data);

    // get the file and its contents, to check
    let remoteData64 = await driver.pullFile(remotePath);
    let remoteData = new Buffer(remoteData64, 'base64').toString();
    remoteData.should.equal(stringData);
  });

  it('should pull a folder', async () => {
    let stringData = `random string data ${Math.random()}`;
    let base64Data = new Buffer(stringData).toString('base64');

    // send the files, then pull the whole folder
    let remoteDir = getRandomDir();
    await driver.pushFile(`${remoteDir}/remote0.txt`, base64Data);
    await driver.pushFile(`${remoteDir}/remote1.txt`, base64Data);
    let data = await driver.pullFolder(remoteDir);

    // go through the folder we pulled and make sure the
    // two files we pushed are in it
    let zipPromise = new B((resolve) => {
      let entryCount = 0;
      let zipStream = new stream.Readable();
      zipStream._read = _.noop;
      zipStream
        .pipe(Unzip.Parse())
        .on('entry', function (entry) {
          entryCount++;
          entry.autodrain();
        })
        .on('close', function () {
          resolve(entryCount);
        });
      zipStream.push(data, 'base64');
      zipStream.push(null);
    });

    (await zipPromise).should.equal(2);
  });
});
