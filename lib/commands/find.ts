import {CssConverter} from '../css-converter';
import type {Element as AppiumElement} from '@appium/types';
import type {FindElementOpts} from 'appium-android-driver';
import type {AndroidUiautomator2Driver} from '../driver';

// we override the xpath search for this first-visible-child selector, which
// looks like /*[@firstVisible="true"]
const MAGIC_FIRST_VIS_CHILD_SEL = /\/\*\[@firstVisible ?= ?('|")true\1\]/;

const MAGIC_SCROLLABLE_SEL = /\/\/\*\[@scrollable ?= ?('|")true\1\]/;
const MAGIC_SCROLLABLE_BY = 'new UiSelector().scrollable(true)';

/**
 * Overrides helpers.doFindElementOrEls functionality of appium-android-driver.
 * Handles special xpath selectors and CSS selector conversion.
 * @param params - Element finding options including strategy, selector, context, and multiple flag.
 * @returns A single element if `params.multiple` is false, or an array of elements if true.
 */
export async function doFindElementOrEls(
  this: AndroidUiautomator2Driver,
  params: FindElementOpts & {multiple: true},
): Promise<AppiumElement[]>;
export async function doFindElementOrEls(
  this: AndroidUiautomator2Driver,
  params: FindElementOpts & {multiple: false},
): Promise<AppiumElement>;
export async function doFindElementOrEls(
  this: AndroidUiautomator2Driver,
  params: FindElementOpts,
): Promise<AppiumElement | AppiumElement[]> {
  const uiautomator2 = this.uiautomator2;
  if (params.strategy === 'xpath' && MAGIC_FIRST_VIS_CHILD_SEL.test(params.selector)) {
    const elementId = params.context;
    return (await uiautomator2.jwproxy.command(`/appium/element/${elementId}/first_visible`, 'GET', {})) as AppiumElement;
  }
  if (params.strategy === 'xpath' && MAGIC_SCROLLABLE_SEL.test(params.selector)) {
    params.strategy = '-android uiautomator';
    params.selector = MAGIC_SCROLLABLE_BY;
  }
  if (params.strategy === 'css selector') {
    params.strategy = '-android uiautomator';
    params.selector = new CssConverter(params.selector, this.opts.appPackage).toUiAutomatorSelector();
  }
  return (await uiautomator2.jwproxy.command(`/element${params.multiple ? 's' : ''}`, 'POST', params)) as
    | AppiumElement
    | AppiumElement[];
}

