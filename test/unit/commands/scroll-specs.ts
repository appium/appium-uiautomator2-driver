import assert from 'node:assert/strict';
import {describe, it, beforeEach, afterEach} from 'node:test';

import sinon from 'sinon';

import {AndroidUiautomator2Driver} from '../../../lib/driver.js';

describe('mobile: scroll', function () {
  let driver: AndroidUiautomator2Driver;
  let commandStub: sinon.SinonStub;

  beforeEach(function () {
    driver = new AndroidUiautomator2Driver();
    commandStub = sinon.stub().resolves(null);
    driver.uiautomator2 = {jwproxy: {command: commandStub}} as any;
  });

  afterEach(function () {
    sinon.restore();
  });

  it('should pass the new options to the server', async function () {
    await driver.execute('mobile: scroll', {
      strategy: 'xpath',
      selector: '//*[@text="a"]',
      elementId: 'el1',
      maxSwipes: 5,
      direction: 'right',
      fromStart: true,
    });
    const [endpoint, method, payload] = commandStub.firstCall.args;
    assert.equal(endpoint, '/gestures/scroll_to');
    assert.equal(method, 'POST');
    assert.deepEqual(payload.params, {
      strategy: 'xpath',
      selector: '//*[@text="a"]',
      maxSwipes: 5,
      direction: 'right',
      fromStart: true,
    });
    assert.ok(payload.origin);
  });

  it('should not send the options that are not set', async function () {
    await driver.execute('mobile: scroll', {strategy: 'id', selector: 'a'});
    const payload = commandStub.firstCall.args[2];
    assert.equal(payload.origin, undefined);
    assert.equal(payload.params.direction, undefined);
    assert.equal(payload.params.fromStart, undefined);
  });

  it('should require the strategy and the selector', async function () {
    await assert.rejects(driver.execute('mobile: scroll', {strategy: 'id'}), /required/i);
  });
});
