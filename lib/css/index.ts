import {errors} from 'appium/driver';
import {memoize} from '../utils';
import {UI_AUTOMATOR_EMITTER_KEY, UI_AUTOMATOR_STRATEGY} from './constants';
import {ATTRIBUTE_SCHEMA} from './schema';
import {UiAutomatorEmitter} from './ui-automator-emitter';
import type {CssTransformer, NativeLocator, StrategyKey} from '@appium/css-locator-to-native';

export {UI_AUTOMATOR_STRATEGY} from './constants';

const emitters = {
  [UI_AUTOMATOR_EMITTER_KEY]: new UiAutomatorEmitter(UI_AUTOMATOR_STRATEGY),
};

const getTransformCss = memoize(async function loadTransformCss(): Promise<CssTransformer> {
  const mod = await import('@appium/css-locator-to-native');
  return mod.createCssTransformer({
    schema: ATTRIBUTE_SCHEMA,
    emitters,
    resolveStrategy(): StrategyKey<typeof emitters> {
      return UI_AUTOMATOR_EMITTER_KEY;
    },
  });
});

/**
 * Converts a CSS selector string into a native locator for the resolved strategy.
 *
 * @param css - CSS selector to transform
 * @param appPackage - Optional application package used to qualify resource ids
 * @returns Native locator strategy name and selector string
 */
export async function cssToNativeLocator(
  css: string,
  appPackage?: string | null,
): Promise<NativeLocator> {
  try {
    const transformCss = await getTransformCss();
    return transformCss(css, {appPackage});
  } catch (err) {
    throw mapCssError(err, css);
  }
}

function mapCssError(err: unknown, css: string): Error {
  if (isPackageError(err, 'InvalidSelectorError')) {
    return new errors.InvalidSelectorError(`Invalid CSS selector '${css}'`, err);
  }
  if (isPackageError(err, 'UnsupportedSelectorError')) {
    return new errors.InvalidSelectorError(`Unsupported CSS selector '${css}'`, err);
  }
  if (err instanceof Error) {
    return err;
  }
  return new Error(String(err));
}

function isPackageError(err: unknown, name: string): err is Error {
  return err instanceof Error && err.name === name;
}
