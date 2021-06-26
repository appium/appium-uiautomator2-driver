## The UiAutomator2 Driver for Android

### Server Arguments

Appium 2.0 Usage: `node . --driver-args='{"uiautomator2": {[argName]: [argValue]}}'`

<expand_table>

|Argument|Default|Description|Example|
|----|-------|-----------|-------|

|`"reboot"`|false|reboot emulator after each session and kill it at the end|`--driver-args='{"uiautomator2": {"reboot": true}}'`|
|`"suppressKillServer"`|false| If set, prevents Appium from killing the adb server instance|`--driver-args='{"uiautomator2": {"suppressKillServer": true}}'`|
|`"chromeDriverPort"`|9515|Port upon which ChromeDriver will run|`--driver-args='{"uiautomator2": {"chromeDriverPort": 9515}}'`|
|`"chromedriverExecutable"`|null|ChromeDriver executable full path|`--driver-args='{"uiautomator2": {"chromedriverExecutable": "/path/to/chromedriverExecutable"}}'`|