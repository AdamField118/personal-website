# Cloudflare Redirect Rules (alternative to nginx-redirects.conf)

Use these if the old subdomains are served by Cloudflare Pages or another
origin rather than your Pi's nginx. Set them up in the Cloudflare dashboard:
**Rules → Redirect Rules → Create rule** (or via the API). All are 301
(permanent). Each subdomain needs a DNS record proxied through Cloudflare
(orange cloud) for the rule to fire.

| # | When (hostname) | Then redirect to | Status |
|---|---|---|---|
| 1 | `portfolio.adamfield.org` AND URI path starts with `/pages/simulations/` | `https://www.adamfield.org` + `http.request.uri.path` (preserve path) | 301 |
| 2 | `portfolio.adamfield.org` (anything else) | `https://www.adamfield.org/pages/sims.html` | 301 |
| 3 | `magic8ball.adamfield.org` | `https://www.adamfield.org/pages/games/magic-8-ball.html` | 301 |
| 4 | `library.adamfield.org` | `https://www.adamfield.org/pages/library.html` | 301 |
| 5 | `comphys.adamfield.org` | `https://www.adamfield.org/pages/courses.html` | 301 |

Rule 1 (path-preserving) example expression and target:

- **Expression:** `http.host eq "portfolio.adamfield.org" and starts_with(http.request.uri.path, "/pages/simulations/")`
- **Target (dynamic):** `concat("https://www.adamfield.org", http.request.uri.path)`
- **Status:** 301, **Preserve query string:** on

Put rule 1 above rule 2 (rules evaluate top-down; the first match wins).

After the rules are verified, the old subdomain repos can be deleted — see
docs/consolidation-plan.md, Phase 4.
