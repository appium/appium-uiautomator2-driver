import type {CssTransformer, NativeLocator, StrategyKey} from '@appium/css-locator-to-native';
import {errors} from 'appium/driver.js';
import {util} from 'appium/support.js';

import {ClassChainEmitter, needsClassChain, PredicateStringEmitter} from './class-chain-emitter.js';
import {CLASS_CHAIN_EMITTER_KEY, CLASS_CHAIN_STRATEGY, PREDICATE_EMITTER_KEY, PREDICATE_STRATEGY} from './constants.js';
import {ATTRIBUTE_SCHEMA} from './schema.js';

export {CLASS_CHAIN_STRATEGY, PREDICATE_STRATEGY} from './constants.js';

const emitters = {
  [CLASS_CHAIN_EMITTER_KEY]: new ClassChainEmitter(CLASS_CHAIN_STRATEGY),
  [PREDICATE_EMITTER_KEY]: new PredicateStringEmitter(PREDICATE_STRATEGY),
};

const getTransformCss = util.memoize(async function loadTransformCss(): Promise<CssTransformer> {
  const mod = await import('@appium/css-locator-to-native');
  return mod.createCssTransformer({
    schema: ATTRIBUTE_SCHEMA,
    emitters,
    resolveStrategy(parsed): StrategyKey<typeof emitters> {
      return needsClassChain(parsed) ? CLASS_CHAIN_EMITTER_KEY : PREDICATE_EMITTER_KEY;
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
export async function cssToNativeLocator(css: string, appPackage?: string | null): Promise<NativeLocator> {
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
