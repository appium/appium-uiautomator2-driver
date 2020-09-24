import { util } from 'appium-support';
import _ from 'lodash';

const commands = {};


function toOrigin (elementId) {
  return elementId ? util.wrapElement(elementId) : undefined;
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

export default commands;
