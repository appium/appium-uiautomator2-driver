import type {StringRecord} from '@appium/types';
import type {Capabilities} from '@wdio/types';
import type {Browser} from 'webdriverio';
import {DEFAULT_HOST, DEFAULT_PORT} from './constants.js';
import {log as logger} from '../../../lib/logger.js';
import {remote} from 'webdriverio';
import {retry, retryInterval} from 'asyncbox';

export const E2E_TEST_TIMEOUT = 60 * 1000 * 4;

export type SessionCapabilities = Capabilities.RequestedStandaloneCapabilities;

type RemoteSessionOptions = Omit<
  Capabilities.WebdriverIOConfig,
  'hostname' | 'port' | 'capabilities' | 'connectionRetryTimeout' | 'connectionRetryCount'
>;

const INIT_RETRIES = process.env.CI ? 2 : 1;
const ALERT_CHECK_RETRIES = 5;
const ALERT_CHECK_INTERVAL = 1000;

let driver: Browser | undefined;

export async function createRemoteSession(
  caps: SessionCapabilities,
  remoteOpts: RemoteSessionOptions = {},
): Promise<Browser> {
  return await remote({
    hostname: DEFAULT_HOST,
    port: DEFAULT_PORT,
    capabilities: caps,
    connectionRetryTimeout: E2E_TEST_TIMEOUT,
    connectionRetryCount: 1,
    ...remoteOpts,
  });
}

export async function deleteRemoteSession(sessionDriver?: Browser): Promise<void> {
  if (!sessionDriver) {
    return;
  }
  try {
    await sessionDriver.deleteSession();
  } catch {
    // ignore
  }
}

export async function initSession(
  caps: StringRecord,
  remoteOpts: StringRecord = {},
): Promise<Browser> {
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

  await attemptToDismissAlert(caps);

  await sessionDriver.setTimeout({implicit: process.env.CI ? 30000 : 5000});

  return sessionDriver;
}

export async function attemptToDismissAlert(caps: StringRecord): Promise<void> {
  // In CI environment, the alert "System UI isn't responding" may appear due to less machine resources.
  if (process.env.CI && driver) {
    const implicitMs = process.env.CI ? 30000 : 5000;
    await driver.setTimeout({implicit: 500});
    try {
      for (const btnId of ['android:id/button1', 'android:id/aerr_wait']) {
        let alertFound = false;
        await retryInterval(ALERT_CHECK_RETRIES, ALERT_CHECK_INTERVAL, async function () {
          const buttons = await driver!.$$(`id=${btnId}`);
          if (!(await buttons.length)) {
            return;
          }
          alertFound = true;
          logger.warn('*******************************************************');
          logger.warn('*******************************************************');
          logger.warn('*******************************************************');
          logger.warn('Alert found on session startup. Trying to dismiss alert');
          logger.warn('*******************************************************');
          logger.warn('*******************************************************');
          logger.warn('*******************************************************');
          await buttons[0].click();
          throw new Error('Alert was found, retry');
        });
        if (alertFound && driver) {
          await driver.startActivity(
            caps.alwaysMatch?.['appium:appPackage'] as string,
            caps.alwaysMatch?.['appium:appActivity'] as string,
            caps.alwaysMatch?.['appium:appWaitPackage'] as string | undefined,
            caps.alwaysMatch?.['appium:appWaitActivity'] as string | undefined,
          );
        }
      }
    } finally {
      await driver.setTimeout({implicit: implicitMs});
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
