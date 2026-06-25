#!/usr/bin/env python3
import sqlite3
import json
import sys
from datetime import datetime

def save_posts(posts, search_query):
    """Save posts to SQLite database."""
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    scrape_date = datetime.now().strftime('%Y-%m-%d')
    new_count = 0
    duplicate_count = 0
    
    for post in posts:
        # Check if URL already exists
        cursor.execute('SELECT id FROM posts WHERE url = ?', (post.get('url', ''),))
        if cursor.fetchone():
            duplicate_count += 1
            continue
        
        # Determine high engagement (>50 likes)
        high_engagement = 1 if post.get('likes', 0) > 50 else 0
        
        try:
            cursor.execute('''INSERT INTO posts 
                (scrape_date, search_query, author_name, author_handle, post_date, post_text, 
                 likes, reposts, replies, bookmarks, views, url, high_engagement)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (scrape_date,
                 search_query,
                 post.get('author', ''),
                 post.get('handle', ''),
                 post.get('date', ''),
                 post.get('text', ''),
                 post.get('likes', 0),
                 post.get('reposts', 0),
                 post.get('replies', 0),
                 post.get('bookmarks', 0),
                 post.get('views', 0),
                 post.get('url', ''),
                 high_engagement))
            new_count += 1
        except sqlite3.IntegrityError as e:
            duplicate_count += 1
    
    conn.commit()
    conn.close()
    
    return new_count, duplicate_count

if __name__ == "__main__":
    posts = json.loads(sys.stdin.read())
    search_query = sys.argv[1] if len(sys.argv) > 1 else 'unknown'
    new_count, duplicate_count = save_posts(posts, search_query)
    print(f"Saved {new_count} new posts, {duplicate_count} duplicates skipped")