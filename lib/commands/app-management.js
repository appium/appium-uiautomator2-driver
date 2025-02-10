import _ from 'lodash';
import B from 'bluebird';
import {errors} from 'appium/driver';
import {APK_EXTENSION} from '../extensions';

/**
 * Install multiple APKs with `install-multiple` option.
 * @this {AndroidUiautomator2Driver}
 * @param {string[]} apks The list of APKs to install. Each APK should be a path to a apk
 * or downloadable URL as HTTP/HTTPS.
 * @param {import('./types').InstallOptions} [options] Installation options.
 * @throws {Error} if an error occured while installing the given APKs.
 * @returns {Promise<void>}
 */
export async function mobileInstallMultipleApks(apks, options) {
  if (!_.isArray(apks) || _.isEmpty(apks)) {
    throw new errors.InvalidArgumentError('No apks are given to install');
  }
  const configuredApks = await B.all(
    apks.map((app) => this.helpers.configureApp(app, [APK_EXTENSION]))
  );
  await this.adb.installMultipleApks(configuredApks, options);
}

/**
 * Puts the app to background and waits the given number of seconds then restores the app
 * if necessary. The call is blocking.
 *
 * @this {AndroidUiautomator2Driver}
 * @param {number} [seconds=-1] The amount of seconds to wait between putting the app to background and restoring it.
 * Any negative value means to not restore the app after putting it to background.
 * @returns {Promise<void>}
 */
export async function mobileBackgroundApp(seconds = -1) {
  await this.background(seconds);
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */

/**
 * @template [T=any]
 * @typedef {import('@appium/types').StringRecord<T>} StringRecord
 */
