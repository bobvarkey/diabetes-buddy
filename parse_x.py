import re, sqlite3, json, datetime, os, sys

DB = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"

POST_RE = re.compile(
    r"article\s+\"(?P<display>[^\"@]+)\s+@(?P<handle>[^\s]+)\s+(?P<date>[^\"]+)\s+(?P<text>.*?)\s+(?P<engagement>\d+[^\"]*(?:reply|reposts?|likes?|bookmarks?|views)[^\"]*)\"\s+\[ref=(?P<ref>e\d+)",
    re.DOTALL
)

URL_RE = re.compile(r'link\s+"[^"]*"\s+\[ref=e\d+\]:\s*\n\s*- /url: (?P<url>\S+)')

MONTHS = {'Jan':1,'Feb':2,'Mar':3,'Apr':4,'May':5,'Jun':6,'Jul':7,'Aug':8,'Sep':9,'Oct':10,'Nov':11,'Dec':12}

def parse_date(s, default_year=2026):
    s = s.strip()
    # e.g. "Aug 7" or "Dec 9, 2025" or "Aug 25"
    m = re.match(r"([A-Za-z]{3})\s+(\d{1,2})(?:,\s+(\d{4}))?", s)
    if not m:
        return s
    mon, day, year = m.group(1), int(m.group(2)), m.group(3)
    year = int(year) if year else default_year
    try:
        return datetime.date(year, MONTHS.get(mon, 1), day).isoformat()
    except Exception:
        return s

def parse_engagement(s):
    nums = re.findall(r'([\d.]+)([KkMm]?)\s*(reply|reposts?|likes?|bookmarks?|views?)', s.lower())
    out = {}
    for n, mult, label in nums:
        v = float(n)
        if mult.lower() == 'k': v *= 1000
        if mult.lower() == 'm': v *= 1000000
        if 'reply' in label:
            out['replies'] = int(v)
        elif 'repost' in label:
            out['reposts'] = int(v)
        elif 'like' in label:
            out['likes'] = int(v)
        elif 'bookmark' in label:
            out['bookmarks'] = int(v)
        elif 'view' in label:
            out['views'] = int(v)
    return out

def extract_posts(text, query_label):
    posts = []
    # split by article lines
    for m in POST_RE.finditer(text):
        d = m.groupdict()
        ref = d['ref']
        # find the status URL after this article block
        start = m.end()
        block_end = text.find(f"[ref={ref}] [cursor=pointer]:", start)
        if block_end == -1:
            block_end = len(text)
        block = text[start:block_end]
        # Find first link to /status/ after article start
        url = None
        for um in URL_RE.finditer(block):
            u = um.group('url')
            if '/status/' in u:
                url = "https://x.com" + u if u.startswith('/') else u
                break
        engagement = parse_engagement(d['engagement'])
        posts.append({
            'author': d['display'].strip(),
            'handle': '@' + d['handle'].strip(),
            'date_raw': d['date'].strip(),
            'date': parse_date(d['date'].strip()),
            'text': re.sub(r'\s+', ' ', d['text']).strip(),
            'engagement_text': d['engagement'].strip(),
            'replies': engagement.get('replies', 0),
            'reposts': engagement.get('reposts', 0),
            'likes': engagement.get('likes', 0),
            'bookmarks': engagement.get('bookmarks', 0),
            'views': engagement.get('views', 0),
            'url': url,
            'query': query_label,
        })
    return posts

def dedupe(posts):
    seen = set()
    out = []
    for p in posts:
        key = p['url'] or (p['handle'], p['date_raw'], p['text'][:80])
        if key not in seen:
            seen.add(key)
            out.append(p)
    return out

def save(posts):
    os.makedirs(os.path.dirname(DB), exist_ok=True)
    conn = sqlite3.connect(DB)
    cur = conn.cursor()
    cur.execute('''CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        handle TEXT,
        date_raw TEXT,
        date TEXT,
        text TEXT,
        replies INTEGER,
        reposts INTEGER,
        likes INTEGER,
        bookmarks INTEGER,
        views INTEGER,
        url TEXT,
        query TEXT,
        scraped_at TEXT DEFAULT CURRENT_TIMESTAMP
    )''')
    cur.execute('CREATE INDEX IF NOT EXISTS idx_url ON posts(url)')
    new_count = 0
    for p in posts:
        # simple dedupe by URL or text hash
        cur.execute("SELECT id FROM posts WHERE url=? OR (handle=? AND date=? AND substr(text,1,80)=?)",
            (p['url'], p['handle'], p['date'], p['text'][:80]))
        if cur.fetchone():
            continue
        new_count += 1
        cur.execute('''INSERT INTO posts (author, handle, date_raw, date, text, replies, reposts, likes, bookmarks, views, url, query)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)''',
            (p['author'], p['handle'], p['date_raw'], p['date'], p['text'],
             p['replies'], p['reposts'], p['likes'], p['bookmarks'], p['views'],
             p['url'], p['query']))
    conn.commit()
    conn.close()
    return new_count

def main():
    posts1 = extract_posts(open('/Users/bobvarkey/.openclaw/workspace/neuro_search_1.txt').read(), 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
    posts2 = extract_posts(open('/Users/bobvarkey/.openclaw/workspace/neuro_search_2.txt').read(), 'cerebral AVM OR intracranial aneurysm OR endovascular')
    all_posts = dedupe(posts1 + posts2)
    new_count = save(all_posts)
    # Write report
    report_path = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    high = [p for p in all_posts if p['likes'] > 50]
    lines = [
        f"# X/Twitter Neurointervention Scrape — {datetime.date.today().isoformat()}\n",
        f"- **Scraped at:** {datetime.datetime.now().isoformat()}\n",
        f"- **Posts found this run:** {len(all_posts)}\n",
        f"- **New posts saved to DB:** {new_count}\n",
        f"- **High-engagement posts (>50 likes):** {len(high)}\n\n",
    ]
    lines.append("## Query 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke\n")
    for p in posts1:
        lines.append(format_post(p))
    lines.append("\n## Query 2: cerebral AVM OR intracranial aneurysm OR endovascular\n")
    for p in posts2:
        lines.append(format_post(p))
    if high:
        lines.append("\n## High-Engagement Posts\n")
        for p in high:
            lines.append(format_post(p, detail=True))
    with open(report_path, 'a', encoding='utf-8') as f:
        f.write(''.join(lines) + '\n---\n')
    summary = {
        'total_this_run': len(all_posts),
        'new_saved': new_count,
        'high_engagement_count': len(high),
        'high_engagement_posts': high
    }
    print(json.dumps(summary, indent=2, ensure_ascii=False))

def format_post(p, detail=False):
    s = f"- **{p['author']}** ({p['handle']}) · {p['date_raw']}\n"
    s += f"  - {p['text']}\n"
    s += f"  - Engagement: {p['replies']} replies, {p['reposts']} reposts, {p['likes']} likes, {p['bookmarks']} bookmarks, {p['views']} views\n"
    if p['url']:
        s += f"  - URL: {p['url']}\n"
    if detail:
        s += f"  - Query: {p['query']}\n"
    return s

if __name__ == "__main__":
    main()
