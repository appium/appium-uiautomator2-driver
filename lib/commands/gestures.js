import { util } from 'appium-support';
import _ from 'lodash';
import { errors } from 'appium-base-driver';

const commands = {};


function toOrigin (element) {
  return element ? util.wrapElement(util.unwrapElement(element)) : undefined;
}

function toPoint (x, y) {
  return _.isFinite(x) && _.isFinite(y) ? {x, y} : undefined;
}

function toRect (left, top, width, height) {
  if ([left, top, width, height].some((v) => !_.isFinite(v))) {
    return undefined;
  }
  return {left, top, width, height};
}


/**
 * @typedef {Object} LongClickOptions
 * @property {?string} elementId - The id of the element to be clicked.
 * If the element is missing then both click offset coordinates must be provided.
 * If both the element id and offset are provided then the coordinates
 * are parsed as relative offsets from the top left corner of the element.
 * @property {?number} x - The x coordinate to click on
 * @property {?number} y - The y coordinate to click on
 * @property {?number} duration [500] - Click duration in milliseconds.
 * The value must not be negative
 */

/**
 * Performs a click that lasts for the given duration
 *
 * @param {?LongClickOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobileLongClickGesture = async function mobileLongClickGesture (opts = {}) {
  const {
    elementId,
    x, y,
    duration,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/long_click', 'POST', {
    origin: toOrigin(elementId),
    offset: toPoint(x, y),
    duration,
  });
};

/**
 * @typedef {Object} DoubleClickOptions
 * @property {?string} elementId - The id of the element to be double clicked.
 * If the element is missing then both click offset coordinates must be provided.
 * If both the element id and offset are provided then the coordinates
 * are parsed as relative offsets from the top left corner of the element.
 * @property {?number} x - The x coordinate to double click on
 * @property {?number} y - The y coordinate to double click on
 */

/**
 * Performs a click that lasts for the given duration
 *
 * @param {?DoubleClickOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobileDoubleClickGesture = async function mobileDoubleClickGesture (opts = {}) {
  const {
    elementId,
    x, y,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/double_click', 'POST', {
    origin: toOrigin(elementId),
    offset: toPoint(x, y),
  });
};

/**
 * @typedef {Object} DragOptions
 * @property {?string} elementId - The id of the element to be dragged.
 * If the element id is missing then the start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are considered as offsets from the top left element corner.
 * @property {?number} startX - The x coordinate where the dragging starts
 * @property {?number} startY - The y coordinate where the dragging starts
 * @property {!number} endX - The x coordinate where the dragging ends
 * @property {!number} endY - The y coordinate where the dragging ends
 * @property {?number} speed [2500 * displayDensity] - The speed at which to perform
 * this gesture in pixels per second. The value must not be negative
 */

/**
 * Drags this object to the specified location.
 *
 * @param {?DragOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobileDragGesture = async function mobileDragGesture (opts = {}) {
  const {
    elementId,
    startX, startY,
    endX, endY,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/drag', 'POST', {
    origin: toOrigin(elementId),
    start: toPoint(startX, startY),
    end: toPoint(endX, endY),
    speed,
  });
};

/**
 * @typedef {Object} FlingOptions
 * @property {?string} elementId - The id of the element to be flinged.
 * If the element id is missing then fling bounding area must be provided.
 * If both the element id and the fling bounding area are provided then this
 * area is effectively ignored.
 * @property {?number} left - The left coordinate of the fling bounding area
 * @property {?number} top - The top coordinate of the fling bounding area
 * @property {?number} width - The width of the fling bounding area
 * @property {?number} height - The height of the fling bounding area
 * @property {!string} direction - Direction of the fling.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {?number} speed [7500 * displayDensity] - The speed at which to perform this
 * gesture in pixels per second. The value must be greater than the minimum fling
 * velocity for the given view (50 by default)
 */

/**
 * Drags to the specified location.
 *
 * @param {?FlingOptions} opts
 * @throws {Error} if provided options are not valid
 * @returns {boolean} True if the object can still scroll in the given direction.
 */
commands.mobileFlingGesture = async function mobileFlingGesture (opts = {}) {
  const {
    elementId,
    left, top, width, height,
    direction,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/fling', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    speed,
  });
};

/**
 * @typedef {Object} PinchOptions
 * @property {?string} elementId - The id of the element to be pinched.
 * If the element id is missing then pinch bounding area must be provided.
 * If both the element id and the pinch bounding area are provided then the
 * area is effectively ignored.
 * @property {?number} left - The left coordinate of the pinch bounding area
 * @property {?number} top - The top coordinate of the pinch bounding area
 * @property {?number} width - The width of the pinch bounding area
 * @property {?number} height - The height of the pinch bounding area
 * @property {!number} percent - The size of the pinch as a percentage of the pinch area size.
 * Valid values must be float numbers in range 0..1, where 1.0 is 100%
 * @property {?number} speed [2500 * displayDensity] - The speed at which to perform
 * this gesture in pixels per second. The value must not be negative
 */

/**
 * Performs a pinch close gesture.
 *
 * @param {?PinchOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobilePinchCloseGesture = async function mobilePinchCloseGesture (opts = {}) {
  const {
    elementId,
    left, top, width, height,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_close', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    percent,
    speed,
  });
};

/**
 * Performs a pinch open gesture.
 *
 * @param {?PinchOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobilePinchOpenGesture = async function mobilePinchOpenGesture (opts = {}) {
  const {
    elementId,
    left, top, width, height,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_open', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    percent,
    speed,
  });
};

/**
 * @typedef {Object} SwipeOptions
 * @property {?string} elementId - The id of the element to be swiped.
 * If the element id is missing then swipe bounding area must be provided.
 * If both the element id and the swipe bounding area are provided then the
 * area is effectively ignored.
 * @property {?number} left - The left coordinate of the swipe bounding area
 * @property {?number} top - The top coordinate of the swipe bounding area
 * @property {?number} width - The width of the swipe bounding area
 * @property {?number} height - The height of the swipe bounding area
 * @property {!string} direction - Direction of the swipe.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {!number} percent - The size of the swipe as a percentage of the swipe area size.
 * Valid values must be float numbers in range 0..1, where 1.0 is 100%
 * @property {?number} speed [5000 * displayDensity] - The speed at which to perform this
 * gesture in pixels per second. The value must not be negative
 */

/**
 * Performs a swipe gesture.
 *
 * @param {?SwipeOptions} opts
 * @throws {Error} if provided options are not valid
 */
commands.mobileSwipeGesture = async function mobileSwipeGesture (opts = {}) {
  const {
    elementId,
    left, top, width, height,
    direction,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/swipe', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    percent,
    speed,
  });
};

/**
 * @typedef {Object} ScrollOptions
 * @property {?string} elementId - The id of the element to be scrolled.
 * If the element id is missing then scroll bounding area must be provided.
 * If both the element id and the scroll bounding area are provided then this
 * area is effectively ignored.
 * @property {?number} left - The left coordinate of the scroll bounding area
 * @property {?number} top - The top coordinate of the scroll bounding area
 * @property {?number} width - The width of the scroll bounding area
 * @property {?number} height - The height of the scroll bounding area
 * @property {!string} direction - Direction of the scroll.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {!number} percent - The size of the scroll as a percentage of the scrolling area size.
 * Valid values must be float numbers greater than zero, where 1.0 is 100%
 * @property {?number} speed [5000 * displayDensity] - The speed at which to perform this gesture
 * in pixels per second. The value must not be negative
 */

/**
 * Performs a scroll gesture.
 *
 * @param {?ScrollOptions} opts
 * @throws {Error} if provided options are not valid
 * @returns {boolean} True if the object can still scroll in the given direction.
 */
commands.mobileScrollGesture = async function mobileScrollGesture (opts = {}) {
  const {
    elementId,
    left, top, width, height,
    direction,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/scroll', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    percent,
    speed,
  });
};

/**
 * @typedef {Object} ScrollElementToElementOpts
 * @property {string} elementId The identifier of the scrollable element,
 * which is going to be scrolled. It is required this element
 * is a valid scrollable container and it was located by `-android uiautomator`
 * strategy.
 * @property {string} elementToId The identifier of the item, which belongs
 * to the scrollable element above, and which should become visible after
 * the scrolling operation is finished. It is required this element
 * was located by `-android uiautomator` strategy.
 */

/**
 * Scrolls the given scrollable element `elementId` until `elementToId`
 * becomes visible. This function returns immediately if the `elementToId`
 * is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 *
 * @param {ScrollElementToElementOpts} opts
 * @throws {Error} if the scrolling operation cannot be performed
 */
commands.mobileScrollBackTo = async function (opts = {}) {
  const {elementId, elementToId} = opts;
  if (!elementId || !elementToId) {
    throw new errors.InvalidArgumentError(`Both elementId and elementToId arguments must be provided`);
  }
  return await this.uiautomator2.jwproxy.command(
    `/appium/element/${util.unwrapElement(elementId)}/scroll_to/${util.unwrapElement(elementToId)}`, 'POST', {});
};

/**
 * @typedef {Object} ScrollOpts
 * @property {?string} element The identifier of an element. It is required this element
 * is a valid scrollable container and it was located by `-android uiautomator`
 * strategy. If this property is not provided then the first currently available scrollable view
 * is selected for the interaction.
 * @property {!string} strategy The following strategies are supported:
 * - `accessibility id` (UiSelector().description)
 * - `class name` (UiSelector().className)
 * - `-android uiautomator` (UiSelector)
 * @property {!string} selector The corresponding lookup value for the given
 * strategy.
 * @property {?number} maxSwipes The maximum number of swipes to perform
 * on the target scrollable view in order to reach the destination element.
 * In case this value is unset then it would be retrieved from the scrollable
 * element itself (vua `getMaxSearchSwipes()` property).
 */

/**
 * Scrolls the given scrollable element until the element identified
 * by `strategy` and `selector` becomes visible. This function returns immediately if the
 * destination element is already visible in the view port. Otherwise it would scroll
 * to the very beginning of the scrollable control and tries to reach the destination element
 * by scrolling its parent to the end step by step. The scroll direction (vertical or horizontal)
 * is detected automatically.
 *
 * @param {ScrollOpts} opts
 * @throws {Error} if the scrolling operation cannot be performed
 */
commands.mobileScroll = async function (opts = {}) {
  const {element, strategy, selector, maxSwipes} = opts;
  if (!strategy || !selector) {
    throw new errors.InvalidArgumentError(`Both strategy and selector arguments must be provided`);
  }
  return await this.uiautomator2.jwproxy.command('/touch/scroll', 'POST', {
    params: {
      origin: toOrigin(element),
      strategy, selector, maxSwipes
    },
  });
};

export default commands;
