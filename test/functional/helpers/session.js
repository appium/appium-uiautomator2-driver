import ADB from 'appium-adb';
import AndroidUiautomator2Driver from '../../..';


async function initDriver (caps) {
  if (process.env.TRAVIS) {
    let adb = new ADB();
    try {
      // on Travis, sometimes we get the keyboard dying and the screen stuck
      await adb.forceStop('com.android.inputmethod.latin');
      await adb.shell(['pm', 'clear', 'com.android.inputmethod.latin']);
    } catch (ign) {}
  }

  let driver = new AndroidUiautomator2Driver();
  await driver.createSession(caps);

  return driver;
}

export { initDriver };
