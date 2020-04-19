import ADB from 'appium-adb';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';
import wd from 'wd';
import { retry, retryInterval } from 'asyncbox';
import _ from 'lodash';
import './mocha-scripts';


const {SAUCE_RDC, SAUCE_EMUSIM, CLOUD, TRAVIS, CI} = process.env;

const INIT_RETRIES = process.env.CI ? 2 : 1;
const ALERT_CHECK_RETRIES = 5;
const ALERT_CHECK_INTERVAL = 1000;

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
  await retry(INIT_RETRIES, driver.init.bind(driver), caps);

  // In Travis, there is sometimes a popup
  if (CI && !CLOUD) {
    const startArgs = _.pick(caps, ['appPackage', 'appActivity', 'appWaitPackage', 'appWaitActivity', 'intentAction', 'intentCategory', 'intentFlags', 'optionalIntentArguments', 'dontStopAppOnReset', 'sessionId', 'id']);
    for (const btnId of ['android:id/button1', 'android:id/aerr_wait']) {
      let alertFound = false;
      await retryInterval(ALERT_CHECK_RETRIES, ALERT_CHECK_INTERVAL, async function () {
        let btn;
        try {
          btn = await driver.elementById(btnId);
          alertFound = true;
        } catch (ign) {
          // no element found, so just finish
          return;
        }
        logger.warn('*******************************************************');
        logger.warn('*******************************************************');
        logger.warn('*******************************************************');
        logger.warn('Alert found on session startup. Trying to dismiss alert');
        logger.warn('*******************************************************');
        logger.warn('*******************************************************');
        logger.warn('*******************************************************');
        await btn.click();
        throw new Error('Alert was found, retry');
      });
      // if an alert was ever found, try to start the activity that the session should have started
      if (alertFound) {
        await driver.startActivity(startArgs);
      }
    }
  }

  await driver.setImplicitWaitTimeout(process.env.CI ? 30000 : 5000);

  return driver;
}

async function deleteSession () {
  try {
    await driver.quit();
  } catch (ign) {}
}

export { initSession, deleteSession };
