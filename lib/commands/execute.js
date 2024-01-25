import _ from 'lodash';
import {errors, PROTOCOLS} from 'appium/driver';
import {AndroidUiautomator2Driver} from '../driver';

const MOBILE_SCRIPT_NAME_PREFIX = 'mobile:';

/**
 * @override
 * @privateRemarks Because the "mobile" commands (execute methods) in this
 * driver universally accept an options object, this method will _not_ call
 * into `BaseDriver.executeMethod`.
 * @this {AndroidUiautomator2Driver}
 * @param {string} script
 * @param {any[]} [args]
 * @returns {Promise<any>}
 */
export async function execute(script, args) {
  const mobileScriptName = toExecuteMethodName(script);
  const isWebContext = this.isWebContext();
  if (mobileScriptName && isWebContext || !isWebContext) {
    if (mobileScriptName) {
      const executeMethodArgs = preprocessExecuteMethodArgs(args);
      this.log.info(`Executing method '${mobileScriptName}'`);
      return await this.executeMobile(mobileScriptName, executeMethodArgs);
    }
    // Just pass the script name through and let it fail with a proper error message
    return await this.executeMobile(`${script}`, {});
  }
  const endpoint =
    /** @type {import('appium-chromedriver').Chromedriver} */ (this.chromedriver).jwproxy
      .downstreamProtocol === PROTOCOLS.MJSONWP
      ? '/execute'
      : '/execute/sync';
  return await /** @type {import('appium-chromedriver').Chromedriver} */ (
    this.chromedriver
  ).jwproxy.command(endpoint, 'POST', {
    script,
    args,
  });
}

/**
 * @override
 * @this {AndroidUiautomator2Driver}
 * @param {string} script Must be of the form `mobile: <something>`, which
 * differs from its parent class implementation.
 * @param {import('@appium/types').StringRecord} [opts={}]
 * @returns {Promise<any>}
 */
export async function executeMobile(script, opts = {}) {
  if (!(script in AndroidUiautomator2Driver.executeMethodMap)) {
    const commandNames = _.map(
      _.keys(AndroidUiautomator2Driver.executeMethodMap),
      (value) => value.slice(8)
    );
    throw new errors.UnknownCommandError(
      `Unknown mobile command "${script}". ` +
        `Only ${commandNames.join(', ')} commands are supported.`
    );
  }
  const methodName =
    AndroidUiautomator2Driver.executeMethodMap[
      /** @type {keyof import('../execute-method-map').Uiautomator2ExecuteMethodMap} */ (script)
    ].command;

  return await /** @type {(opts?: any) => Promise<unknown>} */ (this[methodName])(opts);
}

// #region Internal Helpers

/**
 * Messages the arguments going into an execute method.
 * @remarks A similar method is implemented in `appium-xcuitest-driver`, but it
 * appears the methods in here handle unwrapping of `Element` objects, so we do
 * not do that here.
 * @param {readonly any[] | readonly [StringRecord] | Readonly<StringRecord>} [args]
 * @internal
 * @returns {StringRecord<unknown>}
 */
function preprocessExecuteMethodArgs(args) {
  if (_.isArray(args)) {
    args = _.first(args);
  }
  const executeMethodArgs = /** @type {StringRecord<unknown>} */ (args ?? {});
  /**
   * Renames the deprecated `element` key to `elementId`.  Historically,
   * all of the pre-Execute-Method-Map execute methods accepted an `element` _or_ and `elementId` param.
   * This assigns the `element` value to `elementId` if `elementId` is not already present.
   */
  if (!('elementId' in executeMethodArgs) && 'element' in executeMethodArgs) {
    executeMethodArgs.elementId = executeMethodArgs.element;
    delete executeMethodArgs.element;
  }

  return executeMethodArgs;
}

/**
 * Type guard to check if a script is an execute method.
 * @param {any} script
 * @internal
 * @returns {string?}
 */
function toExecuteMethodName(script) {
  return _.startsWith(script, MOBILE_SCRIPT_NAME_PREFIX)
    ? script.replace(new RegExp(`${MOBILE_SCRIPT_NAME_PREFIX}\\s*`), `${MOBILE_SCRIPT_NAME_PREFIX} `)
    : null;
}

// #endregion

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 * @typedef {import('appium-adb').ADB} ADB
 */

/**
 * @template [T=any]
 * @typedef {import('@appium/types').StringRecord<T>} StringRecord
 */
