import assert from 'node:assert/strict';
import {describe, it, beforeEach, afterEach} from 'node:test';

import sinon from 'sinon';

import {AndroidUiautomator2Driver} from '../../../lib/driver.js';

describe('Gestures', function () {
  let driver: AndroidUiautomator2Driver;
  let commandStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;

  beforeEach(function () {
    driver = new AndroidUiautomator2Driver();
    commandStub = sinon.stub().resolves(true);
    driver.uiautomator2 = {jwproxy: {command: commandStub}} as any;
    warnStub = sinon.stub(driver.log, 'warn');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('mobile: scrollGesture', function () {
    it('should accept neither an element nor an area', async function () {
      await driver.execute('mobile: scrollGesture', {direction: 'down', percent: 1});
      const [endpoint, method, payload] = commandStub.firstCall.args;
      assert.equal(endpoint, '/appium/gestures/scroll');
      assert.equal(method, 'POST');
      assert.equal(payload.origin, undefined);
      assert.equal(payload.area, undefined);
    });

    it('should pass the complete area', async function () {
      await driver.execute('mobile: scrollGesture', {
        direction: 'down',
        percent: 1,
        left: 1,
        top: 2,
        width: 3,
        height: 4,
      });
      assert.deepEqual(commandStub.firstCall.args[2].area, {left: 1, top: 2, width: 3, height: 4});
    });

    it('should reject a partial area', async function () {
      await assert.rejects(
        driver.execute('mobile: scrollGesture', {direction: 'down', percent: 1, left: 1, top: 2}),
        /must be provided together/,
      );
      assert.equal(commandStub.callCount, 0);
    });

    it('should ignore a partial area if an element is given', async function () {
      await driver.execute('mobile: scrollGesture', {elementId: 'el1', direction: 'down', percent: 1, left: 1, top: 2});
      assert.equal(commandStub.callCount, 1);
      assert.equal(commandStub.firstCall.args[2].area, undefined);
    });
  });

  describe('mobile: scroll', function () {
    it('should warn once per session about the UiAutomator strategy', async function () {
      const args = {strategy: '-android uiautomator', selector: 'new UiSelector().text("a")'};
      await driver.execute('mobile: scroll', args);
      await driver.execute('mobile: scroll', args);
      assert.equal(warnStub.callCount, 1);
      assert.match(warnStub.firstCall.args[0], /UiScrollable/);
    });

    it('should not warn about other strategies', async function () {
      await driver.execute('mobile: scroll', {strategy: 'accessibility id', selector: 'a'});
      assert.equal(warnStub.callCount, 0);
    });
  });
});
