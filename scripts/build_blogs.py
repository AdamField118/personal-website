#!/usr/bin/env python3
"""
Generates pages/posts/blog-N.html for each blog post
and blog-posts/index.json for the card listing.

Run: python scripts/build_blogs.py
"""

import os
import re
import json
from datetime import datetime

ROOT    = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD_DIR  = os.path.join(ROOT, 'blog-posts')
OUT_DIR = os.path.join(ROOT, 'pages', 'posts')

MARKDOWN_FILES = [
    'blog-1.md',  'blog-2.md',  'blog-3.md',  'blog-4.md',  'blog-5.md',
    'blog-6.md',  'blog-7.md',  'blog-8.md',  'blog-9.md',  'blog-10.md',
    'blog-11.md', 'blog-12.md', 'blog-13.md', 'blog-14.md', 'blog-15.md'
]

os.makedirs(OUT_DIR, exist_ok=True)


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


def build_page(title, date, tags, body_html):
    tags_html = ''.join(f'<span class="tag">{t}</span>' for t in tags)
    read_time = max(1, len(body_html) // 4000)
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <title>{title}</title>
    <link rel="stylesheet" href="/styles/style.css"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/themes/prism.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/prism.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-python.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-java.min.js" defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.25.0/components/prism-c.min.js" defer></script>
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
    <nav>
        <a href="/index.html">Welcome Page</a>
        <a href="/pages/blog.html">Blog Page</a>
        <a href="/pages/resume.html">Dynamic Resume</a>
    </nav>

    <div class="post-static-page">
        <div class="post-full-content">
            <div class="post-full-header">
                <a href="/pages/blog.html" class="back-link">← Back to Blog</a>
                <h1 class="post-full-title">{title}</h1>
                <div class="post-full-meta">
                    <span><i class="far fa-calendar"></i> {format_date(date)}</span>
                    <span><i class="far fa-clock"></i> {read_time} min read</span>
                </div>
                <div class="post-tags">{tags_html}</div>
            </div>
            <div class="post-full-body">
                {body_html}
            </div>
        </div>
    </div>

    <footer>
        <div class="footer-content">
            <p>Created by Adam Field</p>
            <div class="footer-socials">
                <span class="contact-label">Contact me:</span>
                <div class="social-icons">
                    <a href="mailto:adfield@wpi.edu" title="Email">
                        <img src="/assets/email_logo.svg" alt="email logo">
                    </a>
                    <a href="https://www.linkedin.com/in/adfield/" target="_blank" title="LinkedIn">
                        <img src="/assets/linkedin_logo.svg" alt="linkedin logo">
                    </a>
                    <a href="https://github.com/AdamField118" target="_blank" title="GitHub">
                        <img src="/assets/github_logo.svg" alt="github logo">
                    </a>
                </div>
            </div>
        </div>
    </footer>

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
    page_html = build_page(title, date, tags, body_html)

    out_path = os.path.join(OUT_DIR, f'{slug}.html')
    open(out_path, 'w', encoding='utf8').write(page_html)
    print(f'  built {slug}.html')

    index.append({'title': title, 'date': date, 'tags': tags, 'snippet': snippet, 'href': href})

open(os.path.join(MD_DIR, 'index.json'), 'w', encoding='utf8').write(
    json.dumps(index, indent=2)
)
print(f'  wrote index.json ({len(index)} posts)')