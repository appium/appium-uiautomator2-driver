import {errors} from 'appium/driver';
import {util} from 'appium/support';
import _ from 'lodash';
import type {Element as AppiumElement, Position} from '@appium/types';
import type {RelativeRect} from './types';
import type {AndroidUiautomator2Driver} from '../driver';

/**
 * Performs a simple click/tap gesture.
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

