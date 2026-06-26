#!/bin/bash
# Lists functional e2e spec files. With a batch number 1-5, prints that shard only.
# Specs are discovered from source and mapped to build paths because this script
# runs before `npm run build` in CI.

set -euo pipefail

TOTAL_BATCHES=5
SPEC_SOURCE_ROOT=${E2E_SPEC_SOURCE_ROOT:-test/functional}

list_specs() {
  if [[ ! -d "$SPEC_SOURCE_ROOT" ]]; then
    return
  fi
  find "$SPEC_SOURCE_ROOT" -type f -name '*-e2e-specs.ts' \
    | LC_ALL=C sort \
    | sed 's#^test/#build/test/#; s#\.ts$#.js#'
}

COUNT=$(list_specs | wc -l | tr -d '[:space:]')
if [[ "$COUNT" -eq 0 ]]; then
  echo "No functional e2e spec files found under ${SPEC_SOURCE_ROOT}" >&2
  exit 1
fi

if [[ "${1:-}" == "" ]]; then
  list_specs
  exit 0
fi

BATCH="$1"
if ! [[ "$BATCH" =~ ^[0-9]+$ ]] || ((BATCH < 1 || BATCH > TOTAL_BATCHES)); then
  echo "Batch must be 1..${TOTAL_BATCHES}, got: $BATCH" >&2
  exit 1
fi

PER_BATCH=$(( (COUNT + TOTAL_BATCHES - 1) / TOTAL_BATCHES ))
START=$(( (BATCH - 1) * PER_BATCH ))
END=$(( START + PER_BATCH ))
if [[ $END -gt $COUNT ]]; then
  END=$COUNT
fi

list_specs | awk -v start="$START" -v end="$END" 'NR > start && NR <= end {print}'
