# Consolidation — final layout & cutover

Every `*.adamfield.org` site now lives in this one repo, served by nginx on the
Pi behind Cloudflare. This is the operational reference; deploy details are in
`deploy/`.

## Sections

| Tab | URL | How it works |
|---|---|---|
| Home | `/index.html` | static |
| Blog | `/pages/blog.html`, `/pages/posts/*` | markdown → static (`build_blogs.py`); editable in-browser via `/pages/admin.html` |
| Simulations | `/pages/sims.html`, `/pages/simulations/*` | `build_sims.py` from `simulations.json`; includes the relativistic-aberration WebGL sim |
| Games | `/pages/games.html`, `/pages/games/*` | `games.json` registry; Magic 8-Ball live, others scaffolded (`pages/games/TODO.md`) |
| Courses | `/pages/courses.html`, `/pages/course.html` | dynamic, from `/api` (DB); admin adds courses + markdown notes |
| Library | `/pages/library.html` | dynamic, from `/api` (DB); public catalog + admin-only private books |
| Resume | `/pages/resume.html` | static (3D) |

Shared nav/footer come from `scripts/layout.py`; `scripts/build.py` runs the
whole build (`sims → blogs → site-sync`).

## Backend

FastAPI in `server/`, reverse-proxied at `/api/` (see `deploy/backend.md`).
SQLite lives off-git on the Pi. Admin auth is a single password (PBKDF2) with an
HMAC-signed session cookie — standard library only.

## Cutover checklist

1. **Deploy** the updated checkout to the Pi; run `python3 scripts/build.py`.
2. **Stand up the backend** — `deploy/backend.md` (venv, secrets, seed library,
   systemd unit); add the `/api/` block to nginx and reload.
3. **Redirects** — install `deploy/nginx-redirects.conf` (subdomains on the Pi)
   *or* the rules in `deploy/cloudflare-redirect-rules.md` (subdomains on
   Cloudflare Pages / elsewhere). Verify:
   - `portfolio.adamfield.org/pages/simulations/<slug>.html` → same path on www
   - `magic8ball…` → `/pages/games/magic-8-ball.html`
   - `library…` → `/pages/library.html`
   - `comphys…` → `/pages/courses.html`
4. **Retire the old repos** (GitHub → each repo → Settings → Delete), once the
   redirects are confirmed:
   - `undergraduate-physics-portfolio` — content now under Simulations
   - `8ball` — under Games
   - `libraryWebsite` — under Library (data seeded into the DB)
   - `relativistic-visualization` — under Simulations
   - `computational_physics_isp` — **keep** it, but it becomes code-only: its
     website files are removed on the same `claude/consolidate-subdomains-epu4kr`
     branch (separate bundle), and its subdomain redirects to Courses. Move the
     course notes / write-ups into Courses (admin editor) and the Blog as you go.

## DNS note

Keep the subdomains' DNS records (proxied through Cloudflare) so the redirects
resolve. Only remove a record if you also remove its redirect.
