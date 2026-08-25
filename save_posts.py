import sqlite3, json, os
from datetime import datetime

db = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
os.makedirs(os.path.dirname(db), exist_ok=True)
conn = sqlite3.connect(db)
c = conn.cursor()
c.execute('''
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT,
    search_url TEXT,
    author TEXT,
    handle TEXT,
    post_date TEXT,
    text TEXT,
    likes INTEGER,
    replies INTEGER,
    reposts INTEGER,
    bookmarks INTEGER,
    url TEXT,
    scraped_at TEXT
)
''')

def parse_number(s):
    if not s:
        return 0
    s = s.strip().replace(',', '').upper()
    if s.endswith('K'):
        return int(float(s[:-1]) * 1000)
    if s.endswith('M'):
        return int(float(s[:-1]) * 1000000)
    try:
        return int(float(s))
    except:
        return 0

scraped_at = datetime.utcnow().isoformat() + 'Z'
urls = [
    ('https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today',
     '/Users/bobvarkey/.openclaw/workspace/q1_posts.json'),
    ('https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today',
     '/Users/bobvarkey/.openclaw/workspace/q2_posts.json')
]

for search_url, file in urls:
    with open(file) as f:
        posts = json.load(f)
    for p in posts:
        c.execute('''
        INSERT OR IGNORE INTO posts (created_at, search_url, author, handle, post_date, text, likes, replies, reposts, bookmarks, url, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (datetime.utcnow().isoformat() + 'Z', search_url, p['author'], p['handle'], p['date'], p['text'],
              parse_number(p['likes']), parse_number(p['replies']), parse_number(p['reposts']), 0, p['link'], scraped_at))

conn.commit()
c.execute('SELECT COUNT(*) FROM posts WHERE scraped_at=?', (scraped_at,))
count = c.fetchone()[0]
print(f'New posts inserted in this scrape: {count}')
c.execute('SELECT COUNT(*) FROM posts')
total = c.fetchone()[0]
print(f'Total posts in DB: {total}')
conn.close()
