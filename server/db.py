"""
SQLite storage for the library and courses/notes. Standard-library sqlite3 only.

Schema:
  books   — the library catalog; `public=0` hides a book unless you're admin.
  courses — a course in the Courses directory.
  notes   — a Markdown note belonging to a course (`public=0` = admin-only).
"""

import json
import os
import sqlite3
import time

import config

SCHEMA = """
CREATE TABLE IF NOT EXISTS books (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn        TEXT,
    title       TEXT NOT NULL,
    author      TEXT,
    publisher   TEXT,
    year        INTEGER,
    edition     INTEGER,
    subjects    TEXT,              -- JSON array
    description TEXT,
    cover_url   TEXT,
    public      INTEGER NOT NULL DEFAULT 1,
    created_at  INTEGER,
    updated_at  INTEGER
);

CREATE TABLE IF NOT EXISTS courses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    code        TEXT,
    term        TEXT,
    description TEXT,
    public      INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER,
    updated_at  INTEGER
);

CREATE TABLE IF NOT EXISTS notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    slug        TEXT NOT NULL,
    title       TEXT NOT NULL,
    body_md     TEXT NOT NULL DEFAULT '',
    public      INTEGER NOT NULL DEFAULT 1,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  INTEGER,
    updated_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_notes_course ON notes(course_id);
"""


def now():
    return int(time.time())


def connect():
    os.makedirs(os.path.dirname(config.DB_PATH), exist_ok=True)
    conn = sqlite3.connect(config.DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute('PRAGMA foreign_keys = ON')
    return conn


def init_db():
    conn = connect()
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()


# ── row → dict helpers ───────────────────────────────────────────────────────
def book_to_dict(row):
    d = dict(row)
    d['subjects'] = json.loads(d.get('subjects') or '[]')
    d['public'] = bool(d['public'])
    return d


def course_to_dict(row):
    d = dict(row)
    d['public'] = bool(d['public'])
    return d


def note_to_dict(row):
    d = dict(row)
    d['public'] = bool(d['public'])
    return d


def slugify(text: str) -> str:
    import re
    s = (text or '').lower()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s or 'untitled'
