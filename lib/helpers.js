import path from 'path';
import { fs, system } from 'appium/support';

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
export async function isWriteable(filePath) {
  try {
    await fs.access(filePath, fs.W_OK);
    if (system.isWindows()) {
      // On operating systems, where access-control policies may
      // limit access to the file system, `fs.access` does not work
      // as expected. See https://groups.google.com/forum/#!topic/nodejs/qmZtIwDRSYo
      // for more details
      await fs.close(await fs.open(filePath, 'r+'));
    }
    return true;
  } catch (ign) {
    return false;
  }
}

/**
 *
 * @param {import('appium-adb').ADB} adb
 * @param {string} appPath
 * @returns {Promise<void>}
 */
export async function signApp(adb, appPath) {
  if (!await isWriteable(appPath)) {
    throw new Error(`The application at '${appPath}' is not writeable. ` +
      `Please grant write permissions to this file or to its parent folder '${path.dirname(appPath)}' ` +
      `for the Appium process, so it could sign the application`);
  }
  await adb.sign(appPath);
}
