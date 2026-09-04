import type {Rect, Size, StringRecord} from '@appium/types';
import type {WebviewsMapping} from 'appium-android-driver';
import type {Chromedriver} from 'appium-chromedriver';
import {errors, PROTOCOLS} from 'appium/driver.js';
import {util} from 'appium/support.js';

import type {AndroidUiautomator2Driver} from '../driver.js';
import type {RelativeRect} from './types.js';

/**
 * Gets the status bar height in pixels.
 * @returns The status bar height in pixels.
 */
export async function getStatusBarHeight(this: AndroidUiautomator2Driver): Promise<number> {
  const {statusBar} = (await this.uiautomator2.jwproxy.command(`/appium/device/system_bars`, 'GET', {})) as {
    statusBar: number;
  };
  return statusBar;
}

/**
 * Gets the device pixel ratio.
 * @returns The device pixel ratio as a string.
 */
export async function getDevicePixelRatio(this: AndroidUiautomator2Driver): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command('/appium/device/pixel_ratio', 'GET', {}));
}

/**
 * Gets the viewport rectangle coordinates.
 * @returns The viewport rectangle (left, top, width, height), accounting for status bar height.
 */
export async function getViewPortRect(this: AndroidUiautomator2Driver): Promise<RelativeRect> {
  const windowSize = await this.getWindowSize();
  const statusBarHeight = await this.getStatusBarHeight();
  // android returns the upscaled window size, so to get the true size of the
  // rect we have to downscale
  return {
    left: 0,
    top: statusBarHeight,
    width: windowSize.width,
    height: windowSize.height - statusBarHeight,
  };
}

/**
 * Returns the viewport coordinates.
 * @returns The viewport rectangle (left, top, width, height).
 */
export async function mobileViewPortRect(this: AndroidUiautomator2Driver): Promise<RelativeRect> {
  return await this.getViewPortRect();
}

/**
 * Clips `rect` to the area covered by `bounds`, so that it never extends
 * outside it. An element that is partially (or entirely) scrolled out of its
 * container, or that otherwise overflows it, would otherwise translate to
 * coordinates outside of what's actually on screen at that container.
 *
 * @returns The clipped rectangle. Its width/height are 0 if `rect` doesn't
 * overlap `bounds` at all.
 */
export function clampRectToBounds(rect: Rect, bounds: Rect): Rect {
  const left = Math.min(Math.max(rect.x, bounds.x), bounds.x + bounds.width);
  const top = Math.min(Math.max(rect.y, bounds.y), bounds.y + bounds.height);
  const right = Math.min(Math.max(rect.x + rect.width, bounds.x), bounds.x + bounds.width);
  const bottom = Math.min(Math.max(rect.y + rect.height, bounds.y), bounds.y + bounds.height);
  return {
    x: left,
    y: top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

/**
 * Gets the rectangle of an element located in the current web view context,
 * translated into native device screen coordinates. `getElementRect` is
 * relative to the element's own (possibly nested-frame) document and ignores
 * scroll/zoom, so this corrects for scroll offset, ancestor frame offsets,
 * and the visual viewport (pinch/input zoom) before applying the device
 * pixel ratio and the hosting WebView's on-screen bounds (see
 * `getWebviewGeometryContext`). The result is clamped to those bounds.
 *
 * @param elementId - ID of an element found in the current web view context.
 * @returns The element rectangle (x, y, width, height) in native screen coordinates.
 * @throws {errors.InvalidContextError} If the current context is not a web view.
 * @throws {errors.ElementNotInteractableError} If the element is not visible/is entirely
 * offscreen, i.e. outside the WebView's own on-screen bounds, once clamped.
 */
export async function mobileViewportElementRect(this: AndroidUiautomator2Driver, elementId: string): Promise<Rect> {
  if (!this.isWebContext()) {
    throw new errors.InvalidContextError(
      'The current context must be a web view in order to translate an element rect into native screen coordinates',
    );
  }

  const [webRect, geometry, webViewRect] = await Promise.all([
    this.getElementRect(elementId),
    getWebviewGeometryContext(this),
    getNativeWebViewRect(this),
  ]);

  // getElementRect's x/y are relative to the current frame's own document; convert
  // to layout-viewport-relative coordinates of the top-level page
  const layoutX = webRect.x - geometry.scrollX + geometry.frameOffsetX;
  const layoutY = webRect.y - geometry.scrollY + geometry.frameOffsetY;
  // then account for the page's visual viewport (pinch zoom / auto input zoom),
  // which the layout viewport and devicePixelRatio alone don't reflect
  const visualX = (layoutX - geometry.visualOffsetLeft) * geometry.visualScale;
  const visualY = (layoutY - geometry.visualOffsetTop) * geometry.visualScale;
  const scale = geometry.visualScale * geometry.pixelRatio;

  const translated = {
    x: Math.round(webViewRect.x + visualX * geometry.pixelRatio),
    y: Math.round(webViewRect.y + visualY * geometry.pixelRatio),
    width: Math.round(webRect.width * scale),
    height: Math.round(webRect.height * scale),
  };
  const clamped = clampRectToBounds(translated, webViewRect);
  if (clamped.width === 0 || clamped.height === 0) {
    throw new errors.ElementNotInteractableError(
      `The element is not visible: its translated rectangle does not overlap the WebView's on-screen bounds`,
    );
  }
  return clamped;
}

/**
 * Gets the window rectangle (W3C endpoint).
 * @returns The window rectangle (x, y, width, height).
 */
export async function getWindowRect(this: AndroidUiautomator2Driver): Promise<Rect> {
  const {width, height} = await this.getWindowSize();
  return {
    width,
    height,
    x: 0,
    y: 0,
  };
}

/**
 * Gets the display density.
 * @returns The display density value.
 */
export async function getDisplayDensity(this: AndroidUiautomator2Driver): Promise<number> {
  return (await this.uiautomator2.jwproxy.command('/appium/device/display_density', 'GET', {})) as number;
}

/**
 * Gets the window size.
 * @returns The window size (width, height).
 */
export async function getWindowSize(this: AndroidUiautomator2Driver): Promise<Size> {
  return (await this.uiautomator2.jwproxy.command('/window/current/size', 'GET', {})) as Size;
}

// broad match so custom/vendor WebView subclasses (hybrid frameworks, etc.) are still found
const NATIVE_WEBVIEW_CLASS_SELECTOR = "//*[contains(@class,'WebView')]";

interface CdpPageDescription {
  screenX?: number;
  screenY?: number;
  width?: number;
  height?: number;
  visible?: boolean;
  empty?: boolean;
}

/**
 * Finds the on-screen bounding rectangle of the currently active web view,
 * as self-reported by Chromium's own WebView embedding layer: each page
 * listed by the CDP `/json/list` endpoint carries a `description` field with
 * its `screenX`/`screenY`/`width`/`height` in native device screen
 * coordinates. This is authoritative and independent of whatever native
 * Android view class actually hosts the WebView, unlike scanning the view
 * hierarchy for a specific class name.
 *
 * @returns The rectangle, or `null` if this data isn't available (e.g. the
 * page didn't report a `description`, or the CDP lookup failed).
 */
async function getWebviewRectFromCdp(driver: AndroidUiautomator2Driver): Promise<Rect | null> {
  let mapping: WebviewsMapping[];
  try {
    mapping = await driver.mobileGetContexts();
  } catch {
    return null;
  }

  const pages = mapping.find((m) => m.webviewName === driver.curContext)?.pages;
  for (const page of pages ?? []) {
    const raw = (page as StringRecord).description;
    if (typeof raw !== 'string' || !raw) {
      continue;
    }
    let parsed: CdpPageDescription;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const {screenX: x, screenY: y, width, height, visible, empty} = parsed;
    if (visible === false || empty === true) {
      continue;
    }
    if (
      typeof x === 'number' &&
      typeof y === 'number' &&
      typeof width === 'number' &&
      typeof height === 'number' &&
      width > 0 &&
      height > 0
    ) {
      return {x, y, width, height};
    }
  }
  return null;
}

/**
 * Finds the on-screen bounding rectangle of the native Android WebView that
 * hosts web content, in native device screen coordinates, via an XPath scan
 * of the native view hierarchy for a class name containing "WebView".
 *
 * There is no reliable way to correlate a native view-hierarchy node with the
 * specific Chromium instance backing the currently active CDP target, so this
 * only succeeds when exactly one non-degenerate (visible, non-zero-area)
 * WebView node is found; it throws rather than guessing if more than one
 * candidate remains, since silently picking the wrong one (e.g. the largest)
 * would translate coordinates using an unrelated WebView's origin and bounds.
 * This call bypasses the active web view context, since it must query the
 * native view hierarchy rather than the DOM. Used only as a fallback when the
 * CDP-reported bounds (see `getWebviewRectFromCdp`) aren't available.
 */
async function getNativeWebViewRectFromViewHierarchy(driver: AndroidUiautomator2Driver): Promise<Rect> {
  const webViewElements = await driver.findElOrEls('xpath', NATIVE_WEBVIEW_CLASS_SELECTOR, true);
  if (!webViewElements.length) {
    throw new errors.NoSuchElementError('Could not find a native WebView element on screen');
  }

  // fetched independently per element: one going stale (e.g. the view hierarchy
  // changed between the find and this lookup) must not fail the others
  const settled = await Promise.allSettled(
    webViewElements.map((el) => {
      const elementId = util.unwrapElement(el);
      return driver.uiautomator2.jwproxy.command(`/element/${elementId}/rect`, 'GET') as Promise<Rect>;
    }),
  );
  const rects = settled
    .filter((result): result is PromiseFulfilledResult<Rect> => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((rect) => rect.width > 0 && rect.height > 0);
  if (!rects.length) {
    throw new errors.NoSuchElementError(
      'Could not determine the bounds of any visible native WebView element on screen',
    );
  }
  if (rects.length > 1) {
    throw new errors.UnknownError(
      'Found multiple visible native WebView elements on screen and could not determine which one hosts the ' +
        'current web view context, since its on-screen bounds were not available via CDP. Ensure only one ' +
        'WebView is visible on screen at a time, or check that the CDP devtools socket for this web view is reachable.',
    );
  }
  return rects[0];
}

/**
 * Finds the on-screen bounding rectangle of the currently active web view, in
 * native device screen coordinates. Prefers the bounds Chromium itself
 * reports over CDP; falls back to scanning the native view hierarchy only if
 * that data isn't available.
 */
async function getNativeWebViewRect(driver: AndroidUiautomator2Driver): Promise<Rect> {
  return (await getWebviewRectFromCdp(driver)) ?? (await getNativeWebViewRectFromViewHierarchy(driver));
}

interface WebviewGeometryContext {
  /** Ratio between native device pixels and CSS pixels, per `window.devicePixelRatio`. */
  pixelRatio: number;
  /** The current frame's own horizontal scroll offset, in its own document's CSS pixels. */
  scrollX: number;
  /** The current frame's own vertical scroll offset, in its own document's CSS pixels. */
  scrollY: number;
  /** Sum of each ancestor frame's on-screen horizontal offset within its own parent, up to the first cross-origin ancestor. */
  frameOffsetX: number;
  /** Sum of each ancestor frame's on-screen vertical offset within its own parent, up to the first cross-origin ancestor. */
  frameOffsetY: number;
  /** The page's visual viewport scale, i.e. the current pinch zoom / auto input zoom level. `1` if unzoomed or unsupported. */
  visualScale: number;
  /** The visual viewport's horizontal pan offset from the layout viewport, in CSS pixels. */
  visualOffsetLeft: number;
  /** The visual viewport's vertical pan offset from the layout viewport, in CSS pixels. */
  visualOffsetTop: number;
}

// Walks up window.parent to accumulate same-origin ancestor frame offsets (stopping at the
// first cross-origin one, which can't be measured from script), then reads devicePixelRatio,
// the current frame's own scroll, and the outermost reachable window's visual viewport state.
const GET_WEBVIEW_GEOMETRY_CONTEXT_SCRIPT = `
var win = window;
var frameOffsetX = 0;
var frameOffsetY = 0;
try {
  while (win !== win.parent) {
    var frameRect = win.frameElement.getBoundingClientRect();
    frameOffsetX += frameRect.left;
    frameOffsetY += frameRect.top;
    win = win.parent;
  }
} catch (e) {
  // cross-origin ancestor frame; its geometry can't be measured from here
}
var visualViewport = win.visualViewport;
return {
  pixelRatio: window.devicePixelRatio,
  scrollX: window.scrollX,
  scrollY: window.scrollY,
  frameOffsetX: frameOffsetX,
  frameOffsetY: frameOffsetY,
  visualScale: visualViewport ? visualViewport.scale : 1,
  visualOffsetLeft: visualViewport ? visualViewport.offsetLeft : 0,
  visualOffsetTop: visualViewport ? visualViewport.offsetTop : 0,
};
`;

/**
 * Reads the geometry needed to translate an element's `getElementRect` rectangle
 * (which is relative to its own, possibly nested, document, and unaffected by pinch
 * zoom) into a position within the top-level page's currently visible viewport.
 * Read directly from Chromium itself, rather than assumed from the OS-level display
 * density or a generic viewport rectangle, since none of this can be assumed to stay
 * fixed across zoom, scroll, or frame nesting.
 */
async function getWebviewGeometryContext(driver: AndroidUiautomator2Driver): Promise<WebviewGeometryContext> {
  const chromedriver = driver.chromedriver as Chromedriver;
  const endpoint = chromedriver.jwproxy.downstreamProtocol === PROTOCOLS.MJSONWP ? '/execute' : '/execute/sync';
  return (await chromedriver.jwproxy.command(endpoint, 'POST', {
    script: GET_WEBVIEW_GEOMETRY_CONTEXT_SCRIPT,
    args: [],
  })) as WebviewGeometryContext;
}
