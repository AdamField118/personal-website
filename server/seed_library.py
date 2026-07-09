#!/usr/bin/env python3
"""
One-time import of the old library.adamfield.org catalog (server/seed/books.json)
into the database. Safe to run once on a fresh DB; skips if books already exist.

    python3 server/seed_library.py
"""

import json
import os

import db

SEED = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seed", "books.json")


def main():
    db.init_db()
    conn = db.connect()
    try:
        existing = conn.execute("SELECT COUNT(*) FROM books").fetchone()[0]
        if existing:
            print(f"books table already has {existing} rows — nothing to import.")
            return
        data = json.load(open(SEED, encoding="utf-8"))
        for b in data.get("books", []):
            conn.execute(
                """INSERT INTO books (isbn,title,author,publisher,year,edition,subjects,
                                      description,cover_url,public,created_at,updated_at)
                   VALUES (?,?,?,?,?,?,?,?,?,1,?,?)""",
                (
                    b.get("isbn", ""), b.get("title", ""), b.get("author", ""),
                    b.get("publisher", ""), b.get("year"), b.get("edition"),
                    json.dumps(b.get("subjects", [])), b.get("description", ""),
                    b.get("cover_url", ""), db.now(), db.now(),
                ),
            )
        conn.commit()
        print(f"imported {len(data.get('books', []))} books.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
