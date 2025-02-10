import {util} from 'appium/support';
import _ from 'lodash';
import {errors} from 'appium/driver';

/**
 * Performs a simple click/tap gesture
 *
 * @this {AndroidUiautomator2Driver}
 * @param {string} [elementId] The id of the element to be clicked.
 * If the element is missing then both click offset coordinates must be provided.
 * If both the element id and offset are provided then the coordinates are parsed
 * as relative offsets from the top left corner of the element.
 * @param {number} [x] The x coordinate to click on.
 * @param {number} [y] The y coordinate to click on.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileClickGesture(elementId, x, y) {
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
 * @param {string} [elementId] The id of the element to be clicked.
 * If the element is missing then both click offset coordinates must be provided.
 * If both the element id and offset are provided then the coordinates are parsed
 * as relative offsets from the top left corner of the element.
 * @param {number} [x] The x coordinate to click on.
 * @param {number} [y] The y coordinate to click on.
 * @param {number} [duration] Click duration in milliseconds. The value must not be negative.
 * Default is 500.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileLongClickGesture(elementId, x, y, duration) {
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
 * @param {string} [elementId] The id of the element to be clicked.
 * If the element is missing then both click offset coordinates must be provided.
 * If both the element id and offset are provided then the coordinates are parsed
 * as relative offsets from the top left corner of the element.
 * @param {number} [x] The x coordinate to click on.
 * @param {number} [y] The y coordinate to click on.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileDoubleClickGesture(elementId, x, y) {
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
 * @param {string} [elementId] The id of the element to be dragged.
 * If the element id is missing then the start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are considered as offsets from the top left element corner.
 * @param {number} [startX] The x coordinate where the dragging starts
 * @param {number} [startY] The y coordinate where the dragging starts
 * @param {number} [endX] The x coordinate where the dragging ends
 * @param {number} [endY] The y coordinate where the dragging ends
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must not be negative.
 * Default is 2500 * displayDensity.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileDragGesture(
  elementId,
  startX,
  startY,
  endX,
  endY,
  speed,
) {
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
 * @param {string} direction Direction of the fling.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
 * @param {string} [elementId] The id of the element to be flinged.
 * If the element id is missing then fling bounding area must be provided.
 * If both the element id and the fling bounding area are provided then this
 * area is effectively ignored.
 * @param {number} [left] The left coordinate of the fling bounding area.
 * @param {number} [top] The top coordinate of the fling bounding area.
 * @param {number} [width] The width of the fling bounding area.
 * @param {number} [height] The height of the fling bounding area.
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must be greater than the minimum fling velocity for the given view (50 by default).
 * Default is 7500 * displayDensity.
 * @returns {Promise<boolean>} True if the object can still scroll in the given direction.
 */
export async function mobileFlingGesture(
  direction,
  elementId,
  left,
  top,
  width,
  height,
  speed,
) {
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
 * @param {number} percent The size of the pinch as a percentage of the pinch area size.
 * Valid values must be float numbers in range 0..1, where 1.0 is 100%
 * @param {string} [elementId] The id of the element to be pinched.
 * If the element id is missing then pinch bounding area must be provided.
 * If both the element id and the pinch bounding area are provided then the
 * area is effectively ignored.
 * @param {number} [left] The left coordinate of the pinch bounding area.
 * @param {number} [top] The top coordinate of the pinch bounding area.
 * @param {number} [width] The width of the pinch bounding area.
 * @param {number} [height] The height of the pinch bounding area.
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must not be negative.
 * Default is 2500 * displayDensity.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobilePinchCloseGesture(
  percent,
  elementId,
  left,
  top,
  width,
  height,
  speed,
) {
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
 * @param {number} percent The size of the pinch as a percentage of the pinch area size.
 * Valid values must be float numbers in range 0..1, where 1.0 is 100%
 * @param {string} [elementId] The id of the element to be pinched.
 * If the element id is missing then pinch bounding area must be provided.
 * If both the element id and the pinch bounding area are provided then the
 * area is effectively ignored.
 * @param {number} [left] The left coordinate of the pinch bounding area.
 * @param {number} [top] The top coordinate of the pinch bounding area.
 * @param {number} [width] The width of the pinch bounding area.
 * @param {number} [height] The height of the pinch bounding area.
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must not be negative.
 * Default is 2500 * displayDensity.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobilePinchOpenGesture(
  percent,
  elementId,
  left,
  top,
  width,
  height,
  speed,
) {
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
 * @param {string} direction Direction of the swipe.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
 * @param {number} percent The size of the swipe as a percentage of the swipe area size.
 * Valid values must be float numbers in range 0..1, where 1.0 is 100%.
 * @param {string} [elementId] The id of the element to be swiped.
 * If the element id is missing then swipe bounding area must be provided.
 * If both the element id and the swipe bounding area are provided then the
 * area is effectively ignored.
 * @param {number} [left] The left coordinate of the swipe bounding area.
 * @param {number} [top] The top coordinate of the swipe bounding area.
 * @param {number} [width] The width of the swipe bounding area.
 * @param {number} [height] The height of the swipe bounding area.
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must not be negative.
 * Default is 5000 * displayDensity.
 * @returns {Promise<void>}
 * @throws {Error} if provided options are not valid
 */
export async function mobileSwipeGesture(
  direction,
  percent,
  elementId,
  left,
  top,
  width,
  height,
  speed,
) {
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
 * @param {string} direction Direction of the scroll.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive).
 * @param {number} percent The size of the scroll as a percentage of the scrolling area size.
 * Valid values must be float numbers greater than zero, where 1.0 is 100%.
 * @param {string} [elementId] The id of the element to be scrolled.
 * If the element id is missing then scroll bounding area must be provided.
 * If both the element id and the scroll bounding area are provided then this
 * area is effectively ignored.
 * @param {number} [left] The left coordinate of the scroll bounding area.
 * @param {number} [top] The top coordinate of the scroll bounding area.
 * @param {number} [width] The width of the scroll bounding area.
 * @param {number} [height] The height of the scroll bounding area.
 * @param {number} [speed] The speed at which to perform this gesture in pixels per second.
 * The value must not be negative.
 * Default is 5000 * displayDensity.
 * @returns {Promise<boolean>} True if the object can still scroll in the given direction.
 */
export async function mobileScrollGesture(
  direction,
  percent,
  elementId,
  left,
  top,
  width,
  height,
  speed,
) {
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
 * @param {string} elementId The identifier of the scrollable element, which is going to be scrolled.
 * It is required this element is a valid scrollable container and it was located
 * by `-android uiautomator` strategy.
 * @param {string} elementToId The identifier of the item, which belongs to the scrollable element above,
 * and which should become visible after the scrolling operation is finished.
 * It is required this element was located by `-android uiautomator` strategy.
 * @returns {Promise<void>}
 * @throws {Error} if the scrolling operation cannot be performed
 */
export async function mobileScrollBackTo(elementId, elementToId) {
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
 *
 * @this {AndroidUiautomator2Driver}
 * @param {string} strategy The following strategies are supported:
 * - `accessibility id` (UiSelector().description)
 * - `class name` (UiSelector().className)
 * - `-android uiautomator` (UiSelector)
 * @param {string} selector The corresponding lookup value for the given strategy.
 * @param {string} [elementId] The identifier of an element. It is required this element is a valid scrollable container
 * and it was located by `-android uiautomator` strategy.
 * If this property is not provided then the first currently available scrollable view
 * is selected for the interaction.
 * @param {number} [maxSwipes] The maximum number of swipes to perform on the target scrollable view in order to reach
 * the destination element. In case this value is unset then it would be retrieved from the
 * scrollable element itself (via `getMaxSearchSwipes()` property).
 * @returns {Promise<void>}
 * @throws {Error} if the scrolling operation cannot be performed
 */
export async function mobileScroll(
  strategy,
  selector,
  elementId,
  maxSwipes,
) {
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
