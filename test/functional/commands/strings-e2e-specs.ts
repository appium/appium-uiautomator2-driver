import assert from 'node:assert/strict';
import {describe, it, before, after} from 'node:test';

import type {Browser} from 'webdriverio';

import {APIDEMOS_CAPS, amendCapabilities} from '../desired.js';
import {initSession, deleteSession} from '../helpers/session.js';

describe('strings', function () {
  let driver: Browser;

  describe('specific language', function () {
    before(async function () {
      driver = await initSession(APIDEMOS_CAPS);
    });
    after(async function () {
      await deleteSession();
    });

    it('should return app strings', async function () {
      const strings = await driver.getStrings('en');
      assert.strictEqual(strings.hello_world, 'Hello, World!');
    });

    it('should return app strings for different language', async function () {
      const strings = await driver.getStrings('fr');
      assert.strictEqual(strings.hello_world, 'Bonjour, Monde!');
    });
  });

  describe('device language', function () {
    before(async function () {
      const caps = amendCapabilities(APIDEMOS_CAPS, {
        'appium:language': 'en',
        'appium:locale': 'US',
      });
      driver = await initSession(caps);
    });
    after(async function () {
      await deleteSession();
    });

    it('should return app strings with default locale/language', async function () {
      const strings = await driver.getStrings();
      assert.strictEqual(strings.hello_world, 'Hello, World!');
    });
  });
});
