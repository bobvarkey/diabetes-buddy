#!/usr/bin/env python3
import json
import sqlite3
import subprocess
import sys
import time
from pathlib import Path
from datetime import datetime

JS_PATH = Path('/Users/bobvarkey/.openclaw/workspace/extract_x_posts_eval.js')
TOKEN = '9d070e5cfb935bf8614f92573eaf0e484d39fcdd3fd76163'
DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
REPORT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'

def run(cmd):
    env = {'PATH': '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'}
    return subprocess.run(cmd, capture_output=True, text=True, env=env)

def focus(tab):
    run(['openclaw','browser','focus',tab,'--token',TOKEN])

def extract():
    js = JS_PATH.read_text()
    cmd = ['openclaw','browser','evaluate','--fn',js,'--token',TOKEN,'--timeout','60000','--json']
    r = run(cmd)
    try:
        return json.loads(r.stdout)['result']
    except Exception as e:
        print('extract error:', e, r.stderr, file=sys.stderr)
        return {'count':0,'posts':[]}

def scroll():
    fn = '() => { window.scrollTo(0, document.body.scrollHeight); return document.body.scrollHeight; }'
    run(['openclaw','browser','evaluate','--fn',fn,'--token',TOKEN,'--timeout','30000','--json'])

def parse_number(raw):
    if not raw:
        return 0
    raw = str(raw).replace(',','').strip()
    try:
        if raw[-1].upper() == 'K':
            return int(float(raw[:-1])*1000)
        if raw[-1].upper() == 'M':
            return int(float(raw[:-1])*1000000)
        if raw[-1].upper() == 'B':
            return int(float(raw[:-1])*1000000000)
        return int(float(raw))
    except Exception:
        return 0

def save_to_db(posts, search_query):
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            search_query TEXT,
            author TEXT,
            handle TEXT,
            post_date TEXT,
            post_text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            url TEXT,
            scraped_at TEXT,
            profile_url TEXT,
            UNIQUE(search_query, handle, post_date, url)
        )
    ''')
    now = datetime.now().isoformat()
    inserted = 0
    for p in posts:
        try:
            c.execute('''
                INSERT OR IGNORE INTO posts (search_query, author, handle, post_date, post_text, replies, reposts, likes, views, bookmarks, url, scraped_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            ''', (
                search_query, p.get('author',''), p.get('handle',''), p.get('date',''), p.get('text',''),
                parse_number(p.get('replies',0)), parse_number(p.get('reposts',0)),
                parse_number(p.get('likes',0)), parse_number(p.get('views',0)), parse_number(p.get('bookmarks',0)),
                p.get('url',''), now
            ))
            if c.rowcount > 0:
                inserted += 1
        except Exception as e:
            print('db insert error:', e, file=sys.stderr)
    conn.commit()
    conn.close()
    return inserted

def append_report(posts, search_query, inserted):
    Path(REPORT_PATH).parent.mkdir(parents=True, exist_ok=True)
    high = [p for p in posts if parse_number(p.get('likes',0)) > 50]
    with open(REPORT_PATH, 'a', encoding='utf-8') as f:
        f.write(f'\n## Search: {search_query}\n\n')
        f.write(f'- Scraped at: {datetime.now().isoformat()}\n')
        f.write(f'- Posts found on page: {len(posts)}\n')
        f.write(f'- New posts inserted: {inserted}\n\n')
        if high:
            f.write('### High Engagement Posts (>50 likes)\n\n')
            for p in high:
                f.write(f'- **{p.get("author","Unknown")}** ({p.get("handle","")})\n')
                f.write(f'  - Date: {p.get("date","")}\n')
                f.write(f'  - Likes: {parse_number(p.get("likes",0))}\n')
                f.write(f'  - URL: {p.get("url","")}\n')
                text = (p.get('text','') or '')[:500]
                f.write(f'  - Text: {text}...\n\n')
        f.write('### All Posts\n\n')
        for i,p in enumerate(posts,1):
            f.write(f'{i}. **{p.get("author","Unknown")}** ({p.get("handle","")})\n')
            f.write(f'   - Date: {p.get("date","")}\n')
            text = (p.get('text','') or '')[:300]
            f.write(f'   - Text: {text}...\n')
            f.write(f'   - URL: {p.get("url","")}\n')
            f.write(f'   - Engagement: {parse_number(p.get("replies",0))} replies, {parse_number(p.get("reposts",0))} reposts, {parse_number(p.get("likes",0))} likes\n\n')

def scrape_page(tab, search_query, passes=5):
    focus(tab)
    all_urls = set()
    all_posts = []
    for i in range(passes):
        data = extract()
        for p in data.get('posts', []):
            url = p.get('url','')
            if url and url not in all_urls:
                all_urls.add(url)
                all_posts.append(p)
        print(f'Pass {i+1}: {len(data.get("posts",[]))} posts, {len(all_posts)} unique total')
        if i < passes - 1:
            scroll()
            time.sleep(2)
    inserted = save_to_db(all_posts, search_query)
    append_report(all_posts, search_query, inserted)
    return all_posts, inserted

if __name__ == '__main__':
    tab = sys.argv[1]
    query = sys.argv[2]
    posts, inserted = scrape_page(tab, query, passes=int(sys.argv[3]) if len(sys.argv) > 3 else 5)
    high = [p for p in posts if parse_number(p.get('likes',0)) > 50]
    print(f'\nDONE: {len(posts)} posts, {inserted} new inserted, {len(high)} high-engagement (>50 likes)')
