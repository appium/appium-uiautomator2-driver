import _ from 'lodash';
import log from './logger';
import configEmulator from './config-emulator';


let env = {};

if (!process.env.SAUCE_BUILD) {
  // Get the environment variables
  if (!_.isEmpty(process.env.SAUCE_EMUSIM_DEVICE_INDEX) || process.env.SAUCE_EMUSIM) {
    log.info('Running tests on SauceLabs emulator');
    Object.assign(env, configEmulator());
  } else if (!_.isEmpty(process.env.SAUCE_RDC_DEVICE_INDEX) || process.env.SAUCE_RDC) {
    log.info('Running tests on SauceLabs real device');
    // TODO: fill this is once this is supported
  }

  if (process.env.CLOUD) {
    // get a unique build name for SauceLabs, based on the Travis build number
    // or the current date, for local testing
    env.SAUCE_BUILD = `appium-uiautomator2-driver CI: ${process.env.TRAVIS_BUILD_NUMBER || new Date().toISOString()}`;
  }

  Object.assign(process.env, env);
}
