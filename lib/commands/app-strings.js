/**
 * Retrives app strings from its resources for the given language
 * or the default device language.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').GetAppStringsOptions} [opts={}]
 * @returns {Promise<StringRecord>}
 */
export async function mobileGetAppStrings(opts) {
  return await this.getStrings(opts?.language);
}

/**
 * @typedef {import('appium-adb').ADB} ADB
 * @typedef {import('@appium/types').StringRecord} StringRecord
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
