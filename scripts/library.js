// Dynamic library: reads /api/books (public books, or all when admin) and
// renders a searchable, sortable catalog. Admins get add/edit/delete + a
// public/private toggle per book.

const container   = document.getElementById('booksContainer');
const searchInput = document.getElementById('search-input');
const sortSelect  = document.getElementById('sort-select');
const resultCount = document.getElementById('result-count');

let allBooks = [];
let isAdmin  = false;
let query    = '';

const esc = AF.escapeHtml;

function matches(b) {
    if (!query) return true;
    const hay = [b.title, b.author, b.isbn, (b.subjects || []).join(' ')].join(' ').toLowerCase();
    return hay.includes(query);
}

function sortBooks(list) {
    const v = sortSelect ? sortSelect.value : 'title-asc';
    const by = {
        'title-asc':  (a, b) => a.title.localeCompare(b.title),
        'title-desc': (a, b) => b.title.localeCompare(a.title),
        'author-asc': (a, b) => (a.author || '').localeCompare(b.author || ''),
        'year-desc':  (a, b) => (b.year || 0) - (a.year || 0),
        'year-asc':   (a, b) => (a.year || 0) - (b.year || 0),
    }[v] || (() => 0);
    return list.slice().sort(by);
}

function bookCard(b) {
    const subjects = (b.subjects || []).map(s => `<span class="tag">${esc(s)}</span>`).join('');
    const privateBadge = (!b.public) ? '<span class="private-badge">Private</span>' : '';
    const adminCtrls = isAdmin ? `
        <div class="card-admin">
            <button class="admin-btn" data-edit="${b.id}">Edit</button>
            <button class="admin-btn admin-danger" data-del="${b.id}">Delete</button>
        </div>` : '';
    const card = document.createElement('div');
    card.className = 'card book-card' + (b.public ? '' : ' is-private');
    card.innerHTML = `
        <div class="card-content">
            <h3>${esc(b.title)} ${privateBadge}</h3>
            <p class="book-meta">${esc(b.author || '')}${b.year ? ' · ' + b.year : ''}${b.edition ? ' · ed. ' + b.edition : ''}</p>
            <div class="post-tags">${subjects}</div>
            <p class="book-desc">${esc(b.description || '')}</p>
            ${adminCtrls}
        </div>`;
    if (isAdmin) {
        card.querySelector(`[data-edit="${b.id}"]`).onclick = () => openBookForm(b);
        card.querySelector(`[data-del="${b.id}"]`).onclick = () => deleteBook(b);
    }
    return card;
}

function render() {
    const list = sortBooks(allBooks.filter(matches));
    container.innerHTML = '';
    if (!list.length) {
        container.innerHTML = '<div class="error">No books found.</div>';
    } else {
        list.forEach((b, i) => {
            const card = bookCard(b);
            container.appendChild(card);
            // .card starts at opacity:0; reveal it (staggered fade-in).
            setTimeout(() => card.classList.add('card-visible'), i * 30);
        });
    }
    if (resultCount) {
        resultCount.textContent =
            `${list.length} book${list.length === 1 ? '' : 's'}` +
            (isAdmin ? ` (${allBooks.filter(b => !b.public).length} private)` : '');
    }
}

async function load() {
    try {
        const data = await AF.api('GET', '/api/books');
        allBooks = data.books;
        isAdmin = data.admin;
        document.getElementById('add-book-wrap').style.display = isAdmin ? '' : 'none';
        render();
    } catch (e) {
        container.innerHTML =
            '<div class="error">The library service is unavailable right now.</div>';
    }
}

// ── admin: add / edit / delete ───────────────────────────────────────────────
function openBookForm(book) {
    const b = book || {};
    AF.openModal(book ? 'Edit book' : 'Add book', `
        <label>Title<input id="f-title" value="${esc(b.title || '')}"></label>
        <label>Author(s)<input id="f-author" value="${esc(b.author || '')}"></label>
        <div class="form-row">
            <label>Year<input id="f-year" type="number" value="${b.year || ''}"></label>
            <label>Edition<input id="f-edition" type="number" value="${b.edition || ''}"></label>
        </div>
        <label>ISBN<input id="f-isbn" value="${esc(b.isbn || '')}"></label>
        <label>Publisher<input id="f-publisher" value="${esc(b.publisher || '')}"></label>
        <label>Subjects (comma-separated)<input id="f-subjects" value="${esc((b.subjects || []).join(', '))}"></label>
        <label>Description<textarea id="f-desc" rows="5">${esc(b.description || '')}</textarea></label>
        <label class="checkbox"><input id="f-public" type="checkbox" ${b.public === false ? '' : 'checked'}> Public (uncheck to hide behind admin login)</label>
        <div class="af-error" id="f-err"></div>
    `, async (modal) => {
        const payload = {
            title: modal.querySelector('#f-title').value,
            author: modal.querySelector('#f-author').value,
            year: modal.querySelector('#f-year').value || null,
            edition: modal.querySelector('#f-edition').value || null,
            isbn: modal.querySelector('#f-isbn').value,
            publisher: modal.querySelector('#f-publisher').value,
            subjects: modal.querySelector('#f-subjects').value,
            description: modal.querySelector('#f-desc').value,
            public: modal.querySelector('#f-public').checked,
        };
        try {
            if (book) await AF.api('PUT', `/api/admin/books/${book.id}`, payload);
            else await AF.api('POST', '/api/admin/books', payload);
            await load();
            return true;
        } catch (e) {
            modal.querySelector('#f-err').textContent = e.message;
            return false;
        }
    });
}

async function deleteBook(book) {
    if (!confirm(`Delete "${book.title}"?`)) return;
    await AF.api('DELETE', `/api/admin/books/${book.id}`);
    await load();
}

// ── wire up ──────────────────────────────────────────────────────────────────
if (searchInput) {
    let t = null;
    searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => { query = searchInput.value.trim().toLowerCase(); render(); }, 250);
    });
}
if (sortSelect) sortSelect.addEventListener('change', render);
document.getElementById('add-book-btn').onclick = () => openBookForm(null);

AF.onAuth(() => load());
