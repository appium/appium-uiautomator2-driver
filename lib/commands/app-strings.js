import _ from 'lodash';
import {fs, tempDir} from 'appium/support';

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string?} [language]
 * @returns {Promise<StringRecord>}
 */
export async function getStrings(language) {
  if (!language) {
    language = await this.adb.getDeviceLanguage();
    this.log.info(`No language specified, returning strings for: ${language}`);
  }

  /**
   * Clients require the resulting mapping to have both keys
   * and values of type string
   * @param {StringRecord} mapping
   */
  const preprocessStringsMap = function (mapping) {
    /** @type {StringRecord} */
    const result = {};
    for (const [key, value] of _.toPairs(mapping)) {
      result[key] = _.isString(value) ? value : JSON.stringify(value);
    }
    return result;
  };

  if (!this.opts.app && !this.opts.appPackage) {
    throw this.log.errorAndThrow("One of 'app' or 'appPackage' capabilities should must be specified");
  }

  let app = this.opts.app;
  const tmpRoot = await tempDir.openDir();
  try {
    if (!app) {
      try {
        app = await this.adb.pullApk(/** @type {string} */ (this.opts.appPackage), tmpRoot);
      } catch (err) {
        throw this.log.errorAndThrow(
          `Failed to pull an apk from '${this.opts.appPackage}'. Original error: ${
            /** @type {Error} */ (err).message
          }`
        );
      }
    }

    if (!(await fs.exists(app))) {
      throw this.log.errorAndThrow(`The app at '${app}' does not exist`);
    }

    try {
      const {apkStrings} = await this.adb.extractStringsFromApk(app, language, tmpRoot);
      return preprocessStringsMap(apkStrings);
    } catch (err) {
      this.log.errorAndThrow(
        `Cannot extract strings from '${app}'. Original error: ${
          /** @type {Error} */ (err).message
        }`
      );
      throw new Error(); // unreachable
    }
  } finally {
    await fs.rimraf(tmpRoot);
  }
}

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
