import _ from 'lodash';
import B from 'bluebird';
import {errors} from 'appium/driver';
import {APK_EXTENSION} from '../extensions';
import type {AndroidUiautomator2Driver} from '../driver';
import type {InstallOptions} from './types';

/**
 * Installs multiple APKs with `install-multiple` option.
 * @param apks - Array of APK file paths or URLs to install.
 * @param options - Optional installation options (allowTestPackages, useSdcard, grantPermissions, etc.).
 * @throws {errors.InvalidArgumentError} If the apks array is empty or invalid.
 */
export async function mobileInstallMultipleApks(
  this: AndroidUiautomator2Driver,
  apks: string[],
  options?: InstallOptions,
): Promise<void> {
  if (!_.isArray(apks) || _.isEmpty(apks)) {
    throw new errors.InvalidArgumentError('No apks are given to install');
  }
  const configuredApks = await B.all(apks.map((app) => this.helpers.configureApp(app, [APK_EXTENSION])));
  await this.adb.installMultipleApks(configuredApks, options);
}

