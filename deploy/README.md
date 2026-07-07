# Deploying www.adamfield.org

The site is fully static — deploy is "copy the repo to the web root".
`deploy/nginx-adamfield.conf` is a drop-in server block for the Raspberry Pi
origin behind Cloudflare.

## nginx

1. Copy `nginx-adamfield.conf` to `/etc/nginx/sites-available/adamfield` and
   adjust the `root` path to where this repo is checked out.
2. `ln -s /etc/nginx/sites-available/adamfield /etc/nginx/sites-enabled/`
3. `sudo nginx -t && sudo systemctl reload nginx`

What the config gives you:

- **Custom 404 page** (`/404.html`, styled like the site)
- **gzip compression** for text assets (brotli lines included, commented out —
  stock Debian/Raspbian nginx doesn't ship the brotli module)
- **Security headers**: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, HSTS, and a Content-Security-Policy that allows only
  self-hosted assets plus MathJax (cdnjs) and YouTube thumbnails/embeds
- **Cache-Control**: HTML/XML revalidate on every request; images, CSS, JS,
  fonts, video, and PDFs cache for a week (they aren't content-hashed, so
  don't use `immutable`)

## Cloudflare

- SSL/TLS mode: **Full (strict)** with an origin certificate is strongly
  recommended over "Flexible" (Flexible leaves Pi↔Cloudflare traffic in
  plaintext).
- Caching: the `Cache-Control` headers above are respected by Cloudflare, so
  static assets will be served from the edge and HTML will revalidate. No
  page rules needed.
- Enable **HTTP/3** and **Brotli** in the Cloudflare dashboard (Speed →
  Optimization) — Cloudflare then compresses at the edge even though the Pi
  only does gzip.

## Third-party dependencies

Everything is self-hosted (Prism, three.js, icons) **except MathJax**, which
still loads from cdnjs — vendoring it means also vendoring its dynamically
loaded fonts/output modules, which isn't worth the churn. If cdnjs ever
becomes a problem, `npm pack mathjax@3` and copy the `es5/` tree into
`assets/vendor/`.

## Uptime monitoring

The Pi is a single point of failure. Point a free external monitor (e.g.
UptimeRobot, or a Cloudflare Health Check) at `https://www.adamfield.org/`
and `https://portfolio.adamfield.org/` so you get an email when the box or
tunnel goes down.

## Publishing content

- Blog: add `blog-posts/blog-N.md`, then run `python3 scripts/build_blogs.py`.
  This regenerates the static post pages, `blog-posts/index.json`,
  `sitemap.xml`, `robots.txt`, and `feed.xml` (RSS).
