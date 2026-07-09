"""
Configuration for the adamfield.org backend, all from environment variables so
nothing secret lives in git. See server/.env.example for the full list.
"""

import os

# ── Paths ────────────────────────────────────────────────────────────────────
# Repo checkout root (…/personal-website). Used to locate blog markdown and the
# build scripts the admin blog editor triggers.
SITE_REPO = os.environ.get(
    'AF_SITE_REPO',
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

# SQLite database file. Keep it OUTSIDE the repo in production (e.g.
# /var/lib/adamfield/adamfield.db) so private data never lands in git.
DB_PATH = os.environ.get('AF_DB_PATH', os.path.join(SITE_REPO, 'server', 'data', 'adamfield.db'))

# ── Auth ─────────────────────────────────────────────────────────────────────
ADMIN_USERNAME = os.environ.get('AF_ADMIN_USERNAME', 'admin')
# pbkdf2 string produced by `python3 server/hash_password.py` (never commit it).
ADMIN_PASSWORD_HASH = os.environ.get('AF_ADMIN_PASSWORD_HASH', '')
# HMAC key that signs session cookies. MUST be set in production.
SECRET_KEY = os.environ.get('AF_SECRET_KEY', '')

COOKIE_NAME   = os.environ.get('AF_COOKIE_NAME', 'af_session')
# Cloudflare terminates TLS in the default deploy, so the cookie is still marked
# Secure (the browser talks HTTPS to Cloudflare). Set AF_COOKIE_SECURE=0 only
# for local http testing.
COOKIE_SECURE = os.environ.get('AF_COOKIE_SECURE', '1') not in ('0', 'false', 'False', '')
SESSION_TTL   = int(os.environ.get('AF_SESSION_TTL', str(7 * 24 * 3600)))  # 7 days

# ── Dev convenience ──────────────────────────────────────────────────────────
# When 1, uvicorn also serves the static site at "/", so the whole thing runs on
# one origin for local testing. In production nginx serves static and proxies
# only /api to this app, so leave this off.
SERVE_STATIC = os.environ.get('AF_SERVE_STATIC', '0') in ('1', 'true', 'True')

# Allowed CORS origins (normally none — same-origin behind nginx).
CORS_ORIGINS = [o for o in os.environ.get('AF_CORS_ORIGINS', '').split(',') if o]
