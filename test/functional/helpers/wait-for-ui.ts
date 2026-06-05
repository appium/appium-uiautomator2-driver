import type {Browser} from 'webdriverio';
import {waitForCondition} from 'asyncbox';

const ALERT_BUTTON_IDS = ['android:id/button1', 'android:id/aerr_wait'];

/**
 * Dismisses a blocking system alert when present. Uses a short implicit wait.
 */
export async function dismissSystemAlertIfPresent(driver: Browser): Promise<boolean> {
  await driver.setTimeout({implicit: 500});
  try {
    for (const btnId of ALERT_BUTTON_IDS) {
      const buttons = await driver.$$(`id=${btnId}`);
      if (await buttons.length) {
        await buttons[0].click();
        return true;
      }
    }
    return false;
  } finally {
    await driver.setTimeout({implicit: process.env.CI ? 30000 : 5000});
  }
}

/**
 * Polls for an element before the implicit wait elapses. Use for transient UI (e.g. toasts).
 */
export async function waitForElementByXpath(
  driver: Browser,
  xpath: string,
  timeoutMs = 8000,
  intervalMs = 150,
): Promise<void> {
  await waitForCondition(
    async () => {
      try {
        return !!(await driver.$(xpath).elementId);
      } catch {
        return false;
      }
    },
    {waitMs: timeoutMs, intervalMs},
  );
}
