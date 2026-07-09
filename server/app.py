"""
adamfield.org backend — FastAPI.

Serves everything under /api:
  - auth:    POST /api/login, POST /api/logout, GET /api/me
  - library: GET /api/books (+ admin CRUD under /api/admin/books)
  - courses: GET /api/courses, GET /api/courses/{slug}
             (+ admin CRUD under /api/admin/courses and /api/admin/notes)
  - blog:    admin-only editor endpoints under /api/admin/blog that write
             blog-posts/*.md and rerun the static build.

In production nginx serves the static site and proxies /api here. For local
testing set AF_SERVE_STATIC=1 to also serve the static site from this app.
"""

import json
import os
import re
import subprocess

from fastapi import FastAPI, Depends, HTTPException, Request, Response, Form
from fastapi.responses import JSONResponse

import config
import auth
import db

app = FastAPI(title="adamfield.org API", docs_url=None, redoc_url=None)


@app.on_event("startup")
def _startup():
    db.init_db()


# ── auth helpers ─────────────────────────────────────────────────────────────
def current_user(request: Request):
    token = request.cookies.get(config.COOKIE_NAME)
    return auth.verify_session_token(token) if token else None


def require_admin(request: Request):
    user = current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def _set_session_cookie(response: Response, username: str):
    response.set_cookie(
        config.COOKIE_NAME,
        auth.make_session_token(username),
        max_age=config.SESSION_TTL,
        httponly=True,
        secure=config.COOKIE_SECURE,
        samesite="lax",
        path="/",
    )


# ── auth routes ──────────────────────────────────────────────────────────────
@app.post("/api/login")
def login(response: Response, username: str = Form(...), password: str = Form(...)):
    ok = (
        config.ADMIN_PASSWORD_HASH
        and username == config.ADMIN_USERNAME
        and auth.verify_password(password, config.ADMIN_PASSWORD_HASH)
    )
    if not ok:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    _set_session_cookie(response, username)
    return {"authenticated": True, "username": username}


@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(config.COOKIE_NAME, path="/")
    return {"authenticated": False}


@app.get("/api/me")
def me(request: Request):
    user = current_user(request)
    return {"authenticated": bool(user), "username": user}


@app.get("/api/health")
def health():
    return {"ok": True}


# ── library ──────────────────────────────────────────────────────────────────
@app.get("/api/books")
def list_books(request: Request):
    is_admin = bool(current_user(request))
    conn = db.connect()
    try:
        if is_admin:
            rows = conn.execute("SELECT * FROM books ORDER BY title COLLATE NOCASE").fetchall()
        else:
            rows = conn.execute("SELECT * FROM books WHERE public=1 ORDER BY title COLLATE NOCASE").fetchall()
    finally:
        conn.close()
    return {"books": [db.book_to_dict(r) for r in rows], "admin": is_admin}


def _book_fields(payload: dict):
    subjects = payload.get("subjects", [])
    if isinstance(subjects, str):
        subjects = [s.strip() for s in subjects.split(",") if s.strip()]
    return {
        "isbn": payload.get("isbn", ""),
        "title": (payload.get("title") or "").strip(),
        "author": payload.get("author", ""),
        "publisher": payload.get("publisher", ""),
        "year": payload.get("year") or None,
        "edition": payload.get("edition") or None,
        "subjects": json.dumps(subjects),
        "description": payload.get("description", ""),
        "cover_url": payload.get("cover_url", ""),
        "public": 1 if payload.get("public", True) else 0,
    }


@app.post("/api/admin/books")
async def create_book(request: Request, _: str = Depends(require_admin)):
    f = _book_fields(await request.json())
    if not f["title"]:
        raise HTTPException(status_code=400, detail="Title is required")
    conn = db.connect()
    try:
        cur = conn.execute(
            """INSERT INTO books (isbn,title,author,publisher,year,edition,subjects,
                                  description,cover_url,public,created_at,updated_at)
               VALUES (:isbn,:title,:author,:publisher,:year,:edition,:subjects,
                       :description,:cover_url,:public,:t,:t)""",
            {**f, "t": db.now()},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM books WHERE id=?", (cur.lastrowid,)).fetchone()
    finally:
        conn.close()
    return db.book_to_dict(row)


@app.put("/api/admin/books/{book_id}")
async def update_book(book_id: int, request: Request, _: str = Depends(require_admin)):
    f = _book_fields(await request.json())
    conn = db.connect()
    try:
        if not conn.execute("SELECT 1 FROM books WHERE id=?", (book_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Book not found")
        conn.execute(
            """UPDATE books SET isbn=:isbn,title=:title,author=:author,publisher=:publisher,
               year=:year,edition=:edition,subjects=:subjects,description=:description,
               cover_url=:cover_url,public=:public,updated_at=:t WHERE id=:id""",
            {**f, "t": db.now(), "id": book_id},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM books WHERE id=?", (book_id,)).fetchone()
    finally:
        conn.close()
    return db.book_to_dict(row)


@app.delete("/api/admin/books/{book_id}")
def delete_book(book_id: int, _: str = Depends(require_admin)):
    conn = db.connect()
    try:
        conn.execute("DELETE FROM books WHERE id=?", (book_id,))
        conn.commit()
    finally:
        conn.close()
    return {"deleted": book_id}


# ── courses & notes ──────────────────────────────────────────────────────────
@app.get("/api/courses")
def list_courses(request: Request):
    is_admin = bool(current_user(request))
    conn = db.connect()
    try:
        where = "" if is_admin else "WHERE public=1"
        rows = conn.execute(
            f"SELECT * FROM courses {where} ORDER BY sort_order, title COLLATE NOCASE"
        ).fetchall()
        courses = []
        for r in rows:
            c = db.course_to_dict(r)
            note_sql = "SELECT COUNT(*) FROM notes WHERE course_id=?"
            if not is_admin:
                note_sql += " AND public=1"
            c["note_count"] = conn.execute(note_sql, (r["id"],)).fetchone()[0]
            courses.append(c)
    finally:
        conn.close()
    return {"courses": courses, "admin": is_admin}


@app.get("/api/courses/{slug}")
def get_course(slug: str, request: Request):
    is_admin = bool(current_user(request))
    conn = db.connect()
    try:
        row = conn.execute("SELECT * FROM courses WHERE slug=?", (slug,)).fetchone()
        if not row or (not is_admin and not row["public"]):
            raise HTTPException(status_code=404, detail="Course not found")
        course = db.course_to_dict(row)
        nwhere = "" if is_admin else "AND public=1"
        notes = conn.execute(
            f"SELECT * FROM notes WHERE course_id=? {nwhere} ORDER BY sort_order, title COLLATE NOCASE",
            (row["id"],),
        ).fetchall()
        course["notes"] = [db.note_to_dict(n) for n in notes]
    finally:
        conn.close()
    return {"course": course, "admin": is_admin}


def _course_fields(payload: dict):
    return {
        "title": (payload.get("title") or "").strip(),
        "code": payload.get("code", ""),
        "term": payload.get("term", ""),
        "description": payload.get("description", ""),
        "public": 1 if payload.get("public", True) else 0,
        "sort_order": int(payload.get("sort_order", 0) or 0),
    }


@app.post("/api/admin/courses")
async def create_course(request: Request, _: str = Depends(require_admin)):
    payload = await request.json()
    f = _course_fields(payload)
    if not f["title"]:
        raise HTTPException(status_code=400, detail="Title is required")
    slug = db.slugify(payload.get("slug") or f["title"])
    conn = db.connect()
    try:
        if conn.execute("SELECT 1 FROM courses WHERE slug=?", (slug,)).fetchone():
            raise HTTPException(status_code=409, detail="A course with that slug exists")
        cur = conn.execute(
            """INSERT INTO courses (slug,title,code,term,description,public,sort_order,created_at,updated_at)
               VALUES (:slug,:title,:code,:term,:description,:public,:sort_order,:t,:t)""",
            {**f, "slug": slug, "t": db.now()},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM courses WHERE id=?", (cur.lastrowid,)).fetchone()
    finally:
        conn.close()
    return db.course_to_dict(row)


@app.put("/api/admin/courses/{course_id}")
async def update_course(course_id: int, request: Request, _: str = Depends(require_admin)):
    payload = await request.json()
    f = _course_fields(payload)
    conn = db.connect()
    try:
        if not conn.execute("SELECT 1 FROM courses WHERE id=?", (course_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Course not found")
        conn.execute(
            """UPDATE courses SET title=:title,code=:code,term=:term,description=:description,
               public=:public,sort_order=:sort_order,updated_at=:t WHERE id=:id""",
            {**f, "t": db.now(), "id": course_id},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM courses WHERE id=?", (course_id,)).fetchone()
    finally:
        conn.close()
    return db.course_to_dict(row)


@app.delete("/api/admin/courses/{course_id}")
def delete_course(course_id: int, _: str = Depends(require_admin)):
    conn = db.connect()
    try:
        conn.execute("DELETE FROM courses WHERE id=?", (course_id,))
        conn.commit()
    finally:
        conn.close()
    return {"deleted": course_id}


def _note_fields(payload: dict):
    return {
        "title": (payload.get("title") or "").strip(),
        "body_md": payload.get("body_md", ""),
        "public": 1 if payload.get("public", True) else 0,
        "sort_order": int(payload.get("sort_order", 0) or 0),
    }


@app.post("/api/admin/courses/{course_id}/notes")
async def create_note(course_id: int, request: Request, _: str = Depends(require_admin)):
    payload = await request.json()
    f = _note_fields(payload)
    if not f["title"]:
        raise HTTPException(status_code=400, detail="Title is required")
    slug = db.slugify(payload.get("slug") or f["title"])
    conn = db.connect()
    try:
        if not conn.execute("SELECT 1 FROM courses WHERE id=?", (course_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Course not found")
        cur = conn.execute(
            """INSERT INTO notes (course_id,slug,title,body_md,public,sort_order,created_at,updated_at)
               VALUES (:course_id,:slug,:title,:body_md,:public,:sort_order,:t,:t)""",
            {**f, "course_id": course_id, "slug": slug, "t": db.now()},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM notes WHERE id=?", (cur.lastrowid,)).fetchone()
    finally:
        conn.close()
    return db.note_to_dict(row)


@app.put("/api/admin/notes/{note_id}")
async def update_note(note_id: int, request: Request, _: str = Depends(require_admin)):
    payload = await request.json()
    f = _note_fields(payload)
    conn = db.connect()
    try:
        if not conn.execute("SELECT 1 FROM notes WHERE id=?", (note_id,)).fetchone():
            raise HTTPException(status_code=404, detail="Note not found")
        conn.execute(
            """UPDATE notes SET title=:title,body_md=:body_md,public=:public,
               sort_order=:sort_order,updated_at=:t WHERE id=:id""",
            {**f, "t": db.now(), "id": note_id},
        )
        conn.commit()
        row = conn.execute("SELECT * FROM notes WHERE id=?", (note_id,)).fetchone()
    finally:
        conn.close()
    return db.note_to_dict(row)


@app.delete("/api/admin/notes/{note_id}")
def delete_note(note_id: int, _: str = Depends(require_admin)):
    conn = db.connect()
    try:
        conn.execute("DELETE FROM notes WHERE id=?", (note_id,))
        conn.commit()
    finally:
        conn.close()
    return {"deleted": note_id}


# ── blog admin (write markdown + rerun the static build) ─────────────────────
BLOG_DIR = os.path.join(config.SITE_REPO, "blog-posts")
_SAFE_BLOG = re.compile(r"^blog-\d+\.md$")


def _blog_path(filename: str) -> str:
    if not _SAFE_BLOG.match(filename):
        raise HTTPException(status_code=400, detail="Filename must look like blog-N.md")
    path = os.path.normpath(os.path.join(BLOG_DIR, filename))
    if os.path.dirname(path) != os.path.normpath(BLOG_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")
    return path


def _next_blog_filename() -> str:
    nums = [
        int(m.group(1))
        for f in os.listdir(BLOG_DIR)
        if (m := re.match(r"blog-(\d+)\.md$", f))
    ]
    return f"blog-{(max(nums) + 1) if nums else 1}.md"


def _run_build():
    """Rerun the static build so new/edited posts are regenerated."""
    subprocess.run(
        ["python3", os.path.join("scripts", "build_blogs.py")],
        cwd=config.SITE_REPO, check=True, capture_output=True, text=True,
    )
    subprocess.run(
        ["python3", os.path.join("scripts", "build_site.py")],
        cwd=config.SITE_REPO, check=True, capture_output=True, text=True,
    )


@app.get("/api/admin/blog")
def list_blog(_: str = Depends(require_admin)):
    files = sorted(
        (f for f in os.listdir(BLOG_DIR) if _SAFE_BLOG.match(f)),
        key=lambda f: int(re.match(r"blog-(\d+)", f).group(1)),
    )
    out = []
    for f in files:
        raw = open(os.path.join(BLOG_DIR, f), encoding="utf-8").read()
        m = re.search(r'title:\s*"?(.*?)"?\s*$', raw[:400], re.MULTILINE)
        out.append({"filename": f, "title": m.group(1) if m else f})
    return {"posts": out}


@app.get("/api/admin/blog/{filename}")
def read_blog(filename: str, _: str = Depends(require_admin)):
    path = _blog_path(filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Post not found")
    return {"filename": filename, "markdown": open(path, encoding="utf-8").read()}


@app.post("/api/admin/blog")
def create_blog(payload: dict, _: str = Depends(require_admin)):
    markdown = payload.get("markdown", "")
    filename = _next_blog_filename()
    with open(os.path.join(BLOG_DIR, filename), "w", encoding="utf-8") as fh:
        fh.write(markdown)
    _run_build()
    return {"filename": filename, "built": True}


@app.put("/api/admin/blog/{filename}")
def save_blog(filename: str, payload: dict, _: str = Depends(require_admin)):
    path = _blog_path(filename)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(payload.get("markdown", ""))
    _run_build()
    return {"filename": filename, "built": True}


# ── optional static serving for local dev (AF_SERVE_STATIC=1) ────────────────
if config.SERVE_STATIC:
    from fastapi.staticfiles import StaticFiles
    app.mount("/", StaticFiles(directory=config.SITE_REPO, html=True), name="static")
