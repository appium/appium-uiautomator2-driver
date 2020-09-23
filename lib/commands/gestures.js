import { util } from 'appium-support';

const commands = {};

/**
 * @typedef {Object} LongClickOptions
 * @property {?string} elementId - The id of the element to be clicked.
 * If the element is missing then both click coordinates must be provided.
 * If both the element id and coordinates are provided then the coordinates
 * are parsed as relative offsets from the top left corner of the element.
 * @property {?number} x - The X coordinate to click on
 * @property {?number} y - The Y coordinate to click on
 * @property {?number} duration - Click duration in milliseconds.
 * The default long click duration is used if not provided
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
    origin: util.wrapElement(elementId),
    x, y,
    duration,
  });
};

/**
 * @typedef {Object} DragOptions
 * @property {?string} elementId - The id of the element to be dragged.
 * If the element id is missing then both start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are considered as offsets from the top left element corner.
 * @property {?number} startX - The starting X coordinate where the dragging starts
 * @property {?number} startY - The starting Y coordinate where the dragging starts
 * @property {!number} endX - The ending X coordinate where the dragging ends
 * @property {!number} endY - The ending Y coordinate where the dragging ends
 * @property {?number} speed - The speed at which to perform this gesture in pixels per second.
 * The default speed is applied if not provided.
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
    origin: util.wrapElement(elementId),
    startX, startY,
    endX, endY,
    speed,
  });
};

/**
 * @typedef {Object} FlingOptions
 * @property {?string} elementId - The id of the element to be flinged.
 * If the element id is missing then both start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are effectively ignored.
 * @property {?number} startX - The starting X coordinate where fling starts
 * @property {?number} startY - The starting Y coordinate where fling starts
 * @property {?number} width - The width of the fling bounding area
 * @property {?number} height - The height of the fling bounding area
 * @property {!string} direction - Direction of the fling.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {?number} speed - The speed at which to perform this gesture in pixels per second.
 * The default speed is applied if not provided.
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
    startX, startY, width, height,
    direction,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/fling', 'POST', {
    origin: util.wrapElement(elementId),
    startX, startY, width, height,
    direction,
    speed,
  });
};

/**
 * @typedef {Object} PinchOptions
 * @property {?string} elementId - The id of the element to be pinched.
 * If the element id is missing then both start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are effectively ignored.
 * @property {?number} startX - The starting X coordinate where pinch starts
 * @property {?number} startY - The starting Y coordinate where pinch starts
 * @property {?number} width - The width of the pinch bounding area
 * @property {?number} height - The height of the pinch bounding area
 * @property {!number} percent - The size of the pinch as a percentage of the pinch area size.
 * Valid values must be float numbers in range 0..1
 * @property {?number} speed - The speed at which to perform this gesture in pixels per second.
 * The default speed is applied if not provided.
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
    startX, startY, width, height,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_close', 'POST', {
    origin: util.wrapElement(elementId),
    startX, startY, width, height,
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
    startX, startY, width, height,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_open', 'POST', {
    origin: util.wrapElement(elementId),
    startX, startY, width, height,
    percent,
    speed,
  });
};

/**
 * @typedef {Object} SwipeOptions
 * @property {?string} elementId - The id of the element to be swiped.
 * If the element id is missing then both start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are effectively ignored.
 * @property {?number} startX - The starting X coordinate where swipe starts
 * @property {?number} startY - The starting Y coordinate where swipe starts
 * @property {?number} width - The width of the swipe bounding area
 * @property {?number} height - The height of the swipe bounding area
 * @property {!string} direction - Direction of the swipe.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {!number} percent - The size of the swipe as a percentage of the swipe area size.
 * Valid values must be float numbers in range 0..1
 * @property {?number} speed - The speed at which to perform this gesture in pixels per second.
 * The default speed is applied if not provided.
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
    startX, startY, width, height,
    direction,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/swipe', 'POST', {
    origin: util.wrapElement(elementId),
    startX, startY, width, height,
    direction,
    percent,
    speed,
  });
};

/**
 * @typedef {Object} ScrollOptions
 * @property {?string} elementId - The id of the element to be scrolled.
 * If the element id is missing then both start coordinates must be provided.
 * If both the element id and the start coordinates are provided then these
 * coordinates are effectively ignored.
 * @property {?number} startX - The starting X coordinate where scrolling starts
 * @property {?number} startY - The starting Y coordinate where scrolling starts
 * @property {?number} width - The width of the scroll bounding area
 * @property {?number} height - The height of the scroll bounding area
 * @property {!string} direction - Direction of the scroll.
 * Acceptable values are: `up`, `down`, `left` and `right` (case insensitive)
 * @property {!number} percent - The size of the scroll as a percentage of the scrolling area size.
 * Valid values must be float numbers in range 0..1
 * @property {?number} speed - The speed at which to perform this gesture in pixels per second.
 * The default speed is applied if not provided.
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
    startX, startY, width, height,
    direction,
    percent,
    speed,
  } = opts;
  return await this.uiautomator2.jwproxy.command('/appium/gestures/scroll', 'POST', {
    origin: util.wrapElement(elementId),
    startX, startY, width, height,
    direction,
    percent,
    speed,
  });
};

export default commands;
