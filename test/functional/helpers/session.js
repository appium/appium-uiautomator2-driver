import ADB from 'appium-adb';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';
import wd from 'wd';

async function initDriver (caps, adbPort) {
  if (process.env.TRAVIS) {
    let adb = await ADB.createADB({adbPort});
    try {
      // on Travis, sometimes we get the keyboard dying and the screen stuck
      await adb.forceStop('com.android.inputmethod.latin');
      await adb.shell(['pm', 'clear', 'com.android.inputmethod.latin']);
    } catch (ign) {}
  }

  // Create a WD driver
  logger.debug(`Starting session on ${DEFAULT_HOST}:${DEFAULT_PORT}`);
  let driver = await wd.promiseChainRemote(DEFAULT_HOST, DEFAULT_PORT);
  await driver.init(caps);
  return driver;
}

export { initDriver };