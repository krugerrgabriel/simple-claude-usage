<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong>Dein <a href="https://claude.com/claude-code">Claude</a>-Verbrauch, immer sichtbar in der GNOME-Topbar.</strong><br>
  Nie wieder vom "Limit erreicht" überrascht werden — 5-Stunden-Session und Wochenlimit auf einen Blick.
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <strong>🇩🇪 Deutsch</strong> ·
  <a href="README.ja.md">🇯🇵 日本語</a> ·
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> ·
  <a href="README.ko.md">🇰🇷 한국어</a>
</p>

<p align="center">
  <img alt="GNOME Shell" src="https://img.shields.io/badge/GNOME%20Shell-45%20%7C%2046%20%7C%2047%20%7C%2048-4A86CF?logo=gnome&logoColor=white">
  <img alt="Ubuntu" src="https://img.shields.io/badge/Ubuntu-22.04%2B-E95420?logo=ubuntu&logoColor=white">
  <img alt="Zero deps" src="https://img.shields.io/badge/deps-zero-success">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

<p align="center">
  <img alt="Simple Claude Usage in der GNOME-Topbar" src="assets/panel.png">
</p>

---

## 💡 Warum

Wenn du **Claude Code**, **Claude Pro** oder **Claude Max** nutzt, kennst du das:

- 🛑 Du bist im Flow und plötzlich: *"Limit erreicht, Reset um…"*
- 🔮 Du weißt nicht, wie nah du am Wochenlimit bist — bis es zu spät ist
- ⌨️ Nachsehen heißt: `/usage` in Claude Code eintippen — jedes Mal

**Simple Claude Usage** bringt die Antwort dahin, wo deine Augen ohnehin sind: in die Topbar.

> **✻ 18%** — das ist alles. Klick drauf für die Details.

---

## ✨ Features

| | |
|---|---|
| 📊 **Immer sichtbar** | Verbrauch der 5-Stunden-Session direkt in der Topbar, minütlich aktualisiert |
| 🖱️ **Details per Klick** | Session-%, Wochen-%, Limits pro Modell und exakte Reset-Zeiten im Dropdown |
| 🌡️ **Farbwarnungen** | Orange ab 70 %, fett rot ab 90 % — keine Überraschungen mehr |
| 🔐 **Kein neuer Login** | Nutzt die Claude-Code-Anmeldedaten, die bereits auf deinem Rechner liegen |
| 🪶 **Null Abhängigkeiten** | ~200 Zeilen pures GJS. Kein Python, kein Node, keine Daemons, keine Telemetrie |
| 🔄 **Selbstheilend** | Token abgelaufen? Es sagt dir Bescheid. Claude Code öffnen genügt |

---

## 📦 Installation

**Voraussetzungen:** GNOME Shell 45+ (Ubuntu 24.04+, Fedora 39+…) und [Claude Code](https://claude.com/claude-code) mit aktivem Login.

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

Dann GNOME Shell neu laden:

- **X11:** <kbd>Alt</kbd>+<kbd>F2</kbd> drücken, `r` eingeben, <kbd>Enter</kbd>
- **Wayland:** ab- und wieder anmelden

Such nach dem **✻** in deiner Topbar. Fertig!

---

## 🔍 Wie es funktioniert

Die Extension liest das OAuth-Token, das Claude Code bereits in
`~/.claude/.credentials.json` speichert, und fragt **denselben offiziellen
Endpoint** ab wie der `/usage`-Befehl. Sonst nichts:

- ✅ Dein Token verlässt nie deinen Rechner (ein HTTPS-Call zu `api.anthropic.com`, wie bei Claude Code selbst)
- ✅ Die Abfrage verbraucht **nichts** von deinem Plan
- ✅ Keine Konten, keine API-Keys, keine Konfiguration

---

## ❓ FAQ

**Die Bar zeigt ✻ — und "Claude Code öffnen".**
Dein OAuth-Token ist abgelaufen. Öffne Claude Code einmal — das Token wird automatisch erneuert und die Anzeige erholt sich innerhalb einer Minute.

**Funktioniert es mit der API (Pay-as-you-go) statt Abo?**
Noch nicht — es verfolgt Abo-Limits (Pro/Max-Pläne). API-Kosten-Tracking steht auf der Roadmap.

**Läuft es unter KDE / anderen Desktops?**
Nein, es ist eine GNOME-Shell-Extension. GNOME 45–48 werden unterstützt.

**Ist das ein offizielles Anthropic-Projekt?**
Nein. Ein unabhängiges Open-Source-Tool, das deine eigenen Anmeldedaten lokal nutzt.

---

## 🗑️ Deinstallieren

```bash
./uninstall.sh
```

---

## 🔗 Verwandt

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — dein täglicher Startpunkt für Claude Code: Konversationen finden, benennen und mit einem Klick fortsetzen.

---

<p align="center">
  Gemacht mit ✻ von <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> —
  wenn dich das vor einem überraschenden Rate-Limit gerettet hat: <strong>lass ein ⭐ da</strong>!
</p>
