import type {AndroidUiautomator2Driver} from '../driver';

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
export async function mobileAcceptAlert(
  this: AndroidUiautomator2Driver,
  buttonLabel?: string,
): Promise<void> {
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
export async function mobileDismissAlert(
  this: AndroidUiautomator2Driver,
  buttonLabel?: string,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/alert/dismiss', 'POST', {buttonLabel});
}

/**
 * Dismisses the currently displayed alert (W3C endpoint).
 */
export async function postDismissAlert(this: AndroidUiautomator2Driver): Promise<void> {
  await this.mobileDismissAlert();
}

