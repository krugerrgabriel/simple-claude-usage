'use strict';

// Legacy build for GNOME Shell 42-44 (pre-ESM extensions).
// GNOME 42 runs libsoup 2.4 inside the shell process; 43+ use libsoup 3,
// and mixing the two in one process aborts — so pin the right one upfront.
const Config = imports.misc.config;
const SHELL_MAJOR = parseInt(Config.PACKAGE_VERSION.split('.')[0], 10);
imports.gi.versions.Soup = SHELL_MAJOR >= 43 ? '3.0' : '2.4';

const {GObject, St, Clutter, GLib, Soup} = imports.gi;
const ByteArray = imports.byteArray;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;

const CREDS_PATH = GLib.get_home_dir() + '/.claude/.credentials.json';
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const POLL_SECONDS = 60;
// Em falha o intervalo dobra a cada tentativa até este teto
const POLL_MAX_SECONDS = 600;

const ClaudeUsageIndicator = GObject.registerClass(
class ClaudeUsageIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Claude Usage');

        this._label = new St.Label({
            text: '✻ …',
            y_align: Clutter.ActorAlign.CENTER,
        });
        this.add_child(this._label);

        this._http = new Soup.Session({timeout: 15});
        this._timeoutId = null;
        this._failures = 0;
        this._lastGood = null;

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

        this._refresh();
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
            const creds = JSON.parse(ByteArray.toString(contents));
            return (creds.claudeAiOauth && creds.claudeAiOauth.accessToken) || null;
        } catch (e) {
            return null;
        }
    }

    // Runs the GET and calls onDone(statusCode, bodyText) on either Soup API.
    _request(token, onDone) {
        const msg = Soup.Message.new('GET', USAGE_URL);
        msg.request_headers.append('Authorization', `Bearer ${token}`);
        msg.request_headers.append('anthropic-beta', 'oauth-2025-04-20');
        // Sem este User-Agent o endpoint cai num bucket de rate limit
        // agressivo e devolve 429 persistente (anthropics/claude-code#30930)
        msg.request_headers.replace('User-Agent', 'claude-code/2.1.172');

        if (SHELL_MAJOR >= 43) {
            this._http.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, result) => {
                let status = 0, body = null;
                try {
                    const bytes = session.send_and_read_finish(result);
                    status = msg.get_status();
                    body = ByteArray.toString(bytes.get_data());
                } catch (e) {
                    // erro de transporte: status fica 0
                }
                onDone(status, body);
            });
        } else {
            this._http.queue_message(msg, (session, m) => {
                onDone(m.status_code, m.response_body ? m.response_body.data : null);
            });
        }
    }

    _refresh() {
        const token = this._readToken();
        if (!token) {
            this._onFailure('sem login no Claude Code');
            return;
        }

        this._request(token, (status, body) => {
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
            } catch (e) {
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
        const wait = Math.min(POLL_SECONDS * Math.pow(2, this._failures), POLL_MAX_SECONDS);

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
        const five = data.five_hour || {};
        const week = data.seven_day || {};
        const pct = v => (v === null || v === undefined) ? null : Math.round(v);

        const s = pct(five.utilization);
        const w = pct(week.utilization);

        this._label.set_text(`✻ ${s !== null ? s : '—'}%`);
        const worst = Math.max(s || 0, w || 0);
        if (worst >= 90)
            this._label.set_style('color: #ff5544; font-weight: bold;');
        else if (worst >= 70)
            this._label.set_style('color: #ffaa33;');
        else
            this._label.set_style(null);

        this._sessionItem.label.set_text(
            `Sessão (5h): ${s !== null ? s : '—'}%  ·  reseta ${this._fmtReset(five.resets_at)}`);
        this._weekItem.label.set_text(
            `Semana: ${w !== null ? w : '—'}%  ·  reseta ${this._fmtReset(week.resets_at)}`);

        const opus = data.seven_day_opus ? data.seven_day_opus.utilization : null;
        this._opusItem.visible = opus !== null && opus !== undefined;
        if (this._opusItem.visible)
            this._opusItem.label.set_text(`Opus (semana): ${pct(opus)}%`);

        const sonnet = data.seven_day_sonnet ? data.seven_day_sonnet.utilization : null;
        this._sonnetItem.visible = sonnet !== null && sonnet !== undefined;
        if (this._sonnetItem.visible)
            this._sonnetItem.label.set_text(`Sonnet (semana): ${pct(sonnet)}%`);
    }

    destroy() {
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        this._http.abort();
        super.destroy();
    }
});

let indicator = null;

function init() {
}

function enable() {
    indicator = new ClaudeUsageIndicator();
    Main.panel.addToStatusArea('simple-claude-usage', indicator);
}

function disable() {
    if (indicator) {
        indicator.destroy();
        indicator = null;
    }
}
