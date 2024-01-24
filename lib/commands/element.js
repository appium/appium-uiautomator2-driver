import B from 'bluebird';
import _ from 'lodash';
import {PROTOCOLS} from 'appium/driver';
import {utils} from 'appium-android-driver';

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<import('@appium/types').Element>}
 */
export async function active() {
  return /** @type {import('@appium/types').Element} */ (
    await this.uiautomator2.jwproxy.command(
      '/element/active',
      'GET'
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} attribute
 * @param {string} elementId
 * @returns {Promise<string?>}
 */
export async function getAttribute(attribute, elementId) {
  return String(
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/attribute/${attribute}`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<boolean>}
 */
export async function elementDisplayed(elementId) {
  return toBool(await this.getAttribute('displayed', elementId));
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<boolean>}
 */
export async function elementEnabled(elementId) {
  return toBool(await this.getAttribute('enabled', elementId));
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<boolean>}
 */
export async function elementSelected(elementId) {
  return toBool(await this.getAttribute('selected', elementId));
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<string>}
 */
export async function getName(elementId) {
  return /** @type {string} */ (
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/name`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<import('@appium/types').Position>}
 */
export async function getLocation(elementId) {
  return /** @type {import('@appium/types').Position} */ (
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/location`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<import('@appium/types').Size>}
 */
export async function getSize(elementId) {
  return /** @type {import('@appium/types').Size} */ (
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/size`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('appium-android-driver').DoSetElementValueOpts} params
 * @returns {Promise<void>}
 */
export async function doSetElementValue(params) {
  await this.uiautomator2.jwproxy.command(
    `/element/${params.elementId}/value`,
    'POST',
    params
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string|string[]} keys
 * @param {string} elementId
 * @returns {Promise<void>}
 */
export async function setValueImmediate(keys, elementId) {
  await this.uiautomator2.jwproxy.command(
    `/element/${elementId}/value`,
    'POST',
    {
      elementId,
      text: _.isArray(keys) ? keys.join('') : keys,
      replace: false,
    }
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<string>}
 */
export async function getText(elementId) {
  return String(
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/text`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @returns {Promise<void>}
 */
export async function click(element) {
  await this.uiautomator2.jwproxy.command(
    `/element/${element}/click`,
    'POST',
    {element}
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @returns {Promise<string>}
 */
export async function getElementScreenshot(element) {
  return String(
    await this.uiautomator2.jwproxy.command(
      `/element/${element}/screenshot`,
      'GET',
      {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<void>}
 */
export async function clear(elementId) {
  await this.uiautomator2.jwproxy.command(
    `/element/${elementId}/clear`,
    'POST',
    {
      elementId,
    }
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @returns {Promise<import('@appium/types').Rect>}
 */
export async function getElementRect(elementId) {
  const chromedriver = /** @type {import('appium-chromedriver').default} */ (this.chromedriver);
  if (this.isWebContext()) {
    this.log.debug(
      `Detected downstream chromedriver protocol: ${chromedriver.jwproxy.downstreamProtocol}`
    );
    if (chromedriver.jwproxy.downstreamProtocol === PROTOCOLS.MJSONWP) {
      const [{x, y}, {width, height}] =
        /** @type {[import('@appium/types').Position, import('@appium/types').Size]} */ (
          await B.all([
            chromedriver.jwproxy.command(`/element/${elementId}/location`, 'GET'),
            chromedriver.jwproxy.command(`/element/${elementId}/size`, 'GET'),
          ])
        );
      return {x, y, width, height};
    }
    return /** @type {import('@appium/types').Rect} */ (
      await chromedriver.jwproxy.command(`/element/${elementId}/rect`, 'GET')
    );
  }
  return /** @type {import('@appium/types').Rect} */ (
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/rect`,
      'GET'
    )
  );
}

/**
 * Sends text to the given element by replacing its previous content
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ReplaceValueOptions} opts
 * @throws {Error} If there was a faulre while setting the text
 * @returns {Promise<void>}
 */
export async function mobileReplaceElementValue(opts) {
  const {elementId, text} = utils.requireArgs(['elementId', 'text'], opts);
  await this.uiautomator2.jwproxy.command(
    `/element/${elementId}/value`,
    'POST',
    {
      text,
      replace: true,
    }
  );
}

// #region Internal Helpers

/**
 * @param {any} s
 * @returns {boolean}
 */
function toBool(s) {
  return _.isString(s) ? s.toLowerCase() === 'true' : !!s;
}

// #endregion

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
