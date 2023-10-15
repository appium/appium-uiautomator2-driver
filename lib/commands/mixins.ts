/**
 * @module
 * @privateRemarks These mixins are kind of a mishmash of stuff from `appium-android-driver`,
 * @privateRemarks unique things, and stuff from `ExternalDriver`. Ideally, we should be pulling the method
 * @privateRemarks definitions right out of `ExternalDriver` whenever possible.  Also note that the mixins
 * @privateRemarks contain _more stuff than just commands or execute methods_.
 */

import type {Element, ExternalDriver, StringRecord} from '@appium/types';
import type {
  ActionsMixin,
  AlertMixin,
  ElementMixin,
  ExecuteMixin,
  FindMixin,
  GeneralMixin,
  NetworkMixin,
  TouchMixin,
} from 'appium-android-driver';
import type {EmptyObject} from 'type-fest';
import {AndroidUiautomator2Driver} from '../driver';
import type * as types from './types';

type UIA2Mixin<T = EmptyObject> = ThisType<import('../driver').AndroidUiautomator2Driver> & T;

export type UIA2ActionsMixin = UIA2Mixin<
  Pick<
    ActionsMixin,
    'pressKeyCode' | 'longPressKeyCode' | 'doSwipe' | 'doDrag' | 'getOrientation' | 'setOrientation'
  >
> & {
  mobilePressKey(opts: types.PressKeyOptions): Promise<void>;
  mobileScheduleAction(opts?: StringRecord): Promise<unknown>;
  mobileGetActionHistory(opts?: types.ActionArgs): Promise<types.ActionResult>;
  mobileUnscheduleAction(opts?: types.ActionArgs): Promise<unknown>;
};

export type UIA2AlertMixin = UIA2Mixin<
  Pick<AlertMixin, 'getAlertText' | 'postAcceptAlert' | 'postDismissAlert'>
> & {
  mobileAcceptAlert(opts?: types.AcceptAlertOptions): Promise<void>;
  mobileDismissAlert(opts?: types.DismissAlertOptions): Promise<void>;
};

export type UIA2AppStringsMixin = UIA2Mixin<Pick<GeneralMixin, 'getStrings'>> & {
  mobileGetAppStrings(opts?: types.GetAppStringsOptions): Promise<StringRecord>;
};

export type UIA2BatteryMixin = UIA2Mixin & {
  mobileGetBatteryInfo(): Promise<types.BatteryInfo>;
};

export type UIA2ElementMixin = UIA2Mixin<
  Pick<
    ElementMixin,
    | 'getAttribute'
    | 'elementDisplayed'
    | 'elementEnabled'
    | 'elementSelected'
    | 'getName'
    | 'getLocation'
    | 'getSize'
    | 'touchLongClick'
    | 'touchDown'
    | 'touchUp'
    | 'touchMove'
    | 'doSetElementValue'
    | 'setValueImmediate'
    | 'getText'
    | 'click'
    | 'tap'
    | 'clear'
    | 'getElementRect'
  >
> & {
  active(): Promise<Element>;
  mobileReplaceElementValue(opts: types.ReplaceValueOptions): Promise<void>;
  getElementScreenshot(elementId: string): Promise<string>;
};

export type UIA2FindMixin = UIA2Mixin<Pick<FindMixin, 'doFindElementOrEls'>>;

export type UIA2GeneralMixin = UIA2Mixin<
  Pick<
    GeneralMixin & NetworkMixin & ActionsMixin & ExecuteMixin,
    | 'getPageSource'
    | 'doSendKeys'
    | 'back'
    | 'getDisplayDensity'
    | 'getWindowSize'
    | 'getWindowRect'
    | 'setUrl'
    | 'keyevent'
    | 'execute'
    | 'executeMobile'
  >
> & {
  getClipboard(): Promise<string>;
  mobileViewportScreenshot(): Promise<string>;
  mobileViewPortRect(): Promise<types.RelativeRect>;
  mobileDeepLink(opts: types.DeepLinkOpts): Promise<void>;
  openNotifications(): Promise<void>;
  suspendChromedriverProxy(): void;
  mobileGetDeviceInfo(): Promise<StringRecord>;
  mobileType(opts: types.TypingOptions): Promise<boolean>;
  mobileInstallMultipleApks(opts: types.InstallMultipleApksOptions): Promise<void>;
  mobileBackgroundApp(opts?: types.BackgroundAppOptions): Promise<void>;
};

export type UIA2ViewportMixin = UIA2Mixin & {
  getStatusBarHeight(): Promise<number>;
  getDevicePixelRatio(): Promise<string>;
  getViewportScreenshot(): Promise<string>;
  getViewPortRect(): Promise<types.RelativeRect>;
};

export type UIA2GesturesMixin = UIA2Mixin & {
  mobileClickGesture(opts?: types.ClickOptions): Promise<void>;
  mobileDoubleClickGesture(opts?: types.ClickOptions): Promise<void>;
  mobileDragGesture(opts: types.DragOptions): Promise<void>;
  mobileFlingGesture(opts: types.FlingOptions): Promise<boolean>;
  mobilePinchCloseGesture(opts: types.PinchOptions): Promise<void>;
  mobilePinchOpenGesture(opts: types.PinchOptions): Promise<void>;
  mobileSwipeGesture(opts: types.SwipeOptions): Promise<void>;
  mobileScrollGesture(opts: types.ScrollGestureOptions): Promise<boolean>;
  mobileScrollBackTo(opts: types.ScrollElementToElementOpts): Promise<void>;
  mobileScroll(opts: types.ScrollOptions): Promise<void>;
  mobileLongClickGesture(opts: types.LongClickOptions): Promise<void>;
};

export type UIA2ScreenshotMixin = UIA2Mixin<Pick<ActionsMixin, 'getScreenshot'>> & {
  mobileScreenshots(opts: types.ScreenshotsOpts): Promise<StringRecord<types.Screenshot>>;
};

export type UIA2TouchMixin = UIA2Mixin<
  // Required needed because ExternalDriver's methods are all optional
  Required<
    Pick<ExternalDriver & TouchMixin, 'performActions' | 'releaseActions' | 'doPerformMultiAction'>
  >
>;

declare module '../driver' {
  interface AndroidUiautomator2Driver
    extends UIA2ActionsMixin,
      UIA2AlertMixin,
      UIA2AppStringsMixin,
      UIA2BatteryMixin,
      UIA2ElementMixin,
      UIA2FindMixin,
      UIA2GeneralMixin,
      UIA2GesturesMixin,
      UIA2ScreenshotMixin,
      UIA2TouchMixin,
      UIA2ViewportMixin {}
}

/**
 * This function assigns a mixin `T` to the `AndroidUiautomator2Driver` class' prototype.
 *
 * While each mixin has its own interface which is (in isolation) unrelated to
 * `AndroidUiautomator2Driver`, the constraint on this generic type `T` is that it must be a
 * partial of `AndroidUiautomator2Driver`'s interface. This enforces that it does not
 * conflict with the existing interface of `AndroidUiautomator2Driver`.  In that way, you
 * can think of it as a type guard.
 * @param mixin Mixin implementation
 */
export function mixin<T extends Partial<AndroidUiautomator2Driver>>(mixin: T): void {
  Object.assign(AndroidUiautomator2Driver.prototype, mixin);
}
