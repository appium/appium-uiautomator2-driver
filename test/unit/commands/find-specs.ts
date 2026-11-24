import assert from 'node:assert/strict';
import {describe, it, beforeEach, afterEach} from 'node:test';

import sinon from 'sinon';

import {AndroidUiautomator2Driver} from '../../../lib/driver.js';

const SCROLLABLE_LOCATOR =
  'new UiScrollable(new UiSelector().scrollable(true).instance(0)).scrollIntoView(new UiSelector().text("a"))';

describe('Find', function () {
  let driver: AndroidUiautomator2Driver;
  let warnStub: sinon.SinonStub;

  beforeEach(function () {
    driver = new AndroidUiautomator2Driver();
    driver.uiautomator2 = {jwproxy: {command: sinon.stub().resolves({ELEMENT: 'x'})}} as any;
    warnStub = sinon.stub(driver.log, 'warn');
  });

  afterEach(function () {
    sinon.restore();
  });

  async function find(strategy: string, selector: string) {
    return await driver.doFindElementOrEls({strategy, selector, context: '', multiple: false});
  }

  it('should warn once per session about UiScrollable locators', async function () {
    await find('-android uiautomator', SCROLLABLE_LOCATOR);
    await find('-android uiautomator', SCROLLABLE_LOCATOR);
    assert.equal(warnStub.callCount, 1);
    assert.match(warnStub.firstCall.args[0], /mobile: scrollGesture/);
  });

  it('should not warn about plain UiSelector locators', async function () {
    await find('-android uiautomator', 'new UiSelector().text("a")');
    assert.equal(warnStub.callCount, 0);
  });

  it('should not warn about locators with text mentioning UiScrollable', async function () {
    await find('-android uiautomator', 'new UiSelector().text("UiScrollable")');
    assert.equal(warnStub.callCount, 0);
  });

  it('should not warn about other strategies mentioning UiScrollable', async function () {
    await find('xpath', '//*[@text="UiScrollable"]');
    assert.equal(warnStub.callCount, 0);
  });

  describe('without UiSelector', function () {
    function lastParams() {
      return (driver.uiautomator2.jwproxy.command as sinon.SinonStub).lastCall.args[2];
    }

    it('should convert a CSS selector to a class chain', async function () {
      await find('css selector', '*[text="a"] > android.widget.Button');
      assert.equal(lastParams().strategy, '-android class chain');
      assert.equal(lastParams().selector, "**/*[`text == 'a'`]/android.widget.Button");
      assert.equal(warnStub.callCount, 0);
    });
  });
});
