#!/usr/bin/env python3
"""
Sync the shared nav + footer into every managed page.

Walks the repo for *.html files (skipping vendored assets) and rewrites the
regions marked with the SITE-NAV / SITE-FOOTER comments from scripts/layout.py.
Pages without the markers are left untouched, so one-off pages (e.g. the 3D
resume) can opt out simply by not carrying them.

Run: python3 scripts/build_site.py
Generated blog post pages are handled by build_blogs.py (which shares layout.py).
"""

import os
import layout

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Directories that never contain managed pages.
SKIP_DIRS = {'.git', 'assets', 'images', 'node_modules'}
# Generated post pages are (re)built by build_blogs.py, but syncing them here
# too is harmless and keeps the nav consistent if only build_site.py is run.


def iter_html(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith('.html'):
                yield os.path.join(dirpath, name)


def main():
    changed = 0
    scanned = 0
    for path in iter_html(ROOT):
        scanned += 1
        if layout.sync_html(path):
            rel = os.path.relpath(path, ROOT)
            print(f'  synced {rel}')
            changed += 1
    print(f'build_site: {changed} file(s) updated, {scanned} scanned')


if __name__ == '__main__':
    main()
