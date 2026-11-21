#!/usr/bin/env bash
# Checks that the Swift engine used by the widget fallback and the watch
# (targets/shared) agrees with lunar-javascript, the phone app's engine, on
# Month Pillar, 宜 and 忌 for every day from 2020 to 2060 (issue #41).
#
# Usage, from the repo root (macOS with Xcode command-line tools):
#   scripts/verify-swift-almanac/verify.sh [from=2020-01-01] [to=2060-12-31]
set -euo pipefail
cd "$(dirname "$0")/../.."
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

node scripts/verify-swift-almanac/expected.js "$@" > "$tmp/expected.json"
cp scripts/verify-swift-almanac/verify.swift "$tmp/main.swift"
swiftc -O targets/shared/LunarCalculator.swift targets/shared/AlmanacData.swift "$tmp/main.swift" -o "$tmp/verify"
"$tmp/verify" "$tmp/expected.json"
