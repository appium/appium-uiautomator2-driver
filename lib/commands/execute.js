import _ from 'lodash';
import {AndroidDriver} from 'appium-android-driver';

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {import('@appium/types').StringRecord<string>}
 */
export function mobileCommandsMapping() {
  const commonMapping = new AndroidDriver().mobileCommandsMapping.call(this);
  return {
    ...commonMapping,
    dragGesture: 'mobileDragGesture',
    flingGesture: 'mobileFlingGesture',
    doubleClickGesture: 'mobileDoubleClickGesture',
    clickGesture: 'mobileClickGesture',
    longClickGesture: 'mobileLongClickGesture',
    pinchCloseGesture: 'mobilePinchCloseGesture',
    pinchOpenGesture: 'mobilePinchOpenGesture',
    swipeGesture: 'mobileSwipeGesture',
    scrollGesture: 'mobileScrollGesture',
    scrollBackTo: 'mobileScrollBackTo',
    scroll: 'mobileScroll',
    viewportScreenshot: 'mobileViewportScreenshot',
    viewportRect: 'mobileViewPortRect',

    deepLink: 'mobileDeepLink',

    acceptAlert: 'mobileAcceptAlert',
    dismissAlert: 'mobileDismissAlert',

    batteryInfo: 'mobileGetBatteryInfo',

    deviceInfo: 'mobileGetDeviceInfo',

    openNotifications: 'openNotifications',

    type: 'mobileType',
    replaceElementValue: 'mobileReplaceElementValue',

    getAppStrings: 'mobileGetAppStrings',

    installMultipleApks: 'mobileInstallMultipleApks',
    backgroundApp: 'mobileBackgroundApp',

    pressKey: 'mobilePressKey',

    screenshots: 'mobileScreenshots',

    scheduleAction: 'mobileScheduleAction',
    getActionHistory: 'mobileGetActionHistory',
    unscheduleAction: 'mobileUnscheduleAction',

    setClipboard: 'mobileSetClipboard',
    getClipboard: 'mobileGetClipboard',
  };
}

/**
 * @override
 * @this {AndroidUiautomator2Driver}
 * @param {string} mobileCommand
 * @param {import('@appium/types').StringRecord} [opts={}]
 * @returns {Promise<any>}
 */
export async function executeMobile(mobileCommand, opts = {}) {
  return await new AndroidDriver().executeMobile.call(this, mobileCommand, preprocessOptions(opts));
}

// #region Internal Helpers

/**
 * Renames the deprecated `element` key to `elementId`. Historically,
 * all of the pre-Execute-Method-Map execute methods accepted an `element` _or_ and `elementId` param.
 * This assigns the `element` value to `elementId` if `elementId` is not already present.
 *
 * @param {import('@appium/types').StringRecord} [opts={}]
 * @internal
 * @returns {import('@appium/types').StringRecord|undefined}
 */
function preprocessOptions(opts = {}) {
  if (_.isPlainObject(opts) && !('elementId' in opts) && 'element' in opts) {
    opts.elementId = opts.element;
    delete opts.element;
    this.log.debug(`Replaced the obsolete 'element' key with 'elementId'`);
  }
  return opts;
}

// #endregion

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
