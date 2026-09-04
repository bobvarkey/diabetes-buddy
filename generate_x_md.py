import json, re, sys
from datetime import datetime
from urllib.parse import urljoin

def parse_snapshot(path):
    with open(path) as f:
        raw = f.read()
    start = raw.find('{')
    if start == -1:
        return []
    data = json.loads(raw[start:])
    snapshot = data.get('snapshot', '')
    base_url = data.get('url', 'https://x.com')
    pattern = r"^\s+- ['\"]?article ['\"]([^'\"]+)['\"] \[ref=e\d+\] \[cursor=pointer\]['\"]?:"
    matches = list(re.finditer(pattern, snapshot, re.MULTILINE))
    articles = []
    for i, m in enumerate(matches):
        line = m.group(1)
        pos = m.start()
        nxt = matches[i+1].start() if i+1 < len(matches) else pos + 1800
        block = snapshot[pos:nxt]
        url_match = re.search(r'- /url: (/[^/\s]+/status/\d+)', block)
        url = urljoin(base_url, url_match.group(1)) if url_match else ''
        articles.append({'line': line, 'url': url})
    return articles

def parse_article(item):
    line = item['line']
    m = re.match(
        r'^(.*?)\s+(@[A-Za-z0-9_]+)\s+('
        r'\d+\s+(?:hours?|minutes?|seconds?)'
        r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,\s+\d{4})?'
        r'|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}'
        r')\s+(.+)$',
        line
    )
    if not m:
        return None
    display_name = m.group(1).strip()
    handle = m.group(2).strip()
    date = m.group(3).strip()
    rest = m.group(4).strip()
    display_name = re.sub(r'\s+Verified account$', '', display_name)

    # Engagement
    engagement = ''
    text = rest
    for pat in [
        r'\s(\d+(?:,\d+)*\s+replies?,\s+\d+(?:,\d+)*\s+reposts?,\s+\d+(?:,\d+)*\s+likes?(?:,\s+\d+(?:,\d+)*\s+bookmarks?)?(?:,\s+\d+(?:,\d+)*\s+views)?)$',
        r'\s(\d+(?:,\d+)*\s+reposts?,\s+\d+(?:,\d+)*\s+likes?(?:,\s+\d+(?:,\d+)*\s+bookmarks?)?(?:,\s+\d+(?:,\d+)*\s+views)?)$',
        r'\s(\d+(?:,\d+)*\s+likes?,\s+\d+(?:,\d+)*\s+bookmarks?)$',
    ]:
        eng_match = re.search(pat, rest)
        if eng_match:
            engagement = eng_match.group(1)
            text = rest[:eng_match.start()].strip()
            break

    # Clean text artifacts
    text = re.sub(r'\s*\d+\s+replies?\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*Image\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*Embedded video\s*(?:Play Video\.?\s*)?(?:\d+\s+(?:minute|second)(?:s)?(?:\s+long)?)?\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*Play Video\.?\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*\d+\s+(?:minute|second)(?:s)?(?:\s+long)?\s*$', '', text, flags=re.IGNORECASE)
    text = re.sub(r'\s*,\s*$', '', text)
    text = text.replace("''", "'")
    text = text.strip()

    def num(label):
        n = re.search(r'(\d+(?:,\d+)*)\s+' + label, engagement)
        return int(n.group(1).replace(',', '')) if n else 0

    likes = num('likes?')
    reposts = num('reposts?')
    replies = num('replies?')
    bookmarks = num('bookmarks?')
    views_match = re.search(r'(\d+(?:,\d+)*)\s+views', engagement)
    views = views_match.group(1) if views_match else ''

    return {
        'author': display_name,
        'handle': handle,
        'date': date,
        'text': text,
        'engagement': engagement,
        'replies': replies,
        'reposts': reposts,
        'likes': likes,
        'bookmarks': bookmarks,
        'views': views,
        'url': item['url']
    }

def main():
    files = sys.argv[1:]
    seen = set()
    posts = []
    for f in files:
        arts = parse_snapshot(f)
        for a in arts:
            key = a['line'][:120]
            if key in seen:
                continue
            seen.add(key)
            p = parse_article(a)
            if p:
                posts.append(p)

    # Sort by likes descending for "top" ranking, keep top 10
    posts = sorted(posts, key=lambda x: x['likes'], reverse=True)[:10]

    now = datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')
    md_lines = [
        '# X Neurology News Scrape',
        '',
        f'- **Search query:** neurology OR #neurotwitter OR #NeuroX',
        f'- **Filter:** Top · since:today',
        f'- **Scraped at:** {now}',
        f'- **Total collected:** {len(posts)} posts',
        '',
        '---',
        ''
    ]

    flagged = []
    for i, p in enumerate(posts, 1):
        flags = []
        if p['likes'] > 100:
            flags.append('>100 likes')
        if p['reposts'] > 100:
            flags.append('viral reposts')
        if p['likes'] > 1000:
            flags.append('breaking/high-engagement')
        if '2 hours' in p['date'] or 'hours ago' in p['date'] or 'minutes' in p['date']:
            flags.append('recent')

        flag_str = f"`{', '.join(flags)}`" if flags else ''
        if flags:
            flagged.append((i, p, flags))

        md_lines.extend([
            f'## {i}. {p["author"]} ({p["handle"]})',
            '',
            f'- **Date:** {p["date"]}',
            f'- **URL:** {p["url"]}',
            f'- **Engagement:** {p["engagement"] or "N/A"}',
            f'- **Flags:** {flag_str or "None"}',
            '',
            f'{p["text"]}',
            '',
            '---',
            ''
        ])

    if flagged:
        md_lines.extend([
            '# Flagged Posts',
            ''
        ])
        for i, p, flags in flagged:
            md_lines.append(f'- **#{i}** {p["author"]} — {", ".join(flags)} — {p["url"]}')
        md_lines.append('')
    else:
        md_lines.extend([
            '# Flagged Posts',
            '',
            'No posts exceeded 100 likes or met breaking-news criteria.',
            ''
        ])

    out_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md'
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        f.write('\n'.join(md_lines))
    print(f'Saved markdown to {out_path}')
    print(f'Posts: {len(posts)}, Flagged: {len(flagged)}')

if __name__ == '__main__':
    import os
    main()
