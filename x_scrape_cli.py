import subprocess, json, os, sqlite3, time, re
from datetime import datetime, timezone
from urllib.parse import quote

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
PROFILE = "openclaw"

SEARCH_URLS = [
    "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke%20since%3Atoday&src=typed_query&f=top",
    "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular%20since%3Atoday&src=typed_query&f=top"
]

def run_browser_cmd(args):
    cmd = ["openclaw", "--profile", PROFILE, "browser"] + args
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180, stdin=subprocess.DEVNULL)
    out = result.stdout.strip()
    err = result.stderr.strip()
    if err:
        print("  STDERR:", err[:200])
    # Config warnings appear above the actual output; try to find last line that looks like JSON or simple output
    lines = out.splitlines()
    # If last non-empty line is the answer
    for line in reversed(lines):
        line = line.strip()
        if line and not line.startswith("Config warnings") and not line.startswith("-") and not line.startswith("│") and not line.startswith("╭") and not line.startswith("╰") and not line.startswith("├") and not line.startswith("◇"):
            return line, result.returncode
    return out, result.returncode

def evaluate(fn_body):
    # fn_body should be a JS function definition like "function foo() { ... }"
    out, rc = run_browser_cmd(["evaluate", "--fn", fn_body])
    if rc != 0:
        print("EVAL ERROR:", out)
        return None
    try:
        return json.loads(out)
    except Exception:
        return out

def navigate(url):
    out, rc = run_browser_cmd(["navigate", url])
    if rc != 0:
        print("NAV ERROR:", out)
    time.sleep(5)  # wait for React render
    return rc == 0

EXTRACT_FN = """
function extractPosts() {
  function parseCount(s) {
    if (!s) return 0;
    s = s.toString().trim().replace(/,/g, '').replace(/\u202f/g, '').replace(/\xa0/g, '').toLowerCase();
    var mult = 1;
    if (s.endsWith('k')) { mult = 1000; s = s.slice(0, -1); }
    else if (s.endsWith('m')) { mult = 1000000; s = s.slice(0, -1); }
    var n = parseFloat(s);
    return isNaN(n) ? 0 : Math.round(n * mult);
  }
  var posts = [];
  document.querySelectorAll('article').forEach(function(a) {
    try {
      var links = Array.from(a.querySelectorAll('a'));
      var userLink = null, statusLink = null;
      links.forEach(function(l) {
        var h = l.getAttribute('href') || '';
        if (!statusLink && h.includes('/status/') && !h.includes('/analytics')) {
          statusLink = l;
        }
        if (!userLink && h.startsWith('/') && !h.includes('/status/') && h.split('/').filter(Boolean).length === 1) {
          userLink = l;
        }
      });
      if (!statusLink) return;

      var handle = userLink ? userLink.getAttribute('href').replace('/', '').split('?')[0] : '';
      var author = '';
      if (userLink) {
        var spans = userLink.querySelectorAll('span, div');
        for (var i = 0; i < spans.length; i++) {
          var t = (spans[i].innerText || '').trim();
          if (t && !t.startsWith('@') && !t.startsWith('\u00b7') && t.length > 1) {
            author = t;
            break;
          }
        }
      }

      var timeEl = a.querySelector('time');
      var date = timeEl ? timeEl.getAttribute('datetime') : '';

      var textEl = a.querySelector('[data-testid="tweetText"]');
      var text = textEl ? textEl.innerText : '';

      var replies = 0, reposts = 0, likes = 0, views = 0, bookmarks = 0;
      a.querySelectorAll('button, [role="button"]').forEach(function(b) {
        var aria = (b.getAttribute('aria-label') || '').toLowerCase();
        var tid = (b.getAttribute('data-testid') || '').toLowerCase();
        var visible = (b.innerText || '').trim();
        var countText = '';
        if (/\d/.test(aria)) countText = aria;
        else if (/\d/.test(visible)) countText = visible;

        if (aria.indexOf('replies') >= 0 || aria.indexOf('reply') >= 0 || tid.indexOf('reply') >= 0) {
          replies = parseCount(countText) || replies;
        }
        if (aria.indexOf('reposts') >= 0 || aria.indexOf('repost') >= 0 || tid.indexOf('retweet') >= 0) {
          reposts = parseCount(countText) || reposts;
        }
        if (aria.indexOf('likes') >= 0 || aria.indexOf('like') >= 0 || tid.indexOf('like') >= 0) {
          likes = parseCount(countText) || likes;
        }
        if (aria.indexOf('bookmarks') >= 0 || aria.indexOf('bookmark') >= 0 || tid.indexOf('bookmark') >= 0) {
          bookmarks = parseCount(countText) || bookmarks;
        }
        if (aria.indexOf('views') >= 0 || aria.indexOf('view') >= 0 || tid.indexOf('analytics') >= 0) {
          views = parseCount(countText) || views;
        }
      });

      // Fallback views from analytics link
      if (views === 0) {
        var analytics = links.find(function(l) { var h = l.getAttribute('href') || ''; return h.includes('/status/') && h.includes('/analytics'); });
        if (analytics) views = parseCount(analytics.innerText);
      }

      if (text || author || handle) {
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
          url: 'https://x.com' + statusLink.getAttribute('href').split('?')[0]
        });
      }
    } catch (e) {}
  });
  return JSON.stringify(posts);
}
"""

SCROLL_FN = """
function scrollDown() {
  window.scrollBy(0, 900);
  return 'ok';
}
"""

ARTICLE_COUNT_FN = """
function countArticles() {
  return document.querySelectorAll('article').length;
}
"""

all_posts = []

for url in SEARCH_URLS:
    print("Navigating to:", url)
    if not navigate(url):
        continue

    seen_urls = set()
    posts_for_query = []

    last_count = 0
    same_count = 0
    max_scrolls = 15
    for i in range(max_scrolls):
        # Extract
        raw = evaluate(EXTRACT_FN)
        if isinstance(raw, str):
            try:
                batch = json.loads(raw)
            except Exception as e:
                print("JSON parse error:", e, raw[:200])
                batch = []
        else:
            batch = raw or []

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
        evaluate(SCROLL_FN)
        time.sleep(2.5)

        count_raw = evaluate(ARTICLE_COUNT_FN)
        try:
            count = int(count_raw) if count_raw else 0
        except Exception:
            count = 0
        if count == last_count:
            same_count += 1
            if same_count >= 3:
                break
        else:
            same_count = 0
        last_count = count

    # Final extraction
    raw = evaluate(EXTRACT_FN)
    if isinstance(raw, str):
        try:
            batch = json.loads(raw)
        except Exception:
            batch = []
    else:
        batch = raw or []
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
            'https://x.com/' + p.get('handle', '') if p.get('handle') else '',
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
