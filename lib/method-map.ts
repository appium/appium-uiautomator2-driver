import {AndroidDriver} from 'appium-android-driver';

export const newMethodMap = {
  ...AndroidDriver.newMethodMap,
  '/session/:sessionId/appium/device/get_clipboard': {
    POST: {
      command: 'getClipboard',
      payloadParams: {optional: ['contentType']},
      deprecated: true
    },
  },
  '/session/:sessionId/log': {
    POST: {
      command: 'getLog',
      payloadParams: {required: ['type']},
    },
  },
  '/session/:sessionId/log/types': {
    GET: {
      command: 'getLogTypes',
    },
  },
} as const;
