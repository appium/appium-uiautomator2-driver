import {errors} from 'appium/driver';
import _ from 'lodash';
import type {AndroidUiautomator2Driver} from '../driver';
import type {SendKeysOpts} from 'appium-android-driver';

/**
 * Presses a key code with optional metastate and flags.
 * @param keycode - Android key code to press.
 * @param metastate - Optional meta state modifier keys.
 * @param flags - Optional flags for the key event.
 */
export async function pressKeyCode(
  this: AndroidUiautomator2Driver,
  keycode: string | number,
  metastate?: number,
  flags?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/device/press_keycode', 'POST', {
    keycode,
    metastate,
    flags,
  });
}

/**
 * Long presses a key code with optional metastate and flags.
 * @param keycode - Android key code to long press.
 * @param metastate - Meta state modifier keys.
 * @param flags - Optional flags for the key event.
 */
export async function longPressKeyCode(
  this: AndroidUiautomator2Driver,
  keycode: string | number,
  metastate: number,
  flags?: number,
): Promise<void> {
  await this.uiautomator2.jwproxy.command('/appium/device/long_press_keycode', 'POST', {
    keycode,
    metastate,
    flags,
  });
}

/**
 * Presses a key code with optional metastate, flags, and long press support.
 * @param keycode - Android key code to press.
 * @param metastate - Optional meta state modifier keys.
 * @param flags - Optional flags for the key event.
 * @param isLongPress - Whether to perform a long press. Defaults to false.
 */
export async function mobilePressKey(
  this: AndroidUiautomator2Driver,
  keycode: number,
  metastate?: number,
  flags?: string,
  isLongPress: boolean = false,
): Promise<void> {
  await this.uiautomator2.jwproxy.command(`/appium/device/${isLongPress ? 'long_' : ''}press_keycode`, 'POST', {
    keycode,
    metastate,
    flags,
  });
}

/**
 * Types the given Unicode string. The focus should already be on the destination input field.
 * @param text - Text to type. Can be a string, number, or boolean.
 * @returns True if the input text has been successfully sent to adb.
 * @throws {errors.InvalidArgumentError} If the text argument is not provided.
 */
export async function mobileType(
  this: AndroidUiautomator2Driver,
  text: string | number | boolean,
): Promise<boolean> {
  if (_.isUndefined(text)) {
    throw new errors.InvalidArgumentError(`The 'text' argument is mandatory`);
  }
  return await this.settingsApp.typeUnicode(String(text));
}

/**
 * Sends keys to the current element.
 * @param params - Options containing the text to send and optional replace flag.
 */
export async function doSendKeys(this: AndroidUiautomator2Driver, params: SendKeysOpts): Promise<void> {
  await this.uiautomator2.jwproxy.command('/keys', 'POST', params);
}

/**
 * Sends a key event to the device.
 * @param keycode - Android key code to send.
 * @param metastate - Optional meta state (ignored in this implementation).
 */
export async function keyevent(
  this: AndroidUiautomator2Driver,
  keycode: string | number,
  metastate?: number,
): Promise<void> {
  this.log.debug(`Ignoring metastate ${metastate}`);
  await this.adb.keyevent(keycode);
}

