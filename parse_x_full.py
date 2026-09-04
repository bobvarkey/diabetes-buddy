import json, re, sys
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
    # Match article lines with optional surrounding quotes
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
    # Clean trailing artifacts
    text = re.sub(r'\s*(?:\d+\s+replies?|Image|Embedded video|Play Video\.\s*[\d\s]+(?:minute|second)(?:s)?(?:\s+long)?)\s*$', '', text, flags=re.IGNORECASE).strip()
    text = text.replace("''", "'")
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

if __name__ == '__main__':
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
    print(f'Total unique posts parsed: {len(posts)}')
    for i, p in enumerate(posts[:12], 1):
        print(f'\n--- {i} ---')
        print(json.dumps(p, indent=2))
