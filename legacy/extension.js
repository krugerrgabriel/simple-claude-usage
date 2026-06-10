'use strict';

// Legacy build for GNOME Shell 42-44 (pre-ESM extensions).
// GNOME 42 runs libsoup 2.4 inside the shell process; 43+ use libsoup 3,
// and mixing the two in one process aborts — so pin the right one upfront.
const Config = imports.misc.config;
const SHELL_MAJOR = parseInt(Config.PACKAGE_VERSION.split('.')[0], 10);
imports.gi.versions.Soup = SHELL_MAJOR >= 43 ? '3.0' : '2.4';

const {GObject, St, Clutter, GLib, Gio, Soup} = imports.gi;
const ByteArray = imports.byteArray;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Me = imports.misc.extensionUtils.getCurrentExtension();

const CREDS_PATH = GLib.get_home_dir() + '/.claude/.credentials.json';
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const REPO = 'krugerrgabriel/simple-claude-usage';
const RELEASES_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;
// A build legada vive em legacy/ no repositório
const RAW_SUBDIR = 'legacy/';
const POLL_SECONDS = 60;
// Em falha o intervalo dobra a cada tentativa até este teto
const POLL_MAX_SECONDS = 600;
const UPDATE_CHECK_SECONDS = 86400;

const ClaudeUsageIndicator = GObject.registerClass(
class ClaudeUsageIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, 'Claude Usage');

        this._path = Me.path;
        this._uuid = Me.metadata.uuid;
        this._version = Me.metadata['version-name'] || '0.0.0';

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

        this._sessionItem = new PopupMenu.PopupMenuItem('Session (5h): —', {reactive: false});
        this._weekItem = new PopupMenu.PopupMenuItem('Week: —', {reactive: false});
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

        const refreshItem = new PopupMenu.PopupMenuItem('Refresh now');
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

    _readToken(cb) {
        const file = Gio.File.new_for_path(CREDS_PATH);
        file.load_contents_async(null, (f, res) => {
            try {
                const [ok, contents] = f.load_contents_finish(res);
                if (!ok) {
                    cb(null);
                    return;
                }
                const creds = JSON.parse(ByteArray.toString(contents));
                cb((creds.claudeAiOauth && creds.claudeAiOauth.accessToken) || null);
            } catch (e) {
                cb(null);
            }
        });
    }

    // Runs the GET and calls cb(statusCode, bodyText) on either Soup API.
    _fetchText(url, headers, cb) {
        const msg = Soup.Message.new('GET', url);
        msg.request_headers.replace('User-Agent', `simple-claude-usage/${this._version}`);
        for (const k of Object.keys(headers))
            msg.request_headers.replace(k, headers[k]);

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
                cb(status, body);
            });
        } else {
            this._http.queue_message(msg, (session, m) => {
                cb(m.status_code, m.response_body ? m.response_body.data : null);
            });
        }
    }

    _refresh() {
        this._readToken(token => {
            if (!token) {
                this._onFailure('not logged in to Claude Code');
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
                    this._onFailure('token expired — open Claude Code');
                    return;
                }
                if (status === 429) {
                    this._onFailure('API rate limited');
                    return;
                }
                if (status !== 200 || !body) {
                    this._onFailure(status ? `HTTP ${status}` : 'network error');
                    return;
                }
                let data;
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    this._onFailure('unexpected response');
                    return;
                }
                this._onSuccess(data);
            });
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
        this._statusItem.label.set_text(`⚠ ${why} · retrying in ${mins} min`);
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
            } catch (e) {
            }
        });
    }

    _offerUpdate(tag) {
        this._pendingTag = tag;
        this._updateState = 'available';
        this._updateItem.label.set_text(`⬆ ${tag} available — click to update`);
        this._updateItem.visible = true;
        if (this._notifiedTag !== tag) {
            this._notifiedTag = tag;
            Main.notify('Simple Claude Usage',
                `Version ${tag} available — click ✻ in the top bar to update.`);
        }
    }

    _onUpdateClicked() {
        if (this._updateState === 'available')
            this._downloadUpdate(this._pendingTag);
        else if (this._updateState === 'failed')
            Gio.AppInfo.launch_default_for_uri(RELEASES_PAGE, null);
    }

    _downloadUpdate(tag) {
        this._updateItem.label.set_text('⏳ Downloading update…');
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
                    this._updateItem.label.set_text('✓ Updated — restart GNOME Shell to apply');
                    Main.notify('Simple Claude Usage',
                        `Updated to ${tag}. Restart GNOME Shell to apply (X11: Alt+F2 → r).`);
                } catch (e) {
                    this._updateState = 'failed';
                    this._updateItem.label.set_text('⚠ Download failed — click to open GitHub');
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
            `Session (5h): ${s !== null ? s : '—'}%  ·  resets ${this._fmtReset(five.resets_at)}`);
        this._weekItem.label.set_text(
            `Week: ${w !== null ? w : '—'}%  ·  resets ${this._fmtReset(week.resets_at)}`);

        const opus = data.seven_day_opus ? data.seven_day_opus.utilization : null;
        this._opusItem.visible = opus !== null && opus !== undefined;
        if (this._opusItem.visible)
            this._opusItem.label.set_text(`Opus (week): ${pct(opus)}%`);

        const sonnet = data.seven_day_sonnet ? data.seven_day_sonnet.utilization : null;
        this._sonnetItem.visible = sonnet !== null && sonnet !== undefined;
        if (this._sonnetItem.visible)
            this._sonnetItem.label.set_text(`Sonnet (week): ${pct(sonnet)}%`);
    }

    destroy() {
        const ids = [this._timeoutId, this._updateInitialId, this._updateDailyId];
        for (let i = 0; i < ids.length; i++) {
            if (ids[i])
                GLib.source_remove(ids[i]);
        }
        this._timeoutId = this._updateInitialId = this._updateDailyId = null;
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
