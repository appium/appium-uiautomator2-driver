// @ts-check

import B from 'bluebird';
import _ from 'lodash';
import {util} from 'appium/support';
import {PROTOCOLS, W3C_ELEMENT_KEY} from 'appium/driver';
import {requireArgs} from '../utils';
import {mixin} from './mixins';

/**
 * @param {any} s
 * @returns {boolean}
 */
function toBool(s) {
  return _.isString(s) ? s.toLowerCase() === 'true' : !!s;
}

/**
 * @type {import('./mixins').UIA2ElementMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const ElementMixin = {
  async active() {
    return /** @type {import('@appium/types').Element} */ (
      await this.uiautomator2.jwproxy.command(
        '/element/active',
        'GET'
      )
    );
  },
  async getAttribute(attribute, elementId) {
    return String(
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/attribute/${attribute}`,
        'GET',
        {}
      )
    );
  },
  async elementDisplayed(elementId) {
    return toBool(await this.getAttribute('displayed', elementId));
  },
  async elementEnabled(elementId) {
    return toBool(await this.getAttribute('enabled', elementId));
  },
  async elementSelected(elementId) {
    return toBool(await this.getAttribute('selected', elementId));
  },
  async getName(elementId) {
    return /** @type {string} */ (
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/name`,
        'GET',
        {}
      )
    );
  },
  async getLocation(elementId) {
    return /** @type {import('@appium/types').Position} */ (
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/location`,
        'GET',
        {}
      )
    );
  },
  async getSize(elementId) {
    return /** @type {import('@appium/types').Size} */ (
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/size`,
        'GET',
        {}
      )
    );
  },
  async touchLongClick(element, x, y, duration) {
    let params = {element, x, y, duration};
    await this.uiautomator2.jwproxy.command(
      `/touch/longclick`,
      'POST',
      {params}
    );
  },
  async touchDown(element, x, y) {
    let params = {element, x, y};
    await this.uiautomator2.jwproxy.command(
      `/touch/down`,
      'POST',
      {params}
    );
  },
  async touchUp(element, x, y) {
    let params = {element, x, y};
    await this.uiautomator2.jwproxy.command(
      `/touch/up`,
      'POST',
      {params}
    );
  },
  async touchMove(element, x, y) {
    let params = {element, x, y};
    await this.uiautomator2.jwproxy.command(
      `/touch/move`,
      'POST',
      {params}
    );
  },
  async doSetElementValue(params) {
    await this.uiautomator2.jwproxy.command(
      `/element/${params.elementId}/value`,
      'POST',
      params
    );
  },
  async setValueImmediate(keys, elementId) {
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/value`,
      'POST',
      {
        elementId,
        text: _.isArray(keys) ? keys.join('') : keys,
        replace: false,
      }
    );
  },
  async getText(elementId) {
    return String(
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/text`,
        'GET',
        {}
      )
    );
  },
  async click(element) {
    await this.uiautomator2.jwproxy.command(
      `/element/${element}/click`,
      'POST',
      {element}
    );
  },
  async getElementScreenshot(element) {
    return String(
      await this.uiautomator2.jwproxy.command(
        `/element/${element}/screenshot`,
        'GET',
        {}
      )
    );
  },

  async tap(elementId = null, x = null, y = null, count = 1) {
    const areCoordinatesDefined = util.hasValue(x) && util.hasValue(y);
    if (!util.hasValue(elementId) && !areCoordinatesDefined) {
      throw new Error(`Either element id to tap or both absolute coordinates should be defined`);
    }

    for (let i = 0; i < count; i++) {
      if (util.hasValue(elementId) && !areCoordinatesDefined) {
        // we are either tapping on the default location of the element
        // or an offset from the top left corner
        await this.uiautomator2.jwproxy.command(
          `/element/${elementId}/click`,
          'POST'
        );
      } else {
        await this.uiautomator2.jwproxy.command(
          `/appium/tap`,
          'POST',
          {
            x,
            y,
            [W3C_ELEMENT_KEY]: elementId,
          }
        );
      }
    }
  },

  async clear(elementId) {
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/clear`,
      'POST',
      {
        elementId,
      }
    );
  },

  async getElementRect(elementId) {
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
  },

  /**
   * Sends text to the given element by replacing its previous content
   *
   * @param {import('./types').ReplaceValueOptions} opts
   * @throws {Error} If there was a faulre while setting the text
   */
  async mobileReplaceElementValue(opts) {
    const {elementId, text} = requireArgs(['elementId', 'text'], opts);
    await this.uiautomator2.jwproxy.command(
      `/element/${elementId}/value`,
      'POST',
      {
        text,
        replace: true,
      }
    );
  },
};

mixin(ElementMixin);

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 */
