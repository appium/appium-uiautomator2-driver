import { util } from 'appium/support';
import { W3C_ELEMENT_KEY } from 'appium/driver';

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {import('appium-android-driver').SwipeOpts} swipeOpts
 * @returns {Promise<void>}
 */
export async function doSwipe(swipeOpts) {
  await this.uiautomator2.jwproxy.command(
    `/touch/perform`,
    'POST',
    swipeOpts
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {import('appium-android-driver').DragOpts} dragOpts
 * @returns {Promise<void>}
 */
export async function doDrag(dragOpts) {
  await this.uiautomator2.jwproxy.command(
    `/touch/drag`,
    'POST',
    dragOpts
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @param {number} x
 * @param {number} y
 * @param {number} duration
 * @returns {Promise<void>}
 */
export async function touchLongClick(element, x, y, duration) {
  let params = {element, x, y, duration};
  await this.uiautomator2.jwproxy.command(
    `/touch/longclick`,
    'POST',
    {params}
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @param {number} x
 * @param {number} y
 * @returns {Promise<void>}
 */
export async function touchDown(element, x, y) {
  let params = {element, x, y};
  await this.uiautomator2.jwproxy.command(
    `/touch/down`,
    'POST',
    {params}
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @param {number} x
 * @param {number} y
 * @returns {Promise<void>}
 */
export async function touchUp(element, x, y) {
  let params = {element, x, y};
  await this.uiautomator2.jwproxy.command(
    `/touch/up`,
    'POST',
    {params}
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string} element
 * @param {number} x
 * @param {number} y
 * @returns {Promise<void>}
 */
export async function touchMove(element, x, y) {
  let params = {element, x, y};
  await this.uiautomator2.jwproxy.command(
    `/touch/move`,
    'POST',
    {params}
  );
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string?} [elementId=null]
 * @param {number?} [x=null]
 * @param {number?} [y=null]
 * @param {number} [count=1]
 * @returns {Promise<void>}
 */
export async function tap(elementId = null, x = null, y = null, count = 1) {
  const areCoordinatesDefined = util.hasValue(x) && util.hasValue(y);
  if (!util.hasValue(elementId) && !areCoordinatesDefined) {
    throw new Error(`Either element id to tap or both absolute coordinates should be defined`);
  }

  for (let i = 0; i < count; i++) {
    if (util.hasValue(elementId) && !areCoordinatesDefined) {
      // we are either tapping on the default location of the element
      // or an offset from the top left corner
      await this.uiautomator2.jwproxy.command(
        `/element/${elementId}/click`,
        'POST'
      );
    } else {
      await this.uiautomator2.jwproxy.command(
        `/appium/tap`,
        'POST',
        {
          x,
          y,
          [W3C_ELEMENT_KEY]: elementId,
        }
      );
    }
  }
}

/**
 * @deprecated
 * @this {AndroidUiautomator2Driver}
 * @param {string} elementId
 * @param {import('appium-android-driver').TouchState[]} states
 * @returns {Promise<void>}
 */
export async function doPerformMultiAction(elementId, states) {
  let opts;
  if (elementId) {
    opts = {
      elementId,
      actions: states,
    };

    await this.uiautomator2.jwproxy.command(
      '/touch/multi/perform',
      'POST',
      opts
    );
  } else {
    opts = {
      actions: states,
    };
    await this.uiautomator2.jwproxy.command(
      '/touch/multi/perform',
      'POST',
      opts
    );
  }
}

/**
 * @this {AndroidUiautomator2Driver}
 * @param {import('@appium/types').StringRecord[]} actions
 * @returns {Promise<void>}
 */
export async function performActions(actions) {
  this.log.debug(`Received the following W3C actions: ${JSON.stringify(actions, null, '  ')}`);
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
// eslint-disable-next-line require-await
export async function releaseActions() {
  this.log.info('On this platform, releaseActions is a no-op');
}

/**
 * @typedef {import('../uiautomator2').UiAutomator2Server} UiAutomator2Server
 * @typedef {import('../driver').AndroidUiautomator2Driver} AndroidUiautomator2Driver
 */
