import ADB from 'appium-adb';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';
import wd from 'wd';
import { waitForCondition } from 'asyncbox';


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

  // wait for the right activity
  await waitForCondition(async function () {
    let appPackage = await driver.getCurrentPackage();
    let appActivity = await driver.getCurrentActivity();
    appPackage.should.eql(caps.appPackage);
    appActivity.should.include(caps.appActivity);
  }, {
    waitMs: 300000,
    intervalMs: 500,
  });

  return driver;
}

export { initDriver };