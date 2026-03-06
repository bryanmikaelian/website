#!/usr/bin/env python3
"""Minimal markdown-to-HTML converter with front matter extraction.
Replaces lowdown for environments where it can't be installed."""

import re
import sys
import html

def parse_front_matter(text):
    """Extract YAML-like front matter as key-value pairs."""
    meta = {}
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta, text[m.end():] if m else text

def md_to_html(md):
    """Convert markdown to HTML (supports headers, bold, italic, links,
    images, code blocks, inline code, blockquotes, lists, hrs, paragraphs)."""
    lines = md.split('\n')
    out = []
    in_code = False
    in_list = None  # 'ul' or 'ol'
    paragraph = []

    def flush_paragraph():
        if paragraph:
            text = inline('\n'.join(paragraph))
            out.append(f'<p>{text}</p>')
            paragraph.clear()

    def flush_list():
        nonlocal in_list
        if in_list:
            out.append(f'</{in_list}>')
            in_list = None

    def inline(text):
        # images before links
        text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', r'<img src="\2" alt="\1">', text)
        # links
        text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
        # bold
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'__(.+?)__', r'<strong>\1</strong>', text)
        # italic
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'_(.+?)_', r'<em>\1</em>', text)
        # inline code
        text = re.sub(r'`(.+?)`', r'<code>\1</code>', text)
        return text

    for line in lines:
        # Fenced code blocks
        if line.startswith('```'):
            if in_code:
                out.append('</code></pre>')
                in_code = False
            else:
                flush_paragraph()
                flush_list()
                lang = line[3:].strip()
                cls = f' class="language-{lang}"' if lang else ''
                out.append(f'<pre><code{cls}>')
                in_code = True
            continue

        if in_code:
            out.append(html.escape(line))
            continue

        stripped = line.strip()

        # Blank line
        if not stripped:
            flush_paragraph()
            flush_list()
            continue

        # Headers
        hm = re.match(r'^(#{1,6})\s+(.*)', line)
        if hm:
            flush_paragraph()
            flush_list()
            level = len(hm.group(1))
            out.append(f'<h{level}>{inline(hm.group(2))}</h{level}>')
            continue

        # HR
        if re.match(r'^(\*{3,}|-{3,}|_{3,})\s*$', stripped):
            flush_paragraph()
            flush_list()
            out.append('<hr>')
            continue

        # Unordered list
        ulm = re.match(r'^[\*\-\+]\s+(.*)', stripped)
        if ulm:
            flush_paragraph()
            if in_list != 'ul':
                flush_list()
                in_list = 'ul'
                out.append('<ul>')
            out.append(f'<li>{inline(ulm.group(1))}</li>')
            continue

        # Ordered list
        olm = re.match(r'^\d+\.\s+(.*)', stripped)
        if olm:
            flush_paragraph()
            if in_list != 'ol':
                flush_list()
                in_list = 'ol'
                out.append('<ol>')
            out.append(f'<li>{inline(olm.group(1))}</li>')
            continue

        # Blockquote
        bqm = re.match(r'^>\s?(.*)', line)
        if bqm:
            flush_paragraph()
            flush_list()
            out.append(f'<blockquote><p>{inline(bqm.group(1))}</p></blockquote>')
            continue

        # Regular text -> paragraph
        flush_list()
        paragraph.append(stripped)

    flush_paragraph()
    flush_list()
    if in_code:
        out.append('</code></pre>')

    return '\n'.join(out)

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: md.py (-X <key> | -t html) <file>", file=sys.stderr)
        sys.exit(1)

    mode = sys.argv[1]
    if mode == '-X':
        key = sys.argv[2]
        path = sys.argv[3]
        with open(path) as f:
            meta, _ = parse_front_matter(f.read())
        print(meta.get(key, ''))
    elif mode == '-t' and sys.argv[2] == 'html':
        path = sys.argv[3]
        with open(path) as f:
            _, body = parse_front_matter(f.read())
        print(md_to_html(body))
