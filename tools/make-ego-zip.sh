#!/usr/bin/env bash
# Builds the zip for extensions.gnome.org submission.
# The EGO build has no self-updater: the review guidelines forbid
# downloading code, and EGO distributes updates itself.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/dist"
ZIP="$OUT/simple-claude-usage.shell-extension.zip"

mkdir -p "$OUT"
rm -f "$ZIP"
cd "$ROOT/ego"
zip -q "$ZIP" extension.js metadata.json
echo "✓ $ZIP"
unzip -l "$ZIP"
