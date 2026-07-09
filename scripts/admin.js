// Global admin widget + API helpers, loaded on every page via the shared
// footer (scripts/layout.py). Renders a persistent button in the top-right that
// handles login/logout and — when logged in — gives blog editing from anywhere.
// Pages subscribe with AF.onAuth(cb) to show their own admin affordances.

window.AF = (function () {
    let authed = false;
    let ready = false;
    const listeners = [];

    // ── API helpers ──────────────────────────────────────────────────────────
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
        const r = await fetch('/api/login', { method: 'POST', credentials: 'same-origin', body });
        if (!r.ok) throw new Error('Invalid credentials');
        return r.json();
    }

    async function logout() {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
    }

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

    function escapeHtml(s) {
        return (s || '').replace(/[&<>"]/g, c => (
            { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    }

    // ── auth subscription ────────────────────────────────────────────────────
    function onAuth(cb) {
        listeners.push(cb);
        if (ready) cb(authed);   // fire immediately if we already know
        return cb;
    }
    function isAdmin() { return authed; }
    function fire() { listeners.forEach(cb => { try { cb(authed); } catch (e) {} }); }

    // ── modal ────────────────────────────────────────────────────────────────
    function openModal(title, innerHTML, onSave, afterClose, opts = {}) {
        const overlay = document.createElement('div');
        overlay.className = 'af-modal-overlay';
        overlay.innerHTML = `
            <div class="af-modal ${opts.wide ? 'af-modal-wide' : ''}" role="dialog" aria-modal="true">
                <div class="af-modal-head"><h3>${escapeHtml(title)}</h3>
                    <button class="af-modal-x" aria-label="Close">&times;</button></div>
                <div class="af-modal-body">${innerHTML}</div>
                <div class="af-modal-foot">
                    <button class="admin-btn af-cancel">Cancel</button>
                    <button class="admin-btn admin-primary af-save">${opts.saveLabel || 'Save'}</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        const modal = overlay.querySelector('.af-modal');
        function close() { overlay.remove(); if (afterClose) afterClose(); }
        overlay.querySelector('.af-modal-x').onclick = close;
        overlay.querySelector('.af-cancel').onclick = close;
        overlay.addEventListener('mousedown', e => { if (e.target === overlay) close(); });
        if (!onSave) overlay.querySelector('.af-save').style.display = 'none';
        overlay.querySelector('.af-save').onclick = async () => {
            if (await onSave(modal)) close();
        };
        return { modal, close };
    }

    // ── markdown editor (textarea + live preview) ────────────────────────────
    function mdEditor(container, initial = '') {
        container.innerHTML = `<div class="md-editor">
            <textarea class="md-input" spellcheck="true"></textarea>
            <div class="md-preview post-full-body"></div></div>`;
        const ta = container.querySelector('.md-input');
        const pv = container.querySelector('.md-preview');
        ta.value = initial;
        function refresh() {
            pv.innerHTML = window.renderMarkdown ? window.renderMarkdown(ta.value) : ta.value;
            if (window.MathJax && window.MathJax.typesetPromise) window.MathJax.typesetPromise([pv]).catch(() => {});
        }
        ta.addEventListener('input', refresh);
        refresh();
        return { getValue: () => ta.value, refresh, textarea: ta };
    }

    // ── blog editing (available from the admin menu on any page) ─────────────
    const blogEditors = new WeakMap();

    async function manageBlog() {
        let posts;
        try { posts = (await api('GET', '/api/admin/blog')).posts; }
        catch (e) { alert(e.message); return; }
        const rows = posts.map(p =>
            `<li><span class="blog-file">${escapeHtml(p.filename)}</span>
                 <span class="blog-title">${escapeHtml(p.title)}</span>
                 <button class="admin-btn" data-edit="${escapeHtml(p.filename)}">Edit</button></li>`).join('');
        const { modal } = openModal('Blog posts', `
            <div class="admin-toolbar"><button class="admin-btn admin-primary" id="af-new-post">+ New post</button>
                <span class="muted">Saving reruns the static build.</span></div>
            <ul class="blog-admin-list">${rows}</ul>`, null, null, { wide: true });
        modal.querySelector('#af-new-post').onclick = () => editBlog(null);
        modal.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editBlog(b.dataset.edit));
    }

    async function editBlog(filename) {
        let initial;
        if (filename) {
            try { initial = (await api('GET', `/api/admin/blog/${filename}`)).markdown; }
            catch (e) { alert(e.message); return; }
        } else {
            initial = ['---', 'title: New Post', 'date: ' + new Date().toISOString().slice(0, 10),
                'tags: ', 'snippet: ', '---', '', '# Heading', '',
                'Write your post in Markdown. LaTeX with $…$, code with ``` fences.'].join('\n');
        }
        openModal(filename ? `Edit ${filename}` : 'New post',
            `<div id="af-post-editor"></div><div class="af-error" id="af-post-err"></div>`,
            async (modal) => {
                const ed = blogEditors.get(modal);
                const save = modal.parentElement.querySelector('.af-save');
                save.disabled = true; save.textContent = 'Saving & building…';
                try {
                    if (filename) await api('PUT', `/api/admin/blog/${filename}`, { markdown: ed.getValue() });
                    else await api('POST', '/api/admin/blog', { markdown: ed.getValue() });
                    return true;
                } catch (e) {
                    modal.querySelector('#af-post-err').textContent = e.message;
                    save.disabled = false; save.textContent = 'Save';
                    return false;
                }
            }, null, { wide: true, saveLabel: 'Save & build' });
        const modal = document.querySelector('.af-modal-overlay:last-child .af-modal') || document.querySelector('.af-modal');
        blogEditors.set(modal, mdEditor(modal.querySelector('#af-post-editor'), initial));
    }

    // ── the persistent button ────────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('af-admin-style')) return;
        const s = document.createElement('style');
        s.id = 'af-admin-style';
        s.textContent = `
        #af-admin { position: fixed; top: 10px; right: 12px; z-index: 3000; font-family: inherit; }
        #af-admin .af-adm-btn { display: inline-flex; align-items: center; gap: 6px; cursor: pointer;
            background: rgba(20,28,45,.72); color: #eaf2ff; border: 1px solid rgba(140,175,235,.5);
            border-radius: 999px; padding: 7px 13px; font-size: .82rem; font-weight: 600;
            backdrop-filter: blur(4px); box-shadow: 0 2px 10px rgba(0,0,0,.25); }
        #af-admin .af-adm-btn:hover { background: rgba(30,42,68,.92); border-color: rgba(160,195,255,.8); }
        #af-admin .af-adm-btn.is-in { background: rgba(28,90,60,.85); border-color: rgba(120,220,160,.6); }
        #af-admin .af-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ad991; box-shadow: 0 0 6px #4ad991; }
        #af-admin .af-menu { position: absolute; top: 40px; right: 0; min-width: 180px;
            background: #10182a; color: #eaf2ff; border: 1px solid rgba(140,175,235,.35);
            border-radius: 10px; box-shadow: 0 12px 34px rgba(0,0,0,.45); overflow: hidden; display: none; }
        #af-admin .af-menu.open { display: block; }
        #af-admin .af-menu button { display: block; width: 100%; text-align: left; background: none; border: none;
            color: #eaf2ff; padding: 10px 14px; font-size: .85rem; cursor: pointer; }
        #af-admin .af-menu button:hover { background: rgba(90,130,214,.25); }
        #af-admin .af-menu .af-sep { height: 1px; background: rgba(140,175,235,.2); margin: 4px 0; }`;
        document.head.appendChild(s);
    }

    function render() {
        let root = document.getElementById('af-admin');
        if (!root) {
            root = document.createElement('div');
            root.id = 'af-admin';
            document.body.appendChild(root);
        }
        if (authed) {
            root.innerHTML = `
                <button class="af-adm-btn is-in" id="af-adm-toggle" aria-haspopup="true">
                    <span class="af-dot"></span> Admin ▾</button>
                <div class="af-menu" id="af-adm-menu">
                    <button id="af-m-newpost">✎ New blog post</button>
                    <button id="af-m-blog">☰ Manage blog posts</button>
                    <div class="af-sep"></div>
                    <button id="af-m-logout">⎋ Log out</button>
                </div>`;
            const menu = root.querySelector('#af-adm-menu');
            root.querySelector('#af-adm-toggle').onclick = () => menu.classList.toggle('open');
            root.querySelector('#af-m-newpost').onclick = () => { menu.classList.remove('open'); editBlog(null); };
            root.querySelector('#af-m-blog').onclick = () => { menu.classList.remove('open'); manageBlog(); };
            root.querySelector('#af-m-logout').onclick = async () => {
                menu.classList.remove('open'); await logout(); await refresh();
            };
            document.addEventListener('click', e => { if (!root.contains(e.target)) menu.classList.remove('open'); });
        } else {
            root.innerHTML = `<button class="af-adm-btn" id="af-adm-login">🔒 Admin</button>`;
            root.querySelector('#af-adm-login').onclick = showLogin;
        }
    }

    function showLogin() {
        openModal('Admin log in', `
            <label>Username<input id="af-u" autocomplete="username"></label>
            <label>Password<input id="af-p" type="password" autocomplete="current-password"></label>
            <div class="af-error" id="af-login-err"></div>`,
            async (modal) => {
                try {
                    await login(modal.querySelector('#af-u').value, modal.querySelector('#af-p').value);
                    await refresh();
                    return true;
                } catch (e) {
                    modal.querySelector('#af-login-err').textContent = e.message;
                    return false;
                }
            }, null, { saveLabel: 'Log in' });
    }

    async function refresh() {
        const state = await me();
        authed = !!state.authenticated;
        ready = true;
        render();
        fire();
    }

    function init() {
        injectStyles();
        refresh();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    return { me, login, logout, api, escapeHtml, onAuth, isAdmin, openModal, mdEditor, manageBlog, editBlog };
})();
