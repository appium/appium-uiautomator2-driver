/**
 * This script needs to be run before other e2e mocha scripts
 *
 * This script starts the server or if it's TestObject, runs the tests on TO server
 */
import { enableTestObject, disableTestObject } from 'appium-test-support';
import wd from 'wd';
import { startServer, DEFAULT_PORT } from '../../..';
import logger from '../../../lib/logger';

if (process.env.TESTOBJECT_E2E_TESTS) {
  logger.debug('Running tests on TestObject');

  let wdObject;
  before(async function () {
    const commit = process.env.COMMIT_HASH || process.env.APPVEYOR_REPO_COMMIT || process.env.TRAVIS_COMMIT;
    if (!commit) {
      throw new Error(`A commit must be provided in $COMMIT_HASH`);
    }
    wdObject = await enableTestObject(wd, 'appium-uiautomator2-driver', `https://github.com/appium/appium-uiautomator2-driver.git`, commit);

    // Don't proceed with tests on first build (AppVeyor only runs for 1 hour).
    // The first build is solely for installing, zipping and uploading Appium to S3
    if (process.env.FIRST_BUILD) {
      process.exit();
    }
  });
  after(async function () {
    await disableTestObject(wdObject);
  });

} else {
  before(async function () {
    await startServer(DEFAULT_PORT, 'localhost');
  });
}
