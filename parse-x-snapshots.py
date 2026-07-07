#!/usr/bin/env python3
import re
import sqlite3
import json
from datetime import datetime

def parse_article(article_text):
    """Parse an X article from snapshot text."""
    post = {}
    
    # Extract author name and handle
    # Pattern: 'article "Author Name Verified account @handle ...'
    match = re.search(r'article "([^"]+?)\s*(?:Verified account\s+)?(@[\w]+)', article_text)
    if match:
        post['author'] = match.group(1).strip()
        post['handle'] = match.group(2)
    else:
        # Try without verified
        match = re.search(r'article "([^"]+?)\s+(@[\w]+)', article_text)
        if match:
            post['author'] = match.group(1).strip()
            post['handle'] = match.group(2)
    
    # Extract date/time
    # Patterns: "Jul 1", "14 hours ago", "23 hours ago", "1h", "Jun 27"
    time_match = re.search(r'(@[\w]+\s+)(\d+[hdm]\s+|\d+ hours? ago\s+|\d+ days? ago\s+|\w+ \d+\s+)', article_text)
    if time_match:
        post['date'] = time_match.group(2).strip()
    
    # Extract text - everything after handle/date until engagement metrics
    text_match = re.search(r'(@[\w]+\s+)(?:Verified account\s+)?(?:\d+[hdm]\s+|\d+ hours? ago\s+|\d+ days? ago\s+|\w+ \d+\s+)(.*?)(?:\d+ replies|\d+ reposts|\d+ likes|\d+ views|Image|$)', article_text, re.DOTALL)
    if text_match:
        post['text'] = text_match.group(2).strip()
    
    # Extract engagement metrics
    metrics_match = re.search(r'(\d+)\s+replies?,\s*(\d+)\s+reposts?,\s*(\d+)\s+likes?(?:,\s*(\d+)\s+bookmarks?)?(?:,\s*([\d,]+)\s+views?)?', article_text)
    if metrics_match:
        post['replies'] = int(metrics_match.group(1))
        post['reposts'] = int(metrics_match.group(2))
        post['likes'] = int(metrics_match.group(3))
        if metrics_match.group(4):
            post['bookmarks'] = int(metrics_match.group(4))
        if metrics_match.group(5):
            post['views'] = int(metrics_match.group(5).replace(',', ''))
    
    # Extract URL - look for status link
    url_match = re.search(r'/status/(\d+)', article_text)
    if url_match:
        handle = post.get('handle', '').replace('@', '')
        post['url'] = f"https://x.com/{handle}/status/{url_match.group(1)}"
    
    return post

def process_snapshot_file(filepath):
    """Process a snapshot file and extract articles."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find all article elements
    articles = []
    article_pattern = r'- \'article "([^"]+)"\s+\[ref=e\d+\]'
    
    for match in re.finditer(article_pattern, content):
        article_text = match.group(1)
        post = parse_article(article_text)
        if post.get('text') and post.get('author'):
            articles.append(post)
    
    return articles

def create_database(db_path):
    """Create SQLite database for posts."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    return conn

def save_posts_to_db(conn, posts, search_query):
    """Save posts to database."""
    cursor = conn.cursor()
    
    for post in posts:
        cursor.execute('''
            INSERT INTO posts (author, handle, date, text, replies, reposts, likes, bookmarks, views, url, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post.get('author', ''),
            post.get('handle', ''),
            post.get('date', ''),
            post.get('text', ''),
            post.get('replies', 0),
            post.get('reposts', 0),
            post.get('likes', 0),
            post.get('bookmarks', 0),
            post.get('views', 0),
            post.get('url', ''),
            search_query
        ))
    
    conn.commit()

def main():
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    conn = create_database(db_path)
    
    # Process first snapshot
    print("Processing snapshot 1...")
    posts1 = process_snapshot_file('/tmp/x-snapshot-1.txt')
    print(f"Found {len(posts1)} posts in snapshot 1")
    save_posts_to_db(conn, posts1, 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
    
    # Process second snapshot
    print("Processing snapshot 2...")
    posts2 = process_snapshot_file('/tmp/x-snapshot-2.txt')
    print(f"Found {len(posts2)} posts in snapshot 2")
    save_posts_to_db(conn, posts2, 'cerebral AVM OR intracranial aneurysm OR endovascular')
    
    # Get total count
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM posts')
    total = cursor.fetchone()[0]
    print(f"\nTotal posts saved: {total}")
    
    # Get high-engagement posts (>50 likes)
    cursor.execute('SELECT * FROM posts WHERE likes > 50 ORDER BY likes DESC')
    high_engagement = cursor.fetchall()
    print(f"High-engagement posts (>50 likes): {len(high_engagement)}")
    
    conn.close()
    
    return posts1, posts2

if __name__ == '__main__':
    main()