import path from 'path';
import type {ADB} from 'appium-adb';
import {fs, system} from 'appium/support';

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

