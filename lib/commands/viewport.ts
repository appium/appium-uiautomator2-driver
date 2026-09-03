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
 * translated into native device screen coordinates.
 *
 * Chromedriver reports element geometry in CSS pixels relative to the web
 * view's own viewport. This combines that rectangle with the web view's own
 * device pixel ratio and the on-screen bounding rectangle of the native
 * WebView that hosts it (which may be offset by e.g. a toolbar or action bar)
 * to compute where the element actually is on the device screen, e.g. in
 * order to interact with it via native gestures or to compare it against a
 * device screenshot. The result is clamped to the WebView's own on-screen
 * bounds, so it never reports coordinates outside of the screen (e.g. for an
 * element that's scrolled out of view or that overflows the viewport).
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

  const [webRect, pixelRatio, webViewRect] = await Promise.all([
    this.getElementRect(elementId),
    getWebviewDevicePixelRatio(this),
    getNativeWebViewRect(this),
  ]);

  const translated = {
    x: Math.round(webViewRect.x + webRect.x * pixelRatio),
    y: Math.round(webViewRect.y + webRect.y * pixelRatio),
    width: Math.round(webRect.width * pixelRatio),
    height: Math.round(webRect.height * pixelRatio),
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
    const {screenX: x, screenY: y, width, height, visible} = parsed;
    if (visible === false) {
      continue;
    }
    if ([x, y, width, height].every((v) => typeof v === 'number')) {
      return {x, y, width, height} as Rect;
    }
  }
  return null;
}

/**
 * Finds the on-screen bounding rectangle of the native Android WebView that
 * hosts web content, in native device screen coordinates, via an XPath scan
 * of the native view hierarchy for a class name containing "WebView".
 *
 * Apps may keep more than one (possibly hidden or zero-sized) WebView node in
 * their view hierarchy, so the largest one by area is assumed to be the one
 * that is actually visible and hosting the active web view context. This call
 * bypasses the active web view context, since it must query the native view
 * hierarchy rather than the DOM. Used only as a fallback when the CDP-reported
 * bounds (see `getWebviewRectFromCdp`) aren't available.
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
    .map((result) => result.value);
  if (!rects.length) {
    throw new errors.NoSuchElementError('Could not determine the bounds of any native WebView element on screen');
  }
  return rects.reduce((largest, rect) => (rect.width * rect.height > largest.width * largest.height ? rect : largest));
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

/**
 * Reads `window.devicePixelRatio` from the current web view context, i.e. the
 * ratio between native device pixels and the CSS pixels Chromium itself is
 * using to render the page. Asking Chromium directly (rather than the OS-level
 * display density) avoids any assumption that the two necessarily agree.
 */
async function getWebviewDevicePixelRatio(driver: AndroidUiautomator2Driver): Promise<number> {
  const chromedriver = driver.chromedriver as Chromedriver;
  const endpoint = chromedriver.jwproxy.downstreamProtocol === PROTOCOLS.MJSONWP ? '/execute' : '/execute/sync';
  return (await chromedriver.jwproxy.command(endpoint, 'POST', {
    script: 'return window.devicePixelRatio;',
    args: [],
  })) as number;
}
