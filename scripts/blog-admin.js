// Admin console for blog posts. Lists blog-posts/*.md, and lets the admin
// create or edit a post in the browser. Saving writes the markdown on the
// server and reruns the static build, so the generated post page updates.

const esc = AF.escapeHtml;
const panel = document.getElementById('admin-panel');
const editors = new WeakMap();

function noteBuilding(modal, on) {
    const save = modal.parentElement.querySelector('.af-save');
    if (save) { save.disabled = on; save.textContent = on ? 'Saving & building…' : 'Save'; }
}

async function refreshList() {
    let posts;
    try {
        posts = (await AF.api('GET', '/api/admin/blog')).posts;
    } catch (e) {
        panel.innerHTML = `<p class="error">${esc(e.message)}</p>`;
        return;
    }
    const rows = posts.map(p => `
        <li>
            <span class="blog-file">${esc(p.filename)}</span>
            <span class="blog-title">${esc(p.title)}</span>
            <button class="admin-btn" data-edit="${esc(p.filename)}">Edit</button>
        </li>`).join('');
    panel.innerHTML = `
        <div class="admin-toolbar">
            <button class="admin-btn admin-primary" id="new-post">+ New post</button>
            <span class="muted">Saving reruns the static build automatically.</span>
        </div>
        <ul class="blog-admin-list">${rows}</ul>`;
    panel.querySelector('#new-post').onclick = () => openEditor(null);
    panel.querySelectorAll('[data-edit]').forEach(btn => {
        btn.onclick = () => openEditor(btn.dataset.edit);
    });
}

async function openEditor(filename) {
    let initial = '';
    if (filename) {
        try {
            initial = (await AF.api('GET', `/api/admin/blog/${filename}`)).markdown;
        } catch (e) { alert(e.message); return; }
    } else {
        initial = [
            '---',
            'title: New Post',
            'date: ' + new Date().toISOString().slice(0, 10),
            'tags: ',
            'snippet: ',
            '---',
            '',
            '# Heading',
            '',
            'Write your post in Markdown. LaTeX with $…$, code with ``` fences.',
        ].join('\n');
    }

    AF.openModal(filename ? `Edit ${filename}` : 'New post', `
        <div id="post-editor"></div>
        <div class="af-error" id="post-err"></div>
    `, async (modal) => {
        const editor = editors.get(modal);
        noteBuilding(modal, true);
        try {
            if (filename) {
                await AF.api('PUT', `/api/admin/blog/${filename}`, { markdown: editor.getValue() });
            } else {
                await AF.api('POST', '/api/admin/blog', { markdown: editor.getValue() });
            }
            await refreshList();
            return true;
        } catch (e) {
            modal.querySelector('#post-err').textContent = e.message;
            noteBuilding(modal, false);
            return false;
        }
    }, null, { wide: true });

    const modal = document.querySelector('.af-modal');
    editors.set(modal, AF.mdEditor(modal.querySelector('#post-editor'), initial));
}

AF.mountAdminBar(document.getElementById('admin-bar'), (authed) => {
    if (authed) {
        refreshList();
    } else {
        panel.innerHTML = '<p class="muted">Log in as admin to manage blog posts.</p>';
    }
});
