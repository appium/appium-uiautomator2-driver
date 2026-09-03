import assert from 'node:assert/strict';
import {describe, it, beforeEach, afterEach} from 'node:test';

import {PROTOCOLS} from 'appium/driver.js';
import sinon from 'sinon';

import {clampRectToBounds} from '../../../lib/commands/viewport.js';
import {AndroidUiautomator2Driver} from '../../../lib/driver.js';

describe('clampRectToBounds', function () {
  const bounds = {x: 0, y: 100, width: 1080, height: 1700};

  it('should leave a rect that is fully inside the bounds untouched', function () {
    const rect = {x: 20, y: 140, width: 60, height: 80};
    assert.deepStrictEqual(clampRectToBounds(rect, bounds), rect);
  });

  it('should clip a rect that overflows past the left/top edges', function () {
    const rect = {x: -30, y: 60, width: 60, height: 80};
    assert.deepStrictEqual(clampRectToBounds(rect, bounds), {x: 0, y: 100, width: 30, height: 40});
  });

  it('should clip a rect that overflows past the right/bottom edges', function () {
    const rect = {x: 1060, y: 1770, width: 60, height: 80};
    assert.deepStrictEqual(clampRectToBounds(rect, bounds), {x: 1060, y: 1770, width: 20, height: 30});
  });

  it('should collapse a rect that does not overlap the bounds at all to zero size', function () {
    const rect = {x: -200, y: -200, width: 60, height: 80};
    assert.deepStrictEqual(clampRectToBounds(rect, bounds), {x: 0, y: 100, width: 0, height: 0});
  });

  it('should clip a rect that is larger than the bounds on every side', function () {
    const rect = {x: -50, y: 50, width: 2000, height: 2000};
    assert.deepStrictEqual(clampRectToBounds(rect, bounds), bounds);
  });
});

describe('Viewport', function () {
  let driver: AndroidUiautomator2Driver;
  let mockDriver: sinon.SinonMock;

  beforeEach(function () {
    driver = new AndroidUiautomator2Driver();
    driver.curContext = 'WEBVIEW_com.example.app';
    mockDriver = sinon.mock(driver);
  });

  afterEach(function () {
    mockDriver.verify();
  });

  function stubChromedriverPixelRatio(pixelRatio: number) {
    const command = sinon
      .stub()
      .withArgs('/execute/sync', 'POST', {script: 'return window.devicePixelRatio;', args: []})
      .resolves(pixelRatio);
    driver.chromedriver = {jwproxy: {downstreamProtocol: PROTOCOLS.W3C, command}} as any;
    return command;
  }

  function stubCdpWebviewRect(rect: {screenX: number; screenY: number; width: number; height: number} | null) {
    mockDriver
      .expects('mobileGetContexts')
      .once()
      .returns([
        {
          webviewName: 'WEBVIEW_com.example.app',
          pages: rect ? [{description: JSON.stringify({...rect, attached: true, empty: false, visible: true})}] : [],
        },
      ]);
  }

  describe('mobile: viewportElementRect', function () {
    it('should throw if the current context is not a web view', async function () {
      mockDriver.expects('isWebContext').once().returns(false);
      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /web view/i);
    });

    it('should translate the element rect using the CDP-reported WebView bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should clamp the translated rect to the WebView bounds for an element scrolled past the viewport edge', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      // css rect puts the element mostly above the top of the viewport (negative y)
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: -15, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      // native y would be 100 + (-15 * 2) = 70, below the WebView's top edge of 100
      assert.deepStrictEqual(result, {x: 20, y: 100, width: 60, height: 50});
    });

    it('should throw ElementNotInteractableError if the element is entirely outside the WebView bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      // css rect puts the element entirely above the top of the viewport
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: -100, width: 30, height: 10});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /not visible/i);
    });

    it('should ignore a non-visible page when reading the CDP-reported bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      mockDriver
        .expects('mobileGetContexts')
        .once()
        .returns([
          {
            webviewName: 'WEBVIEW_com.example.app',
            pages: [
              {description: JSON.stringify({screenX: 0, screenY: 0, width: 10, height: 10, visible: false})},
              {description: JSON.stringify({screenX: 0, screenY: 100, width: 1080, height: 1700, visible: true})},
            ],
          },
        ]);

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should fall back to the native view hierarchy when CDP reports no usable bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect(null);
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['webview1']);
      driver.uiautomator2 = {
        jwproxy: {
          command: sinon
            .stub()
            .withArgs('/element/webview1/rect', 'GET')
            .resolves({x: 0, y: 100, width: 1080, height: 1700}),
        },
      } as any;

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should fall back to the native view hierarchy when the CDP lookup throws', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      mockDriver.expects('mobileGetContexts').once().rejects(new Error('devtools unreachable'));
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['webview1']);
      driver.uiautomator2 = {
        jwproxy: {
          command: sinon
            .stub()
            .withArgs('/element/webview1/rect', 'GET')
            .resolves({x: 0, y: 100, width: 1080, height: 1700}),
        },
      } as any;

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should pick the largest native WebView element when falling back with more than one present', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect(null);
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['hidden-webview', 'visible-webview']);
      const commandStub = sinon.stub();
      commandStub.withArgs('/element/hidden-webview/rect', 'GET').resolves({x: 0, y: 0, width: 0, height: 0});
      commandStub.withArgs('/element/visible-webview/rect', 'GET').resolves({x: 0, y: 100, width: 1080, height: 1700});
      driver.uiautomator2 = {jwproxy: {command: commandStub}} as any;

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should throw if no native WebView element can be found in the fallback', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubChromedriverPixelRatio(2);
      stubCdpWebviewRect(null);
      mockDriver.expects('findElOrEls').once().returns([]);

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /WebView/);
    });
  });
});
