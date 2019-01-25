import log from './logger';


function configEmulator () {
  const platformVersion = process.env.PLATFORM_VERSION;
  const deviceName = process.env.DEVICE_NAME;

  log.info(`Running tests on iOS ${platformVersion}, device '${deviceName}'`);

  return {
    CLOUD: true,
    SAUCE_EMUSIM: true,
    SAUCE_USERNAME: process.env.SAUCE_USERNAME,
    SAUCE_ACCESS_KEY: process.env.SAUCE_ACCESS_KEY,
    CLOUD_PLATFORM_VERSION: platformVersion,
    CLOUD_DEVICE_NAME: deviceName,
  };
}


export default configEmulator;
