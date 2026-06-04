import type {Context} from 'mocha';

export function isCi(): boolean {
  return Boolean(process.env.CI);
}

/**
 * Skips the current suite in CI (use in a `before` hook on the root `describe`).
 * @returns `true` if the suite was skipped (callers in `async` hooks should return early).
 */
export function skipSuiteInCi(this: Context): boolean {
  if (isCi()) {
    this.skip();
    return true;
  }
  return false;
}

/** Skips the current test in CI (use at the start of slow or flaky `it` callbacks). */
export function skipTestInCi(this: Context): boolean {
  return skipSuiteInCi.call(this);
}
