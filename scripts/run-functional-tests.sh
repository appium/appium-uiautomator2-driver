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
}

checkTestPrerequisites

RESULTS_JSON=test-results.ndjson
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
mapfile -t SPEC_FILES < <("$SCRIPT_DIR/e2e-spec-batches.sh" "${E2E_BATCH:-}")

if [[ -n "${E2E_BATCH:-}" ]]; then
  echo "Running functional e2e batch ${E2E_BATCH} (${#SPEC_FILES[@]} spec files)"
fi

npm run build
if ! node \
  --test \
  --test-concurrency=1 \
  --test-timeout=600000 \
  --test-reporter=spec \
  --test-reporter-destination=stdout \
  --test-reporter="./scripts/node-test-json-reporter.mjs" \
  --test-reporter-destination="$RESULTS_JSON" \
  "${SPEC_FILES[@]}"; then
  if [[ ! -f "$RESULTS_JSON" ]]; then
    echo "Node test runner failed before writing $RESULTS_JSON"
    exit 1
  fi
  tests=$(jq -s 'map(select(.type == "test:summary" and (.data.file | not))) | last | .data.counts.tests' "$RESULTS_JSON")
  errors=$(jq -s 'map(select(.type == "test:summary" and (.data.file | not))) | last | .data.counts.cancelled' "$RESULTS_JSON")
  skipped=$(jq -s 'map(select(.type == "test:summary" and (.data.file | not))) | last | .data.counts.skipped' "$RESULTS_JSON")
  failures=$(jq -s 'map(select(.type == "test:summary" and (.data.file | not))) | last | .data.counts.failed' "$RESULTS_JSON")
  if [[ $tests -eq $skipped ]]; then
    echo "All tests were skipped"
    exit 0
  fi
  threshold=$(((failures + errors) * 100 / (tests - skipped)))
  if [[ $threshold -gt $TEST_PASS_THRESHOLD ]]; then
    echo "${threshold}% of tests failed"
    exit 1
  else
    echo "${threshold}% of tests failed. This is (probably) fine"
  fi
fi
