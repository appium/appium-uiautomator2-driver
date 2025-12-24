import {errors} from 'appium/driver';
import {util} from 'appium/support';
import _ from 'lodash';
import type {Element as AppiumElement, Position} from '@appium/types';
import type {RelativeRect} from './types';
import type {AndroidUiautomator2Driver} from '../driver';

/**
 * Performs a simple click/tap gesture.
 * @param elementId - Optional element to use as the origin for the click. If not provided, uses screen coordinates.
 * @param x - Optional X offset from the element origin or screen.
 * @param y - Optional Y offset from the element origin or screen.
 */
export async function mobileClickGesture(
  this: AndroidUiautomator2Driver,
  elementId?: AppiumElement | string,
  x?: number,
  y?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/click', 'POST', {
    origin: toOrigin(elementId),
    offset: toPoint(x, y),
  });
}

/**
 * Performs a long click with an optional duration.
 * @param elementId - Optional element to use as the origin for the long click.
 * @param x - Optional X offset from the element origin or screen.
 * @param y - Optional Y offset from the element origin or screen.
 * @param duration - Optional duration of the long press in milliseconds.
 */
export async function mobileLongClickGesture(
  this: AndroidUiautomator2Driver,
  elementId?: AppiumElement | string,
  x?: number,
  y?: number,
  duration?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/long_click', 'POST', {
    origin: toOrigin(elementId),
    offset: toPoint(x, y),
    duration,
  });
}

/**
 * Performs a double-click gesture.
 * @param elementId - Optional element to use as the origin for the double click.
 * @param x - Optional X offset from the element origin or screen.
 * @param y - Optional Y offset from the element origin or screen.
 */
export async function mobileDoubleClickGesture(
  this: AndroidUiautomator2Driver,
  elementId?: AppiumElement | string,
  x?: number,
  y?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/double_click', 'POST', {
    origin: toOrigin(elementId),
    offset: toPoint(x, y),
  });
}

/**
 * Drags from a start point to an end point.
 * @param elementId - Optional element to use as the origin for the drag.
 * @param startX - X coordinate of the drag start point.
 * @param startY - Y coordinate of the drag start point.
 * @param endX - X coordinate of the drag end point.
 * @param endY - Y coordinate of the drag end point.
 * @param speed - Optional speed of the drag gesture.
 */
export async function mobileDragGesture(
  this: AndroidUiautomator2Driver,
  elementId?: AppiumElement | string,
  startX?: number,
  startY?: number,
  endX?: number,
  endY?: number,
  speed?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/drag', 'POST', {
    origin: toOrigin(elementId),
    start: toPoint(startX, startY),
    end: toPoint(endX, endY),
    speed,
  });
}

/**
 * Performs a fling gesture and reports if further scrolling is possible.
 * @param direction - Direction of the fling ('up', 'down', 'left', 'right').
 * @param elementId - Optional element to use as the origin for the fling.
 * @param left - Optional left coordinate of the fling area.
 * @param top - Optional top coordinate of the fling area.
 * @param width - Optional width of the fling area.
 * @param height - Optional height of the fling area.
 * @param speed - Optional speed of the fling gesture.
 * @returns True if further scrolling is possible, false otherwise.
 */
export async function mobileFlingGesture(
  this: AndroidUiautomator2Driver,
  direction: string,
  elementId?: AppiumElement | string,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  speed?: number,
): Promise<boolean> {
  return (await this.uiautomator2.jwproxy.command('/appium/gestures/fling', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    speed,
  })) as boolean;
}

/**
 * Performs a pinch-close gesture.
 * @param percent - Percentage of the pinch (0-100).
 * @param elementId - Optional element to use as the origin for the pinch.
 * @param left - Optional left coordinate of the pinch area.
 * @param top - Optional top coordinate of the pinch area.
 * @param width - Optional width of the pinch area.
 * @param height - Optional height of the pinch area.
 * @param speed - Optional speed of the pinch gesture.
 */
export async function mobilePinchCloseGesture(
  this: AndroidUiautomator2Driver,
  percent: number,
  elementId?: AppiumElement | string,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  speed?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_close', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    percent,
    speed,
  });
}

/**
 * Performs a pinch-open gesture.
 * @param percent - Percentage of the pinch (0-100).
 * @param elementId - Optional element to use as the origin for the pinch.
 * @param left - Optional left coordinate of the pinch area.
 * @param top - Optional top coordinate of the pinch area.
 * @param width - Optional width of the pinch area.
 * @param height - Optional height of the pinch area.
 * @param speed - Optional speed of the pinch gesture.
 */
export async function mobilePinchOpenGesture(
  this: AndroidUiautomator2Driver,
  percent: number,
  elementId?: AppiumElement | string,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  speed?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/pinch_open', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    percent,
    speed,
  });
}

/**
 * Performs a swipe gesture for the given direction and percent.
 * @param direction - Direction of the swipe ('up', 'down', 'left', 'right').
 * @param percent - Percentage of the swipe distance (0-100).
 * @param elementId - Optional element to use as the origin for the swipe.
 * @param left - Optional left coordinate of the swipe area.
 * @param top - Optional top coordinate of the swipe area.
 * @param width - Optional width of the swipe area.
 * @param height - Optional height of the swipe area.
 * @param speed - Optional speed of the swipe gesture.
 */
export async function mobileSwipeGesture(
  this: AndroidUiautomator2Driver,
  direction: string,
  percent: number,
  elementId?: AppiumElement | string,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  speed?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/gestures/swipe', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    percent,
    speed,
  });
}

/**
 * Performs a scroll gesture and reports if further scrolling is possible.
 * @param direction - Direction of the scroll ('up', 'down', 'left', 'right').
 * @param percent - Percentage of the scroll distance (0-100).
 * @param elementId - Optional element to use as the origin for the scroll.
 * @param left - Optional left coordinate of the scroll area.
 * @param top - Optional top coordinate of the scroll area.
 * @param width - Optional width of the scroll area.
 * @param height - Optional height of the scroll area.
 * @param speed - Optional speed of the scroll gesture.
 * @returns True if further scrolling is possible, false otherwise.
 */
export async function mobileScrollGesture(
  this: AndroidUiautomator2Driver,
  direction: string,
  percent: number,
  elementId?: AppiumElement | string,
  left?: number,
  top?: number,
  width?: number,
  height?: number,
  speed?: number,
): Promise<boolean> {
  return (await this.uiautomator2.jwproxy.command('/appium/gestures/scroll', 'POST', {
    origin: toOrigin(elementId),
    area: toRect(left, top, width, height),
    direction,
    percent,
    speed,
  })) as boolean;
}

/**
 * Scrolls a scrollable element until a target element becomes visible.
 * @param elementId - ID of the scrollable element.
 * @param elementToId - ID of the target element to scroll to.
 * @throws {errors.InvalidArgumentError} If either elementId or elementToId is not provided.
 */
export async function mobileScrollBackTo(
  this: AndroidUiautomator2Driver,
  elementId?: string,
  elementToId?: string,
): Promise<void> {
  if (!elementId || !elementToId) {
    throw new errors.InvalidArgumentError(`Both elementId and elementToId arguments must be provided`);
  }
  await this.uiautomator2.jwproxy.command(
    `/appium/element/${util.unwrapElement(elementId)}/scroll_to/${util.unwrapElement(elementToId)}`,
    'POST',
    {},
  );
}

/**
 * Scrolls until an element located by the given strategy is visible.
 * @param strategy - Locator strategy to use (e.g., 'id', 'xpath', 'class name').
 * @param selector - Selector string for the element to find.
 * @param elementId - Optional element to use as the origin for scrolling.
 * @param maxSwipes - Optional maximum number of swipes to perform.
 * @throws {errors.InvalidArgumentError} If either strategy or selector is not provided.
 */
export async function mobileScroll(
  this: AndroidUiautomator2Driver,
  strategy: string,
  selector: string,
  elementId?: AppiumElement | string,
  maxSwipes?: number,
): Promise<void> {
  if (!strategy || !selector) {
    throw new errors.InvalidArgumentError(`Both strategy and selector arguments must be provided`);
  }
  await this.uiautomator2.jwproxy.command('/gestures/scroll_to', 'POST', {
    origin: toOrigin(elementId),
    params: {strategy, selector, maxSwipes},
  });
}

function toOrigin(element?: AppiumElement | string): AppiumElement | undefined {
  return element ? (util.wrapElement(util.unwrapElement(element)) as AppiumElement) : undefined;
}

function toPoint(x?: number, y?: number): Partial<Position> | undefined {
  return _.isFinite(x) && _.isFinite(y) ? {x, y} : undefined;
}

function toRect(left?: number, top?: number, width?: number, height?: number): RelativeRect | undefined {
  return [left, top, width, height].some((v) => !_.isFinite(v))
    ? undefined
    : ({left, top, width, height} as RelativeRect);
}

