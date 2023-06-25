import _ from 'lodash';
import B from 'bluebird';

const commands = {};

// Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="EMU_display_0"
const DISPLAY_PATTERN = /^Display\s+(\d+)\s+\(.+display\s+(\d+)\).+displayName="([^"]*)/gm;

commands.getScreenshot = async function () {
  if (this.mjpegStream) {
    const data = await this.mjpegStream.lastChunkPNGBase64();
    if (data) {
      return data;
    }
    this.log.warn('Tried to get screenshot from active MJPEG stream, but there ' +
      'was no data yet. Falling back to regular screenshot methods.');
  }
  return await this.uiautomator2.jwproxy.command('/screenshot', 'GET');
};

/**
 * @typedef {Object} ScreenshotsInfo
 *
 * A dictionary where each key contains a unique display identifier
 * and values are dictionaries with following items:
 * - id: Display identifier
 * - name: Display name, could be empty
 * - isDefault: Whether this display is the default one
 * - payload: The actual PNG screenshot data encoded to base64 string
 */

/**
 * @typedef {Object} ScreenshotsOpts
 * @property {number|string?} displayId Android display identifier to take a screenshot for.
 * If not provided then screenshots of all displays are going to be returned.
 * If no matches were found then an error is thrown.
 */

/**
 * Retrieves screenshots of each display available to Android.
 * This functionality is only supported since Android 10.
 *
 * @param {ScreenshotsOpts} opts
 * @returns {Promise<ScreenshotsInfo>}
 */
commands.mobileScreenshots = async function mobileScreenshots (opts = {}) {
  const displaysInfo = await this.adb.shell(['dumpsys', 'SurfaceFlinger', '--display-id']);
  const infos = {};
  let match;
  while ((match = DISPLAY_PATTERN.exec(displaysInfo))) {
    infos[match[1]] = {
      id: match[1],
      isDefault: match[2] === '0',
      name: match[3],
    };
  }
  if (_.isEmpty(infos)) {
    this.log.debug(displaysInfo);
    throw new Error('Cannot determine the information about connected Android displays');
  }
  this.log.info(`Parsed Android display infos: ${JSON.stringify(infos)}`);

  const toB64Screenshot = async (dispId) => (await this.adb.takeScreenshot(dispId))
    .toString('base64');

  const {displayId} = opts;
  const displayIdStr = isNaN(displayId) ? null : `${displayId}`;
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
      }
    };
  }

  const allInfos = _.values(infos);
  const screenshots = await B.all(allInfos.map(({id}) => toB64Screenshot(id)));
  for (const [info, payload] of _.zip(allInfos, screenshots)) {
    info.payload = payload;
  }
  return infos;
};

export default commands;
