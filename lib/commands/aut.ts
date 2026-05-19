import {utils} from 'appium-android-driver';
import {fs} from 'appium/support';
import {SETTINGS_HELPER_ID} from 'io.appium.settings';
import type {AndroidUiautomator2Driver} from '../driver';
import {APKS_EXTENSION, APK_EXTENSION} from '../extensions';
import {SERVER_PACKAGE_ID, SERVER_TEST_PACKAGE_ID} from '../uiautomator2-server';
import {signApp} from '../utils';

/** Configures the app capability and validates the APK path before session start. */
export async function prepareSessionApp(this: AndroidUiautomator2Driver): Promise<void> {
  if (this.opts.app) {
    // find and copy, or download and unzip an app url or path
    this.opts.app = await this.helpers.configureApp(this.opts.app, [APK_EXTENSION, APKS_EXTENSION]);
    await this.checkAppPresent();
  } else if (this.opts.appPackage) {
    // the app isn't an actual app file but rather something we want to
    // assume is on the device and just launch via the appPackage
    this.log.info(`Starting '${this.opts.appPackage}' directly on the device`);
  } else {
    this.log.info(
      `Neither 'app' nor 'appPackage' was set. Starting UiAutomator2 ` +
        'without the target application',
    );
  }
}

/** Verifies that the app APK path from capabilities exists on the host. */
export async function checkAppPresent(this: AndroidUiautomator2Driver): Promise<void> {
  this.log.debug('Checking whether app is actually present');
  if (!this.opts.app || !(await fs.exists(this.opts.app))) {
    throw this.log.errorWithException(`Could not find app apk at '${this.opts.app}'`);
  }
}

/** Installs and prepares the application under test on the device. */
export async function initAUT(this: AndroidUiautomator2Driver): Promise<void> {
  // Uninstall any uninstallOtherPackages which were specified in caps
  if (this.opts.uninstallOtherPackages) {
    await this.uninstallOtherPackages(utils.parseArray(this.opts.uninstallOtherPackages), [
      SETTINGS_HELPER_ID,
      SERVER_PACKAGE_ID,
      SERVER_TEST_PACKAGE_ID,
    ]);
  }

  // Install any "otherApps" that were specified in caps
  if (this.opts.otherApps) {
    let otherApps;
    try {
      otherApps = utils.parseArray(this.opts.otherApps);
    } catch (e) {
      throw this.log.errorWithException(
        `Could not parse "otherApps" capability: ${(e as Error).message}`,
      );
    }
    otherApps = await Promise.all(
      otherApps.map((app) => this.helpers.configureApp(app, [APK_EXTENSION, APKS_EXTENSION])),
    );
    await this.installOtherApks(otherApps);
  }

  if (this.opts.app && this.opts.appPackage) {
    const adb = this.requireAdb();
    const appPackage = this.opts.appPackage;
    if ((this.opts.noReset && !(await adb.isAppInstalled(appPackage))) || !this.opts.noReset) {
      if (
        !this.opts.noSign &&
        !(await adb.checkApkCert(this.opts.app, appPackage, {
          requireDefaultCert: false,
        }))
      ) {
        await signApp(adb, this.opts.app);
      }
      if (!this.opts.skipUninstall) {
        await adb.uninstallApk(appPackage);
      }
      await this.installAUT();
    } else {
      this.log.debug('noReset has been requested and the app is already installed. Doing nothing');
    }
  } else {
    if (this.opts.fullReset) {
      throw this.log.errorWithException(
        'Full reset requires an app capability, use fastReset if app is not provided',
      );
    }
    this.log.debug('No app capability. Assuming it is already on the device');
    if (this.opts.fastReset && this.opts.appPackage) {
      await this.resetAUT();
    }
  }
}

/** Launches the application under test according to session capabilities. */
export async function ensureAppStarts(this: AndroidUiautomator2Driver): Promise<void> {
  const adb = this.requireAdb();
  const appPackage = this.opts.appPackage;
  const appActivity = this.opts.appActivity;
  if (!appPackage) {
    throw this.log.errorWithException('appPackage capability is required to start the application');
  }
  // make sure we have an activity and package to wait for
  const appWaitPackage = this.opts.appWaitPackage || appPackage;
  const appWaitActivity = this.opts.appWaitActivity || appActivity;
  this.log.info(
    `Starting '${appPackage}${appActivity ? '/' + appActivity : ''}` +
      `and waiting for '${appWaitPackage}${appWaitActivity ? '/' + appWaitActivity : ''}'`,
  );

  if (this.opts.noReset && !this.opts.forceAppLaunch && (await adb.processExists(appPackage))) {
    this.log.info(
      `'${appPackage}' is already running and noReset is enabled. ` +
        `Set forceAppLaunch capability to true if the app must be forcefully restarted on session startup.`,
    );
    return;
  }
  await adb.startApp({
    pkg: appPackage,
    activity: appActivity,
    action: this.opts.intentAction || 'android.intent.action.MAIN',
    category: this.opts.intentCategory || 'android.intent.category.LAUNCHER',
    flags: this.opts.intentFlags || '0x10200000', // FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
    waitPkg: this.opts.appWaitPackage,
    waitActivity: this.opts.appWaitActivity,
    waitForLaunch: this.opts.appWaitForLaunch,
    waitDuration: this.opts.appWaitDuration,
    optionalIntentArguments: this.opts.optionalIntentArguments,
    stopApp: this.opts.forceAppLaunch || !this.opts.dontStopAppOnReset,
    retry: true,
    user: this.opts.userProfile,
  });
}
