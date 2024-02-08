/**
 * @privateRemarks This was created by hand from the type definitions in `lib/commands` here and in `appium-android-driver`.
 * @module
 */

export const executeMethodMap = {
  'mobile: shell': {
    command: 'mobileShell',
    params: {
      required: ['command'],
      optional: ['args', 'timeout', 'includeStderr'],
    },
  },
  'mobile: execEmuConsoleCommand': {
    command: 'mobileExecEmuConsoleCommand',
    params: {
      required: ['command'],
      optional: ['execTimeout', 'connTimeout', 'initTimeout'],
    },
  },
  'mobile: dragGesture': {
    command: 'mobileDragGesture',
    params: {
      optional: ['elementId', 'startX', 'startY', 'endX', 'endY', 'speed'],
    },
  },
  'mobile: flingGesture': {
    command: 'mobileFlingGesture',
    params: {
      required: ['direction'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed'],
    },
  },
  'mobile: doubleClickGesture': {
    command: 'mobileDoubleClickGesture',
    params: {
      optional: ['elementId', 'x', 'y'],
    },
  },
  'mobile: clickGesture': {
    command: 'mobileClickGesture',
    params: {
      optional: ['elementId', 'x', 'y'],
    },
  },
  'mobile: longClickGesture': {
    command: 'mobileLongClickGesture',
    params: {
      optional: ['elementId', 'x', 'y', 'duration'],
    },
  },
  'mobile: pinchCloseGesture': {
    command: 'mobilePinchCloseGesture',
    params: {
      required: ['percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed'],
    },
  },
  'mobile: pinchOpenGesture': {
    command: 'mobilePinchOpenGesture',
    params: {
      required: ['percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed'],
    },
  },
  'mobile: swipeGesture': {
    command: 'mobileSwipeGesture',
    params: {
      required: ['direction', 'percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed'],
    },
  },
  'mobile: scrollGesture': {
    command: 'mobileScrollGesture',
    params: {
      required: ['direction', 'percent'],
      optional: ['elementId', 'left', 'top', 'width', 'height', 'speed'],
    },
  },
  'mobile: scrollBackTo': {
    command: 'mobileScrollBackTo',
    params: {
      required: ['elementId', 'elementToId'],
    },
  },
  'mobile: scroll': {
    command: 'mobileScroll',
    params: {
      required: ['strategy', 'selector'],
      optional: ['elementId', 'maxSwipes', 'element'],
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
      required: ['url', 'package'],
      optional: ['waitForLaunch'],
    },
  },

  'mobile: startLogsBroadcast': {
    command: 'mobileStartLogsBroadcast',
  },
  'mobile: stopLogsBroadcast': {
    command: 'mobileStopLogsBroadcast',
  },

  'mobile: deviceidle': {
    command: 'mobileDeviceidle',
    params: {
      required: ['action'],
      optional: ['packages'],
    },
  },

  'mobile: acceptAlert': {
    command: 'mobileAcceptAlert',
    params: {
      optional: ['buttonLabel'],
    },
  },
  'mobile: dismissAlert': {
    command: 'mobileDismissAlert',
    params: {
      optional: ['buttonLabel'],
    },
  },

  'mobile: batteryInfo': {
    command: 'mobileGetBatteryInfo',
  },

  'mobile: deviceInfo': {
    command: 'mobileGetDeviceInfo',
  },

  'mobile: getDeviceTime': {
    command: 'mobileGetDeviceTime',
    params: {
      optional: ['format'],
    },
  },

  'mobile: changePermissions': {
    command: 'mobileChangePermissions',
    params: {
      required: ['permissions'],
      optional: ['appPackage', 'action', 'target'],
    },
  },
  'mobile: getPermissions': {
    command: 'mobileGetPermissions',
    params: {
      optional: ['type', 'appPackage'],
    },
  },

  'mobile: performEditorAction': {
    command: 'mobilePerformEditorAction',
    params: {
      required: ['action'],
    },
  },

  'mobile: startScreenStreaming': {
    command: 'mobileStartScreenStreaming',
    params: {
      optional: [
        'width',
        'height',
        'bitrate',
        'host',
        'pathname',
        'tcpPort',
        'port',
        'quality',
        'considerRotation',
        'logPipelineDetails',
      ],
    },
  },
  'mobile: stopScreenStreaming': {
    command: 'mobileStopScreenStreaming',
  },

  'mobile: getNotifications': {
    command: 'mobileGetNotifications',
  },
  'mobile: openNotifications': {
    command: 'openNotifications',
  },

  'mobile: listSms': {
    command: 'mobileListSms',
    params: {
      optional: ['max'],
    },
  },

  'mobile: type': {
    command: 'mobileType',
    params: {
      required: ['text'],
    },
  },
  'mobile: replaceElementValue': {
    command: 'mobileReplaceElementValue',
    params: {
      required: ['elementId', 'text'],
    },
  },

  'mobile: pushFile': {
    command: 'mobilePushFile',
    params: {
      required: ['payload', 'remotePath'],
    },
  },
  'mobile: pullFile': {
    command: 'mobilePullFile',
    params: {
      required: ['remotePath'],
    },
  },
  'mobile: pullFolder': {
    command: 'mobilePullFolder',
    params: {
      required: ['remotePath'],
    },
  },
  'mobile: deleteFile': {
    command: 'mobileDeleteFile',
    params: {
      required: ['remotePath'],
    },
  },

  'mobile: isAppInstalled': {
    command: 'mobileIsAppInstalled',
    params: {
      required: ['appId'],
    },
  },
  'mobile: queryAppState': {
    command: 'mobileQueryAppState',
    params: {
      required: ['appId'],
    },
  },
  'mobile: activateApp': {
    command: 'mobileActivateApp',
    params: {
      required: ['appId'],
    },
  },
  'mobile: removeApp': {
    command: 'mobileRemoveApp',
    params: {
      required: ['appId'],
      optional: ['timeout', 'keepData'],
    },
  },
  'mobile: terminateApp': {
    command: 'mobileTerminateApp',
    params: {
      required: ['appId'],
      optional: ['timeout'],
    },
  },
  'mobile: installApp': {
    command: 'mobileInstallApp',
    params: {
      required: ['appPath'],
      optional: ['timeout', 'allowTestPackages', 'useSdcard', 'grantPermissions', 'replace', 'checkVersion'],
    },
  },
  'mobile: clearApp': {
    command: 'mobileClearApp',
    params: {
      required: ['appId'],
    },
  },
  'mobile: backgroundApp': {
    command: 'mobileBackgroundApp',
    params: {
      optional: ['seconds'],
    },
  },
  'mobile: getCurrentActivity': {
    command: 'getCurrentActivity',
  },
  'mobile: getCurrentPackage': {
    command: 'getCurrentPackage',
  },

  'mobile: startActivity': {
    command: 'mobileStartActivity',
    params: {
      optional: ['wait', 'stop', 'windowingMode', 'activityType', 'display'],
    },
  },
  'mobile: startService': {
    command: 'mobileStartService',
    params: {
      optional: [
        'user',
        'intent',
        'action',
        'package',
        'uri',
        'mimeType',
        'identifier',
        'component',
        'categories',
        'extras',
        'flags',
        'wait',
        'stop',
        'windowingMode',
        'activityType',
        'display',
      ],
    },
  },
  'mobile: stopService': {
    command: 'mobileStopService',
    params: {
      optional: [
        'user',
        'intent',
        'action',
        'package',
        'uri',
        'mimeType',
        'identifier',
        'component',
        'categories',
        'extras',
        'flags',
      ],
    },
  },
  'mobile: broadcast': {
    command: 'mobileBroadcast',
    params: {
      optional: [
        'user',
        'intent',
        'action',
        'package',
        'uri',
        'mimeType',
        'identifier',
        'component',
        'categories',
        'extras',
        'flags',
        'receiverPermission',
        'allowBackgroundActivityStarts',
      ],
    },
  },

  'mobile: getContexts': {
    command: 'mobileGetContexts',
    params: {
      optional: ['waitForWebviewMs'],
    },
  },

  'mobile: getAppStrings': {
    command: 'mobileGetAppStrings',
    params: {
      optional: ['language'],
    },
  },

  'mobile: installMultipleApks': {
    command: 'mobileInstallMultipleApks',
    params: {
      required: ['apks'],
      optional: ['options'],
    },
  },

  'mobile: lock': {
    command: 'mobileLock',
    params: {
      optional: ['seconds'],
    },
  },
  'mobile: unlock': {
    command: 'mobileUnlock',
    params: {
      optional: ['key', 'type', 'strategy', 'timeoutMs'],
    },
  },
  'mobile: isLocked': {
    command: 'isLocked',
  },

  'mobile: refreshGpsCache': {
    command: 'mobileRefreshGpsCache',
    params: {
      optional: ['timeoutMs'],
    },
  },

  'mobile: startMediaProjectionRecording': {
    command: 'mobileStartMediaProjectionRecording',
    params: {
      optional: ['resolution', 'maxDurationSec', 'priority', 'filename'],
    },
  },
  'mobile: isMediaProjectionRecordingRunning': {
    command: 'mobileIsMediaProjectionRecordingRunning',
  },
  'mobile: stopMediaProjectionRecording': {
    command: 'mobileStopMediaProjectionRecording',
    params: {
      optional: [
        'remotePath',
        'user',
        'pass',
        'method',
        'headers',
        'fileFieldName',
        'formFields',
        'uploadTimeout',
      ],
    },
  },

  'mobile: getConnectivity': {
    command: 'mobileGetConnectivity',
    params: {
      optional: ['services'],
    },
  },
  'mobile: setConnectivity': {
    command: 'mobileSetConnectivity',
    params: {
      optional: ['wifi', 'data', 'airplaneMode'],
    },
  },
  'mobile: toggleGps': {
    command: 'toggleLocationServices',
  },
  'mobile: isGpsEnabled': {
    command: 'isLocationServicesEnabled',
  },

  'mobile: hideKeyboard': {
    command: 'hideKeyboard',
  },
  'mobile: isKeyboardShown': {
    command: 'isKeyboardShown',
  },

  'mobile: pressKey': {
    command: 'mobilePressKey',
    params: {
      required: ['keycode'],
      optional: ['metastate', 'flags', 'isLongPress'],
    },
  },

  'mobile: getDisplayDensity': {
    command: 'getDisplayDensity',
  },
  'mobile: getSystemBars': {
    command: 'getSystemBars',
  },

  'mobile: fingerprint': {
    command: 'mobileFingerprint',
    params: {
      required: ['fingerprintId'],
    },
  },
  'mobile: sendSms': {
    command: 'mobileSendSms',
    params: {
      required: ['phoneNumber', 'message'],
    },
  },
  'mobile: gsmCall': {
    command: 'mobileGsmCall',
    params: {
      required: ['phoneNumber', 'action'],
    },
  },
  'mobile: gsmSignal': {
    command: 'mobileGsmSignal',
    params: {
      required: ['strength'],
    },
  },
  'mobile: gsmVoice': {
    command: 'mobileGsmVoice',
    params: {
      required: ['state'],
    },
  },
  'mobile: powerAc': {
    command: 'mobilePowerAc',
    params: {
      required: ['state'],
    },
  },
  'mobile: powerCapacity': {
    command: 'mobilePowerCapacity',
    params: {
      required: ['percent'],
    },
  },
  'mobile: networkSpeed': {
    command: 'mobileNetworkSpeed',
    params: {
      required: ['speed'],
    },
  },
  'mobile: sensorSet': {
    command: 'sensorSet',
    params: {
      required: ['sensorType', 'value'],
    },
  },

  'mobile: getPerformanceData': {
    command: 'mobileGetPerformanceData',
    params: {
      required: ['packageName', 'dataType'],
    },
  },
  'mobile: getPerformanceDataTypes': {
    command: 'getPerformanceDataTypes',
  },

  'mobile: statusBar': {
    command: 'mobilePerformStatusBarCommand',
    params: {
      required: ['command'],
      optional: ['component'],
    },
  },

  'mobile: screenshots': {
    command: 'mobileScreenshots',
    params: {
      optional: ['displayId'],
    },
  },

  'mobile: scheduleAction': {
    command: 'mobileScheduleAction',
    params: {
      optional: ['opts'],
    },
  },
  'mobile: getActionHistory': {
    command: 'mobileGetActionHistory',
    params: {
      optional: ['opts'],
    },
  },
  'mobile: unscheduleAction': {
    command: 'mobileUnscheduleAction',
    params: {
      optional: ['opts'],
    },
  },

  'mobile: getUiMode': {
    command: 'mobileGetUiMode',
    params: {
      optional: ['opts'],
    },
  },
  'mobile: setUiMode': {
    command: 'mobileSetUiMode',
    params: {
      optional: ['opts'],
    },
  },

  'mobile: sendTrimMemory': {
    command: 'mobileSendTrimMemory',
    params: {
      optional: ['opts'],
    }
  },

} as const;

export type Uiautomator2ExecuteMethodMap = typeof executeMethodMap;
