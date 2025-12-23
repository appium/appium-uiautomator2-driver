import type {AndroidUiautomator2Driver} from '../driver';

/**
 * Gets the clipboard content as a base64-encoded string.
 * @returns Base64-encoded clipboard content, or an empty string if the clipboard is empty.
 */
export async function getClipboard(this: AndroidUiautomator2Driver): Promise<string> {
  return String(
    (await this.adb.getApiLevel()) < 29
      ? await this.uiautomator2.jwproxy.command('/appium/device/get_clipboard', 'POST', {})
      : await this.settingsApp.getClipboard()
  );
}

/**
 * Sets the clipboard content.
 * @param content - Base64-encoded clipboard payload.
 * @param contentType - Content type. Only 'plaintext' is supported. Defaults to 'plaintext'.
 * @param label - Optional label to identify the current clipboard payload.
 */
export async function setClipboard(
  this: AndroidUiautomator2Driver,
  content: string,
  contentType: 'plaintext' = 'plaintext',
  label?: string,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/device/set_clipboard', 'POST', {content, contentType, label});
}

