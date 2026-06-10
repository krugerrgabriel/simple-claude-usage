#!/usr/bin/env bash
# Simple Claude Usage — uninstaller
set -euo pipefail

UUID="simple-claude-usage@krugerrgabriel.github.io"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

gnome-extensions disable "$UUID" 2>/dev/null || true
rm -rf "$DEST_DIR"

echo "✓ Simple Claude Usage removed."
echo "→ Restart GNOME Shell (Alt+F2 → r on X11, or log out on Wayland) to clear it from the bar."
