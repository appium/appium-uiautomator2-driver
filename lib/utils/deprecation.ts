import type {AndroidUiautomator2Driver} from '../driver.js';

const UI_SCROLLABLE_PATTERN = /\bnew\s+UiScrollable\s*\(/;
const UIAUTOMATOR_STRATEGY = '-android uiautomator';
const MIGRATION_DOC_URL =
  'https://appium.github.io/appium-uiautomator2-driver/latest/guides/migrating-from-uiscrollable/';

/**
 * Logs the `UiScrollable` deprecation warning, but only once per session.
 */
export function warnAboutUiScrollableOnce(driver: AndroidUiautomator2Driver): void {
  if (driver._uiScrollableWarningShown) {
    return;
  }
  driver._uiScrollableWarningShown = true;
  driver.log.warn(
    'Google is going to remove UiScrollable and UiSelector from the UiAutomator framework, ' +
      `so scrolling via the '${UIAUTOMATOR_STRATEGY}' locator strategy will stop working. ` +
      `Consider 'mobile: scroll' with the '-android predicate string' or '-android class chain' strategy, ` +
      `'mobile: scrollGesture' or W3C actions instead. See ${MIGRATION_DOC_URL}`,
  );
}

/**
 * Warns if the given locator is a `UiScrollable`-based expression.
 */
export function warnIfUiScrollableLocator(driver: AndroidUiautomator2Driver, strategy: string, selector: string): void {
  if (strategy === UIAUTOMATOR_STRATEGY && UI_SCROLLABLE_PATTERN.test(selector)) {
    warnAboutUiScrollableOnce(driver);
  }
}

/**
 * Warns if `mobile: scroll` is used with the `UiSelector`-based strategy.
 */
export function warnIfUiAutomatorScrollStrategy(driver: AndroidUiautomator2Driver, strategy: string): void {
  if (strategy === UIAUTOMATOR_STRATEGY) {
    warnAboutUiScrollableOnce(driver);
  }
}
