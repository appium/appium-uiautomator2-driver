import CssConverter from '../css-converter';

// we override the xpath search for this first-visible-child selector, which
// looks like /*[@firstVisible="true"]
const MAGIC_FIRST_VIS_CHILD_SEL = /\/\*\[@firstVisible ?= ?('|")true\1\]/;

const MAGIC_SCROLLABLE_SEL = /\/\/\*\[@scrollable ?= ?('|")true\1\]/;
const MAGIC_SCROLLABLE_BY = 'new UiSelector().scrollable(true)';

/**
 * @privateRemarks Overriding helpers.doFindElementOrEls functionality of appium-android-driver,
 * this.element initialized in find.js of appium-android-drive.
 *
 * @this {AndroidUiautomator2Driver}
 * @param {import('appium-android-driver').FindElementOpts} params
 * @returns {Promise<Element | Element[]>}
 */
export async function doFindElementOrEls(params) {
  const uiautomator2 = /** @type {import('../uiautomator2').UiAutomator2Server} */ (
    this.uiautomator2
  );
  if (params.strategy === 'xpath' && MAGIC_FIRST_VIS_CHILD_SEL.test(params.selector)) {
    let elementId = params.context;
    return /** @type {Element} */ (
      await uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {})
    );
  }
  if (params.strategy === 'xpath' && MAGIC_SCROLLABLE_SEL.test(params.selector)) {
    params.strategy = '-android uiautomator';
    params.selector = MAGIC_SCROLLABLE_BY;
  }
  if (params.strategy === 'css selector') {
    params.strategy = '-android uiautomator';
    params.selector = new CssConverter(
      params.selector,
      this.opts.appPackage
    ).toUiAutomatorSelector();
  }
  return /** @type {Element|Element[]} */ (
    await uiautomator2.jwproxy.command(`/element${params.multiple ? 's' : ''}`, 'POST', params)
  );
}

/**
 * Find a single element on a specific display.
 *
 * @param {Object} selector - Locator object, e.g. {id: 'com.xxx:id/title', text: 'Start'}.
 * @param {number} displayIndex - Target display index (0 = primary, 1 = secondary, ...).
 * @param {number} [timeout=1000] - Optional wait timeout in milliseconds.
 * @param {string} [context] - Optional parent element ELEMENT ID for scoped search.
 * @returns {Promise<Element>} - Promise resolving to a single element.
 * @throws {Error} If displayIndex is not a number or element is not found within timeout.
 */
export async function mobileFindElementOnDisplay(selector, displayIndex, timeout, context) {

  const numericDisplayIndex =
    typeof displayIndex === 'string' ? parseInt(displayIndex, 10) : displayIndex;

  if (typeof numericDisplayIndex !== 'number' || isNaN(numericDisplayIndex)) {
    throw new Error('displayId must be provided and be a number');
  }
  const waitTimeout = Math.max(timeout ?? 1000, 0);

  const params = {
    selector,
    displayIndex: numericDisplayIndex,
    timeout: waitTimeout,
  };
  
  if (context) {
    params.context = context;
  }
  
  const uiautomator2 = this.uiautomator2;
  const endpoint = `appium/element/on_display`;

  return await uiautomator2.jwproxy.command(endpoint, 'POST', params);
}

/**
 * Find multiple elements on a specific display.
 *
 * @param {Object} selector - Locator object, e.g. {className: 'android.widget.TextView'}.
 * @param {number} displayIndex - Target display index (0 = primary, 1 = secondary, ...).
 * @param {number} [timeout=1000] - Optional wait timeout in milliseconds.
 * @param {string} [context] - Optional parent element ELEMENT ID for scoped search.
 * @returns {Promise<Element[]>} - Promise resolving to an array of elements.
 * @throws {Error} If displayIndex is not a number or elements are not found within timeout.
 */
export async function mobileFindElementsOnDisplay(selector, displayIndex, timeout, context) {

  const numericDisplayIndex =
    typeof displayIndex === 'string' ? parseInt(displayIndex, 10) : displayIndex;

  if (typeof numericDisplayIndex !== 'number' || isNaN(numericDisplayIndex)) {
    throw new Error('displayId must be provided and be a number');
  }
  const waitTimeout = Math.max(timeout ?? 1000, 0);

  const params = {
    selector,
    displayIndex: numericDisplayIndex,
    timeout: waitTimeout
  };
  
  if (context) {
    params.context = context;
  }
  
  const uiautomator2 = this.uiautomator2;
  const endpoint = `appium/elements/on_display`;

  return await uiautomator2.jwproxy.command(endpoint, 'POST', params);
}

/**
 * @typedef {import('@appium/types').Element} Element
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
