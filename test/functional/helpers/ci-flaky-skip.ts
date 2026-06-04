import type {Context} from 'mocha';

/**
 * TODO: Re-enable these tests in CI after stabilizing them on GitHub Actions emulators.
 * Tracked for a follow-up PR (session startup alerts, toast timing, system UI xpath waits).
 */
export function skipFlakyInCi(this: Context): void {
  if (process.env.CI) {
    this.skip();
  }
}
