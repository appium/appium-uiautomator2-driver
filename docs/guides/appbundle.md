---
title: Android App Bundle (.aab)
---

The UiAutomator2 driver supports the [Android App Bundle](https://developer.android.com/platform/technology/app-bundle/)
feature. This feature allows generating an `.aab` file, which is meant for uploading to the Google
Play Store.

## Generating the App Bundle

An `.aab` file can be managed via CLI using the official [bundletool](https://developer.android.com/studio/command-line/bundletool),
which is available from [Google's GitHub repo](https://github.com/google/bundletool).
[Google's App Bundle guide](https://developer.android.com/guide/app-bundle/) can also help
understand the feature.

## Running Tests

Before testing with Appium, the `.aab` file should be converted to an `.apks` file. Appium added
support for `.apks` files in [these](https://github.com/appium/appium-adb/pull/367) [PRs](https://github.com/appium/appium-base-driver/pull/271).

1. Ensure `bundletool.jar` is available in PATH
    - Appium will look for `bundletool.jar`. Ensure the path can be found with `which 'bundletool.jar'`.
    - bundletool version should be above 1.6.0
2. Generate the `.apks` file from the `.aab` file
    - `.aab` is available since Android Studio 3.2
    - Generating `.apks` from `.aab` requires app signing

    ```bash
    $ java -jar apks/bundletool.jar build-apks \
        --bundle apks/release/release/app.aab \ # Path to the input .aab file
        --output apks/AppBundleSample.apks \    # Path to the .apks file
        --ks apks/sign \                        # Signing keystore
        --ks-key-alias key0 \                   # Alias of the keytstore
        --ks-pass pass:kazucocoa \              # Password of the keystore
        --overwrite                             # Overwrite any existing apks files
    ```

3. Use the path to the `.apks` file in the [`appium:app`](../reference/capabilities.md#app) capability.

    ```ruby
    # Ruby
    capabilities = {
        platformName: :android,
        automationName: 'uiautomator2',
        platformVersion: '8.1',
        deviceName: 'Android Emulator',
        app: "path/to/the.apks",   # This line is important
        fullReset: true,
        ...
    }

    core = ::Appium::Core.for capabilities: capabilities
    driver = core.start_driver
    ```

The `.apks` bundle can also be installed using [`mobile: installApp`](../reference/execute-methods.md#mobile-installapp):

```ruby
# Ruby
driver.execute_script 'mobile: installApp', {appPath: 'path/to/your.apks'}
```

## Tips

### Make `bundletool.jar` executable

This can be done by running `chmod 655 /path/to/bundletool.jar`, for example.

### Test with different languages

Set [`appium:fullReset`](../reference/capabilities.md#fullreset) to `true` if testing the app with
different language resources.

Appium only installs the minimum set of resources, following the behavior of the appbundle feature.
For example, if a device's language is set of English, Appium will only install the `en` resource,
with any other languages being absent.

## Example Project

- <https://github.com/KazuCocoa/AppBundleSample>
