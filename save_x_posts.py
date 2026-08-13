#!/usr/bin/env python3
import json, sqlite3, sys, os
from datetime import datetime, timezone

def main():
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    neuro_json = '/Users/bobvarkey/.openclaw/workspace/x-neuro-posts.json'
    avm_json = '/Users/bobvarkey/.openclaw/workspace/x-avm-posts.json'

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            search_query TEXT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            url TEXT UNIQUE,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            scraped_at TEXT
        )
    ''')
    cur.execute('''
        CREATE TABLE IF NOT EXISTS scrape_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_at TEXT,
            search_query TEXT,
            new_posts INTEGER,
            total_posts INTEGER
        )
    ''')
    conn.commit()

    now = datetime.now(timezone.utc).isoformat()
    total_new = 0
    results = []

    for query_label, q, path in [
        ('neurointervention OR thrombectomy OR #Neurointervention OR #stroke', 'neuro', neuro_json),
        ('cerebral AVM OR intracranial aneurysm OR endovascular', 'avm', avm_json),
    ]:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        posts = data.get('posts', [])
        new_count = 0
        for p in posts:
            try:
                cur.execute('''
                    INSERT INTO x_posts (search_query, author, handle, date, text, url, replies, reposts, likes, bookmarks, views, scraped_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (query_label, p.get('author'), p.get('handle'), p.get('date'),
                      p.get('text'), p.get('url'),
                      p.get('replies', 0), p.get('reposts', 0), p.get('likes', 0),
                      p.get('bookmarks', 0), p.get('views', 0), now))
                new_count += 1
            except sqlite3.IntegrityError:
                pass
        cur.execute('INSERT INTO scrape_runs (run_at, search_query, new_posts, total_posts) VALUES (?, ?, ?, ?)',
                    (now, query_label, new_count, len(posts)))
        total_new += new_count
        results.append((query_label, len(posts), new_count))
        conn.commit()

    conn.close()
    print(json.dumps({'total_new': total_new, 'results': [{'query': q, 'total_scraped': t, 'new_inserted': n} for q, t, n in results]}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
