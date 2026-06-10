#!/usr/bin/env bash

set -uo pipefail

checks=(
  "Frontend|http://localhost:5173"
  "Backend PDF integration|http://localhost:4000/api/pdf/health"
  "Primary Flask PDF service|http://localhost:5000/health"
  "OMR service|http://localhost:8001/health"
)

failed=0

for check in "${checks[@]}"; do
  name="${check%%|*}"
  url="${check#*|}"

  if curl --fail --silent --show-error --max-time 5 "$url" >/dev/null; then
    printf 'PASS  %s (%s)\n' "$name" "$url"
  else
    printf 'FAIL  %s (%s)\n' "$name" "$url"
    failed=1
  fi
done

exit "$failed"

