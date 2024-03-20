import _ from 'lodash';
import B from 'bluebird';
import {errors} from 'appium/driver';
import {APK_EXTENSION} from '../extensions';

/**
 * Install multiple APKs with `install-multiple` option.
 * @this {AndroidUiautomator2Driver}=
 * @param {import('./types').InstallMultipleApksOptions} opts
 * @throws {Error} if an error occured while installing the given APKs.
 * @returns {Promise<void>}
 */
export async function mobileInstallMultipleApks(opts) {
  if (!_.isArray(opts.apks) || _.isEmpty(opts.apks)) {
    throw new errors.InvalidArgumentError('No apks are given to install');
  }
  const apks = await B.all(
    opts.apks.map((app) => this.helpers.configureApp(app, [APK_EXTENSION]))
  );
  await this.adb.installMultipleApks(apks, opts.options);
}

/**
 * Puts the app to background and waits the given number of seconds Then restores the app
 * if necessary. The call is blocking.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').BackgroundAppOptions} [opts={}]
 * @returns {Promise<void>}
 */
export async function mobileBackgroundApp(opts = {}) {
  const {seconds = -1} = opts;
  await this.background(seconds);
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */

/**
 * @template [T=any]
 * @typedef {import('@appium/types').StringRecord<T>} StringRecord
 */
