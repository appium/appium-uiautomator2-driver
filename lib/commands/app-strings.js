// @ts-check

import {mixin} from './mixins';
import _ from 'lodash';
import {fs, tempDir} from 'appium/support';

/**
 * @type {import('./mixins').UIA2AppStringsMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const AppStringsMixin = {
  async getStrings(language) {
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

    if (this.apkStrings[language]) {
      // Return cached strings
      return preprocessStringsMap(this.apkStrings[language]);
    }

    if (!this.opts.app && !this.opts.appPackage) {
      this.log.errorAndThrow("One of 'app' or 'appPackage' capabilities should must be specified");
      throw new Error(); // unreachable
    }

    let app = this.opts.app;
    const tmpRoot = await tempDir.openDir();
    try {
      if (!app) {
        try {
          app = await this.adb.pullApk(/** @type {string} */ (this.opts.appPackage), tmpRoot);
        } catch (err) {
          this.log.errorAndThrow(
            `Failed to pull an apk from '${this.opts.appPackage}'. Original error: ${
              /** @type {Error} */ (err).message
            }`
          );
          throw new Error(); // unreachable
        }
      }

      if (!(await fs.exists(app))) {
        this.log.errorAndThrow(`The app at '${app}' does not exist`);
        throw new Error(); // unreachable
      }

      try {
        const {apkStrings} = await this.adb.extractStringsFromApk(app, language, tmpRoot);
        this.apkStrings[language] = apkStrings;
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
  },

  /**
   * Retrives app strings from its resources for the given language
   * or the default device language.
   *
   * @returns App strings map
   */
  async mobileGetAppStrings(opts) {
    return await this.getStrings(opts?.language);
  },
};

mixin(AppStringsMixin);

/**
 * @typedef {import('appium-adb').ADB} ADB
 * @typedef {import('@appium/types').StringRecord} StringRecord
 */
