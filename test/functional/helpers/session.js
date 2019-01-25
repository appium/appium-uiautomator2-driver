import ADB from 'appium-adb';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';
import wd from 'wd';
import './mocha-scripts';


const {SAUCE_RDC, SAUCE_EMUSIM, CLOUD, TRAVIS, CI} = process.env;

function getPort () {
  if (SAUCE_EMUSIM || SAUCE_RDC) {
    return 80;
  }
  return DEFAULT_PORT;
}

function getHost () {
  if (SAUCE_RDC) {
    return 'appium.staging.testobject.org';
  } else if (SAUCE_EMUSIM) {
    return 'ondemand.saucelabs.com';
  }

  return DEFAULT_HOST;
}


let driver;

async function initSession (caps, adbPort) {
  if (TRAVIS && !CLOUD) {
    let adb = await ADB.createADB({adbPort});
    try {
      // on Travis, sometimes we get the keyboard dying and the screen stuck
      await adb.forceStop('com.android.inputmethod.latin');
      await adb.shell(['pm', 'clear', 'com.android.inputmethod.latin']);
    } catch (ign) {}
  }

  if (CLOUD) {
    // on cloud tests, we want to set the `name` capability
    if (!caps.name) {
      caps.name = process.env.SAUCE_JOB_NAME || process.env.TRAVIS_JOB_NUMBER || 'unnamed';
    }
  }

  // Create a WD driver
  const host = getHost();
  const port = getPort();
  logger.debug(`Starting session on ${host}:${port}`);
  driver = await wd.promiseChainRemote(host, port);
  await driver.init(caps);

  // In Travis, there is sometimes a popup
  if (CI && !CLOUD) {
    try {
      const okBtn = await driver.elementById('android:id/button1');
      logger.warn('*******************************************************');
      logger.warn('*******************************************************');
      logger.warn('*******************************************************');
      logger.warn('Alert found on session startup. Trying to dismiss alert');
      await okBtn.click();
      await driver.startActivity(caps);
    } catch (ign) {}
  }

  return driver;
}

async function deleteSession () {
  try {
    await driver.quit();
  } catch (ign) {}
}

export { initSession, deleteSession };
