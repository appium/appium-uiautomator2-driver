// TODO(appium server 3.4.1+): Replace local `isEmpty` / `escapeRegExp` with imports from `appium/support`
// once this driver declares that minimum server version.

/**
 * Returns true when the value has no elements/properties.
 *
 * @param value - Value to check
 * @returns `true` if the value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value == null) {
    return true;
  }
  if (typeof value === 'string' || Array.isArray(value) || Buffer.isBuffer(value)) {
    return value.length === 0;
  }
  if (value instanceof Map || value instanceof Set) {
    return value.size === 0;
  }
  if (typeof value === 'object' || typeof value === 'function') {
    return Object.keys(value).length === 0;
  }
  return true;
}

/**
 * Escapes RegExp special characters in a string.
 *
 * @param value - Input string
 * @returns Escaped string safe for RegExp source
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
