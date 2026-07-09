# Backend (FastAPI) — setup on the Pi

The dynamic parts of the site — the library, courses/notes, admin auth, and the
in-browser blog editor — are a small FastAPI app in `server/`. nginx serves the
static site and reverse-proxies `/api/` to this app (see the `/api/` block in
`deploy/nginx-adamfield.conf`). Only nginx is exposed; the app listens on
localhost.

Dependencies are just FastAPI + uvicorn (+ python-multipart). All crypto is
standard-library (PBKDF2 password hashing, HMAC-signed session cookies), so
there's nothing to compile on the Pi.

## 1. Install

```bash
cd /var/www/personal-website/server
python3 -m venv .venv           # optional but recommended
. .venv/bin/activate
pip install -r requirements.txt
```

(If you use the venv, point `ExecStart` in the systemd unit at
`/var/www/personal-website/server/.venv/bin/python`.)

## 2. Configure secrets

Generate the admin password hash and a session secret:

```bash
python3 hash_password.py
```

Create `/etc/adamfield/api.env` (referenced by the systemd unit) — a plain
`KEY=VALUE` file. **Do not `source` it in bash**: the `$` characters in the
pbkdf2 hash would be mangled by the shell. systemd's `EnvironmentFile` and
python-dotenv read it literally, which is fine.

```
AF_ADMIN_USERNAME=admin
AF_ADMIN_PASSWORD_HASH=pbkdf2_sha256$200000$....$....
AF_SECRET_KEY=<the token from hash_password.py>
AF_DB_PATH=/var/lib/adamfield/adamfield.db
AF_SITE_REPO=/var/www/personal-website
AF_COOKIE_SECURE=1
```

```bash
sudo mkdir -p /var/lib/adamfield && sudo chown adam:adam /var/lib/adamfield
```

`AF_COOKIE_SECURE=1` keeps the session cookie `Secure`. That's correct even
though nginx serves plain HTTP to Cloudflare, because the browser only ever
talks to Cloudflare over HTTPS. If you ever expose the Pi without HTTPS in
front, set it to `0` (not recommended).

## 3. Seed the library

Imports the old `library.adamfield.org` catalog (bundled at
`server/seed/books.json`) into the database. Run once:

```bash
AF_DB_PATH=/var/lib/adamfield/adamfield.db python3 seed_library.py
```

## 4. Run under systemd

```bash
sudo cp ../deploy/adamfield-api.service /etc/systemd/system/
# edit User/paths in the unit if needed
sudo systemctl daemon-reload
sudo systemctl enable --now adamfield-api
curl -s http://127.0.0.1:8000/api/health   # -> {"ok":true}
```

Reload nginx after adding the `/api/` proxy block:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 5. Use it

- **Library** (`/pages/library.html`) and **Courses** (`/pages/courses.html`)
  show public content to everyone. Click **Admin log in** to add/edit, mark
  books or notes private (`public` off = admin-only), and manage courses.
- **Blog editor** lives at `/pages/admin.html`. Log in, create or edit a post
  in Markdown; **Save** writes `blog-posts/blog-N.md` and reruns the static
  build so the post page regenerates. Commit the new markdown to git when you
  want it in version control.

## How the pieces map

| URL | Served by | Data |
|---|---|---|
| `/api/*` | FastAPI (uvicorn) | SQLite at `AF_DB_PATH` (off-git) |
| `/pages/library.html`, `/pages/courses.html`, `/pages/course.html` | static, hydrate from `/api` | DB |
| `/pages/admin.html` | static + `/api/admin/blog` | writes `blog-posts/*.md` + rebuild |
| everything else | static files | git |

## Local development

Run the whole thing on one origin without nginx:

```bash
cd server
AF_SERVE_STATIC=1 AF_COOKIE_SECURE=0 AF_DB_PATH=./data/dev.db \
AF_SECRET_KEY=dev AF_ADMIN_USERNAME=admin \
AF_ADMIN_PASSWORD_HASH="$(python3 -c 'import auth;print(auth.hash_password("dev"))')" \
python3 -m uvicorn app:app --reload --port 8000
# then open http://127.0.0.1:8000/pages/library.html
```
