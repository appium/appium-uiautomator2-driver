/**
 * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-scheduleaction
 * @this {AndroidUiautomator2Driver}
 * @param {string} name
 * @param {import('@appium/types').StringRecord[]} steps
 * @param {number} [maxPass]
 * @param {number} [maxFail]
 * @param {number} [times]
 * @param {number} [intervalMs]
 * @param {number} [maxHistoryItems]
 * @returns {Promise<any>}
 */
export async function mobileScheduleAction(
  name,
  steps,
  maxPass,
  maxFail,
  times,
  intervalMs,
  maxHistoryItems,
) {
  return await this.uiautomator2.jwproxy.command(
    '/appium/schedule_action',
    'POST',
    {
      name,
      steps,
      maxFail,
      maxPass,
      times,
      intervalMs,
      maxHistoryItems,
    }
  );
}

/**
 * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-getactionhistory
 * @this {AndroidUiautomator2Driver}
 * @param {string} name
 * @returns {Promise<import('./types').ActionResult>}
 */
export async function mobileGetActionHistory(name) {
  return /** @type {import('./types').ActionResult} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/action_history',
      'POST',
      {name}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-unscheduleaction
 * @param {string} name
 * @returns {Promise<any>}
 */
export async function mobileUnscheduleAction(name) {
  return await this.uiautomator2.jwproxy.command(
    '/appium/unschedule_action',
    'POST',
    {name}
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('@appium/types').StringRecord[]} actions
 * @returns {Promise<void>}
 */
export async function performActions(actions) {
  // This is mandatory, since Selenium API uses MOUSE as the default pointer type
  const preprocessedActions = actions.map((action) =>
    Object.assign(
      {},
      action,
      action.type === 'pointer'
        ? {
            parameters: {
              pointerType: 'touch',
            },
          }
        : {}
    )
  );
  this.log.debug(`Preprocessed actions: ${JSON.stringify(preprocessedActions, null, '  ')}`);
  await this.uiautomator2.jwproxy.command(
    '/actions',
    'POST',
    {
      actions: preprocessedActions,
    }
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @returns {Promise<void>}
 */
export async function releaseActions() {
  this.log.info('On this platform, releaseActions is a no-op');
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
