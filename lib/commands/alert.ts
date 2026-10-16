import type {AndroidUiautomator2Driver} from '../driver.js';

declare module '../driver.js' {
  interface AndroidUiautomator2Driver {
    getAlertText(...args: Parameters<typeof getAlertText>): ReturnType<typeof getAlertText>;
    mobileAcceptAlert(...args: Parameters<typeof mobileAcceptAlert>): ReturnType<typeof mobileAcceptAlert>;
    mobileDismissAlert(...args: Parameters<typeof mobileDismissAlert>): ReturnType<typeof mobileDismissAlert>;
    postAcceptAlert(...args: Parameters<typeof postAcceptAlert>): ReturnType<typeof postAcceptAlert>;
    postDismissAlert(...args: Parameters<typeof postDismissAlert>): ReturnType<typeof postDismissAlert>;
  }
}

/**
 * Gets the text of the currently displayed alert.
 * @returns The alert text as a string.
 */
export async function getAlertText(this: AndroidUiautomator2Driver): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command('/alert/text', 'GET', {}));
}

/**
 * Accepts the currently displayed alert.
 * @param buttonLabel - Optional label of the button to click. If not provided, the button will be detected automatically.
 */
export async function mobileAcceptAlert(this: AndroidUiautomator2Driver, buttonLabel?: string): Promise<void> {
  await this.uiautomator2.jwproxy.command('/alert/accept', 'POST', {buttonLabel});
}

/**
 * Accepts the currently displayed alert (W3C endpoint).
 */
export async function postAcceptAlert(this: AndroidUiautomator2Driver): Promise<void> {
  await this.mobileAcceptAlert();
}

/**
 * Dismisses the currently displayed alert.
 * @param buttonLabel - Optional label of the button to click. If not provided, the button will be detected automatically.
 */
export async function mobileDismissAlert(this: AndroidUiautomator2Driver, buttonLabel?: string): Promise<void> {
  await this.uiautomator2.jwproxy.command('/alert/dismiss', 'POST', {buttonLabel});
}

/**
 * Dismisses the currently displayed alert (W3C endpoint).
 */
export async function postDismissAlert(this: AndroidUiautomator2Driver): Promise<void> {
  await this.mobileDismissAlert();
}
