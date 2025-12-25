import type {StringRecord} from '@appium/types';
import type {Browser} from 'webdriverio';
import {DEFAULT_HOST, DEFAULT_PORT} from './constants';
import {log as logger} from '../../../lib/logger';
import {remote} from 'webdriverio';
import {retry, retryInterval} from 'asyncbox';

const INIT_RETRIES = process.env.CI ? 2 : 1;
const ALERT_CHECK_RETRIES = 5;
const ALERT_CHECK_INTERVAL = 1000;

let driver: Browser | undefined;

export async function initSession(caps: StringRecord, remoteOpts: StringRecord = {}): Promise<Browser> {
  // Create the driver
  const host = DEFAULT_HOST;
  const port = DEFAULT_PORT;
  const opts = Object.assign({}, remoteOpts, {
    hostname: host,
    port,
    capabilities: caps,
  });
  logger.debug(`Starting session on ${host}:${port}`);
  const sessionDriver = await retry(INIT_RETRIES, async (x) => await remote(x), opts);
  if (!sessionDriver) {
    throw new Error('Failed to create session');
  }
  driver = sessionDriver;

  attemptToDismissAlert(caps);

  await sessionDriver.setTimeout({implicit: process.env.CI ? 30000 : 5000});

  return sessionDriver;
}

export async function attemptToDismissAlert(caps: StringRecord): Promise<void> {
  // In CI environment, the alert "System UI isn't responding" may appear due to less machine resources.
  if (process.env.CI && driver) {
    for (const btnId of ['android:id/button1', 'android:id/aerr_wait']) {
      let alertFound = false;
      await retryInterval(ALERT_CHECK_RETRIES, ALERT_CHECK_INTERVAL, async function () {
        let btn;
        try {
          btn = await driver!.$(`id=${btnId}`);
          alertFound = true;
        } catch {
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
      if (alertFound && driver) {
        await driver.startActivity(
          caps.alwaysMatch?.['appium:appPackage'] as string,
          caps.alwaysMatch?.['appium:appActivity'] as string,
          caps.alwaysMatch?.['appium:appWaitPackage'] as string | undefined,
          caps.alwaysMatch?.['appium:appWaitActivity'] as string | undefined
        );
      }
    }
  }
}

export async function deleteSession(): Promise<void> {
  try {
    if (driver) {
      await driver.deleteSession();
    }
  } catch {
    // ignore
  } finally {
    driver = undefined;
  }
}
