#!/usr/bin/env bash
# Simple Claude Usage — installer
# Copies the extension into the user's GNOME Shell extensions folder and enables it.
set -euo pipefail

UUID="simple-claude-usage@krugerrgabriel.github.io"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="$HOME/.local/share/gnome-shell/extensions/$UUID"

echo "✻ Simple Claude Usage — installer"
echo

# Sanity checks -------------------------------------------------------------
if ! command -v gnome-shell >/dev/null 2>&1; then
    echo "✗ GNOME Shell not found. This extension only works on GNOME." >&2
    exit 1
fi

SHELL_MAJOR="$(gnome-shell --version | grep -oE '[0-9]+' | head -1)"
if [ "$SHELL_MAJOR" -lt 45 ]; then
    echo "✗ GNOME Shell 45+ is required (you have $SHELL_MAJOR)." >&2
    exit 1
fi

if [ ! -f "$HOME/.claude/.credentials.json" ]; then
    echo "⚠ ~/.claude/.credentials.json not found."
    echo "  Install Claude Code and log in first: https://claude.com/claude-code"
    echo "  The extension will show '—' until you do."
    echo
fi

# Install -------------------------------------------------------------------
mkdir -p "$DEST_DIR"
cp "$SRC_DIR/extension.js" "$SRC_DIR/metadata.json" "$DEST_DIR/"
echo "✓ Installed to $DEST_DIR"

# Enable (works now if the shell already knows the extension, otherwise
# pre-enables it for the next shell restart) --------------------------------
if gnome-extensions enable "$UUID" 2>/dev/null; then
    echo "✓ Extension enabled"
else
    python3 - "$UUID" <<'EOF'
import ast, subprocess, sys
uuid = sys.argv[1]
out = subprocess.run(['gsettings', 'get', 'org.gnome.shell', 'enabled-extensions'],
                     capture_output=True, text=True).stdout.strip()
lst = [] if out in ('@as []', '[]') else list(ast.literal_eval(out))
if uuid not in lst:
    lst.append(uuid)
val = '[' + ', '.join(f"'{x}'" for x in lst) + ']'
subprocess.run(['gsettings', 'set', 'org.gnome.shell', 'enabled-extensions', val], check=True)
EOF
    echo "✓ Extension pre-enabled for the next GNOME Shell restart"
fi

echo
if [ "${XDG_SESSION_TYPE:-}" = "wayland" ]; then
    echo "→ Log out and back in to load the extension (Wayland)."
else
    echo "→ Press Alt+F2, type 'r' and hit Enter to reload GNOME Shell (X11)."
fi
echo
echo "Done! Look for ✻ in your top bar."
