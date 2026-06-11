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
const POLL_SECONDS = 60;
// On failure the poll interval doubles per attempt, up to this cap
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

    // Reads the OAuth token Claude Code stores locally. The token is only
    // ever sent to api.anthropic.com, the same host Claude Code talks to.
    _readToken(cb) {
        const file = Gio.File.new_for_path(CREDS_PATH);
        file.load_contents_async(null, (f, res) => {
            try {
                const [ok, contents] = f.load_contents_finish(res);
                if (!ok) {
                    cb(null, 0);
                    return;
                }
                const creds = JSON.parse(new TextDecoder().decode(contents));
                const oauth = creds?.claudeAiOauth ?? {};
                cb(oauth.accessToken ?? null, oauth.expiresAt ?? 0);
            } catch {
                cb(null, 0);
            }
        });
    }

    _refresh() {
        this._readToken((token, expiresAt) => {
            if (!token) {
                this._onFailure('not logged in to Claude Code');
                return;
            }

            const msg = Soup.Message.new('GET', USAGE_URL);
            msg.request_headers.append('Authorization', `Bearer ${token}`);
            msg.request_headers.append('anthropic-beta', 'oauth-2025-04-20');
            // Without a claude-code User-Agent this endpoint applies a far
            // stricter rate-limit bucket and returns persistent 429s
            // (anthropics/claude-code#30930)
            msg.request_headers.replace('User-Agent', 'claude-code/2.1.172');

            this._http.send_and_read_async(msg, GLib.PRIORITY_DEFAULT, null, (session, result) => {
                let bytes;
                try {
                    bytes = session.send_and_read_finish(result);
                } catch {
                    this._onFailure('network error');
                    return;
                }

                const status = msg.get_status();
                if (status === 401) {
                    // A token that expired hours ago means Claude Code on this
                    // machine is not refreshing the credentials file (another
                    // machine, API-key auth, custom CLAUDE_CONFIG_DIR…)
                    const stale = expiresAt && Date.now() - expiresAt > 3600000;
                    this._onFailure(stale
                        ? 'credentials stale — run claude in a terminal'
                        : 'token expired — open Claude Code');
                    return;
                }
                if (status === 429) {
                    this._onFailure('API rate limited');
                    return;
                }
                if (status !== 200) {
                    this._onFailure(`HTTP ${status}`);
                    return;
                }

                let data;
                try {
                    data = JSON.parse(new TextDecoder().decode(bytes.get_data()));
                } catch {
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
        const wait = Math.min(POLL_SECONDS * 2 ** this._failures, POLL_MAX_SECONDS);

        // Keep the last known value on the bar, dimmed to signal staleness
        if (this._lastGood)
            this._label.set_style('color: #888888;');
        else
            this._label.set_text('✻ —');

        const mins = Math.max(1, Math.round(wait / 60));
        this._statusItem.label.set_text(`⚠ ${why} · retrying in ${mins} min`);
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
            `Session (5h): ${s ?? '—'}%  ·  resets ${this._fmtReset(five.resets_at)}`);
        this._weekItem.label.set_text(
            `Week: ${w ?? '—'}%  ·  resets ${this._fmtReset(week.resets_at)}`);

        const opus = data.seven_day_opus?.utilization;
        this._opusItem.visible = opus !== null && opus !== undefined;
        if (this._opusItem.visible)
            this._opusItem.label.set_text(`Opus (week): ${pct(opus)}%`);

        const sonnet = data.seven_day_sonnet?.utilization;
        this._sonnetItem.visible = sonnet !== null && sonnet !== undefined;
        if (this._sonnetItem.visible)
            this._sonnetItem.label.set_text(`Sonnet (week): ${pct(sonnet)}%`);
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
