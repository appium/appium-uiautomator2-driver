import _ from 'lodash';
import { exec } from 'teen_process';
import B from 'bluebird';
import path from 'path';

const PLATFORMS = {
  "7.1": [
    "Samsung Galaxy S6 GoogleAPI Emulator"
  ],
  "7.0": [
    //"Samsung Galaxy S8 GoogleAPI Emulator",
  ]
};

const TEST_CASES = [
  "build/test/functional/commands/find/",
  "build/test/functional/commands/general/",
];

const TIMEOUT = 60 * 1000;

(async function () {

  let cases = [];
  for (const platformVersion of _.keys(PLATFORMS)) {
    for (const deviceName of PLATFORMS[platformVersion]) {
      for (const testCase of TEST_CASES) {
        const env = {
          PLATFORM_VERSION: platformVersion,
          DEVICE_NAME: deviceName,
          SAUCE_LABS: true,
        };
        const mochaBin = path.resolve(__dirname, '..', '..', 'node_modules', '.bin', 'mocha');
        cases.push(exec(mochaBin, ['--timeout', TIMEOUT, testCase], {env}));
      }
    }
  }

  await B.all(cases);

})();