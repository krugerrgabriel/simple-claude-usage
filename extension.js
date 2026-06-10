import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import Soup from 'gi://Soup?version=3.0';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const CREDS_PATH = GLib.get_home_dir() + '/.claude/.credentials.json';
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const REPO = 'krugerrgabriel/simple-claude-usage';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;
// Build moderna baixa da raiz do repo; a legada sobrescreve com 'legacy/'
const RAW_SUBDIR = '';
const POLL_SECONDS = 60;
// Em falha o intervalo dobra a cada tentativa até este teto
const POLL_MAX_SECONDS = 600;
const UPDATE_CHECK_SECONDS = 86400;

const ClaudeUsageIndicator = GObject.registerClass(
class ClaudeUsageIndicator extends PanelMenu.Button {
    _init(ext) {
        super._init(0.0, 'Claude Usage');

        this._path = ext.path;
        this._uuid = ext.metadata.uuid;
        this._version = ext.metadata['version-name'] ?? '0.0.0';

        this._label = new St.Label({
            text: '✻ …',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this._http = new Soup.Session({timeout: 15});
        this._timeoutId = null;
        this._failures = 0;
        this._lastGood = null;
        this._updateState = null;
        this._pendingTag = null;
        this._notifiedTag = null;

        this._sessionItem = new PopupMenu.PopupMenuItem('Sessão (5h): —', {reactive: false});
        this._weekItem = new PopupMenu.PopupMenuItem('Semana: —', {reactive: false});
        this._opusItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this._sonnetItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this._statusItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this._opusItem.visible = false;
        this._sonnetItem.visible = false;
        this._statusItem.visible = false;
        this.menu.addMenuItem(this._sessionItem);
        this.menu.addMenuItem(this._weekItem);
        this.menu.addMenuItem(this._opusItem);
        this.menu.addMenuItem(this._sonnetItem);
        this.menu.addMenuItem(this._statusItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const refreshItem = new PopupMenu.PopupMenuItem('Atualizar agora');
        refreshItem.connect('activate', () => this._refresh());
        this.menu.addMenuItem(refreshItem);

        this._updateItem = new PopupMenu.PopupMenuItem('');
        this._updateItem.visible = false;
        this._updateItem.connect('activate', () => this._onUpdateClicked());
        this.menu.addMenuItem(this._updateItem);

        this._refresh();

        this._updateInitialId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 30, () => {
            this._updateInitialId = null;
            this._checkUpdate();
            return GLib.SOURCE_REMOVE;
        });
        this._updateDailyId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, UPDATE_CHECK_SECONDS, () => {
            this._checkUpdate();
            return GLib.SOURCE_CONTINUE;
        });
    }

    _scheduleNext(seconds) {
        if (this._timeoutId)
            GLib.source_remove(this._timeoutId);
        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, seconds, () => {
            this._timeoutId = null;
            this._refresh();
            return GLib.SOURCE_REMOVE;
        });
    }

    _readToken() {
        try {
            const [ok, contents] = GLib.file_get_contents(CREDS_PATH);
            if (!ok)
                return null;
            const creds = JSON.parse(new TextDecoder().decode(contents));
            return creds?.claudeAiOauth?.accessToken ?? null;
        } catch {
            return null;
        }
    }

    _fetchText(url, headers, cb) {
        const msg = Soup.Message.new('GET', url);
        msg.request_headers.replace('User-Agent', `simple-claude-usage/${this._version}`);
        for (const [k, v] of Object.entries(headers))
            msg.request_headers.replace(k, v);

        this._http.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, result) => {
            try {
                const bytes = session.send_and_read_finish(result);
                const status = msg.get_status();
                const text = new TextDecoder().decode(bytes.get_data());
                cb(status, text);
            } catch {
                cb(0, null);
            }
        });
    }

    _refresh() {
        const token = this._readToken();
        if (!token) {
            this._onFailure('sem login no Claude Code');
            return;
        }

        // Sem o User-Agent claude-code o endpoint cai num bucket de rate
        // limit agressivo e devolve 429 persistente (anthropics/claude-code#30930)
        this._fetchText(USAGE_URL, {
            'Authorization': `Bearer ${token}`,
            'anthropic-beta': 'oauth-2025-04-20',
            'User-Agent': 'claude-code/2.1.172',
        }, (status, body) => {
            if (status === 401) {
                // Token expirado: o Claude Code renova ao ser aberto
                this._onFailure('token expirado — abra o Claude Code');
                return;
            }
            if (status === 429) {
                this._onFailure('limite de consultas da API');
                return;
            }
            if (status !== 200 || !body) {
                this._onFailure(status ? `HTTP ${status}` : 'sem rede');
                return;
            }
            let data;
            try {
                data = JSON.parse(body);
            } catch {
                this._onFailure('resposta inesperada');
                return;
            }
            this._onSuccess(data);
        });
    }

    _onSuccess(data) {
        this._failures = 0;
        this._lastGood = data;
        this._statusItem.visible = false;
        this._render(data);
        this._scheduleNext(POLL_SECONDS);
    }

    _onFailure(why) {
        this._failures++;
        const wait = Math.min(POLL_SECONDS * 2 ** this._failures, POLL_MAX_SECONDS);

        // Mantém o último valor conhecido na barra, esmaecido para
        // sinalizar que está desatualizado
        if (this._lastGood)
            this._label.set_style('color: #888888;');
        else
            this._label.set_text('✻ —');

        const mins = Math.max(1, Math.round(wait / 60));
        this._statusItem.label.set_text(`⚠ ${why} · nova tentativa em ${mins} min`);
        this._statusItem.visible = true;
        this._scheduleNext(wait);
    }

    // --- Atualizações -------------------------------------------------

    _isNewer(tag) {
        const parse = v => String(v).replace(/^v/, '').split('.').map(n => parseInt(n, 10) || 0);
        const remote = parse(tag), local = parse(this._version);
        for (let i = 0; i < 3; i++) {
            if ((remote[i] || 0) > (local[i] || 0))
                return true;
            if ((remote[i] || 0) < (local[i] || 0))
                return false;
        }
        return false;
    }

    _checkUpdate() {
        if (this._updateState === 'downloaded')
            return;
        this._fetchText(RELEASES_API, {}, (status, body) => {
            if (status !== 200 || !body)
                return;
            try {
                const tag = JSON.parse(body).tag_name;
                if (tag && this._isNewer(tag))
                    this._offerUpdate(tag);
            } catch {
            }
        });
    }

    _offerUpdate(tag) {
        this._pendingTag = tag;
        this._updateState = 'available';
        this._updateItem.label.set_text(`⬆ ${tag} disponível — clique para atualizar`);
        this._updateItem.visible = true;
        if (this._notifiedTag !== tag) {
            this._notifiedTag = tag;
            Main.notify('Simple Claude Usage',
                `Versão ${tag} disponível — clique no ✻ na barra para atualizar.`);
        }
    }

    _onUpdateClicked() {
        if (this._updateState === 'available')
            this._downloadUpdate(this._pendingTag);
        else if (this._updateState === 'failed')
            Gio.AppInfo.launch_default_for_uri(RELEASES_PAGE, null);
    }

    _downloadUpdate(tag) {
        this._updateItem.label.set_text('⏳ Baixando atualização…');
        const base = `https://raw.githubusercontent.com/${REPO}/${tag}/${RAW_SUBDIR}`;

        this._fetchText(`${base}extension.js`, {}, (jsStatus, js) => {
            this._fetchText(`${base}metadata.json`, {}, (metaStatus, meta) => {
                try {
                    if (jsStatus !== 200 || metaStatus !== 200 || !js || js.length < 500)
                        throw new Error('download incompleto');
                    const remoteMeta = JSON.parse(meta);
                    // Preserva o uuid local: o diretório da extensão tem
                    // que continuar batendo com ele
                    remoteMeta.uuid = this._uuid;
                    GLib.file_set_contents(`${this._path}/extension.js`, js);
                    GLib.file_set_contents(`${this._path}/metadata.json`,
                        JSON.stringify(remoteMeta, null, 2) + '\n');
                    this._updateState = 'downloaded';
                    this._updateItem.label.set_text('✓ Atualizado — reinicie o GNOME Shell para aplicar');
                    Main.notify('Simple Claude Usage',
                        `Atualizado para ${tag}. Reinicie o GNOME Shell para aplicar (X11: Alt+F2 → r).`);
                } catch {
                    this._updateState = 'failed';
                    this._updateItem.label.set_text('⚠ Falha ao baixar — clique para abrir o GitHub');
                }
            });
        });
    }

    // -------------------------------------------------------------------

    _fmtReset(iso) {
        if (!iso)
            return '';
        const dt = GLib.DateTime.new_from_iso8601(iso, null);
        if (!dt)
            return '';
        const local = dt.to_local();
        const now = GLib.DateTime.new_now_local();
        const sameDay = local.format('%Y%m%d') === now.format('%Y%m%d');
        return sameDay ? local.format('%H:%M') : local.format('%a %H:%M');
    }

    _render(data) {
        const five = data.five_hour ?? {};
        const week = data.seven_day ?? {};
        const pct = v => (v === null || v === undefined) ? null : Math.round(v);

        const s = pct(five.utilization);
        const w = pct(week.utilization);

        this._label.set_text(`✻ ${s ?? '—'}%`);
        const worst = Math.max(s ?? 0, w ?? 0);
        if (worst >= 90)
            this._label.set_style('color: #ff5544; font-weight: bold;');
        else if (worst >= 70)
            this._label.set_style('color: #ffaa33;');
        else
            this._label.set_style(null);

        this._sessionItem.label.set_text(
            `Sessão (5h): ${s ?? '—'}%  ·  reseta ${this._fmtReset(five.resets_at)}`);
        this._weekItem.label.set_text(
            `Semana: ${w ?? '—'}%  ·  reseta ${this._fmtReset(week.resets_at)}`);

        const opus = data.seven_day_opus?.utilization;
        this._opusItem.visible = opus !== null && opus !== undefined;
        if (this._opusItem.visible)
            this._opusItem.label.set_text(`Opus (semana): ${pct(opus)}%`);

        const sonnet = data.seven_day_sonnet?.utilization;
        this._sonnetItem.visible = sonnet !== null && sonnet !== undefined;
        if (this._sonnetItem.visible)
            this._sonnetItem.label.set_text(`Sonnet (semana): ${pct(sonnet)}%`);
    }

    destroy() {
        for (const id of [this._timeoutId, this._updateInitialId, this._updateDailyId]) {
            if (id)
                GLib.source_remove(id);
        }
        this._timeoutId = this._updateInitialId = this._updateDailyId = null;
        this._http.abort();
        super.destroy();
    }
});

export default class ClaudeUsageExtension extends Extension {
    enable() {
        this._indicator = new ClaudeUsageIndicator(this);
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
