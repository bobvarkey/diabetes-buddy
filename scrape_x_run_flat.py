import json, sqlite3, time, re, os, sys
from datetime import datetime, timezone

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

QUERIES = [
    ("neurointervention OR thrombectomy OR #Neurointervention OR #stroke",
     "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today"),
    ("cerebral AVM OR intracranial aneurysm OR endovascular",
     "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"),
]

EXTRACT_JS = r"""(()=>{
function parseCount(s){
  if (!s) return 0;
  s = s.trim().replace(/,/g,'').toLowerCase();
  let m = s.match(/^([0-9.]+)([km]?)\s*/);
  if(!m) return 0;
  let n = parseFloat(m[1]);
  if(Number.isNaN(n)) return 0;
  if(m[2]==='k') n *= 1000;
  if(m[2]==='m') n *= 1000000;
  return Math.round(n);
}
const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
const posts = [];
articles.forEach(a => {
  const links = Array.from(a.querySelectorAll('a[role="link"][href]'));
  let handle = '', authorName = '', postUrl = '';
  for(const link of links){
    const href = (link.getAttribute('href') || '').split('?')[0];
    if(!postUrl && href.includes('/status/') && !href.endsWith('/analytics')){
      postUrl = 'https://x.com' + href;
    }
    if((new RegExp('^/[^/]+$')).test(href) && !href.includes('search')){
      const txt = link.textContent.trim();
      if(txt.startsWith('@')){
        handle = txt.slice(1);
      } else if(txt.length > 0 && !authorName){
        authorName = txt;
      }
      if(!handle) handle = href.slice(1);
    }
  }
  if(!postUrl) return;
  const textEl = a.querySelector('[data-testid="tweetText"]');
  const text = textEl ? textEl.textContent.trim() : '';
  const timeEl = a.querySelector('time');
  const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
  let replies=0, reposts=0, likes=0, bookmarks=0, views=0;
  const labels = Array.from(a.querySelectorAll('[aria-label]')).map(el=>el.getAttribute('aria-label') || '').join(' ');
  const matches = labels.matchAll(/\b(\d[\d,.]*)([km]?)\s+(replies?|reposts?|likes?|bookmarks?|views?)\b/gi);
  for(const m of matches){
    const n = parseCount(m[1]+m[2]);
    if(!Number.isFinite(n) || n < 0) continue;
    const w = m[3].toLowerCase();
    if(w === 'reply' || w === 'replies') replies = n;
    else if(w === 'repost' || w === 'reposts') reposts = n;
    else if(w === 'like' || w === 'likes') likes = n;
    else if(w === 'bookmark' || w === 'bookmarks') bookmarks = n;
    else if(w === 'view' || w === 'views') views = n;
  }
  if(!likes && !replies && !reposts){
    const groups = Array.from(a.querySelectorAll('[role="group"]'));
    groups.forEach(g => {
      Array.from(g.querySelectorAll('span')).forEach(sp => {
        const txt = sp.textContent.trim();
        const parent = sp.parentElement;
        if(!parent) return;
        const testid = parent.getAttribute('data-testid') || '';
        const n = parseCount(txt);
        if(!Number.isFinite(n) || n < 0) return;
        if(testid.includes('reply')) replies = n;
        else if(testid.includes('retweet')) reposts = n;
        else if(testid.includes('like')) likes = n;
        else if(testid.includes('bookmark')) bookmarks = n;
      });
    });
  }
  const hashtags = (text.match(/#\w+/g) || []).join(' ');
  posts.push({authorName, handle, datetime, text, replies, reposts, likes, bookmarks, views, postUrl, hashtags});
});
return JSON.stringify(posts);
})()"""

# ensure DB table
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
# x_posts is the existing table used by previous scrapes
c.execute("""
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
""")
# add bookmarks column if it doesn't exist (harmless)
cols = [row[1] for row in c.execute("PRAGMA table_info(x_posts)")]
if 'bookmarks' not in cols:
    try:
        c.execute("ALTER TABLE x_posts ADD COLUMN bookmarks INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
c.execute("CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)")
c.execute("CREATE INDEX IF NOT EXISTS idx_date ON x_posts(date)")
c.execute("CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes)")
c.execute("CREATE INDEX IF NOT EXISTS idx_handle ON x_posts(handle)")
c.execute("SELECT url FROM x_posts")
existing = {r[0] for r in c.fetchall()}
conn.close()

all_posts = []
seen_urls = set()

for label, url in QUERIES:
    print(f"Scraping: {label}")
    new_tab(url)
    wait_for_load()
    time.sleep(4)
    for i in range(4):
        js("window.scrollBy(0, 900)")
        time.sleep(2)
    raw = js(EXTRACT_JS)
    if not raw:
        print(f"WARN: no data for {label}", file=sys.stderr)
        continue
    posts = json.loads(raw)
    print(f"  extracted {len(posts)} articles")
    for p in posts:
        u = p.get('postUrl')
        if not u or u in seen_urls:
            continue
        seen_urls.add(u)
        # filter non-medical AVM noise
        if p.get('handle', '').lower() == 'avmnews7':
            continue
        p['source_query'] = label
        all_posts.append(p)

# insert new posts
conn = sqlite3.connect(DB_PATH)
c = conn.cursor()
new_count = 0
for p in all_posts:
    if p['postUrl'] in existing:
        continue
    new_count += 1
    c.execute("""
        INSERT OR IGNORE INTO x_posts (author, handle, date, text, replies, reposts, likes, views, bookmarks, url, search_query, scrape_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        p.get('authorName'), p.get('handle'), p.get('datetime'),
        p.get('text'), int(p.get('replies') or 0), int(p.get('reposts') or 0),
        int(p.get('likes') or 0), int(p.get('views') or 0), int(p.get('bookmarks') or 0),
        p.get('postUrl'), p.get('source_query'),
        datetime.now(timezone.utc).isoformat()
    ))
# record scrape run summary
c.execute("""
    CREATE TABLE IF NOT EXISTS scrape_runs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        search_query TEXT,
        posts_found INTEGER,
        scrape_date TEXT,
        notes TEXT
    )
""")
c.execute("""
    INSERT INTO scrape_runs (search_query, posts_found, scrape_date, notes)
    VALUES (?, ?, ?, ?)
""", ("neurointervention/stroke + AVM/aneurysm/endovascular", len(all_posts), datetime.now(timezone.utc).isoformat(), f"new={new_count}"))
conn.commit()
conn.close()

# append markdown report
os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
run_ts = datetime.now(timezone.utc).isoformat()
lines = [
    f"## X Neurointervention Scrape — {run_ts}",
    "",
    f"- **Queries:** {len(QUERIES)}",
    f"- **Posts extracted (live):** {len(all_posts)}",
    f"- **New posts inserted:** {new_count}",
    "",
]
high = [p for p in all_posts if int(p.get('likes') or 0) > 50]
if high:
    lines.append(f"### High-engagement posts ({len(high)} with >50 likes)")
    lines.append("")
    for p in sorted(high, key=lambda x: int(x.get('likes') or 0), reverse=True):
        snippet = p.get('text','')[:240].replace('\n', ' ').replace('\r', ' ')
        lines.append(f"- **@{p.get('handle')}** — {p.get('authorName')}  ")
        lines.append(f"  {p.get('postUrl')}  ")
        lines.append(f"  Likes: {p.get('likes')}, Reposts: {p.get('reposts')}, Replies: {p.get('replies')}  ")
        lines.append(f"  > {snippet}")
        lines.append("")
else:
    lines.append("### High-engagement posts")
    lines.append("No posts with >50 likes in this scrape.")
    lines.append("")
lines.append("### All extracted posts")
lines.append("")
for p in all_posts:
    lines.append(f"- [{p.get('authorName')} (@{p.get('handle')})]({p.get('postUrl')}) — {p.get('datetime')} — Likes {p.get('likes')} | Reposts {p.get('reposts')} | Bookmarks {p.get('bookmarks')}")
lines.append("")
lines.append("---")
lines.append("")
with open(REPORT_PATH, "a", encoding="utf-8") as f:
    f.write("\n".join(lines))

print(f"DONE: {len(all_posts)} live posts, {new_count} new, {len(high)} high-engagement")
