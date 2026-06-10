<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong>Seu consumo do <a href="https://claude.com/claude-code">Claude</a>, sempre visível na barra superior do GNOME.</strong><br>
  Nunca mais seja pego de surpresa pelo "limite atingido" — veja a sessão de 5h e o limite semanal num relance.
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <strong>🇧🇷 Português</strong> ·
  <a href="README.es.md">🇪🇸 Español</a> ·
  <a href="README.de.md">🇩🇪 Deutsch</a> ·
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
  <img alt="Simple Claude Usage na barra superior do GNOME" src="assets/panel.png">
</p>

---

## 💡 Por que usar

Se você usa **Claude Code**, **Claude Pro** ou **Claude Max**, conhece a sensação:

- 🛑 Você está no flow e de repente: *"limite atingido, reseta às…"*
- 🔮 Não faz ideia de quão perto está do limite semanal até ser tarde demais
- ⌨️ Conferir significa digitar `/usage` dentro do Claude Code — toda vez

O **Simple Claude Usage** coloca essa resposta onde seus olhos já estão: na barra superior.

> **✻ 18%** — só isso. Clique para ver os detalhes.

---

## ✨ Funcionalidades

| | |
|---|---|
| 📊 **Sempre visível** | Consumo da sessão de 5h direto na barra, atualizado a cada minuto |
| 🖱️ **Detalhes em um clique** | % da sessão, % da semana, limites por modelo e horários exatos de reset |
| 🌡️ **Alertas por cor** | Laranja a partir de 70% e vermelho em negrito a partir de 90% |
| 🔐 **Sem novo login** | Reusa as credenciais do Claude Code que já estão na sua máquina |
| 🪶 **Zero dependências** | ~200 linhas de GJS puro. Sem Python, sem Node, sem daemons, sem telemetria |
| 🔄 **Auto-recuperação** | Token expirou? Ele avisa. Abrir o Claude Code resolve sozinho |

---

## 📦 Instalação

**Requisitos:** GNOME Shell 45+ (Ubuntu 24.04+, Fedora 39+…) e [Claude Code](https://claude.com/claude-code) logado.

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

Depois recarregue o GNOME Shell:

- **X11:** pressione <kbd>Alt</kbd>+<kbd>F2</kbd>, digite `r`, dê <kbd>Enter</kbd>
- **Wayland:** faça logout e login

Procure o **✻** na barra superior. Pronto!

---

## 🔍 Como funciona

A extensão lê o token OAuth que o Claude Code já guarda em
`~/.claude/.credentials.json` e consulta o **mesmo endpoint oficial** que o
comando `/usage` usa. Nada além disso:

- ✅ Seu token nunca sai da sua máquina (uma chamada HTTPS para `api.anthropic.com`, igual ao próprio Claude Code)
- ✅ Consultar o consumo gasta **zero** do seu plano
- ✅ Sem contas, sem API keys, sem configuração

---

## ❓ Perguntas frequentes

**A barra mostra ✻ — e "abra o Claude Code".**
Seu token OAuth expirou. Abra o Claude Code uma vez — ele renova o token automaticamente e o indicador se recupera em até um minuto.

**Funciona com a API (pagamento por uso) em vez de assinatura?**
Ainda não — ele acompanha os limites de assinatura (planos Pro/Max). Rastreio de custo da API está no roadmap.

**Funciona no KDE / outros desktops?**
Não, é uma extensão do GNOME Shell. GNOME 45–48 são suportados.

**É um projeto oficial da Anthropic?**
Não. É uma ferramenta open-source independente que usa suas próprias credenciais, localmente.

---

## 🗑️ Desinstalar

```bash
./uninstall.sh
```

---

## 🔗 Relacionados

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — seu ponto de partida diário para o Claude Code: encontre, nomeie e retome qualquer conversa em um clique.

---

<p align="center">
  Feito com ✻ por <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> —
  se isso te salvou de um rate limit surpresa, <strong>deixe uma ⭐</strong>!
</p>
