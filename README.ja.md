<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong><a href="https://claude.com/claude-code">Claude</a> プランの使用量を、GNOME トップバーに常時表示。</strong><br>
  「制限に達しました」にもう驚かない — 5時間セッションと週間上限をひと目で確認。
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <strong>🇯🇵 日本語</strong> ·
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
  <img alt="GNOME トップバーの Simple Claude Usage" src="assets/panel.png">
</p>

---

## 💡 なぜ使うのか

**Claude Code**、**Claude Pro**、**Claude Max** を使っているなら、こんな経験があるはず：

- 🛑 集中している最中に突然 *「制限に達しました。リセットは…」*
- 🔮 週間上限にどれだけ近いか、手遅れになるまで分からない
- ⌨️ 確認するには Claude Code 内で `/usage` を打つ — 毎回

**Simple Claude Usage** はその答えを、いつも目にある場所＝トップバーに置きます。

> **✻ 18%** — それだけ。クリックすれば詳細が見られます。

---

## ✨ 機能

| | |
|---|---|
| 📊 **常時表示** | 5時間セッションの使用率をトップバーに表示、毎分更新 |
| 🖱️ **ワンクリックで詳細** | セッション％、週間％、モデル別の上限、正確なリセット時刻をドロップダウンで |
| 🌡️ **色によるアラート** | 70% でオレンジ、90% で太字の赤 — 不意打ちはもうありません |
| 🔐 **新規ログイン不要** | マシンに既にある Claude Code の認証情報を再利用 |
| 🪶 **依存ゼロ** | 純粋な GJS 約200行。Python なし、Node なし、デーモンなし、テレメトリなし |
| 🔄 **自己回復** | トークン期限切れ？通知します。Claude Code を開けば自動的に復旧 |
| 🔔 **更新チェック** | 1日1回 GitHub を確認し、新バージョンが出たらワンクリックで自己更新 |

---

## 📦 インストール

**要件：** GNOME Shell 42+（Ubuntu 22.04+、Fedora 36+ など）と、ログイン済みの [Claude Code](https://claude.com/claude-code)。

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

その後、GNOME Shell をリロード：

- **X11:** <kbd>Alt</kbd>+<kbd>F2</kbd> を押し、`r` と入力して <kbd>Enter</kbd>
- **Wayland:** 一度ログアウトして再ログイン

トップバーの **✻** を探してください。完了！

---

## 🔍 仕組み

この拡張機能は、Claude Code が `~/.claude/.credentials.json` に保存している
OAuth トークンを読み取り、`/usage` コマンドと**同じ公式エンドポイント**に問い
合わせます。それ以外は何もしません：

- ✅ トークンがマシンの外に出ることはありません（Claude Code 本体と同じ `api.anthropic.com` への HTTPS 通信のみ）
- ✅ 使用量の確認はプランを**一切**消費しません
- ✅ アカウント不要、API キー不要、設定不要
- ✅ 更新チェックは GitHub API への1日1回の匿名リクエストのみ — トークンは一切使いません

---

## ❓ FAQ

**バーに ✻ — と「Claude Code を開いてください」と表示される。**
OAuth トークンの期限が切れています。Claude Code を一度開けばトークンが自動更新され、1分以内に表示が復旧します。

**サブスクリプションではなく API（従量課金）でも使える？**
まだです — 現在はサブスクリプションの上限（Pro/Max プラン）を追跡します。API コストの追跡はロードマップにあります。

**KDE や他のデスクトップでも動く？**
いいえ、GNOME Shell 拡張機能です。GNOME 42–48 をサポートしています。

**Anthropic の公式プロジェクト？**
いいえ。自分の認証情報をローカルで使う、独立したオープンソースツールです。

---

## 🗑️ アンインストール

```bash
./uninstall.sh
```

---

## 🔗 関連プロジェクト

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — Claude Code の毎日の出発点：会話を検索・命名し、ワンクリックで再開。

---

<p align="center">
  ✻ を込めて <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> が作りました —
  突然のレート制限から救われたら、<strong>⭐ をお願いします</strong>！
</p>
