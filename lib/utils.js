import _ from 'lodash';
import { errors } from 'appium/driver';

/**
 * Assert the presence of particular keys in the given object
 *
 * @template {Object} T
 * @param {string|string[]} argNames one or more key names
 * @param {T} opts the object to check
 * @returns {T} the same given object
 */
export function requireArgs (argNames, opts = {}) {
  for (const argName of (_.isArray(argNames) ? argNames : [argNames])) {
    if (!_.has(opts, argName)) {
      throw new errors.InvalidArgumentError(`'${argName}' argument must be provided`);
    }
  }
  return opts;
}
