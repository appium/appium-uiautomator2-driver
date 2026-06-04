import type {Context} from 'mocha';

export function isCi(): boolean {
  return Boolean(process.env.CI);
}

/** Skips the current suite in CI (use in a `before` hook on the root `describe`). */
export function skipSuiteInCi(this: Context): void {
  if (isCi()) {
    this.skip();
  }
}
