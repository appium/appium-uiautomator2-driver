
Appium UiAutomator2 Driver is a test automation framework for Android devices. Appium UiAutomator2 Driver automates native, hybrid and mobile web apps, tested on emulators and real devices. Appium UiAutomator2 Driver is part of the [Appium](https://github.com/appium/appium) mobile test automation tool.

*Note*: Issue tracking for this repo has been disabled. Please use the [main Appium issue tracker](https://github.com/appium/appium/issues) instead.

## Installation
```
npm install appium-uiautomator2-driver
```

## Usage
Import Android Driver, set [desired capabilities](http://appium.io/slate/en/1.5/?javascript#appium-server-capabilities) and create a session:

```
import { AndroidUiautomator2Driver } from `appium-uiautomator2-driver`

let defaultCaps = {
  app: 'path/to/your.apk',
  deviceName: 'Android',
  platformName: 'Android',
  automationName: 'uiautomator2'
};

let driver = new AndroidUiautomator2Driver();
await driver.createSession(defaultCaps);
```

### Specifying and selecting devices/emulators
The driver will attempt to connect to a device/emulator based on these properties in the `desiredCapabilities` object:

1. `avd`: Launch or connect to the emulator with the given name.
1. `udid`: Connect to the device with the given UDID.
1. `platformVersion`: Connect to the first device or active emulator whose OS begins with the desired OS. This means `platformVersion: 5` will take the first `5x` device from the output of `adb devices` if there are multiple available.

If none of these capabilities are given, the driver will connect to the first device or active emulator returned from the output of `adb devices`.

If more than one of these capabilities are given, the driver will only use first the capability in the order above. That is, `avd` takes priority over `udid`, which takes priority over `platformVersion`.

### Custom binaries url

To use a mirror of the UIAutomator 2 driver binaries use npm config property `uiautomator2_driver_cdnurl`.
Default is `https://github.com/appium/appium-uiautomator2-server/releases/download`.

```bash
npm install appium-uiautomator2-driver --uiautomator2_driver_cdnurl=https://github.com/appium/appium-uiautomator2-server/releases/download
```

Or add the property into your [`.npmrc`](https://docs.npmjs.com/files/npmrc) file.

```bash
uiautomator2_driver_cdnurl=https://github.com/appium/appium-uiautomator2-server/releases/download
```

Another option is to use PATH variable `UIAUTOMATOR2_DRIVER_CDNURL`.

```bash
UIAUTOMATOR2_DRIVER_CDNURL=https://github.com/appium/appium-uiautomator2-server/releases/download npm install appium-uiautomator2-driver
```

## API Notes

`lock` behaves differently in Android than it does in iOS. In Android it does not take any arguments, and locks the screen and returns immediately.


## Watch

```
npm run watch
```

## Test

```
npm test
```
