#!/usr/bin/env python3
"""
Build the whole static site, in dependency order:

  1. build_sims.py   — simulation pages + simulations.json
  2. build_blogs.py  — blog post pages + index.json + unified sitemap/feed/robots
                       (reads simulations.json, so it runs after build_sims)
  3. build_site.py   — sync shared nav/footer into every marked page

Run: python3 scripts/build.py
"""

import os
import runpy
import sys

SCRIPTS = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPTS)  # so each script's `import layout` resolves

for name in ('build_sims.py', 'build_blogs.py', 'build_site.py'):
    print(f'== {name} ==')
    runpy.run_path(os.path.join(SCRIPTS, name), run_name='__main__')
    print()

print('build: done')
