import type {AndroidUiautomator2Driver} from '../driver';

/**
 * Sets the URL for the current app.
 * @param url - The URL to navigate to.
 */
export async function setUrl(this: AndroidUiautomator2Driver, url: string): Promise<void> {
  await this.adb.startUri(url, this.opts.appPackage as string);
}

/**
 * Starts a URL that takes users directly to specific content in the app.
 * @param url - The deep link URL to start.
 * @param pkg - Optional package name to start the URI with. If not provided, uses the current app package.
 * @param waitForLaunch - If false, adb won't wait for the started activity to return control. Defaults to true.
 */
export async function mobileDeepLink(
  this: AndroidUiautomator2Driver,
  url: string,
  pkg?: string,
  waitForLaunch: boolean = true,
): Promise<void> {
  return await this.adb.startUri(url, pkg, {waitForLaunch});
}

/**
 * Navigates back in the app.
 */
export async function back(this: AndroidUiautomator2Driver): Promise<void> {
  await this.adb.keyevent(4);
}

