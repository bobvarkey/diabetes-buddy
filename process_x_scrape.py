import json
import sqlite3
import re
import os
from datetime import datetime, timezone
from pathlib import Path

def load_json_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        text = f.read()
    # Extract JSON array between first [ and last ]
    start = text.find('[')
    end = text.rfind(']')
    if start == -1 or end == -1:
        return []
    try:
        return json.loads(text[start:end+1])
    except Exception as e:
        print(f"Error parsing {path}: {e}")
        return []

q1 = load_json_file('/tmp/x_q1_posts_all.json')
q2 = load_json_file('/tmp/x_q2_posts_all.json')

# Tag source query
for p in q1:
    p['query'] = 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
for p in q2:
    p['query'] = 'cerebral AVM OR intracranial aneurysm OR endovascular'

all_posts = q1 + q2

# Deduplicate by tweetUrl
seen = set()
unique_posts = []
for p in all_posts:
    url = p.get('tweetUrl', '')
    if url and url in seen:
        continue
    seen.add(url)
    unique_posts.append(p)

# Create DB
DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
REPORT_DIR = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes'
REPORT_PATH = os.path.join(REPORT_DIR, 'x-scrape-2026-05-22.md')

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    handle TEXT,
    date_display TEXT,
    datetime TEXT,
    text TEXT,
    replies INTEGER,
    reposts INTEGER,
    likes INTEGER,
    bookmarks INTEGER,
    views INTEGER,
    tweet_url TEXT UNIQUE,
    profile_url TEXT,
    query TEXT,
    scraped_at TEXT
)
''')

inserted = 0
skipped = 0
for p in unique_posts:
    try:
        c.execute('''
        INSERT OR IGNORE INTO posts
        (author, handle, date_display, datetime, text, replies, reposts, likes, bookmarks, views, tweet_url, profile_url, query, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p.get('author'),
            p.get('handle'),
            p.get('date'),
            p.get('datetime'),
            p.get('text'),
            p.get('replies', 0),
            p.get('reposts', 0),
            p.get('likes', 0),
            p.get('bookmarks', 0),
            p.get('views', 0),
            p.get('tweetUrl'),
            p.get('profileUrl'),
            p.get('query'),
            datetime.now(timezone.utc).isoformat()
        ))
        if c.rowcount > 0:
            inserted += 1
        else:
            skipped += 1
    except Exception as e:
        print(f"Insert error: {e}")
        skipped += 1

conn.commit()
conn.close()

# Build markdown report
report_lines = []
report_lines.append(f"# X/Twitter Neurointervention Scrape\n")
report_lines.append(f"**Date:** 2026-05-22 (scraped {datetime.now(timezone.utc).isoformat()})\n")
report_lines.append(f"**Queries:**\n")
report_lines.append(f"- neurointervention OR thrombectomy OR #Neurointervention OR #stroke\n")
report_lines.append(f"- cerebral AVM OR intracranial aneurysm OR endovascular\n\n")
report_lines.append(f"**New posts inserted:** {inserted}\n")
report_lines.append(f"**Duplicate/already-known posts skipped:** {skipped}\n")
report_lines.append(f"**Total unique posts this run:** {len(unique_posts)}\n\n")

high_engagement = [p for p in unique_posts if p.get('likes', 0) > 50]
report_lines.append(f"## High-engagement posts (>50 likes)\n")
report_lines.append(f"Count: {len(high_engagement)}\n\n")
for p in high_engagement:
    report_lines.append(f"### {p.get('author')} ({p.get('handle')}) — {p.get('date')}\n")
    report_lines.append(f"- Likes: {p.get('likes')}, Reposts: {p.get('reposts')}, Replies: {p.get('replies')}, Views: {p.get('views')}\n")
    report_lines.append(f"- URL: {p.get('tweetUrl')}\n")
    report_lines.append(f"- Text: {p.get('text')}\n\n")

report_lines.append(f"## All posts\n")
for p in unique_posts:
    report_lines.append(f"- **{p.get('author')}** {p.get('handle')} — {p.get('date')} — {p.get('tweetUrl')}\n")
    report_lines.append(f"  Likes: {p.get('likes')}, Reposts: {p.get('reposts')}, Replies: {p.get('replies')}, Views: {p.get('views')}\n")
    report_lines.append(f"  Text: {p.get('text')}\n\n")

# Append to report file
with open(REPORT_PATH, 'a', encoding='utf-8') as f:
    f.write('\n'.join(report_lines))

print(f"Inserted {inserted} new posts, skipped {skipped} duplicates.")
print(f"Report appended to {REPORT_PATH}")
print(f"DB at {DB_PATH}")
print(f"High engagement (>50 likes): {len(high_engagement)}")
