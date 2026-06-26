import {describe, it, before, after, afterEach} from 'node:test';
import type {Browser} from 'webdriverio';
import {waitForCondition} from 'asyncbox';
import {APIDEMOS_CAPS, amendCapabilities} from '../desired.js';
import {isCi} from '../helpers/ci-e2e.js';
import {initSession, deleteSession} from '../helpers/session.js';
import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

use(chaiAsPromised);

describe('apidemo - orientation -', function () {
  let driver: Browser;

  describe('initial -', {skip: isCi()}, function () {
    afterEach(async function () {
      await driver.setOrientation('PORTRAIT');
      await deleteSession();
    });
    it('should have portrait orientation if requested', async function () {
      driver = await initSession(
        amendCapabilities(APIDEMOS_CAPS, {
          'appium:appActivity': '.view.TextFields',
          'appium:orientation': 'PORTRAIT',
        }),
      );
      await expect(driver.getOrientation()).to.eventually.eql('PORTRAIT');
    });
    it('should have landscape orientation if requested', async function () {
      driver = await initSession(
        amendCapabilities(APIDEMOS_CAPS, {
          'appium:appActivity': '.view.TextFields',
          'appium:orientation': 'LANDSCAPE',
        }),
      );
      await expect(driver.getOrientation()).to.eventually.eql('LANDSCAPE');
    });
    it('should have portrait orientation if nothing requested', async function () {
      driver = await initSession(
        amendCapabilities(APIDEMOS_CAPS, {
          'appium:appActivity': '.view.TextFields',
        }),
      );
      await expect(driver.getOrientation()).to.eventually.eql('PORTRAIT');
    });
  });
  describe('setting -', function () {
    const orientationSettleOpts = {waitMs: 15000, intervalMs: 250};

    async function waitForOrientation(expected: string): Promise<void> {
      await waitForCondition(
        async () => {
          try {
            return (await driver.getOrientation()) === expected;
          } catch {
            return false;
          }
        },
        {
          ...orientationSettleOpts,
          error: `Timed out waiting for orientation ${expected}`,
        },
      );
    }

    before(async function () {
      driver = await initSession(
        amendCapabilities(APIDEMOS_CAPS, {
          'appium:appActivity': '.view.TextFields',
        }),
      );
    });
    after(async function () {
      await deleteSession();
    });
    it('should rotate screen to landscape', async function () {
      await driver.setOrientation('PORTRAIT');
      await waitForOrientation('PORTRAIT');
      await driver.setOrientation('LANDSCAPE');
      await waitForOrientation('LANDSCAPE');
    });
    it('should rotate screen to portrait', async function (t) {
      if (isCi()) {
        return t.skip();
      }
      await driver.setOrientation('LANDSCAPE');
      await waitForOrientation('LANDSCAPE');
      await driver.setOrientation('PORTRAIT');
      await waitForOrientation('PORTRAIT');
    });
    it('should not error when trying to rotate to portrait again', async function (t) {
      if (isCi()) {
        return t.skip();
      }
      await driver.setOrientation('PORTRAIT');
      await waitForOrientation('PORTRAIT');
      await driver.setOrientation('PORTRAIT');
      await waitForOrientation('PORTRAIT');
    });
  });
});
