<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong>Your <a href="https://claude.com/claude-code">Claude</a> plan usage, always visible in the GNOME top bar.</strong><br>
  Never get surprised by "limit reached" again — see your 5-hour session and weekly limits at a glance.
</p>

<p align="center">
  <strong>🇺🇸 English</strong> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.ja.md">🇯🇵 日本語</a> ·
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> ·
  <a href="README.ko.md">🇰🇷 한국어</a>
</p>

<p align="center">
  <img alt="GNOME Shell" src="https://img.shields.io/badge/GNOME%20Shell-42%E2%80%9348-4A86CF?logo=gnome&logoColor=white">
  <img alt="Ubuntu" src="https://img.shields.io/badge/Ubuntu-22.04%2B-E95420?logo=ubuntu&logoColor=white">
  <img alt="Zero deps" src="https://img.shields.io/badge/deps-zero-success">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

<p align="center">
  <img alt="Simple Claude Usage in the GNOME top bar" src="assets/panel.png">
</p>

---

## 💡 Why use it

If you use **Claude Code**, **Claude Pro** or **Claude Max**, you know the feeling:

- 🛑 You're deep in flow and suddenly hit *"limit reached, resets at…"*
- 🔮 You have no idea how close you are to the weekly cap until it's too late
- ⌨️ Checking means typing `/usage` inside Claude Code — every single time

**Simple Claude Usage** puts that answer where your eyes already are: the top bar.

> **✻ 18%** — that's it. Click it for the details.

---

## ✨ Features

| | |
|---|---|
| 📊 **Always visible** | Current 5-hour session usage right in the top bar, updated every minute |
| 🖱️ **One-click details** | Session %, weekly %, per-model limits and exact reset times in a dropdown |
| 🌡️ **Color warnings** | Turns orange at 70% and bold red at 90% — you'll never be caught off guard |
| 🔐 **No new login** | Reuses the Claude Code credentials already on your machine |
| 🪶 **Zero dependencies** | ~200 lines of vanilla GJS. No Python, no Node, no daemons, no telemetry |
| 🔄 **Self-healing** | Token expired? It tells you. Opening Claude Code fixes it automatically |
| 🔔 **Update checker** | Checks GitHub once a day and updates itself in one click when a new version is out |

---

## 📦 Installation

**Requirements:** GNOME Shell 42+ (Ubuntu 22.04+, Fedora 36+…) and [Claude Code](https://claude.com/claude-code) logged in.

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

Then reload GNOME Shell:

- **X11:** press <kbd>Alt</kbd>+<kbd>F2</kbd>, type `r`, hit <kbd>Enter</kbd>
- **Wayland:** log out and back in

Look for **✻** in your top bar. Done!

---

## 🔍 How it works

The extension reads the OAuth token that Claude Code already stores in
`~/.claude/.credentials.json` and queries the **same official endpoint** the
`/usage` command uses. Nothing else:

- ✅ Your token never leaves your machine (one HTTPS call to `api.anthropic.com`, same as Claude Code itself)
- ✅ Checking usage consumes **zero** of your plan
- ✅ No accounts, no API keys, no configuration
- ✅ The update check is a single anonymous request a day to the GitHub API — your token is never involved

---

## ❓ FAQ

**The bar shows ✻ — and "open Claude Code".**
Your OAuth token expired. Open Claude Code once — it refreshes the token automatically and the indicator recovers within a minute.

**I use Claude Code every day, but it says "credentials stale".**
The credentials file on *this* machine isn't being refreshed. Two common causes: you use Claude Code on another machine (SSH/WSL/containers), or your CLI authenticates with an `ANTHROPIC_API_KEY` instead of your subscription — check with `/status` inside Claude Code and `/login` with your account. Running `claude` locally once fixes the first case.

**Does it work with the API (pay-as-you-go) instead of a subscription?**
Not yet — it tracks subscription limits (Pro/Max plans). API cost tracking is on the roadmap.

**Does it work on KDE / other desktops?**
No, it's a GNOME Shell extension. GNOME 42–48 are supported.

**Is this an official Anthropic project?**
No. It's an independent open-source tool that uses your own credentials, locally.

---

## 🗑️ Uninstall

```bash
./uninstall.sh
```

---

## 🔗 Related

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — your daily starting point for Claude Code: find, name and resume any conversation in one click.

---

<p align="center">
  Made with ✻ by <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> —
  if this saved you from a surprise rate limit, <strong>leave a ⭐</strong>!
</p>
