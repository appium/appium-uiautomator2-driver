/**
 * See https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-scheduleaction
 * @this {AndroidUiautomator2Driver}
 * @param {Record<string, any>} [opts={}]
 * @returns {Promise<any>}
 */
export async function mobileScheduleAction(opts = {}) {
  return await this.uiautomator2.jwproxy.command(
    '/appium/schedule_action',
    'POST',
    opts
  );
}

/**
 * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-getactionhistory
 * @this {AndroidUiautomator2Driver}
 * @param {import('./types').ActionArgs} [opts={}]
 * @returns {Promise<import('./types').ActionResult>}
 */
export async function mobileGetActionHistory(opts) {
  return /** @type {import('./types').ActionResult} */ (
    await this.uiautomator2.jwproxy.command(
      '/appium/action_history',
      'POST',
      opts ?? {}
    )
  );
}

/**
 * @this {AndroidUiautomator2Driver}
 * @see https://github.com/appium/appium-uiautomator2-driver/blob/master/docs/scheduled-actions.md#mobile-unscheduleaction
 * @param {import('./types').ActionArgs} [opts={}]
 * @returns {Promise<any>}
 */
export async function mobileUnscheduleAction(opts) {
  return await this.uiautomator2.jwproxy.command(
    '/appium/unschedule_action',
    'POST',
    opts ?? {}
  );
}

/**
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
