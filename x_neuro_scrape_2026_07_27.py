import sys, os, time, json, sqlite3, re
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

# Ensure x_posts table exists with correct schema
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

# Also keep posts table if needed
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
conn.close()

def parse_count(s):
    if not s:
        return 0
    s = str(s).strip().replace(',', '').replace('\u202f', '').replace('\xa0', '').lower()
    try:
        mult = 1
        if s.endswith('k'):
            mult = 1000
            s = s[:-1]
        elif s.endswith('m'):
            mult = 1000000
            s = s[:-1]
        return int(round(float(s) * mult))
    except Exception:
        return 0

EXTRACT_JS = """
(() => {
  const posts = [];
  const articles = document.querySelectorAll('article');
  articles.forEach(a => {
    try {
      const links = Array.from(a.querySelectorAll('a'));
      let handle = '';
      let author = '';
      let profileUrl = '';

      // Find user link: /handle (not status link)
      for (const l of links) {
        const h = l.getAttribute('href') || '';
        if (h.startsWith('/') && !h.includes('/status/') && h.split('/').filter(Boolean).length === 1) {
          handle = h.split('/').filter(Boolean)[0];
          profileUrl = 'https://x.com' + h;
          // Author name may be in an ancestor or same link
          const txt = (l.innerText || '').trim();
          if (txt && !txt.startsWith('@')) {
            author = txt;
          }
          break;
        }
      }

      // Status link
      let statusLink = null;
      for (const l of links) {
        const h = l.getAttribute('href') || '';
        if (h.includes('/status/') && !h.includes('/analytics') && !h.includes('/photo')) {
          statusLink = l;
          break;
        }
      }
      const url = statusLink ? 'https://x.com' + statusLink.getAttribute('href').split('?')[0] : '';

      // Date
      const timeEl = a.querySelector('time');
      const date = timeEl ? timeEl.getAttribute('datetime') : '';

      // Text
      let text = '';
      const tweetText = a.querySelector('[data-testid="tweetText"]');
      if (tweetText) {
        text = tweetText.innerText || '';
      } else {
        const langs = a.querySelectorAll('[lang]');
        for (const el of langs) {
          const t = (el.innerText || '').trim();
          if (t) { text = t; break; }
        }
      }

      // Engagement
      function parseCountJs(s) {
        if (!s) return 0;
        s = s.toString().trim().replace(/,/g, '').replace(/\u202f/g, '').replace(/\xa0/g, '').toLowerCase();
        let mult = 1;
        if (s.endsWith('k')) { mult = 1000; s = s.slice(0, -1); }
        else if (s.endsWith('m')) { mult = 1000000; s = s.slice(0, -1); }
        const n = parseFloat(s);
        return isNaN(n) ? 0 : Math.round(n * mult);
      }
      let replies = 0, reposts = 0, likes = 0, views = 0, bookmarks = 0;
      const buttons = a.querySelectorAll('button, [role="button"]');
      buttons.forEach(b => {
        const aria = (b.getAttribute('aria-label') || '').toLowerCase();
        const dataTestid = (b.getAttribute('data-testid') || '').toLowerCase();
        const visibleText = (b.innerText || '').trim();
        // Try to get count from aria-label or inner text
        let countText = '';
        if (/\d/.test(aria)) countText = aria;
        else if (/\d/.test(visibleText)) countText = visibleText;

        if (aria.includes('replies') || aria.includes('reply') || dataTestid.includes('reply')) {
          replies = parseCountJs(countText) || replies;
        }
        if (aria.includes('reposts') || aria.includes('repost') || dataTestid.includes('retweet')) {
          reposts = parseCountJs(countText) || reposts;
        }
        if (aria.includes('likes') || aria.includes('like') || dataTestid.includes('like')) {
          likes = parseCountJs(countText) || likes;
        }
        if (aria.includes('bookmarks') || aria.includes('bookmark') || dataTestid.includes('bookmark')) {
          bookmarks = parseCountJs(countText) || bookmarks;
        }
        if (aria.includes('views') || aria.includes('view') || dataTestid.includes('analytics')) {
          views = parseCountJs(countText) || views;
        }
      });

      // Fallback: look at any link/button text with numbers near bottom of article
      if (replies === 0 && reposts === 0 && likes === 0 && views === 0) {
        const allText = a.innerText || '';
        const nums = allText.match(/(\d[\d.KMkm,\.]*)/g);
        // Can't reliably assign without labels
      }

      // Author fallback: look for first non-@ text in user link area
      if (!author) {
        const possibleName = a.querySelector('a[href^="/"]');
        if (possibleName) {
          const t = (possibleName.innerText || '').trim();
          if (t && !t.startsWith('@')) author = t;
        }
      }

      if (url && text) {
        posts.push({
          author: author,
          handle: handle,
          date: date,
          text: text,
          replies: replies,
          reposts: reposts,
          likes: likes,
          views: views,
          bookmarks: bookmarks,
          url: url,
          profile_url: profileUrl
        });
      }
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
    time.sleep(6)

    seen_urls = set()
    posts_for_query = []

    # Check for error page
    body_text = js("document.body ? document.body.innerText.slice(0,500) : ''") or ''
    if 'Something went wrong' in body_text or 'Try again' in body_text:
        print("  Got error page, waiting 10s and retrying...")
        time.sleep(10)
        goto(url)
        wait_for_load()
        time.sleep(6)

    last_count = 0
    same_count = 0
    max_scrolls = 15
    for i in range(max_scrolls):
        # Extract before scroll
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

        # Scroll
        js("window.scrollBy(0, 800)")
        time.sleep(2.5)
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
inserted_x = 0
inserted_posts = 0
for p in all_posts:
    try:
        c.execute('''
            INSERT OR IGNORE INTO x_posts (author, handle, date, text, replies, reposts, likes, views, bookmarks, url, search_query, scrape_date)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            p.get('author', ''),
            p.get('handle', ''),
            p.get('date', ''),
            p.get('text', ''),
            p.get('replies', 0),
            p.get('reposts', 0),
            p.get('likes', 0),
            p.get('views', 0),
            p.get('bookmarks', 0),
            p.get('url', ''),
            p.get('search_query', ''),
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
            p.get('url', ''),
            p.get('author', ''),
            p.get('handle', ''),
            p.get('profile_url', ''),
            p.get('date', ''),
            p.get('text', ''),
            p.get('replies', 0),
            p.get('likes', 0),
            p.get('reposts', 0),
            p.get('bookmarks', 0),
            p.get('search_query', ''),
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
lines.append(f"**New posts inserted:** {inserted_x} (total extracted this run: {len(all_posts)})\n")
high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
lines.append(f"**High-engagement posts (>50 likes):** {len(high_engagement)}\n")
for p in all_posts:
    lines.append(f"### {p.get('author', 'Unknown')} (@{p.get('handle', '')})")
    lines.append(f"- **Date:** {p.get('date', '')}")
    lines.append(f"- **URL:** {p.get('url', '')}")
    lines.append(f"- **Replies:** {p.get('replies', 0)} | **Reposts:** {p.get('reposts', 0)} | **Likes:** {p.get('likes', 0)} | **Views:** {p.get('views', 0)} | **Bookmarks:** {p.get('bookmarks', 0)}")
    text = p.get('text', '').replace('\n', '  \n')
    lines.append(f"- **Text:** {text}\n")
if high_engagement:
    lines.append("\n### High-engagement highlights\n")
    for p in high_engagement:
        lines.append(f"- [{p.get('author', '')} (@{p.get('handle', '')})]({p.get('url', '')}) — {p.get('likes', 0)} likes, {p.get('reposts', 0)} reposts")
lines.append("\n---\n")
with open(REPORT_PATH, 'a', encoding='utf-8') as f:
    f.write('\n'.join(lines))

print(f"\nSUMMARY: {inserted_x} new posts saved, {len(all_posts)} total extracted, {len(high_engagement)} high-engagement posts")
for p in high_engagement[:10]:
    print(f"  - {p.get('author')} (@{p.get('handle')}): {p.get('likes')} likes — {p.get('url')}")
