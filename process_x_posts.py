#!/usr/bin/env python3
import json, sqlite3, os, re
from datetime import datetime, timezone

workspace = '/Users/bobvarkey/.openclaw/workspace'
db_path = os.path.join(workspace, 'memory_x_posts.db')
report_path = os.path.join(workspace, 'knowledge-base/x-scrapes/x-scrape-2026-05-22.md')

query_map = {
    'neuro_query1_initial.json': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke',
    'neuro_query1.json': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke',
    'neuro_query2_initial.json': 'cerebral AVM OR intracranial aneurysm OR endovascular',
    'neuro_query2.json': 'cerebral AVM OR intracranial aneurysm OR endovascular',
}

all_posts = []
seen_urls = set()
for filename, query in query_map.items():
    path = os.path.join(workspace, filename)
    if not os.path.exists(path):
        continue
    with open(path, 'r') as f:
        data = json.load(f)
    for p in data.get('result', []):
        url = p.get('url')
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)
        all_posts.append({
            'query': query,
            'author': p.get('author', ''),
            'handle': p.get('handle', ''),
            'date': p.get('date', ''),
            'text': p.get('text', ''),
            'replies': p.get('replies', 0) or 0,
            'retweets': p.get('retweets', 0) or 0,
            'likes': p.get('likes', 0) or 0,
            'bookmarks': p.get('bookmarks', 0) or 0,
            'views': p.get('views', 0) or 0,
            'url': url,
        })

# Connect and create table
conn = sqlite3.connect(db_path)
cur = conn.cursor()
cur.execute('''
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE,
    author_name TEXT,
    handle TEXT,
    date TEXT,
    display_date TEXT,
    text TEXT,
    replies INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    query TEXT,
    scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Insert or ignore duplicates
inserted = 0
for p in all_posts:
    try:
        cur.execute('''
        INSERT OR IGNORE INTO posts (query, author_name, handle, date, display_date, text, replies, retweets, likes, bookmarks, views, url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (p['query'], p['author'], p['handle'], p['date'], p['date'][:10],
              p['text'], p['replies'], p['retweets'], p['likes'],
              p['bookmarks'], p['views'], p['url']))
        if cur.rowcount > 0:
            inserted += 1
    except Exception as e:
        print('insert error', e)

conn.commit()

# High engagement >50 likes
high = [p for p in all_posts if p['likes'] > 50]
run_time = datetime.now(timezone.utc).astimezone().strftime('%Y-%m-%d %H:%M %Z')

# Append markdown report
os.makedirs(os.path.dirname(report_path), exist_ok=True)
with open(report_path, 'a', encoding='utf-8') as f:
    f.write(f"\n## X Neurointervention Scrape — {run_time}\n\n")
    f.write(f"**Total unique posts extracted this run:** {len(all_posts)}\n\n")
    f.write(f"**New posts saved to DB:** {inserted}\n\n")
    f.write(f"**High-engagement posts (>50 likes):** {len(high)}\n\n")
    if high:
        f.write("### 🔥 High-engagement posts\n\n")
        for p in high:
            f.write(f"- **{p['author']}** ({p['handle']}) — {p['date'][:10]}\n")
            f.write(f"  - Likes: {p['likes']}, Reposts: {p['retweets']}, Replies: {p['replies']}, Views: {p['views']}\n")
            f.write(f"  - {p['text'][:200]}{'...' if len(p['text'])>200 else ''}\n")
            f.write(f"  - [Post link]({p['url']})\n\n")
    f.write("### All extracted posts\n\n")
    for p in all_posts:
        f.write(f"- **{p['author']}** ({p['handle']}) — {p['date'][:10]} — [{p['url']}]({p['url']})\n")
        f.write(f"  Likes: {p['likes']}, Reposts: {p['retweets']}, Replies: {p['replies']}, Views: {p['views']}\n")
        f.write(f"  > {p['text'][:250]}{'...' if len(p['text'])>250 else ''}\n\n")

conn.close()
print(f"EXTRACTED={len(all_posts)} INSERTED={inserted} HIGH={len(high)}")
for p in high:
    print(f"HIGH: {p['author']} {p['handle']} likes={p['likes']} url={p['url']}")
