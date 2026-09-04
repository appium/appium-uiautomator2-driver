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

  interface GeometryOverrides {
    pixelRatio?: number;
    scrollX?: number;
    scrollY?: number;
    frameOffsetX?: number;
    frameOffsetY?: number;
    visualScale?: number;
    visualOffsetLeft?: number;
    visualOffsetTop?: number;
  }

  function stubGeometryContext(overrides: GeometryOverrides = {}) {
    const geometry = {
      pixelRatio: 2,
      scrollX: 0,
      scrollY: 0,
      frameOffsetX: 0,
      frameOffsetY: 0,
      visualScale: 1,
      visualOffsetLeft: 0,
      visualOffsetTop: 0,
      ...overrides,
    };
    const command = sinon.stub().withArgs('/execute/sync', 'POST', sinon.match.has('script')).resolves(geometry);
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
      stubGeometryContext();
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should convert document-relative getElementRect coordinates using the current scroll offset', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      // per the WebDriver spec, getElementRect is relative to the document, not the viewport;
      // an element at document y=1200 while scrolled to y=1180 is 20px from the visible top
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 1200, width: 30, height: 40});
      stubGeometryContext({scrollY: 1180});
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should accumulate ancestor frame offsets for an element inside an iframe', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      // rect is relative to the iframe's own document; the iframe itself sits at (50, 80)
      // within its parent's layout viewport
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 5, y: 5, width: 20, height: 20});
      stubGeometryContext({frameOffsetX: 50, frameOffsetY: 80});
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 110, y: 270, width: 40, height: 40});
    });

    it('should account for the visual viewport scale and pan offset under pinch zoom', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 15, y: 110, width: 30, height: 40});
      stubGeometryContext({visualScale: 2, visualOffsetLeft: 10, visualOffsetTop: 20});
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      // layout (15, 110) -> visual ((15-10)*2, (110-20)*2) = (10, 180) -> native (0+10*2, 100+180*2)
      assert.deepStrictEqual(result, {x: 20, y: 460, width: 120, height: 160});
    });

    it('should clamp the translated rect to the WebView bounds for an element scrolled past the viewport edge', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 1165, width: 30, height: 40});
      stubGeometryContext({scrollY: 1180});
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      // layout y = 1165 - 1180 = -15 -> native y would be 100 + (-15 * 2) = 70, above the WebView's top edge of 100
      assert.deepStrictEqual(result, {x: 20, y: 100, width: 60, height: 50});
    });

    it('should throw ElementNotInteractableError if the element is entirely outside the WebView bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 1200, width: 30, height: 10});
      stubGeometryContext({scrollY: 1300});
      stubCdpWebviewRect({screenX: 0, screenY: 100, width: 1080, height: 1700});

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /not visible/i);
    });

    it('should ignore a non-visible page when reading the CDP-reported bounds', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
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
      stubGeometryContext();
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

    it('should fall back to the native view hierarchy when the CDP-reported page is empty/zero-area', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
      mockDriver
        .expects('mobileGetContexts')
        .once()
        .returns([
          {
            webviewName: 'WEBVIEW_com.example.app',
            pages: [
              {description: JSON.stringify({screenX: 0, screenY: 0, width: 0, height: 0, visible: true})},
              {
                description: JSON.stringify({
                  screenX: 0,
                  screenY: 0,
                  width: 100,
                  height: 100,
                  visible: true,
                  empty: true,
                }),
              },
            ],
          },
        ]);
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
      stubGeometryContext();
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

    it('should ignore hidden/zero-area WebView elements and use the one remaining candidate', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
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

    it('should throw as ambiguous if more than one visible native WebView element is found in the fallback', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
      stubCdpWebviewRect(null);
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['webview1', 'webview2']);
      const commandStub = sinon.stub();
      commandStub.withArgs('/element/webview1/rect', 'GET').resolves({x: 0, y: 100, width: 500, height: 1700});
      commandStub.withArgs('/element/webview2/rect', 'GET').resolves({x: 500, y: 100, width: 580, height: 1700});
      driver.uiautomator2 = {jwproxy: {command: commandStub}} as any;

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /multiple/i);
    });

    it('should throw if no native WebView element can be found in the fallback', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
      stubCdpWebviewRect(null);
      mockDriver.expects('findElOrEls').once().returns([]);

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /WebView/);
    });

    it('should ignore a stale WebView element whose rect lookup fails, rather than failing the whole call', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
      stubCdpWebviewRect(null);
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['stale-webview', 'visible-webview']);
      const commandStub = sinon.stub();
      commandStub.withArgs('/element/stale-webview/rect', 'GET').rejects(new Error('stale element reference'));
      commandStub.withArgs('/element/visible-webview/rect', 'GET').resolves({x: 0, y: 100, width: 1080, height: 1700});
      driver.uiautomator2 = {jwproxy: {command: commandStub}} as any;

      const result = await driver.execute('mobile: viewportElementRect', {elementId: 'el1'});
      assert.deepStrictEqual(result, {x: 20, y: 140, width: 60, height: 80});
    });

    it('should throw if every native WebView element rect lookup fails', async function () {
      mockDriver.expects('isWebContext').once().returns(true);
      mockDriver.expects('getElementRect').once().withArgs('el1').returns({x: 10, y: 20, width: 30, height: 40});
      stubGeometryContext();
      stubCdpWebviewRect(null);
      mockDriver
        .expects('findElOrEls')
        .once()
        .withArgs('xpath', "//*[contains(@class,'WebView')]", true)
        .returns(['stale-webview']);
      driver.uiautomator2 = {
        jwproxy: {command: sinon.stub().rejects(new Error('stale element reference'))},
      } as any;

      await assert.rejects(driver.execute('mobile: viewportElementRect', {elementId: 'el1'}), /WebView/);
    });
  });
});
