import {Constraints} from '@appium/types';
import {commonCapConstraints} from 'appium-android-driver';

const UIAUTOMATOR2_CONSTRAINTS = {
  launchTimeout: {
    isNumber: true,
  },
  uiautomator2ServerLaunchTimeout: {
    isNumber: true,
  },
  uiautomator2ServerInstallTimeout: {
    isNumber: true,
  },
  uiautomator2ServerReadTimeout: {
    isNumber: true,
  },
  systemPort: {
    isNumber: true,
  },
  mjpegServerPort: {
    isNumber: true,
  },
  mjpegScreenshotUrl: {
    isString: true,
  },
  skipServerInstallation: {
    isBoolean: true,
  },
  disableSuppressAccessibilityService: {
    isBoolean: true,
  },
  forceAppLaunch: {
    isBoolean: true,
  },
  shouldTerminateApp: {
    isBoolean: true,
  },
  ...commonCapConstraints,
} as const satisfies Constraints;

export default UIAUTOMATOR2_CONSTRAINTS;

export type Uiautomator2Constraints = typeof UIAUTOMATOR2_CONSTRAINTS;
