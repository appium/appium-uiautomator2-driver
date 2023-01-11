import { AndroidDriver } from 'appium-android-driver';

export const newMethodMap = /** @type {const} */ ({
  ...AndroidDriver.newMethodMap,
  '/session/:sessionId/appium/device/get_clipboard': {
    POST: {
      command: 'getClipboard',
      payloadParams: { optional: ['contentType'] }
    }
  }
});
