const { ADB } = require('appium-adb');
const B = require('bluebird');
const {logger} = require('appium/support');

const log = logger.getLogger('UIA2Reset');

const SERVER_PKGS = [
  'io.appium.uiautomator2.server',
  'io.appium.uiautomator2.server.test',
  'io.appium.settings',
];

async function runReset () {
  const adb = await ADB.createADB();
  const udids = (await adb.getConnectedDevices())
    .filter(({state}) => state === 'device')
    .map(({udid}) => udid);
  if (0 === udids.length) {
    return;
  }

  log.info(`About to perform reset for the following device${udids.length === 1 ? '' : 's'}: ${udids}`);
  const uninstallPromises = [];
  for (const udid of udids) {
    const deviceAdb = udids.length === 1 ? adb : await ADB.createADB();
    deviceAdb.setDeviceId(udid);
    uninstallPromises.push(...(SERVER_PKGS.map((pkgId) => deviceAdb.uninstallApk(pkgId))));
  }
  await B.all(uninstallPromises);
}

(async () => await runReset())();
