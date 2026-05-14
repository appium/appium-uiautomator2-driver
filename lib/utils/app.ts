import path from 'node:path';
import type {ADB} from 'appium-adb';
import {fs, system} from 'appium/support';

/**
 * @param filePath - Path to check
 * @returns Whether the file is writeable by the current process
 */
export async function isWriteable(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath, fs.constants.W_OK);
    if (system.isWindows()) {
      // On operating systems, where access-control policies may
      // limit access to the file system, `fs.access` does not work
      // as expected. See https://groups.google.com/forum/#!topic/nodejs/qmZtIwDRSYo
      // for more details
      await fs.close(await fs.open(filePath, 'r+'));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensures the app at `appPath` is writeable, then signs it with the given ADB instance.
 *
 * @param adb - ADB instance used to sign the APK
 * @param appPath - Path to the application package
 */
export async function signApp(adb: ADB, appPath: string): Promise<void> {
  if (!(await isWriteable(appPath))) {
    throw new Error(
      `The application at '${appPath}' is not writeable. ` +
        `Please grant write permissions to this file or to its parent folder '${path.dirname(appPath)}' ` +
        `for the Appium process, so it could sign the application`,
    );
  }
  await adb.sign(appPath);
}
