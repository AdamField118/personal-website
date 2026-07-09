// Courses directory: reads /api/courses and renders a card per course linking
// to its notes. Admins can add / edit / delete courses.

const coursesContainer = document.getElementById('coursesContainer');
let isAdmin = false;
const esc = AF.escapeHtml;

function courseCard(c) {
    const meta = [c.code, c.term].filter(Boolean).map(esc).join(' · ');
    const privateBadge = c.public ? '' : '<span class="private-badge">Private</span>';
    const adminCtrls = isAdmin ? `
        <div class="card-admin">
            <button class="admin-btn" data-edit="${c.id}">Edit</button>
            <button class="admin-btn admin-danger" data-del="${c.id}">Delete</button>
        </div>` : '';
    const card = document.createElement('div');
    card.className = 'card' + (c.public ? '' : ' is-private');
    card.innerHTML = `
        <a href="/pages/course.html?slug=${encodeURIComponent(c.slug)}">
            <div class="card-content">
                <h3>${esc(c.title)} ${privateBadge}</h3>
                ${meta ? `<p class="book-meta">${meta}</p>` : ''}
                <p>${esc(c.description || '')}</p>
                <p class="note-count">${c.note_count} note${c.note_count === 1 ? '' : 's'}</p>
            </div>
        </a>
        ${adminCtrls}`;
    if (isAdmin) {
        card.querySelector(`[data-edit="${c.id}"]`).onclick = (e) => { e.preventDefault(); openCourseForm(c); };
        card.querySelector(`[data-del="${c.id}"]`).onclick = (e) => { e.preventDefault(); deleteCourse(c); };
    }
    return card;
}

function render(courses) {
    coursesContainer.innerHTML = '';
    if (!courses.length) {
        coursesContainer.innerHTML = isAdmin
            ? '<div class="error">No courses yet — use “Add course”.</div>'
            : '<div class="error">No courses published yet.</div>';
        return;
    }
    courses.forEach((c, i) => {
        const card = courseCard(c);
        coursesContainer.appendChild(card);
        // .card starts at opacity:0; reveal it (staggered fade-in).
        setTimeout(() => card.classList.add('card-visible'), i * 30);
    });
}

async function load() {
    try {
        const data = await AF.api('GET', '/api/courses');
        isAdmin = data.admin;
        document.getElementById('add-course-wrap').style.display = isAdmin ? '' : 'none';
        render(data.courses);
    } catch (e) {
        coursesContainer.innerHTML = '<div class="error">The courses service is unavailable right now.</div>';
    }
}

function openCourseForm(course) {
    const c = course || {};
    AF.openModal(course ? 'Edit course' : 'Add course', `
        <label>Title<input id="c-title" value="${esc(c.title || '')}"></label>
        <div class="form-row">
            <label>Code<input id="c-code" value="${esc(c.code || '')}" placeholder="PH3999"></label>
            <label>Term<input id="c-term" value="${esc(c.term || '')}" placeholder="Fall 2025"></label>
        </div>
        <label>Description<textarea id="c-desc" rows="3">${esc(c.description || '')}</textarea></label>
        <div class="form-row">
            <label>Sort order<input id="c-sort" type="number" value="${c.sort_order || 0}"></label>
            <label class="checkbox"><input id="c-public" type="checkbox" ${c.public === false ? '' : 'checked'}> Public</label>
        </div>
        <div class="af-error" id="c-err"></div>
    `, async (modal) => {
        const payload = {
            title: modal.querySelector('#c-title').value,
            code: modal.querySelector('#c-code').value,
            term: modal.querySelector('#c-term').value,
            description: modal.querySelector('#c-desc').value,
            sort_order: modal.querySelector('#c-sort').value,
            public: modal.querySelector('#c-public').checked,
        };
        try {
            if (course) await AF.api('PUT', `/api/admin/courses/${course.id}`, payload);
            else await AF.api('POST', '/api/admin/courses', payload);
            await load();
            return true;
        } catch (e) {
            modal.querySelector('#c-err').textContent = e.message;
            return false;
        }
    });
}

async function deleteCourse(course) {
    if (!confirm(`Delete "${course.title}" and all its notes?`)) return;
    await AF.api('DELETE', `/api/admin/courses/${course.id}`);
    await load();
}

document.getElementById('add-course-btn').onclick = () => openCourseForm(null);
AF.mountAdminBar(document.getElementById('admin-bar'), () => load());
