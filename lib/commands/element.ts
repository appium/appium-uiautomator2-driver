import {PROTOCOLS} from 'appium/driver';
import B from 'bluebird';
import _ from 'lodash';
import type {DoSetElementValueOpts} from 'appium-android-driver';
import type {Element as AppiumElement, Position, Rect, Size} from '@appium/types';
import type {AndroidUiautomator2Driver} from '../driver';
import type {Chromedriver} from 'appium-chromedriver';

/**
 * Gets the currently active element.
 * @returns The currently active element.
 */
export async function active(this: AndroidUiautomator2Driver): Promise<AppiumElement> {
  return (await this.uiautomator2.jwproxy.command('/element/active', 'GET')) as AppiumElement;
}

/**
 * Gets an element attribute value.
 * @param attribute - Name of the attribute to retrieve.
 * @param elementId - ID of the element.
 * @returns The attribute value as a string.
 */
export async function getAttribute(this: AndroidUiautomator2Driver, attribute: string, elementId: string): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command(`/element/${elementId}/attribute/${attribute}`, 'GET', {}));
}

/**
 * Returns whether the element is displayed.
 * @param elementId - ID of the element.
 * @returns True if the element is displayed, false otherwise.
 */
export async function elementDisplayed(this: AndroidUiautomator2Driver, elementId: string): Promise<boolean> {
  return toBool(await this.getAttribute('displayed', elementId));
}

/**
 * Returns whether the element is enabled.
 * @param elementId - ID of the element.
 * @returns True if the element is enabled, false otherwise.
 */
export async function elementEnabled(this: AndroidUiautomator2Driver, elementId: string): Promise<boolean> {
  return toBool(await this.getAttribute('enabled', elementId));
}

/**
 * Returns whether the element is selected.
 * @param elementId - ID of the element.
 * @returns True if the element is selected, false otherwise.
 */
export async function elementSelected(this: AndroidUiautomator2Driver, elementId: string): Promise<boolean> {
  return toBool(await this.getAttribute('selected', elementId));
}

/**
 * Gets the element tag name.
 * @param elementId - ID of the element.
 * @returns The element tag name.
 */
export async function getName(this: AndroidUiautomator2Driver, elementId: string): Promise<string> {
  return (await this.uiautomator2.jwproxy.command(`/element/${elementId}/name`, 'GET', {})) as string;
}

/**
 * Gets the element location.
 * @param elementId - ID of the element.
 * @returns The element position coordinates (x, y).
 */
export async function getLocation(this: AndroidUiautomator2Driver, elementId: string): Promise<Position> {
  return (await this.uiautomator2.jwproxy.command(`/element/${elementId}/location`, 'GET', {})) as Position;
}

/**
 * Gets the element size.
 * @param elementId - ID of the element.
 * @returns The element size (width, height).
 */
export async function getSize(this: AndroidUiautomator2Driver, elementId: string): Promise<Size> {
  return (await this.uiautomator2.jwproxy.command(`/element/${elementId}/size`, 'GET', {})) as Size;
}

/**
 * Sets the value of an element using the upstream driver API.
 * @param params - Options containing the element ID and value to set.
 */
export async function doSetElementValue(this: AndroidUiautomator2Driver, params: DoSetElementValueOpts): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/element/${params.elementId}/value`, 'POST', params);
}

/**
 * Sends text to an element without replacement.
 * @param keys - Text to send, either as a string or array of strings (which will be joined).
 * @param elementId - ID of the element.
 */
export async function setValueImmediate(
  this: AndroidUiautomator2Driver,
  keys: string | string[],
  elementId: string,
): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/element/${elementId}/value`, 'POST', {
    elementId,
    text: _.isArray(keys) ? keys.join('') : keys,
    replace: false,
  });
}

/**
 * Gets the element text.
 * @param elementId - ID of the element.
 * @returns The element text content.
 */
export async function getText(this: AndroidUiautomator2Driver, elementId: string): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command(`/element/${elementId}/text`, 'GET', {}));
}

/**
 * Clicks the given element.
 * @param element - ID of the element to click.
 */
export async function click(this: AndroidUiautomator2Driver, element: string): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/element/${element}/click`, 'POST', {element});
}

/**
 * Takes a screenshot of the element.
 * @param element - ID of the element.
 * @returns Base64-encoded PNG screenshot of the element.
 */
export async function getElementScreenshot(this: AndroidUiautomator2Driver, element: string): Promise<string> {
  return String(await this.uiautomator2.jwproxy.command(`/element/${element}/screenshot`, 'GET', {}));
}

/**
 * Clears the element text.
 * @param elementId - ID of the element to clear.
 */
export async function clear(this: AndroidUiautomator2Driver, elementId: string): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/element/${elementId}/clear`, 'POST', {elementId});
}

/**
 * Gets the element rectangle.
 * @param elementId - ID of the element.
 * @returns The element rectangle (x, y, width, height).
 */
export async function getElementRect(this: AndroidUiautomator2Driver, elementId: string): Promise<Rect> {
  if (!this.isWebContext()) {
    return (await this.uiautomator2.jwproxy.command(`/element/${elementId}/rect`, 'GET')) as Rect;
  }

  const chromedriver = this.chromedriver as Chromedriver;
  if (chromedriver.jwproxy.downstreamProtocol === PROTOCOLS.MJSONWP) {
    const [{x, y}, {width, height}] = (await B.all([
      chromedriver.jwproxy.command(`/element/${elementId}/location`, 'GET'),
      chromedriver.jwproxy.command(`/element/${elementId}/size`, 'GET'),
    ])) as [Position, Size];
    return {x, y, width, height};
  }
  return (await chromedriver.jwproxy.command(`/element/${elementId}/rect`, 'GET')) as Rect;
}

/**
 * Replaces the element text.
 * @param elementId - ID of the element.
 * @param text - Text to replace the current element value with.
 */
export async function mobileReplaceElementValue(
  this: AndroidUiautomator2Driver,
  elementId: string,
  text: string,
): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/element/${elementId}/value`, 'POST', {
    text,
    replace: true,
  });
}

function toBool(value: any): boolean {
  return _.isString(value) ? value.toLowerCase() === 'true' : !!value;
}

