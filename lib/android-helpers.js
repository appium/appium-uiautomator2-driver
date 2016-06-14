import logger from './logger';
import path from 'path';
import { fs } from 'appium-support';

let helpers = {};

helpers.truncateDecimals = function (number, digits) {
  let multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);

  return truncatedNum / multiplier;
};

helpers.pushStrings = async function (language, adb, opts) {
  let remotePath = '/data/local/tmp';
  let stringsJson = 'strings.json';
  let stringsTmpDir = path.resolve(opts.tmpDir, opts.appPackage);
  try {
    logger.debug('Extracting strings from apk', opts.app, language, stringsTmpDir);
    let {apkStrings, localPath} = await adb.extractStringsFromApk(
          opts.app, language, stringsTmpDir);
    await adb.push(localPath, remotePath);
    return apkStrings;
  } catch (err) {
    if (!(await fs.exists(opts.app))) {
      // delete remote string.json if present
      await adb.rimraf(`${remotePath}/${stringsJson}`);
    } else {
      logger.warn("Could not get strings, continuing anyway");
      let remoteFile = `${remotePath}/${stringsJson}`;
      await adb.shell('echo', [`'{}' > ${remoteFile}`]);
    }
  }
  return {};
};

export default helpers;
