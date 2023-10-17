import type {DriverCaps, DriverOpts, W3CDriverCaps} from '@appium/types';
import type {EmptyObject} from 'type-fest';
import type {RelativeRect} from './commands/types';
import type {Uiautomator2Constraints} from './constraints';

export type Uiautomator2DriverOpts = DriverOpts<Uiautomator2Constraints>;

export type Uiautomator2DriverCaps = DriverCaps<Uiautomator2Constraints>;

export type W3CUiautomator2DriverCaps = W3CDriverCaps<Uiautomator2Constraints>;

export interface Uiautomator2SessionInfo {
  deviceName: string;
  deviceUDID: string;
}

export interface Uiautomator2DeviceDetails {
  pixelRatio: string;
  statBarHeight: number;
  viewportRect: RelativeRect;
  deviceApiLevel: number;
  deviceScreenSize: string;
  deviceScreenDensity: string;
  deviceModel: string;
  deviceManufacturer: string;
  platformVersion: string;
}

export interface Uiautomator2ServerInfo {
  platform: 'LINUX';
  webStorageEnabled: false;
  takesScreenshot: true;
  javascriptEnabled: true;
  databaseEnabled: false;
  networkConnectionEnabled: true;
  locationContextEnabled: false;
  warnings: EmptyObject;
  desired: Uiautomator2DriverCaps;
}

export interface Uiautomator2StartSessionOpts
  extends Uiautomator2DriverCaps,
    Uiautomator2ServerInfo {}

export interface Uiautomator2SessionCaps
  extends Uiautomator2ServerInfo,
    Uiautomator2SessionInfo,
    Partial<Uiautomator2DeviceDetails> {}

export interface Uiautomator2Settings {
  ignoreUnimportantViews: boolean;
  allowInvisibleElements: boolean;
}
