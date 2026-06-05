#!/bin/bash
# Lists functional e2e spec files. With a batch number 1-5, prints that shard only.
# Keep batches balanced when adding or removing spec files.

set -euo pipefail

TOTAL_BATCHES=5

SPECS=(
  test/functional/commands/file-movement-e2e-specs.ts
  test/functional/commands/find/by-accessibility-id-e2e-specs.ts
  test/functional/commands/find/by-css-e2e-specs.ts
  test/functional/commands/find/by-id-e2e-specs.ts
  test/functional/commands/find/by-image-e2e-specs.ts
  test/functional/commands/find/by-uiautomator-e2e-specs.ts
  test/functional/commands/find/by-xpath-e2e-specs.ts
  test/functional/commands/find/find-basic-e2e-specs.ts
  test/functional/commands/find/find-system-ui-el-e2e-specs.ts
  test/functional/commands/find/from-el-e2e-specs.ts
  test/functional/commands/find/invalid-strategy-e2e-specs.ts
  test/functional/commands/general/attribute-e2e-specs.ts
  test/functional/commands/general/context-e2e-specs.ts
  test/functional/commands/general/element-e2e-specs.ts
  test/functional/commands/general/general-e2e-specs.ts
  test/functional/commands/general/mobile-command-e2e-specs.ts
  test/functional/commands/general/network-e2e-specs.ts
  test/functional/commands/general/source-e2e-specs.ts
  test/functional/commands/general/url-e2e-specs.ts
  test/functional/commands/keyboard/keyboard-e2e-specs.ts
  test/functional/commands/orientation-e2e-specs.ts
  test/functional/commands/strings-e2e-specs.ts
  test/functional/commands/viewport-e2e-specs.ts
  test/functional/driver/driver-e2e-specs.ts
  test/functional/driver/session-claim-e2e-specs.ts
)

if [[ "${1:-}" == "" ]]; then
  printf '%s\n' "${SPECS[@]}"
  exit 0
fi

BATCH="$1"
if ! [[ "$BATCH" =~ ^[1-5]$ ]]; then
  echo "Batch must be 1..${TOTAL_BATCHES}, got: $BATCH" >&2
  exit 1
fi

COUNT=${#SPECS[@]}
PER_BATCH=$(( (COUNT + TOTAL_BATCHES - 1) / TOTAL_BATCHES ))
START=$(( (BATCH - 1) * PER_BATCH ))
END=$(( START + PER_BATCH ))
if [[ $END -gt $COUNT ]]; then
  END=$COUNT
fi

for ((i = START; i < END; i++)); do
  echo "${SPECS[$i]}"
done
