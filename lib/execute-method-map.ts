import { ExecuteMethodMap } from '@appium/types';
import { AndroidDriver } from 'appium-android-driver';

export const executeMethodMap = {
  ...AndroidDriver.executeMethodMap,

  'mobile: dragGesture': {
    command: 'mobileDragGesture',
    params: {
      optional: [
        'elementId',
        'startX',
        'startY',
        'endX',
        'endY',
        'speed',
      ],
    },
  },
  'mobile: flingGesture': {
    command: 'mobileFlingGesture',
    params: {
      required: [
        'direction',
      ],
      optional: [
        'elementId',
        'left',
        'top',
        'width',
        'height',
        'speed',
      ],
    },
  },
  'mobile: doubleClickGesture': {
    command: 'mobileDoubleClickGesture',
    params: {
      optional: [
        'elementId',
        'x',
        'y',
      ],
    },
  },
  'mobile: clickGesture': {
    command: 'mobileClickGesture',
    params: {
      optional: [
        'elementId',
        'x',
        'y',
      ],
    },
  },
  'mobile: longClickGesture': {
    command: 'mobileLongClickGesture',
    params: {
      optional: [
        'elementId',
        'x',
        'y',
        'duration',
      ],
    },
  },
  'mobile: pinchCloseGesture': {
    command: 'mobilePinchCloseGesture',
    params: {
      required: [
        'percent',
      ],
      optional: [
        'elementId',
        'left',
        'top',
        'width',
        'height',
        'speed',
      ],
    },
  },
  'mobile: pinchOpenGesture': {
    command: 'mobilePinchOpenGesture',
    params: {
      required: [
        'percent',
      ],
      optional: [
        'elementId',
        'left',
        'top',
        'width',
        'height',
        'speed',
      ],
    },
  },
  'mobile: swipeGesture': {
    command: 'mobileSwipeGesture',
    params: {
      required: [
        'direction',
        'percent',
      ],
      optional: [
        'elementId',
        'left',
        'top',
        'width',
        'height',
        'speed',
      ],
    },
  },
  'mobile: scrollGesture': {
    command: 'mobileScrollGesture',
    params: {
      required: [
        'direction',
        'percent',
      ],
      optional: [
        'elementId',
        'left',
        'top',
        'width',
        'height',
        'speed',
      ],
    },
  },
  'mobile: scrollBackTo': {
    command: 'mobileScrollBackTo',
    params: {
      required: [
        'elementId',
        'elementToId',
      ],
    },
  },
  'mobile: scroll': {
    command: 'mobileScroll',
    params: {
      required: [
        'strategy',
        'selector',
      ],
      optional: [
        'elementId',
        'maxSwipes',
      ],
    },
  },

  'mobile: viewportScreenshot': {
    command: 'mobileViewportScreenshot',
  },
  'mobile: viewportRect': {
    command: 'mobileViewPortRect',
  },

  'mobile: deepLink': {
    command: 'mobileDeepLink',
    params: {
      required: ['url'],
      optional: ['package', 'waitForLaunch'],
    }
  },

  'mobile: acceptAlert': {
    command: 'mobileAcceptAlert',
    params: {
      optional: ['buttonLabel'],
    }
  },
  'mobile: dismissAlert': {
    command: 'mobileDismissAlert',
    params: {
      optional: ['buttonLabel'],
    }
  },

  'mobile: batteryInfo': {
    command: 'mobileGetBatteryInfo',
  },

  'mobile: deviceInfo': {
    command: 'mobileGetDeviceInfo',
  },

  'mobile: openNotifications': {
    command: 'openNotifications',
  },

  'mobile: type': {
    command: 'mobileType',
    params: {
      required: ['text'],
    }
  },
  'mobile: replaceElementValue': {
    command: 'mobileReplaceElementValue',
    params: {
      required: ['elementId', 'text'],
    }
  },

  'mobile: installMultipleApks': {
    command: 'mobileInstallMultipleApks',
    params: {
      required: ['apks'],
      optional: ['options'],
    }
  },

  'mobile: pressKey': {
    command: 'mobilePressKey',
    params: {
      required: ['keycode'],
      optional: ['metastate', 'flags', 'isLongPress'],
    }
  },

  'mobile: screenshots': {
    command: 'mobileScreenshots',
    params: {
      optional: ['displayId'],
    }
  },

  'mobile: scheduleAction': {
    command: 'mobileScheduleAction',
    params: {
      required: ['name', 'steps'],
      optional: ['maxPass', 'maxFail', 'times', 'intervalMs', 'maxHistoryItems'],
    }
  },
  'mobile: getActionHistory': {
    command: 'mobileGetActionHistory',
    params: {
      required: ['name'],
    }
  },
  'mobile: unscheduleAction': {
    command: 'mobileUnscheduleAction',
    params: {
      required: ['name'],
    }
  },

  'mobile: setClipboard': {
    command: 'setClipboard',
    params: {
      required: ['content'],
      optional: ['contentType', 'label'],
    }
  },
  'mobile: getClipboard': {
    command: 'getClipboard',
  },

  'mobile: resetAccessibilityCache': {
    command: 'mobileResetAccessibilityCache',
  },

  'mobile: listWindows': {
    command: 'mobileListWindows',
    params: {
      optional: ['filters', 'skipScreenshots'],
    },
  },

  'mobile: listDisplays': {
    command: 'mobileListDisplays',
  },
} as const satisfies ExecuteMethodMap<any>;
