import _ from 'lodash';
import B from 'bluebird';
import {imageUtil} from 'appium/support';
import type {AndroidUiautomator2Driver} from '../driver';
import type {Screenshot} from './types';
import type {StringRecord} from '@appium/types';

// Matches SurfaceFlinger output format:
// Physical: Display 4619827259835644672 (HWC display 0): port=0 pnpId=GGL displayName="EMU_display_0"
// Virtual: Display 11529215049243506835 (Virtual display): displayName="Emulator 2D Display" uniqueId="..."
const DISPLAY_PATTERN = /^Display\s+(\d+)\s+\((?:HWC\s+display\s+(\d+)|Virtual\s+display)\):.*?displayName="([^"]*)"/gm;

/**
 * Parses SurfaceFlinger display output to extract display information.
 * @param displaysInfo - The raw output from `adb shell dumpsys SurfaceFlinger --display-id`
 * @returns A record mapping display IDs to their information (without payload)
 */
export function parseSurfaceFlingerDisplays(
  displaysInfo: string
): Record<string, Partial<Screenshot>> {
  const infos: Record<string, Partial<Screenshot>> = {};
  const lines = displaysInfo.split('\n');

  for (const line of lines) {
    let match: RegExpExecArray | null;

    // Try to match display header line
    if ((match = DISPLAY_PATTERN.exec(line))) {
      const [, matchedDisplayId, hwcId, displayName] = match; // Skip match[0] (full match), then Display ID, HWC ID (optional), Display name

      // Determine if default: HWC display 0 is default, or first physical display if no HWC info
      const isDefault = hwcId !== undefined
        ? hwcId === '0'
        : !line.includes('Virtual') && Object.keys(infos).length === 0;

      infos[matchedDisplayId] = {
        id: matchedDisplayId,
        isDefault,
        name: displayName || undefined,
      };

      // Reset regex lastIndex for next iteration
      DISPLAY_PATTERN.lastIndex = 0;
    }
  }

  return infos;
}

/**
 * Takes a screenshot of the current viewport
 */
export async function mobileViewportScreenshot(
  this: AndroidUiautomator2Driver
): Promise<string> {
  return await this.getViewportScreenshot();
}

/**
 * Gets a screenshot of the current viewport
 */
export async function getViewportScreenshot(
  this: AndroidUiautomator2Driver
): Promise<string> {
  const screenshot = await this.getScreenshot();
  const rect = await this.getViewPortRect();
  return await imageUtil.cropBase64Image(screenshot, rect);
}

/**
 * Gets a screenshot of the current screen
 */
export async function getScreenshot(
  this: AndroidUiautomator2Driver
): Promise<string> {
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
    await this.uiautomator2.jwproxy.command('/screenshot', 'GET')
  );
}

/**
 * Retrieves screenshots of each display available to Android.
 * This functionality is only supported since Android 10.
 * @param displayId - Android display identifier to take a screenshot for.
 * If not provided then screenshots of all displays are going to be returned.
 * If no matches were found then an error is thrown.
 */
export async function mobileScreenshots(
  this: AndroidUiautomator2Driver,
  displayId?: number | string
): Promise<StringRecord<Screenshot>> {
  const displaysInfo = await this.adb.shell([
    'dumpsys',
    'SurfaceFlinger',
    '--display-id',
  ]);
  const infos = parseSurfaceFlingerDisplays(displaysInfo);
  if (_.isEmpty(infos)) {
    this.log.debug(displaysInfo);
    throw new Error('Cannot determine the information about connected Android displays');
  }
  this.log.info(`Parsed Android display infos: ${JSON.stringify(infos)}`);

  const toB64Screenshot = async (dispId: string): Promise<string> =>
    (await this.adb.takeScreenshot(dispId)).toString('base64');

  const displayIdStr: string | null =
    _.isNil(displayId) || displayId === ''
      ? null
      : String(displayId);

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
      } as Screenshot,
    };
  }

  const allInfos = _.values(infos).filter((info): info is Partial<Screenshot> & {id: string} => !!info?.id);
  const screenshots = await B.all(allInfos.map((info) => toB64Screenshot(info.id)));
  for (const [info, payload] of _.zip(allInfos, screenshots) as Array<[Partial<Screenshot>, string]>) {
    if (info && payload) {
      info.payload = payload;
    }
  }
  return infos as StringRecord<Screenshot>;
}

