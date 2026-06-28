#!/usr/bin/env python3
import sqlite3
import json
import re
import hashlib
from datetime import datetime
from pathlib import Path

# Parse posts from snapshot text
def parse_posts_from_snapshot(snapshot_text, search_query):
    posts = []
    # Split by article tags
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {'search_query': search_query}
        
        # Extract author and handle - handle "Verified account" pattern
        author_match = re.search(r'^([^\s@]+(?:\s+[^\s@]+)*?)\s+(?:Verified account\s+)?(@[\w]+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = author_match.group(2).strip()
        
        # Extract date/time - look for time patterns
        time_patterns = [
            (r'(\d+\s+hours?\s+ago)', None),
            (r'(\d+\s+days?\s+ago)', None),
            (r'(\d+h)', None),
            (r'(\d+d)', None),
            (r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:,?\s+\d{4})?', None)
        ]
        
        for pattern, _ in time_patterns:
            time_match = re.search(pattern, article_text)
            if time_match:
                post['date'] = time_match.group(1)
                break
        
        # Extract text content - between author and metrics
        text_start = 0
        if 'handle' in post:
            handle_pos = article_text.find(post['handle'])
            if handle_pos >= 0:
                text_start = handle_pos + len(post['handle'])
        
        if text_start > 0:
            remaining = article_text[text_start:]
            
            # Remove date patterns from beginning of text
            for pattern, _ in time_patterns:
                remaining = re.sub(r'^\s*' + pattern + r'\s*', ' ', remaining)
            
            # Remove metrics from end
            metrics_pos = remaining.find('Embedded video')
            if metrics_pos < 0:
                metrics_pos = remaining.find('Image')
            if metrics_pos < 0:
                metrics_pos = remaining.find('group')
            
            if metrics_pos > 0:
                remaining = remaining[:metrics_pos]
            
            post['text'] = remaining.strip()
        
        # Extract engagement metrics
        metrics_match = re.search(r'(\d+)\s+repl(y|ies)?\s*,\s*(\d+)\s+reposts?\s*,\s*(\d+)\s+likes?\s*,\s*(?:(\d+)\s+bookmarks?\s*,\s*)?(\d+[\.\d]*[KM]?)\s+views?', article_text)
        if metrics_match:
            post['replies'] = int(metrics_match.group(1))
            post['reposts'] = int(metrics_match.group(3))
            post['likes'] = int(metrics_match.group(4))
            post['bookmarks'] = int(metrics_match.group(5)) if metrics_match.group(5) else 0
            post['views'] = metrics_match.group(6)
        else:
            # Try simpler pattern for metrics
            simple_metrics = re.search(r'(\d+)\s+like[s]?', article_text)
            if simple_metrics:
                post['likes'] = int(simple_metrics.group(1))
                post['replies'] = 0
                post['reposts'] = 0
                post['bookmarks'] = 0
                post['views'] = '0'
        
        # Extract URL - look for status pattern
        url_match = re.search(r'/(\w+)/status/(\d+)', article_text)
        if url_match:
            post['url'] = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
        
        if post.get('author') and post.get('text'):
            # Generate a unique ID for deduplication based on content
            content_hash = hashlib.md5(
                f"{post.get('author', '')}{post.get('text', '')}".encode()
            ).hexdigest()
            post['content_id'] = content_hash
            posts.append(post)
    
    return posts

# Save to SQLite database
def save_to_db(posts, db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id TEXT UNIQUE,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER,
            reposts INTEGER,
            likes INTEGER,
            bookmarks INTEGER,
            views TEXT,
            url TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            search_query TEXT
        )
    ''')
    
    # Insert posts
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (content_id, author, handle, date, text, replies, reposts, likes, bookmarks, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('content_id', ''),
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('bookmarks', 0),
                post.get('views', '0'),
                post.get('url', ''),
                post.get('search_query', '')
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    return inserted

# Main execution
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python x_scraper.py <snapshot_file> <search_query>")
        sys.exit(1)
    
    snapshot_file = sys.argv[1]
    search_query = sys.argv[2]
    db_path = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
    
    # Read snapshot
    with open(snapshot_file, 'r') as f:
        snapshot_text = f.read()
    
    # Parse posts
    posts = parse_posts_from_snapshot(snapshot_text, search_query)
    print(f"Parsed {len(posts)} posts from {snapshot_file}")
    
    # Save to database
    inserted = save_to_db(posts, db_path)
    print(f"Inserted {inserted} new posts into database")
    
    # Print summary
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    print(f"High engagement posts (>{50} likes): {len(high_engagement)}")
    for post in high_engagement:
        print(f"  - {post.get('author')} ({post.get('handle')}): {post.get('likes')} likes - {post.get('url', 'N/A')}")