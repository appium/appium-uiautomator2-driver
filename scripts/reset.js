const ADB = require('appium-adb');
const B = require('bluebird');
const { flatMap } = require('lodash');

const SERVER_PKGS = [
  'io.appium.uiautomator2.server',
  'io.appium.uiautomator2.server.test',
  'io.appium.settings',
];

async function runReset () {
  const adb = new ADB();
  const udids = (await adb.getConnectedDevices())
    .filter(({state}) => state === 'device')
    .map(({udid}) => udid);
  if (0 === udids.length) {
    return;
  }
  const uninstallPromises = udids.map((udid) => {
    adb.curDeviceId = udid;
    return SERVER_PKGS.map((pkgId) => adb.uninstallApk(pkgId));
  });
  await B.all(flatMap(uninstallPromises));
}

(async () => await runReset())();
