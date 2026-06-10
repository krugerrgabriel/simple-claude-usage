<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong>把 <a href="https://claude.com/claude-code">Claude</a> 套餐用量常驻显示在 GNOME 顶栏。</strong><br>
  不再被"已达上限"打个措手不及 — 5 小时会话和每周限额一目了然。
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.ja.md">🇯🇵 日本語</a> ·
  <strong>🇨🇳 简体中文</strong> ·
  <a href="README.ko.md">🇰🇷 한국어</a>
</p>

<p align="center">
  <img alt="GNOME Shell" src="https://img.shields.io/badge/GNOME%20Shell-42%E2%80%9348-4A86CF?logo=gnome&logoColor=white">
  <img alt="Ubuntu" src="https://img.shields.io/badge/Ubuntu-22.04%2B-E95420?logo=ubuntu&logoColor=white">
  <img alt="Zero deps" src="https://img.shields.io/badge/deps-zero-success">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

<p align="center">
  <img alt="GNOME 顶栏中的 Simple Claude Usage" src="assets/panel.png">
</p>

---

## 💡 为什么需要它

如果你在用 **Claude Code**、**Claude Pro** 或 **Claude Max**，一定经历过：

- 🛑 正写到兴头上，突然弹出 *"已达上限，将于…重置"*
- 🔮 完全不知道自己离每周限额还有多远，直到为时已晚
- ⌨️ 想查一下？得在 Claude Code 里输入 `/usage` — 每次都要

**Simple Claude Usage** 把答案放在你的视线本来就在的地方：顶栏。

> **✻ 18%** — 就这么简单。点击即可查看详情。

---

## ✨ 功能

| | |
|---|---|
| 📊 **常驻显示** | 5 小时会话用量直接显示在顶栏，每分钟更新 |
| 🖱️ **一键查看详情** | 会话百分比、每周百分比、各模型限额及精确重置时间 |
| 🌡️ **颜色预警** | 70% 变橙色，90% 变加粗红色 — 不再措手不及 |
| 🔐 **无需重新登录** | 复用你机器上已有的 Claude Code 凭据 |
| 🪶 **零依赖** | 约 200 行纯 GJS。无 Python、无 Node、无守护进程、无遥测 |
| 🔄 **自动恢复** | 令牌过期？它会提示你。打开 Claude Code 即自动修复 |

---

## 📦 安装

**要求：** GNOME Shell 42+（Ubuntu 22.04+、Fedora 36+ 等）以及已登录的 [Claude Code](https://claude.com/claude-code)。

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

然后重新加载 GNOME Shell：

- **X11：** 按 <kbd>Alt</kbd>+<kbd>F2</kbd>，输入 `r`，回车
- **Wayland：** 注销后重新登录

在顶栏找到 **✻**，搞定！

---

## 🔍 工作原理

本扩展读取 Claude Code 已保存在 `~/.claude/.credentials.json` 的 OAuth
令牌，并查询与 `/usage` 命令**相同的官方接口**。仅此而已：

- ✅ 令牌绝不离开你的机器（仅向 `api.anthropic.com` 发起一次 HTTPS 请求，与 Claude Code 本身相同）
- ✅ 查询用量**不消耗**任何套餐额度
- ✅ 无需账号、无需 API 密钥、无需配置

---

## ❓ 常见问题

**顶栏显示 ✻ — 和"请打开 Claude Code"。**
你的 OAuth 令牌已过期。打开一次 Claude Code，令牌会自动刷新，指示器一分钟内恢复。

**支持 API（按量付费）而非订阅吗？**
暂不支持 — 目前追踪订阅限额（Pro/Max 套餐）。API 成本追踪在路线图中。

**支持 KDE / 其他桌面吗？**
不支持，这是一个 GNOME Shell 扩展。支持 GNOME 42–48。

**这是 Anthropic 官方项目吗？**
不是。这是一个独立的开源工具，在本地使用你自己的凭据。

---

## 🗑️ 卸载

```bash
./uninstall.sh
```

---

## 🔗 相关项目

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — 你每天使用 Claude Code 的起点：查找、命名并一键恢复任何对话。

---

<p align="center">
  由 <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> 用 ✻ 打造 —
  如果它让你躲过了一次突如其来的限流，<strong>请留下一颗 ⭐</strong>！
</p>
