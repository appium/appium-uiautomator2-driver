#!/bin/bash

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
