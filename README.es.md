<h1 align="center">✻ Simple Claude Usage</h1>

<p align="center">
  <strong>Tu consumo de <a href="https://claude.com/claude-code">Claude</a>, siempre visible en la barra superior de GNOME.</strong><br>
  No vuelvas a sorprenderte con "límite alcanzado" — mira tu sesión de 5 h y tu límite semanal de un vistazo.
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a> ·
  <a href="README.pt-BR.md">🇧🇷 Português</a> ·
  <strong>🇪🇸 Español</strong> ·
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
  <img alt="Simple Claude Usage en la barra superior de GNOME" src="assets/panel.png">
</p>

---

## 💡 Por qué usarlo

Si usas **Claude Code**, **Claude Pro** o **Claude Max**, conoces la sensación:

- 🛑 Estás concentrado y de repente: *"límite alcanzado, se reinicia a las…"*
- 🔮 No tienes idea de qué tan cerca estás del límite semanal hasta que es demasiado tarde
- ⌨️ Comprobarlo significa escribir `/usage` dentro de Claude Code — cada vez

**Simple Claude Usage** pone esa respuesta donde ya están tus ojos: la barra superior.

> **✻ 18%** — eso es todo. Haz clic para ver los detalles.

---

## ✨ Características

| | |
|---|---|
| 📊 **Siempre visible** | Consumo de la sesión de 5 h en la barra, actualizado cada minuto |
| 🖱️ **Detalles en un clic** | % de sesión, % semanal, límites por modelo y horas exactas de reinicio |
| 🌡️ **Alertas por color** | Naranja a partir del 70 % y rojo en negrita a partir del 90 % |
| 🔐 **Sin nuevo login** | Reutiliza las credenciales de Claude Code que ya están en tu máquina |
| 🪶 **Cero dependencias** | ~200 líneas de GJS puro. Sin Python, sin Node, sin daemons, sin telemetría |
| 🔄 **Auto-recuperación** | ¿Token caducado? Te avisa. Abrir Claude Code lo arregla solo |

---

## 📦 Instalación

**Requisitos:** GNOME Shell 45+ (Ubuntu 24.04+, Fedora 39+…) y [Claude Code](https://claude.com/claude-code) con sesión iniciada.

```bash
git clone https://github.com/krugerrgabriel/simple-claude-usage.git
cd simple-claude-usage
./install.sh
```

Luego recarga GNOME Shell:

- **X11:** pulsa <kbd>Alt</kbd>+<kbd>F2</kbd>, escribe `r`, presiona <kbd>Enter</kbd>
- **Wayland:** cierra sesión y vuelve a entrar

Busca el **✻** en tu barra superior. ¡Listo!

---

## 🔍 Cómo funciona

La extensión lee el token OAuth que Claude Code ya guarda en
`~/.claude/.credentials.json` y consulta el **mismo endpoint oficial** que usa
el comando `/usage`. Nada más:

- ✅ Tu token nunca sale de tu máquina (una llamada HTTPS a `api.anthropic.com`, igual que el propio Claude Code)
- ✅ Consultar el consumo gasta **cero** de tu plan
- ✅ Sin cuentas, sin API keys, sin configuración

---

## ❓ Preguntas frecuentes

**La barra muestra ✻ — y "abre Claude Code".**
Tu token OAuth caducó. Abre Claude Code una vez — renueva el token automáticamente y el indicador se recupera en un minuto.

**¿Funciona con la API (pago por uso) en lugar de suscripción?**
Todavía no — rastrea los límites de suscripción (planes Pro/Max). El seguimiento de costes de la API está en el roadmap.

**¿Funciona en KDE / otros escritorios?**
No, es una extensión de GNOME Shell. Se soporta GNOME 45–48.

**¿Es un proyecto oficial de Anthropic?**
No. Es una herramienta open-source independiente que usa tus propias credenciales, localmente.

---

## 🗑️ Desinstalar

```bash
./uninstall.sh
```

---

## 🔗 Relacionados

- 🔖 [**Claude Sessions Manager**](https://github.com/krugerrgabriel/claude-sessions-manager) — tu punto de partida diario para Claude Code: encuentra, nombra y retoma cualquier conversación con un clic.

---

<p align="center">
  Hecho con ✻ por <a href="https://github.com/krugerrgabriel">Gabriel Krüger</a> —
  si esto te salvó de un rate limit sorpresa, <strong>¡deja una ⭐!</strong>
</p>
