import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Clutter from 'gi://Clutter';
import Soup from 'gi://Soup?version=3.0';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const CREDS_PATH = GLib.get_home_dir() + '/.claude/.credentials.json';
const USAGE_URL = 'https://api.anthropic.com/api/oauth/usage';
const POLL_SECONDS = 60;

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

        this._sessionItem = new PopupMenu.PopupMenuItem('Sessão (5h): —', {reactive: false});
        this._weekItem = new PopupMenu.PopupMenuItem('Semana: —', {reactive: false});
        this._opusItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this._sonnetItem = new PopupMenu.PopupMenuItem('', {reactive: false});
        this._opusItem.visible = false;
        this._sonnetItem.visible = false;
        this.menu.addMenuItem(this._sessionItem);
        this.menu.addMenuItem(this._weekItem);
        this.menu.addMenuItem(this._opusItem);
        this.menu.addMenuItem(this._sonnetItem);
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        const refreshItem = new PopupMenu.PopupMenuItem('Atualizar agora');
        refreshItem.connect('activate', () => this._refresh());
        this.menu.addMenuItem(refreshItem);

        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, POLL_SECONDS, () => {
            this._refresh();
            return GLib.SOURCE_CONTINUE;
        });
        this._refresh();
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

    _refresh() {
        const token = this._readToken();
        if (!token) {
            this._setError('sem login');
            return;
        }

        const msg = Soup.Message.new('GET', USAGE_URL);
        msg.request_headers.append('Authorization', `Bearer ${token}`);
        msg.request_headers.append('anthropic-beta', 'oauth-2025-04-20');
        // Sem este User-Agent o endpoint cai num bucket de rate limit
        // agressivo e devolve 429 persistente (anthropics/claude-code#30930)
        msg.request_headers.replace('User-Agent', 'claude-code/2.1.172');

        this._http.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, result) => {
            try {
                const bytes = session.send_and_read_finish(result);
                const status = msg.get_status();
                if (status === 401) {
                    // Token expirado: o Claude Code renova ao ser aberto
                    this._setError('abra o Claude Code');
                    return;
                }
                if (status !== 200) {
                    this._setError(`HTTP ${status}`);
                    return;
                }
                const data = JSON.parse(new TextDecoder().decode(bytes.get_data()));
                this._update(data);
            } catch {
                this._setError('sem rede');
            }
        });
    }

    _setError(why) {
        this._label.set_text('✻ —');
        this._label.set_style('color: #888888;');
        this._sessionItem.label.set_text(`Erro: ${why}`);
        this._weekItem.label.set_text('Tentando de novo em 1 min');
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

    _update(data) {
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
        if (this._timeoutId) {
            GLib.source_remove(this._timeoutId);
            this._timeoutId = null;
        }
        this._http.abort();
        super.destroy();
    }
});

export default class ClaudeUsageExtension extends Extension {
    enable() {
        this._indicator = new ClaudeUsageIndicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator?.destroy();
        this._indicator = null;
    }
}
