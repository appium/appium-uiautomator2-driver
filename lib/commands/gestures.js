import {util} from 'appium/support';
import _ from 'lodash';
import {errors} from 'appium/driver';

/**
 * Performs a simple click/tap gesture
 *
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ClickOptions} [opts={}]
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileClickGesture(opts = {}) {
  const {elementId, x, y} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/click',
    'POST',
    {
      origin: toOrigin(elementId),
      offset: toPoint(x, y),
    }
  );
}

/**
 * Performs a click that lasts for the given duration
 *
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').LongClickOptions} [opts={}]
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileLongClickGesture(opts = {}) {
  const {elementId, x, y, duration} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/long_click',
    'POST',
    {
      origin: toOrigin(elementId),
      offset: toPoint(x, y),
      duration,
    }
  );
}

/**
 * Performs a click that lasts for the given duration
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').DoubleClickOptions} [opts={}]
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileDoubleClickGesture(opts = {}) {
  const {elementId, x, y} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/double_click',
    'POST',
    {
      origin: toOrigin(elementId),
      offset: toPoint(x, y),
    }
  );
}

/**
 * Drags this object to the specified location.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').DragOptions} opts
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileDragGesture(opts) {
  const {elementId, startX, startY, endX, endY, speed} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/drag',
    'POST',
    {
      origin: toOrigin(elementId),
      start: toPoint(startX, startY),
      end: toPoint(endX, endY),
      speed,
    }
  );
}

/**
 * Drags to the specified location.
 *
 * @throws {Error} if provided options are not valid
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').FlingOptions} opts
 * @returns {Promise<boolean>} True if the object can still scroll in the given direction.
 */
export async function mobileFlingGesture(opts) {
  const {elementId, left, top, width, height, direction, speed} = opts;
  return /** @type {boolean} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/gestures/fling',
      'POST',
      {
        origin: toOrigin(elementId),
        area: toRect(left, top, width, height),
        direction,
        speed,
      }
    )
  );
}

/**
 * Performs a pinch close gesture.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').PinchOptions} opts
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobilePinchCloseGesture(opts) {
  const {elementId, left, top, width, height, percent, speed} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/pinch_close',
    'POST',
    {
      origin: toOrigin(elementId),
      area: toRect(left, top, width, height),
      percent,
      speed,
    }
  );
}

/**
 * Performs a pinch open gesture.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').PinchOptions} opts
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobilePinchOpenGesture(opts) {
  const {elementId, left, top, width, height, percent, speed} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/pinch_open',
    'POST',
    {
      origin: toOrigin(elementId),
      area: toRect(left, top, width, height),
      percent,
      speed,
    }
  );
}

/**
 * Performs a swipe gesture.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').SwipeOptions} opts
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileSwipeGesture(opts) {
  const {elementId, left, top, width, height, direction, percent, speed} = opts;
  await this.uiautomator2.jwproxy.command(
    '/appium/gestures/swipe',
    'POST',
    {
      origin: toOrigin(elementId),
      area: toRect(left, top, width, height),
      direction,
      percent,
      speed,
    }
  );
}

/**
 * Performs a scroll gesture.
 *
 * @throws {Error} if provided options are not valid
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ScrollGestureOptions} opts
 * @returns {Promise<boolean>} True if the object can still scroll in the given direction.
 */
export async function mobileScrollGesture(opts) {
  const {elementId, left, top, width, height, direction, percent, speed} = opts;
  return /** @type {boolean} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/gestures/scroll',
      'POST',
      {
        origin: toOrigin(elementId),
        area: toRect(left, top, width, height),
        direction,
        percent,
        speed,
      }
    )
  );
}

/**
 * Scrolls the given scrollable element `elementId` until `elementToId`
 * becomes visible. This function returns immediately if the `elementToId`
 * is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ScrollElementToElementOpts} opts
 * @returns {Promise<void>}
 * @throws {Error} if the scrolling operation cannot be performed
 */
export async function mobileScrollBackTo(opts) {
  const {elementId, elementToId} = opts;
  if (!elementId || !elementToId) {
    throw new errors.InvalidArgumentError(
      `Both elementId and elementToId arguments must be provided`
    );
  }
  await this.uiautomator2.jwproxy.command(
    `/appium/element/${util.unwrapElement(elementId)}/scroll_to/${util.unwrapElement(
      elementToId
    )}`,
    'POST',
    {}
  );
}

/**
 * Scrolls the given scrollable element until the element identified
 * by `strategy` and `selector` becomes visible. This function returns immediately if the
 * destination element is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ScrollOptions} opts
 * @returns {Promise<void>}
 * @throws {Error} if the scrolling operation cannot be performed
 */
export async function mobileScroll(opts) {
  const {
    elementId,
    strategy,
    selector,
    maxSwipes,
  } = opts;
  if (!strategy || !selector) {
    throw new errors.InvalidArgumentError(
      `Both strategy and selector arguments must be provided`
    );
  }
  await this.uiautomator2.jwproxy.command(
    '/gestures/scroll_to',
    'POST',
    {
      origin: toOrigin(elementId),
      params: {strategy, selector, maxSwipes},
    }
  );
}

// #region Internal Helpers

/**
 *
 * @param {import('@appium/types').Element|string} [element]
 * @returns {import('@appium/types').Element|undefined}
 */
function toOrigin(element) {
  return element ? util.wrapElement(util.unwrapElement(element)) : undefined;
}

/**
 *
 * @param {number} [x]
 * @param {number} [y]
 * @returns {Partial<import('@appium/types').Position>|undefined}
 */
function toPoint(x, y) {
  return _.isFinite(x) && _.isFinite(y) ? {x, y} : undefined;
}

/**
 *
 * @param {number} [left]
 * @param {number} [top]
 * @param {number} [width]
 * @param {number} [height]
 * @returns {Partial<import('./types').RelativeRect>|undefined}
 */
function toRect(left, top, width, height) {
  return [left, top, width, height].some((v) => !_.isFinite(v))
    ? undefined
    : {left, top, width, height};
}

// #endregion

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
