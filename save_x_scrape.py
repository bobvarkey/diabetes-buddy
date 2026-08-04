import json, sqlite3, os
from datetime import datetime, timezone

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

queries = [
    ("/tmp/x_posts_query1.json", "neurointervention OR thrombectomy OR #Neurointervention OR #stroke since:today"),
    ("/tmp/x_posts_query2.json", "cerebral AVM OR intracranial aneurysm OR endovascular since:today"),
]

all_posts = []
seen_urls = set()
for path, query_label in queries:
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        data = json.loads(raw) if isinstance(raw, str) else raw
    except Exception as e:
        print(f"Error reading {path}: {e}")
        continue
    for p in data:
        u = p.get("url", "")
        if u and u not in seen_urls:
            seen_urls.add(u)
            p["search_query"] = query_label
            all_posts.append(p)

now = datetime.now(timezone.utc).isoformat()
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()

c.execute('''
    CREATE TABLE IF NOT EXISTS x_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        handle TEXT,
        date TEXT,
        text TEXT,
        replies INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        url TEXT UNIQUE,
        search_query TEXT,
        scrape_date TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        bookmarks INTEGER DEFAULT 0
    )
''')
c.execute('CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)')
c.execute('CREATE INDEX IF NOT EXISTS idx_date ON x_posts(date)')
c.execute('CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes)')
c.execute('CREATE INDEX IF NOT EXISTS idx_handle ON x_posts(handle)')
c.execute('''
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT UNIQUE NOT NULL,
        author TEXT,
        handle TEXT,
        profile_url TEXT,
        date TEXT,
        text TEXT,
        replies INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        retweets INTEGER DEFAULT 0,
        bookmarks INTEGER DEFAULT 0,
        query_group TEXT,
        scraped_at TEXT
    )
''')
c.execute('CREATE INDEX IF NOT EXISTS idx_scraped_at ON posts(scraped_at)')
conn.commit()

inserted_x = 0
inserted_posts = 0
for p in all_posts:
    try:
        c.execute('''
            INSERT OR IGNORE INTO x_posts (author, handle, date, text, replies, reposts, likes, views, bookmarks, url, search_query, scrape_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p.get("author", ""),
            p.get("handle", ""),
            p.get("date", ""),
            p.get("text", ""),
            p.get("replies", 0),
            p.get("reposts", 0),
            p.get("likes", 0),
            p.get("views", 0),
            p.get("bookmarks", 0),
            p.get("url", ""),
            p.get("search_query", ""),
            now
        ))
        if c.rowcount > 0:
            inserted_x += 1
    except Exception as e:
        print("x_posts DB error:", e)

    try:
        c.execute('''
            INSERT OR IGNORE INTO posts (url, author, handle, profile_url, date, text, replies, likes, retweets, bookmarks, query_group, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p.get("url", ""),
            p.get("author", ""),
            p.get("handle", ""),
            "https://x.com/" + p.get("handle", "") if p.get("handle") else "",
            p.get("date", ""),
            p.get("text", ""),
            p.get("replies", 0),
            p.get("likes", 0),
            p.get("reposts", 0),
            p.get("bookmarks", 0),
            p.get("search_query", ""),
            now
        ))
        if c.rowcount > 0:
            inserted_posts += 1
    except Exception as e:
        print("posts DB error:", e)

conn.commit()
conn.close()

# Append markdown report
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
report_now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
lines = [f"\n## X Neurointervention/Stroke Scrape — {report_now}\n"]
lines.append(f"**New posts inserted:** {inserted_x} (total unique extracted this run: {len(all_posts)})\n")
lines.append(f"**Queries:**\n- {queries[0][1]}\n- {queries[1][1]}\n")
high_engagement = [p for p in all_posts if p.get("likes", 0) > 50]
lines.append(f"**High-engagement posts (>50 likes):** {len(high_engagement)}\n")
for p in all_posts:
    lines.append(f"### {p.get('author', 'Unknown')} (@{p.get('handle', '')})")
    lines.append(f"- **Date:** {p.get('date', '')}")
    lines.append(f"- **URL:** {p.get('url', '')}")
    lines.append(f"- **Replies:** {p.get('replies', 0)} | **Reposts:** {p.get('reposts', 0)} | **Likes:** {p.get('likes', 0)} | **Views:** {p.get('views', 0)} | **Bookmarks:** {p.get('bookmarks', 0)}")
    text = p.get("text", "").replace("\n", "  \n")
    lines.append(f"- **Text:** {text}\n")
if high_engagement:
    lines.append("\n### High-engagement highlights\n")
    for p in high_engagement:
        lines.append(f"- [{p.get('author', '')} (@{p.get('handle', '')})]({p.get('url', '')}) — {p.get('likes', 0)} likes, {p.get('reposts', 0)} reposts")
lines.append("\n---\n")
with open(REPORT_PATH, "a", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"\nSUMMARY: {inserted_x} new posts saved, {len(all_posts)} total extracted, {len(high_engagement)} high-engagement posts")
for p in high_engagement:
    print(f"  - {p.get('author')} (@{p.get('handle')}): {p.get('likes')} likes — {p.get('url')}")
