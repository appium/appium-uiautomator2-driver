import { commonCapConstraints } from 'appium-android-driver';

let uiautomatorCapConstraints = {
  app: {
    presence: true,
    isString: true,
  },
  automationName: {
    isString: true,
  },
  browserName: {
    isString: true
  },
  launchTimeout: {
    isNumber: true
  },
  skipUnlock: {
    isBoolean: true
  },
  uiautomator2ServerLaunchTimeout: {
    isNumber: true
  },
  uiautomator2ServerInstallTimeout: {
    isNumber: true
  },
  disableWindowAnimation: {
    isBoolean: true
  },
  systemPort: {
    isNumber: true
  },
};

let desiredCapConstraints = {};
Object.assign(desiredCapConstraints, uiautomatorCapConstraints,
              commonCapConstraints);

export default desiredCapConstraints;
