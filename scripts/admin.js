// Shared admin/auth helpers for the dynamic sections (library, courses, blog).
// Talks to the FastAPI backend under /api. Everything is same-origin, so the
// httpOnly session cookie rides along automatically.

window.AF = (function () {
    async function me() {
        try {
            const r = await fetch('/api/me', { credentials: 'same-origin' });
            return r.ok ? r.json() : { authenticated: false };
        } catch (e) {
            return { authenticated: false, offline: true };
        }
    }

    async function login(username, password) {
        const body = new URLSearchParams({ username, password });
        const r = await fetch('/api/login', {
            method: 'POST', credentials: 'same-origin', body,
        });
        if (!r.ok) throw new Error('Invalid credentials');
        return r.json();
    }

    async function logout() {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    }

    // JSON API call. Throws on non-2xx with the server's detail message.
    async function api(method, path, body) {
        const opts = { method, credentials: 'same-origin', headers: {} };
        if (body !== undefined) {
            opts.headers['Content-Type'] = 'application/json';
            opts.body = JSON.stringify(body);
        }
        const r = await fetch(path, opts);
        if (!r.ok) {
            let detail = r.statusText;
            try { detail = (await r.json()).detail || detail; } catch (e) {}
            throw new Error(detail);
        }
        return r.status === 204 ? null : r.json();
    }

    // Render a login / logout control into `el`. Calls onChange(authed) after
    // any state change so the page can re-render admin affordances.
    function mountAdminBar(el, onChange) {
        async function render() {
            const state = await me();
            el.innerHTML = '';
            const bar = document.createElement('div');
            bar.className = 'admin-bar';
            if (state.authenticated) {
                bar.innerHTML = `<span class="admin-tag">admin</span>
                    <button type="button" class="admin-btn" id="af-logout">Log out</button>`;
                el.appendChild(bar);
                el.querySelector('#af-logout').onclick = async () => {
                    await logout(); render();
                };
            } else if (!state.offline) {
                bar.innerHTML = `<button type="button" class="admin-btn admin-link" id="af-login">Admin log in</button>`;
                el.appendChild(bar);
                el.querySelector('#af-login').onclick = showLogin;
            }
            if (onChange) onChange(state.authenticated);
        }

        function showLogin() {
            openModal('Admin log in', `
                <label>Username<input id="af-u" autocomplete="username"></label>
                <label>Password<input id="af-p" type="password" autocomplete="current-password"></label>
                <div class="af-error" id="af-login-err"></div>
            `, async (modal) => {
                const u = modal.querySelector('#af-u').value;
                const p = modal.querySelector('#af-p').value;
                try {
                    await login(u, p);
                    return true;               // close modal
                } catch (e) {
                    modal.querySelector('#af-login-err').textContent = e.message;
                    return false;
                }
            }, render);
        }

        render();
        return { refresh: render };
    }

    // ── Minimal modal ────────────────────────────────────────────────────────
    // openModal(title, innerHTML, onSave -> bool|Promise<bool>, afterClose?)
    function openModal(title, innerHTML, onSave, afterClose, opts = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'af-modal-overlay';
        overlay.innerHTML = `
            <div class="af-modal ${opts.wide ? 'af-modal-wide' : ''}" role="dialog" aria-modal="true">
                <div class="af-modal-head">
                    <h3>${title}</h3>
                    <button class="af-modal-x" aria-label="Close">&times;</button>
                </div>
                <div class="af-modal-body">${innerHTML}</div>
                <div class="af-modal-foot">
                    <button class="admin-btn af-cancel">Cancel</button>
                    <button class="admin-btn admin-primary af-save">Save</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const modal = overlay.querySelector('.af-modal');
        function close() { overlay.remove(); if (afterClose) afterClose(); }
        overlay.querySelector('.af-modal-x').onclick = close;
        overlay.querySelector('.af-cancel').onclick = close;
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
        overlay.querySelector('.af-save').onclick = async () => {
            const done = await onSave(modal);
            if (done) close();
        };
        return { modal, close };
    }

    // ── Markdown editor: textarea + live preview via renderMarkdown ──────────
    function mdEditor(container, initial = '') {
        container.innerHTML = `
            <div class="md-editor">
                <textarea class="md-input" spellcheck="true"></textarea>
                <div class="md-preview post-full-body"></div>
            </div>`;
        const ta = container.querySelector('.md-input');
        const pv = container.querySelector('.md-preview');
        ta.value = initial;
        function refresh() {
            pv.innerHTML = window.renderMarkdown ? window.renderMarkdown(ta.value) : '';
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([pv]).catch(() => {});
            }
        }
        ta.addEventListener('input', refresh);
        refresh();
        return { getValue: () => ta.value, refresh, textarea: ta };
    }

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"]/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    return { me, login, logout, api, mountAdminBar, openModal, mdEditor, escapeHtml };
})();
