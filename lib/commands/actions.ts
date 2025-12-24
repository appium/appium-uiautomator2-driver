import type {StringRecord} from '@appium/types';
import type {AndroidUiautomator2Driver} from '../driver';
import type {ActionResult} from './types';

/**
 * Schedules a recurring action to be performed at specified intervals.
 * @param name - Unique name for the scheduled action.
 * @param steps - Array of action steps to be executed.
 * @param maxPass - Maximum number of successful executions before stopping.
 * @param maxFail - Maximum number of failed executions before stopping.
 * @param times - Total number of times to execute the action.
 * @param intervalMs - Interval in milliseconds between action executions.
 * @param maxHistoryItems - Maximum number of history items to keep.
 * @returns The result of scheduling the action.
 */
export async function mobileScheduleAction(
  this: AndroidUiautomator2Driver,
  name: string,
  steps: StringRecord[],
  maxPass?: number,
  maxFail?: number,
  times?: number,
  intervalMs?: number,
  maxHistoryItems?: number,
): Promise<any> {
  return await this.uiautomator2.jwproxy.command('/appium/schedule_action', 'POST', {
    name,
    steps,
    maxFail,
    maxPass,
    times,
    intervalMs,
    maxHistoryItems,
  });
}

/**
 * Gets the execution history for a scheduled action.
 * @param name - Name of the scheduled action.
 * @returns The action execution history containing repeats and step results.
 */
export async function mobileGetActionHistory(
  this: AndroidUiautomator2Driver,
  name: string,
): Promise<ActionResult> {
  return (await this.uiautomator2.jwproxy.command('/appium/action_history', 'POST', {name})) as ActionResult;
}

/**
 * Unschedules a previously scheduled action.
 * @param name - Name of the scheduled action to unschedule.
 * @returns The result of unscheduling the action.
 */
export async function mobileUnscheduleAction(
  this: AndroidUiautomator2Driver,
  name: string,
): Promise<any> {
  return await this.uiautomator2.jwproxy.command('/appium/unschedule_action', 'POST', {name});
}

/**
 * Performs a sequence of actions.
 * @param actions - Array of action objects to perform. Pointer actions are automatically converted to touch type.
 */
export async function performActions(
  this: AndroidUiautomator2Driver,
  actions: StringRecord[],
): Promise<void> {
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
  await this.uiautomator2.jwproxy.command('/actions', 'POST', {
    actions: preprocessedActions,
  });
}

/**
 * Releases all currently pressed keys and buttons.
 */
export async function releaseActions(this: AndroidUiautomator2Driver): Promise<void> {
  this.log.info('On this platform, releaseActions is a no-op');
}

