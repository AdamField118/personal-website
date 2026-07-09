#!/usr/bin/env python3
"""
Generates pages/posts/blog-N.html for each blog post
and blog-posts/index.json for the card listing.

Run: python scripts/build_blogs.py
"""

import os
import re
import glob
import json
from datetime import datetime

import layout  # shared nav/footer (scripts/ is on sys.path when run as a script)

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_DIR  = os.path.join(ROOT, 'blog-posts')
OUT_DIR = os.path.join(ROOT, 'pages', 'posts')

SITE_URL = 'https://www.adamfield.org'

# Auto-discover blog-N.md files and sort them numerically (blog-2 before blog-10).
def _blog_num(path):
    m = re.search(r'blog-(\d+)\.md$', path)
    return int(m.group(1)) if m else 1 << 30

MARKDOWN_FILES = [
    os.path.basename(p)
    for p in sorted(glob.glob(os.path.join(MD_DIR, 'blog-*.md')), key=_blog_num)
]

os.makedirs(OUT_DIR, exist_ok=True)


def html_escape(s):
    return (s.replace('&', '&amp;').replace('<', '&lt;')
             .replace('>', '&gt;').replace('"', '&quot;'))


def parse_front_matter(raw):
    if not raw.startswith('---'):
        return {}, raw
    end = raw.find('---', 3)
    if end == -1:
        return {}, raw
    fm   = raw[3:end].strip()
    body = raw[end+3:].strip()
    meta = {}
    for line in fm.splitlines():
        if ':' in line:
            k, _, v = line.partition(':')
            meta[k.strip()] = v.strip().strip('"\'')
    return meta, body


def format_date(s):
    try:
        return datetime.strptime(s, '%Y-%m-%d').strftime('%B %-d, %Y')
    except Exception:
        return s


def fix_paths(html):
    html = html.replace('src="../assets/',       'src="/assets/')
    html = html.replace('href="../assets/',      'href="/assets/')
    html = html.replace('data-script="../scripts/', 'data-script="/scripts/')
    return html


# ── renderMarkdown ported from render-markdown.js ────────────────────────────
# Keeps the same logic so output is identical to what the browser produces.

def render_markdown(content):
    code_blocks    = []
    inline_codes   = []
    code_containers = []
    latex_blocks   = []

    # Step 0: fenced code blocks
    def save_code_block(m):
        lang = m.group(1)
        code = m.group(2)
        if code.startswith('\n'):
            code = code[1:]
        code = code.rstrip().replace('\t', '    ')
        escaped = (code.replace('&','&amp;').replace('<','&lt;')
                       .replace('>','&gt;').replace('"','&quot;'))
        block = (f'<pre><code class="language-{lang}">{escaped}</code></pre>'
                 if lang else f'<pre><code>{escaped}</code></pre>')
        ph = f'__CODEBLOCK_{len(code_blocks)}__'
        code_blocks.append(block)
        return ph

    html = re.sub(r'```([\w-]*)\s*\n?([\s\S]*?)```', save_code_block, content)

    # Step 1: inline code
    def save_inline(m):
        code = (m.group(1).replace('&','&amp;').replace('<','&lt;')
                           .replace('>','&gt;'))
        ph = f'__INLINECODE_{len(inline_codes)}__'
        inline_codes.append(f'<code>{code}</code>')
        return ph

    html = re.sub(r'`(.*?)`', save_inline, html, flags=re.IGNORECASE)

    # Step 2: codeContainer directives
    def save_container(m):
        ph = f'__CODECONTAINER_{len(code_containers)}__'
        code_containers.append(m.group(1))
        return ph

    html = re.sub(r'\[codeContainer\]\(([^)]+)\)', save_container, html)

    # Step 3: LaTeX display blocks
    def save_latex_display(m):
        ph = f'__LATEXBLOCK_{len(latex_blocks)}__'
        latex_blocks.append(f'<div class="latex-display">$${m.group(1).strip()}$$</div>')
        return ph

    html = re.sub(r'\$\$([\s\S]*?)\$\$', save_latex_display, html)

    # Step 3b: inline LaTeX
    def save_latex_inline(m):
        ph = f'__LATEXBLOCK_{len(latex_blocks)}__'
        latex_blocks.append(f'<span class="latex-inline">${m.group(1).strip()}$</span>')
        return ph

    html = re.sub(r'(?<!\$)\$(?!\$)((?:[^$]|\\\$)+?)\$(?!\$)', save_latex_inline, html)

    # Step 4: standard markdown
    html = re.sub(r'^### (.*)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.*)$',  r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.*)$',   r'<h1>\1</h1>', html, flags=re.MULTILINE)
    html = re.sub(r'!\[([^\]]+)\]\(([^)]+)\)', r'<img src="\2" alt="\1">', html)
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)',  r'<a href="\2">\1</a>', html)
    html = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*(.*?)\*',     r'<em>\1</em>', html)
    html = re.sub(r'^> (.*)$', r'<blockquote>\1</blockquote>', html, flags=re.MULTILINE)

    # Step 5: lists
    html = re.sub(r'^- (.*)$',       r'<li>\1</li>', html, flags=re.MULTILINE)
    html = re.sub(r'^\d+\. (.*)$',   r'<li>\1</li>', html, flags=re.MULTILINE)

    lines = html.split('\n')
    out   = []
    in_list = False
    for line in lines:
        is_item = bool(re.match(r'^<li>.*</li>$', line.strip()))
        if is_item and not in_list:
            out.append('<ol>')
            out.append(line)
            in_list = True
        elif is_item and in_list:
            out.append(line)
        elif not is_item and in_list:
            out.append('</ol>')
            out.append(line)
            in_list = False
        else:
            out.append(line)
    if in_list:
        out.append('</ol>')
    html = '\n'.join(out)

    # Step 6: paragraphs
    html = html.replace('\n\n', '</p><p>')
    html = re.sub(r'\n(?!<li>|</ol>)', '<br>', html)
    html = re.sub(r'(<ol>)\n', r'\1', html)
    html = re.sub(r'(</li>)\n', r'\1', html)

    html = f'<p>{html}</p>'
    html = html.replace('<p></p>', '')
    html = re.sub(r'<p>(</?(?:pre|h\d|blockquote|ol|div)[^>]*>)', r'\1', html)
    html = re.sub(r'(</?(?:pre|h\d|blockquote|ol|div)[^>]*>)</p>', r'\1', html)

    # Restore placeholders
    for i, block in enumerate(code_blocks):
        html = html.replace(f'__CODEBLOCK_{i}__', block)
    for i, block in enumerate(latex_blocks):
        html = html.replace(f'__LATEXBLOCK_{i}__', block)
    for i, script_path in enumerate(code_containers):
        html = html.replace(
            f'__CODECONTAINER_{i}__',
            f'<div class="code-container" data-script="{script_path}" id="codeContainer-{i}"></div>'
        )
    for i, code in enumerate(inline_codes):
        html = html.replace(f'__INLINECODE_{i}__', code)

    return html

def make_slug(title):
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug.strip())
    slug = re.sub(r'-+', '-', slug)
    return slug


CALENDAR_SVG = ('<svg class="meta-icon" viewBox="0 0 16 16" aria-hidden="true">'
                '<path d="M4 1v1H2.5A1.5 1.5 0 0 0 1 3.5v10A1.5 1.5 0 0 0 2.5 15h11'
                'a1.5 1.5 0 0 0 1.5-1.5v-10A1.5 1.5 0 0 0 13.5 2H12V1h-1.5v1h-5V1H4z'
                'm-1.5 4h11v8.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5V5z"/></svg>')
CLOCK_SVG    = ('<svg class="meta-icon" viewBox="0 0 16 16" aria-hidden="true">'
                '<path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm0 1.5a6.5 6.5 0 1 1 0 13'
                ' 6.5 6.5 0 0 1 0-13zM7.25 3v5.31l3.97 2.29.75-1.3-3.22-1.86V3h-1.5z"/></svg>')


def first_image(body_html):
    """First image in the post body (absolute URL), for social cards."""
    m = re.search(r'<img[^>]+src="([^"]+)"', body_html)
    if not m:
        return None
    src = m.group(1)
    if src.startswith('http'):
        return src
    return SITE_URL + src if src.startswith('/') else None


def build_page(title, date, tags, body_html, snippet='', slug=''):
    tags_html = ''.join(f'<span class="tag">{t}</span>' for t in tags)
    read_time = max(1, len(body_html) // 4000)
    esc_title = html_escape(title)
    desc      = html_escape(snippet) if snippet else esc_title
    canonical = f'{SITE_URL}/pages/posts/{slug}.html'
    keywords  = html_escape(', '.join(tags))
    og_image  = first_image(body_html) or f'{SITE_URL}/assets/adam.jpg'
    json_ld   = json.dumps({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': title,
        'description': snippet or title,
        'datePublished': date,
        'url': canonical,
        'image': og_image,
        'keywords': tags,
        'author': {'@type': 'Person', 'name': 'Adam Field',
                   'url': SITE_URL + '/'},
    }, indent=2)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{esc_title}</title>
    <meta name="description" content="{desc}">
    <meta name="author" content="Adam Field">
    <meta name="keywords" content="{keywords}">
    <link rel="canonical" href="{canonical}">

    <!-- Icons -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">

    <!-- Open Graph / social cards -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="{esc_title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{canonical}">
    <meta property="og:image" content="{og_image}">
    <meta property="article:published_time" content="{date}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{esc_title}">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{og_image}">

    <script type="application/ld+json">
{json_ld}
    </script>

    <link rel="alternate" type="application/rss+xml" title="Adam Field's Blog" href="/feed.xml">
    <link rel="stylesheet" href="/styles/style.css"/>
    <link rel="stylesheet" href="/assets/vendor/prism/prism.min.css">
    <script src="/assets/vendor/prism/prism.min.js" defer></script>
    <script src="/assets/vendor/prism/prism-python.min.js" defer></script>
    <script src="/assets/vendor/prism/prism-java.min.js" defer></script>
    <script src="/assets/vendor/prism/prism-c.min.js" defer></script>
    <script src="/assets/vendor/prism/prism-latex.min.js" defer></script>
    <script>
        window.MathJax = {{
            tex: {{
                inlineMath: [['$', '$']],
                displayMath: [['$$', '$$']],
                processEscapes: true
            }},
            options: {{
                skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
            }}
        }};
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-chtml.min.js" defer></script>
</head>
<body>
    <header>
        <h1>Adam\'s Blog Page</h1>
    </header>
    {layout.NAV_START}
{layout.render_nav(active_href='/pages/blog.html')}
    {layout.NAV_END}

    <div class="post-static-page">
        <div class="post-full-content">
            <div class="post-full-header">
                <a href="/pages/blog.html" class="back-link">← Back to Blog</a>
                <h1 class="post-full-title">{title}</h1>
                <div class="post-full-meta">
                    <span>{CALENDAR_SVG} {format_date(date)}</span>
                    <span>{CLOCK_SVG} {read_time} min read</span>
                </div>
                <div class="post-tags">{tags_html}</div>
            </div>
            <div class="post-full-body">
                {body_html}
            </div>
        </div>
    </div>

    {layout.FOOTER_START}
{layout.render_footer()}
    {layout.FOOTER_END}

    <script>
        (async () => {{
            const containers = document.querySelectorAll('.code-container[data-script]');
            for (const container of containers) {{
                window.currentCodeContainer   = container;
                window.currentCodeContainerId = container.id;
                await new Promise((resolve, reject) => {{
                    const s   = document.createElement('script');
                    s.src     = container.dataset.script;
                    s.onload  = resolve;
                    s.onerror = reject;
                    document.head.appendChild(s);
                }});
            }}
        }})();
    </script>
</body>
</html>'''


index = []

for filename in MARKDOWN_FILES:
    raw = open(os.path.join(MD_DIR, filename), encoding='utf8').read()
    meta, content = parse_front_matter(raw)

    title   = meta.get('title',   'Untitled')
    date    = meta.get('date',    '1970-01-01')
    tags    = [t.strip() for t in meta.get('tags', '').split(',') if t.strip()]
    snippet = meta.get('snippet', '')
    slug    = make_slug(title)
    href    = f'/pages/posts/{slug}.html'

    body_html = fix_paths(render_markdown(content))
    page_html = build_page(title, date, tags, body_html, snippet=snippet, slug=slug)

    out_path = os.path.join(OUT_DIR, f'{slug}.html')
    open(out_path, 'w', encoding='utf8').write(page_html)
    print(f'  built {slug}.html')

    index.append({'title': title, 'date': date, 'tags': tags, 'snippet': snippet, 'href': href})

open(os.path.join(MD_DIR, 'index.json'), 'w', encoding='utf8').write(
    json.dumps(index, indent=2)
)
print(f'  wrote index.json ({len(index)} posts)')


# ── sitemap.xml ──────────────────────────────────────────────────────────────
def sitemap_url(loc, lastmod=None):
    parts = [f'    <loc>{loc}</loc>']
    if lastmod:
        parts.append(f'    <lastmod>{lastmod}</lastmod>')
    return '  <url>\n' + '\n'.join(parts) + '\n  </url>'

latest = max((p['date'] for p in index), default=None)
urls = [
    sitemap_url(f'{SITE_URL}/', latest),
    sitemap_url(f'{SITE_URL}/pages/blog.html', latest),
    sitemap_url(f'{SITE_URL}/pages/sims.html'),
    sitemap_url(f'{SITE_URL}/pages/games.html'),
    sitemap_url(f'{SITE_URL}/pages/courses.html'),
    sitemap_url(f'{SITE_URL}/pages/library.html'),
    sitemap_url(f'{SITE_URL}/pages/resume.html'),
]
for p in index:
    urls.append(sitemap_url(f"{SITE_URL}{p['href']}", p['date']))

# Simulation pages (from simulations.json, written by build_sims.py).
try:
    with open(os.path.join(MD_DIR, '..', 'simulations.json'), encoding='utf8') as f:
        for s in json.load(f):
            urls.append(sitemap_url(f"{SITE_URL}{s['href']}"))
except FileNotFoundError:
    pass

sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
           + '\n'.join(urls) + '\n</urlset>\n')
open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf8').write(sitemap)
print(f'  wrote sitemap.xml ({len(urls)} urls)')

# ── robots.txt ───────────────────────────────────────────────────────────────
robots = (f'User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n')
open(os.path.join(ROOT, 'robots.txt'), 'w', encoding='utf8').write(robots)
print('  wrote robots.txt')

# ── feed.xml (RSS 2.0) ───────────────────────────────────────────────────────
def rfc822(date_str):
    return datetime.strptime(date_str, '%Y-%m-%d').strftime('%a, %d %b %Y 00:00:00 +0000')

items = []
for p in sorted(index, key=lambda p: p['date'], reverse=True):
    link = f"{SITE_URL}{p['href']}"
    cats = ''.join(f'\n      <category>{html_escape(t)}</category>' for t in p['tags'])
    items.append(f'''    <item>
      <title>{html_escape(p['title'])}</title>
      <link>{link}</link>
      <guid>{link}</guid>
      <pubDate>{rfc822(p['date'])}</pubDate>
      <description>{html_escape(p['snippet'])}</description>{cats}
    </item>''')

feed = f'''<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Adam Field's Blog</title>
    <link>{SITE_URL}/pages/blog.html</link>
    <atom:link href="{SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Physics and mathematics blog by Adam Field: gravitational lensing, quantum field theory, wave equations, and computational astrophysics research notes.</description>
    <language>en-us</language>
{chr(10).join(items)}
  </channel>
</rss>
'''
open(os.path.join(ROOT, 'feed.xml'), 'w', encoding='utf8').write(feed)
print(f'  wrote feed.xml ({len(items)} items)')