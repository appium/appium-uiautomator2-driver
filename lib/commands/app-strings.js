import _ from 'lodash';
import { fs, tempDir } from 'appium/support';

const commands = {};

commands.getStrings = async function (language) {
  if (!language) {
    language = await this.adb.getDeviceLanguage();
    this.log.info(`No language specified, returning strings for: ${language}`);
  }

  // Clients require the resulting mapping to have both keys
  // and values of type string
  const preprocessStringsMap = function (mapping) {
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
  }

  let app = this.opts.app;
  const tmpRoot = await tempDir.openDir();
  try {
    if (!app) {
      try {
        app = await this.adb.pullApk(this.opts.appPackage, tmpRoot);
      } catch (err) {
        this.log.errorAndThrow(`Failed to pull an apk from '${this.opts.appPackage}'. Original error: ${err.message}`);
      }
    }

    if (!await fs.exists(app)) {
      this.log.errorAndThrow(`The app at '${app}' does not exist`);
    }

    try {
      const {apkStrings} = await this.adb.extractStringsFromApk(app, language, tmpRoot);
      this.apkStrings[language] = apkStrings;
      return preprocessStringsMap(apkStrings);
    } catch (err) {
      this.log.errorAndThrow(`Cannot extract strings from '${app}'. Original error: ${err.message}`);
    }
  } finally {
    await fs.rimraf(tmpRoot);
  }
};

/**
 * @typedef {Object} GetAppStringsOptions
 * @property {string?} language The language abbreviation to fetch app strings mapping for. If no
 * language is provided then strings for the default language on the device under test
 * would be returned. Examples: en, fr
 */

/**
 * Retrives app strings from its resources for the given language
 * or the default device language.
 *
 * @param {GetAppStringsOptions} opts
 * @returns {Promise<object>} App strings map
 */
commands.mobileGetAppStrings = async function mobileGetAppStrings (opts = {}) {
  return await this.getStrings(opts.language);
};

export default commands;