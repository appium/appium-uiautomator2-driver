#!/bin/bash

# If a developer has an incorrect local setup, we want to tell them clearly, instead of them needing to read cryptic test failures.
checkTestPrerequisites() {
    # Check if Appium server is running on default port (4567)
    APPIUM_PORT=${APPIUM_TEST_SERVER_PORT:-4567}
    APPIUM_HOST=${APPIUM_TEST_SERVER_HOST:-127.0.0.1}
    if ! curl -s "http://${APPIUM_HOST}:${APPIUM_PORT}/status" > /dev/null; then
        echo "Error: Appium server is not running on ${APPIUM_HOST}:${APPIUM_PORT}"
        echo "Please start the Appium server first with: appium server -p ${APPIUM_PORT}, or set APPIUM_TEST_SERVER_HOST and APPIUM_TEST_SERVER_PORT environment variables"
        exit 1
    fi

    # Check if any Android device is connected
    if ! adb devices | grep -q "device$"; then
        echo "Error: No Android device connected"
        echo "Please connect an Android device or start an emulator"
        echo "Current devices list:"
        adb devices
        exit 1
    fi

    # Check if android-apidemos is installed
    if [ ! -f "node_modules/android-apidemos/apks/ApiDemos-debug.apk" ]; then
        echo "Error: android-apidemos package not found"
        echo "Installing android-apidemos package..."
        npm install android-apidemos --save-dev
    fi
}

checkTestPrerequisites

RESULTS_XML=test-results.xml
echo "{\"reporterEnabled\": \"spec, xunit\", \"xunitReporterOptions\": {\"output\": \"$RESULTS_XML\"}}" > reporter_config.json
ARGS=(./test/functional/driver-e2e-specs.js \
./test/functional/commands \
./test/functional/commands/find \
./test/functional/commands/general \
./test/functional/commands/keyboard \
--exit --timeout 10m \
--reporter mocha-multi-reporters --reporter-options configFile=reporter_config.json)
if ! npx mocha "${ARGS[@]}"; then
  tests=$(cat "$RESULTS_XML" | xq --xpath '//testsuite/@tests')
  errors=$(cat "$RESULTS_XML" | xq --xpath '//testsuite/@errors')
  skipped=$(cat "$RESULTS_XML" | xq --xpath '//testsuite/@skipped')
  failures=$(cat "$RESULTS_XML" | xq --xpath '//testsuite/@failures')
  threshold=$(( (failures + errors) * 100 / (tests - skipped) ))
  cat "$RESULTS_XML"
  if [[ $threshold -gt $TEST_PASS_THRESHOLD ]]; then
    echo "${threshold}% of tests failed"
    exit 1
  else
    echo "${threshold}% of tests failed. This is (probably) fine"
  fi
fi
