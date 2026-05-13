/**
 * Assigns own enumerable properties of `source` onto `target` only where `target[key] === undefined`
 * (lodash `defaults` semantics).
 */
export function assignDefaults<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): void {
  for (const key of Object.keys(source)) {
    if (target[key] === undefined) {
      (target as Record<string, unknown>)[key] = source[key];
    }
  }
}
