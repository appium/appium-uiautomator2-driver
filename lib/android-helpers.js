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
  const remotePath = '/data/local/tmp';
  const stringsJson = 'strings.json';
  const stringsTmpDir = path.resolve(opts.tmpDir, opts.appPackage);
  try {
    logger.debug('Extracting strings from apk', opts.app, language, stringsTmpDir);
    const {apkStrings, localPath} = await adb.extractStringsFromApk(opts.app, language, stringsTmpDir);
    await adb.push(localPath, remotePath);
    return apkStrings;
  } catch (err) {
    logger.warn(`Could not extract string resources, continuing anyway. ` +
                `Original error: ${err.message}`);
    if (await fs.exists(opts.app)) {
      const remoteFile = `${remotePath}/${stringsJson}`;
      await adb.shell('echo', [`'{}' > ${remoteFile}`]);
    } else {
      // delete remote string.json if present
      await adb.rimraf(`${remotePath}/${stringsJson}`);
    }
  }
  return {};
};

export default helpers;
