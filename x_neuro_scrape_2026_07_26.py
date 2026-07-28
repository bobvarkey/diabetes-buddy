import sys, os, time, json, sqlite3
from datetime import datetime, timezone
from urllib.parse import quote

sys.path.insert(0, "/Users/bobvarkey/.local/share/uv/tools/harness/lib/python3.12/site-packages")
from helpers import cdp, goto, wait_for_load, js

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

SEARCH_URLS = [
    "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke%20since%3Atoday&src=typed_query&f=top",
    "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular%20since%3Atoday&src=typed_query&f=top"
]

cdp("Emulation.setDeviceMetricsOverride", width=1280, height=900, deviceScaleFactor=1, mobile=False)

os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
c.execute('DROP TABLE IF EXISTS posts')
c.execute('''
    CREATE TABLE posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        search_query TEXT,
        author TEXT,
        handle TEXT,
        post_date TEXT,
        post_text TEXT,
        replies INTEGER,
        reposts INTEGER,
        likes INTEGER,
        views INTEGER,
        url TEXT,
        scraped_at TEXT,
        UNIQUE(search_query, handle, post_date, url)
    )
''')
conn.commit()
conn.close()

EXTRACT_JS = """
(() => {
  const posts = [];
  document.querySelectorAll('article').forEach(a => {
    try {
      const links = Array.from(a.querySelectorAll('a'));
      const userLink = links.find(l => {
        const h = l.getAttribute('href') || '';
        return h.startsWith('/') && h.split('/').length === 2;
      });
      const statusLink = links.find(l => {
        const h = l.getAttribute('href') || '';
        return h.includes('/status/') && !h.includes('/analytics');
      });
      const analyticsLink = links.find(l => {
        const h = l.getAttribute('href') || '';
        return h.includes('/status/') && h.includes('/analytics');
      });
      const timeEl = a.querySelector('time');
      const date = timeEl ? timeEl.getAttribute('datetime') : '';

      let author = '';
      let handle = '';
      if (userLink) {
        const href = userLink.getAttribute('href') || '';
        handle = href.startsWith('/') ? href.slice(1) : href;
        const sameHandleLinks = links.filter(l => {
          const lh = (l.getAttribute('href') || '').toLowerCase();
          return lh === '/' + handle.toLowerCase();
        });
        for (const l of sameHandleLinks) {
          const text = (l.innerText || '').trim();
          if (text && !text.startsWith('@')) author = text;
          if (text.startsWith('@')) handle = text.slice(1);
        }
      }

      const textParts = [];
      a.querySelectorAll('[data-testid="tweetText"]').forEach(el => {
        textParts.push(el.innerText || '');
      });
      const text = textParts.join('\\n').trim();

      let replies = 0, reposts = 0, likes = 0, views = 0;
      a.querySelectorAll('button, [role="button"]').forEach(b => {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const txt = (b.innerText || '').trim();
        if (aria.includes('replies') || aria.includes('reply')) {
          const n = parseInt(txt || '0');
          replies = isNaN(n) ? 0 : n;
        }
        if (aria.includes('reposts') || aria.includes('repost')) {
          const n = parseInt(txt || '0');
          reposts = isNaN(n) ? 0 : n;
        }
        if (aria.includes('likes') || aria.includes('like')) {
          const n = parseInt(txt || '0');
          likes = isNaN(n) ? 0 : n;
        }
      });
      if (analyticsLink) {
        const raw = analyticsLink.innerText || '';
        const clean = raw.replace(/,/g, '');
        const n = parseInt(clean);
        views = isNaN(n) ? 0 : n;
      }

      posts.push({
        author: author,
        handle: handle,
        date: date,
        text: text,
        replies: replies,
        reposts: reposts,
        likes: likes,
        views: views,
        url: statusLink ? 'https://x.com' + statusLink.getAttribute('href') : ''
      });
    } catch (e) {}
  });
  return posts;
})()
"""

all_posts = []

for url in SEARCH_URLS:
    print("Navigating to:", url)
    goto(url)
    wait_for_load()
    time.sleep(4)

    seen_urls = set()
    posts_for_query = []

    # If error page, wait and retry once
    body_text = js("document.body ? document.body.innerText.slice(0,500) : ''") or ''
    if 'Something went wrong' in body_text:
        print("  Got error page, waiting 10s and retrying...")
        time.sleep(10)
        goto(url)
        wait_for_load()
        time.sleep(4)

    last_count = 0
    same_count = 0
    max_scrolls = 12
    for i in range(max_scrolls):
        time.sleep(1.5)
        # Extract current visible posts before scrolling
        batch = js(EXTRACT_JS)
        if batch:
            new_count = 0
            for p in batch:
                u = p.get('url', '')
                if u and u not in seen_urls:
                    seen_urls.add(u)
                    p['search_query'] = url
                    posts_for_query.append(p)
                    new_count += 1
            if new_count > 0:
                print(f"  scroll {i+1}: added {new_count} new posts (total {len(posts_for_query)})")

        js("window.scrollTo(0, document.body.scrollHeight)")
        count = js("document.querySelectorAll('article').length") or 0
        if count == last_count:
            same_count += 1
            if same_count >= 3:
                break
        else:
            same_count = 0
        last_count = count

    # Final extraction
    batch = js(EXTRACT_JS)
    if batch:
        for p in batch:
            u = p.get('url', '')
            if u and u not in seen_urls:
                seen_urls.add(u)
                p['search_query'] = url
                posts_for_query.append(p)

    print(f"  Total extracted for this query: {len(posts_for_query)}")
    all_posts.extend(posts_for_query)

# Save to DB
now = datetime.now(timezone.utc).isoformat()
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
inserted = 0
for p in all_posts:
    try:
        c.execute('''
            INSERT OR IGNORE INTO posts (search_query, author, handle, post_date, post_text, replies, reposts, likes, views, url, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p.get('search_query', ''),
            p.get('author', ''),
            p.get('handle', ''),
            p.get('date', ''),
            p.get('text', ''),
            p.get('replies', 0),
            p.get('reposts', 0),
            p.get('likes', 0),
            p.get('views', 0),
            p.get('url', ''),
            now
        ))
        if c.rowcount > 0:
            inserted += 1
    except Exception as e:
        print("DB error:", e)
conn.commit()
conn.close()

# Append markdown report
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
report_now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
lines = [f"\n## X Neurointervention/Stroke Scrape — {report_now}\n"]
lines.append(f"**New posts inserted:** {inserted} (total extracted this run: {len(all_posts)})\n")
high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
lines.append(f"**High-engagement posts (>50 likes):** {len(high_engagement)}\n")
for p in all_posts:
    lines.append(f"### {p.get('author', 'Unknown')} (@{p.get('handle', '')})")
    lines.append(f"- **Date:** {p.get('date', '')}")
    lines.append(f"- **URL:** {p.get('url', '')}")
    lines.append(f"- **Replies:** {p.get('replies', 0)} | **Reposts:** {p.get('reposts', 0)} | **Likes:** {p.get('likes', 0)} | **Views:** {p.get('views', 0)}")
    text = p.get('text', '').replace('\n', '  \n')
    lines.append(f"- **Text:** {text}\n")
if high_engagement:
    lines.append("\n### High-engagement highlights\n")
    for p in high_engagement:
        lines.append(f"- [{p.get('author', '')} (@{p.get('handle', '')})]({p.get('url', '')}) — {p.get('likes', 0)} likes, {p.get('reposts', 0)} reposts")
lines.append("\n---\n")
with open(REPORT_PATH, 'a', encoding='utf-8') as f:
    f.write('\n'.join(lines))

high = [p for p in all_posts if p.get('likes', 0) > 50]
print(f"\nSUMMARY: {inserted} new posts saved, {len(all_posts)} total extracted, {len(high)} high-engagement posts")
for p in high[:10]:
    print(f"  - {p.get('author')} (@{p.get('handle')}): {p.get('likes')} likes — {p.get('url')}")
