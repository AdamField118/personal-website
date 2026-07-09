// Course detail: renders a course's notes (Markdown → HTML via renderMarkdown,
// with MathJax + Prism like the blog). Admins get add / edit / delete on notes.

const esc = AF.escapeHtml;
const slug = new URLSearchParams(location.search).get('slug');

const titleEl = document.getElementById('course-title');
const metaEl  = document.getElementById('course-meta');
const listEl  = document.getElementById('note-list');
const bodyEl  = document.getElementById('note-body');
const addWrap = document.getElementById('add-note-wrap');

let course = null;
let isAdmin = false;
let currentNoteId = null;

function renderNoteBody(note) {
    currentNoteId = note ? note.id : null;
    if (!note) {
        bodyEl.innerHTML = '<p class="muted">Select a note.</p>';
        return;
    }
    const adminCtrls = isAdmin ? `
        <div class="card-admin note-actions">
            <button class="admin-btn" id="edit-note">Edit</button>
            <button class="admin-btn admin-danger" id="del-note">Delete</button>
            <span class="private-badge" style="${note.public ? 'display:none' : ''}">Private</span>
        </div>` : '';
    bodyEl.innerHTML = `
        <div class="post-full-header">
            <h2 class="post-full-title">${esc(note.title)}</h2>
            ${adminCtrls}
        </div>
        <div class="post-full-body">${window.renderMarkdown(note.body_md || '')}</div>`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([bodyEl]).catch(() => {});
    }
    if (window.Prism) window.Prism.highlightAllUnder(bodyEl);
    if (isAdmin) {
        bodyEl.querySelector('#edit-note').onclick = () => openNoteForm(note);
        bodyEl.querySelector('#del-note').onclick = () => deleteNote(note);
    }
}

function renderNoteList() {
    listEl.innerHTML = '';
    if (!course.notes.length) {
        listEl.innerHTML = '<li class="muted">No notes yet.</li>';
        renderNoteBody(null);
        return;
    }
    course.notes.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `<button class="note-link${n.id === currentNoteId ? ' active' : ''}">
            ${esc(n.title)}${n.public ? '' : ' <span class="private-dot" title="Private">●</span>'}</button>`;
        li.querySelector('button').onclick = () => {
            currentNoteId = n.id;
            renderNoteList();
            renderNoteBody(n);
        };
        listEl.appendChild(li);
    });
}

async function load() {
    if (!slug) { titleEl.textContent = 'Course not found'; return; }
    try {
        const data = await AF.api('GET', `/api/courses/${encodeURIComponent(slug)}`);
        course = data.course;
        isAdmin = data.admin;
        document.title = `${course.title} — Adam Field`;
        titleEl.textContent = course.title;
        metaEl.textContent = [course.code, course.term].filter(Boolean).join(' · ');
        addWrap.style.display = isAdmin ? '' : 'none';
        // keep current selection if still present, else first note
        const keep = course.notes.find(n => n.id === currentNoteId);
        const sel = keep || course.notes[0] || null;
        currentNoteId = sel ? sel.id : null;
        renderNoteList();
        renderNoteBody(sel);
    } catch (e) {
        titleEl.textContent = 'Course not found';
        bodyEl.innerHTML = `<p class="error">${esc(e.message)}</p>`;
    }
}

function openNoteForm(note) {
    const n = note || {};
    AF.openModal(note ? 'Edit note' : 'Add note', `
        <label>Title<input id="n-title" value="${esc(n.title || '')}"></label>
        <div class="form-row">
            <label>Sort order<input id="n-sort" type="number" value="${n.sort_order || 0}"></label>
            <label class="checkbox"><input id="n-public" type="checkbox" ${n.public === false ? '' : 'checked'}> Public</label>
        </div>
        <label>Markdown (LaTeX with $…$, code with \`\`\` — just like the blog)</label>
        <div id="n-editor"></div>
        <div class="af-error" id="n-err"></div>
    `, async (modal) => {
        const editor = editors.get(modal);
        const payload = {
            title: modal.querySelector('#n-title').value,
            sort_order: modal.querySelector('#n-sort').value,
            public: modal.querySelector('#n-public').checked,
            body_md: editor.getValue(),
        };
        try {
            if (note) await AF.api('PUT', `/api/admin/notes/${note.id}`, payload);
            else await AF.api('POST', `/api/admin/courses/${course.id}/notes`, payload);
            await load();
            return true;
        } catch (e) {
            modal.querySelector('#n-err').textContent = e.message;
            return false;
        }
    }, null, { wide: true });

    // mount the markdown editor inside the just-opened modal
    const modal = document.querySelector('.af-modal');
    const editor = AF.mdEditor(modal.querySelector('#n-editor'), n.body_md || '');
    editors.set(modal, editor);
}

const editors = new WeakMap();

async function deleteNote(note) {
    if (!confirm(`Delete note "${note.title}"?`)) return;
    await AF.api('DELETE', `/api/admin/notes/${note.id}`);
    currentNoteId = null;
    await load();
}

document.getElementById('add-note-btn').onclick = () => openNoteForm(null);
AF.mountAdminBar(document.getElementById('admin-bar'), () => load());
