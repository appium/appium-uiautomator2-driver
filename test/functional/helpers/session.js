import { DEFAULT_HOST, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';
import { remote } from 'webdriverio';
import { retry, retryInterval } from 'asyncbox';
import './mocha-scripts';


const INIT_RETRIES = process.env.CI ? 2 : 1;
const ALERT_CHECK_RETRIES = 5;
const ALERT_CHECK_INTERVAL = 1000;


let driver;

async function initSession (caps) {
  // Create the driver
  const host = DEFAULT_HOST;
  const port = DEFAULT_PORT;
  logger.debug(`Starting session on ${host}:${port}`);
  driver = await retry(INIT_RETRIES, async (x) => await remote(x), {
    hostname: host,
    port,
    capabilities: caps,
  });

  // In Travis, there is sometimes a popup
  if (process.env.CI) {
    for (const btnId of ['android:id/button1', 'android:id/aerr_wait']) {
      let alertFound = false;
      await retryInterval(ALERT_CHECK_RETRIES, ALERT_CHECK_INTERVAL, async function () {
        let btn;
        try {
          btn = await driver.$(`#${btnId}`);
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
        await driver.startActivity(
          caps.alwaysMatch['appium:appPackage'],
          caps.alwaysMatch['appium:appActivity'],
          caps.alwaysMatch['appium:appWaitPackage'],
          caps.alwaysMatch['appium:appWaitActivity']
        );
      }
    }
  }

  await driver.setTimeout({implicit: process.env.CI ? 30000 : 5000});

  return driver;
}

async function deleteSession () {
  try {
    await driver.deleteSession();
  } catch (ign) {}
}

export { initSession, deleteSession };
