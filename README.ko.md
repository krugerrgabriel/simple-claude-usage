<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong><a href="https://claude.com/claude-code">Claude</a> 플랜 사용량을 GNOME 상단 바에 항상 표시.</strong><br>
  "한도 도달"에 더 이상 당황하지 마세요 — 5시간 세션과 주간 한도를 한눈에.
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
  <a href="README.ja.md">🇯🇵 日本語</a> ·
  <a href="README.zh-CN.md">🇨🇳 简体中文</a> ·
  <strong>🇰🇷 한국어</strong>
</p>

<p align="center">
  <img alt="GNOME Shell" src="https://img.shields.io/badge/GNOME%20Shell-42%E2%80%9348-4A86CF?logo=gnome&logoColor=white">
  <img alt="Ubuntu" src="https://img.shields.io/badge/Ubuntu-22.04%2B-E95420?logo=ubuntu&logoColor=white">
  <img alt="Zero deps" src="https://img.shields.io/badge/deps-zero-success">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue">
</p>

<p align="center">
  <img alt="GNOME 상단 바의 Simple Claude Usage" src="assets/panel.png">
</p>

---

## 💡 왜 필요한가

**Claude Code**, **Claude Pro**, **Claude Max**를 쓴다면 이런 경험이 있을 겁니다:

- 🛑 한창 몰입 중인데 갑자기 *"한도 도달, 재설정 시각은…"*
- 🔮 주간 한도에 얼마나 가까운지, 너무 늦기 전까지는 알 수 없음
- ⌨️ 확인하려면 Claude Code 안에서 `/usage`를 입력 — 매번

**Simple Claude Usage**는 그 답을 시선이 이미 머무는 곳, 상단 바에 둡니다.

> **✻ 18%** — 그게 전부입니다. 클릭하면 자세히 볼 수 있어요.

---

## ✨ 기능

| | |
|---|---|
| 📊 **항상 표시** | 5시간 세션 사용량을 상단 바에 표시, 매분 갱신 |
| 🖱️ **클릭 한 번으로 상세 보기** | 세션 %, 주간 %, 모델별 한도, 정확한 재설정 시각 |
| 🌡️ **색상 경고** | 70%부터 주황색, 90%부터 굵은 빨간색 — 더 이상 기습은 없습니다 |
| 🔐 **새 로그인 불필요** | 이미 기기에 있는 Claude Code 자격 증명을 재사용 |
| 🪶 **의존성 제로** | 순수 GJS 약 200줄. Python·Node·데몬·텔레메트리 없음 |
| 🔄 **자가 복구** | 토큰 만료? 알려줍니다. Claude Code를 열면 자동으로 해결 |

---

## 📦 설치

**요구 사항:** GNOME Shell 42+ (Ubuntu 22.04+, Fedora 36+ 등) 및 로그인된 [Claude Code](https://claude.com/claude-code).

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

그다음 GNOME Shell을 다시 불러오세요:

- **X11:** <kbd>Alt</kbd>+<kbd>F2</kbd>를 누르고 `r` 입력 후 <kbd>Enter</kbd>
- **Wayland:** 로그아웃 후 다시 로그인

상단 바에서 **✻**를 찾으세요. 끝!

---

## 🔍 작동 원리

이 확장은 Claude Code가 이미 `~/.claude/.credentials.json`에 저장한 OAuth
토큰을 읽어, `/usage` 명령과 **동일한 공식 엔드포인트**를 조회합니다. 그
이상은 없습니다:

- ✅ 토큰은 절대 기기를 떠나지 않습니다 (Claude Code와 동일한 `api.anthropic.com`으로의 HTTPS 호출 한 번뿐)
- ✅ 사용량 조회는 플랜을 **전혀** 소모하지 않습니다
- ✅ 계정·API 키·설정 불필요

---

## ❓ FAQ

**바에 ✻ — 와 "Claude Code를 여세요"가 표시됩니다.**
OAuth 토큰이 만료됐습니다. Claude Code를 한 번 열면 토큰이 자동 갱신되고 표시기는 1분 안에 복구됩니다.

**구독 대신 API(종량제)도 지원하나요?**
아직입니다 — 현재는 구독 한도(Pro/Max 플랜)를 추적합니다. API 비용 추적은 로드맵에 있습니다.

**KDE나 다른 데스크톱에서도 되나요?**
아니요, GNOME Shell 확장입니다. GNOME 42–48을 지원합니다.

**Anthropic 공식 프로젝트인가요?**
아니요. 자신의 자격 증명을 로컬에서 사용하는 독립 오픈소스 도구입니다.

---

## 🗑️ 제거

```bash
./uninstall.sh
```

---

## 🔗 관련 프로젝트

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — Claude Code의 매일의 출발점: 대화를 찾고, 이름 붙이고, 클릭 한 번으로 재개.

---

<p align="center">
  <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a>가 ✻을 담아 만들었습니다 —
  갑작스러운 한도 초과에서 구해줬다면 <strong>⭐ 하나 부탁드려요</strong>!
</p>
