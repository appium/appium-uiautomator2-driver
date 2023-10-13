// @ts-check

import {mixin} from './mixins';
import _ from 'lodash';
import B from 'bluebird';

// Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="EMU_display_0"
const DISPLAY_PATTERN = /^Display\s+(\d+)\s+\(.+display\s+(\d+)\).+displayName="([^"]*)/gm;

/**
 * @type {import('./mixins').UIA2ScreenshotMixin}
 * @satisfies {import('@appium/types').ExternalDriver}
 */
const ScreenshotMixin = {
  async getScreenshot() {
    if (this.mjpegStream) {
      const data = await this.mjpegStream.lastChunkPNGBase64();
      if (data) {
        return data;
      }
      this.log.warn(
        'Tried to get screenshot from active MJPEG stream, but there ' +
          'was no data yet. Falling back to regular screenshot methods.'
      );
    }
    return String(
      await /** @type {import('../uiautomator2').UiAutomator2Server} */ (
        this.uiautomator2
      ).jwproxy.command('/screenshot', 'GET')
    );
  },

  /**
   * Retrieves screenshots of each display available to Android.
   * This functionality is only supported since Android 10.
   */
  async mobileScreenshots(opts = {}) {
    const displaysInfo = await /** @type {import('appium-adb').ADB} */ (this.adb).shell([
      'dumpsys',
      'SurfaceFlinger',
      '--display-id',
    ]);
    /** @type {import('@appium/types').StringRecord<import('./types').Screenshot>} */
    const infos = {};
    let match;
    while ((match = DISPLAY_PATTERN.exec(displaysInfo))) {
      infos[match[1]] = /** @type {any} */ ({
        id: match[1],
        isDefault: match[2] === '0',
        name: match[3],
      });
    }
    if (_.isEmpty(infos)) {
      this.log.debug(displaysInfo);
      throw new Error('Cannot determine the information about connected Android displays');
    }
    this.log.info(`Parsed Android display infos: ${JSON.stringify(infos)}`);

    /**
     * @param {string} dispId
     */
    const toB64Screenshot = async (dispId) =>
      (await /** @type {import('appium-adb').ADB} */ (this.adb).takeScreenshot(dispId)).toString(
        'base64'
      );

    const {displayId} = opts;
    const displayIdStr = _.isNaN(displayId) ? null : `${displayId}`;
    if (displayIdStr) {
      if (!infos[displayIdStr]) {
        throw new Error(
          `The provided display identifier '${displayId}' is not known. ` +
            `Only the following displays have been detected: ${JSON.stringify(infos)}`
        );
      }
      return {
        [displayIdStr]: {
          ...infos[displayIdStr],
          payload: await toB64Screenshot(displayIdStr),
        },
      };
    }

    const allInfos = _.values(infos);
    const screenshots = await B.all(allInfos.map(({id}) => toB64Screenshot(id)));
    for (const [info, payload] of /** @type {[import('./types').Screenshot, string][]} */ (
      _.zip(allInfos, screenshots)
    )) {
      info.payload = payload;
    }
    return infos;
  },
};

mixin(ScreenshotMixin);
