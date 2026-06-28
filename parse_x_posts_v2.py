#!/usr/bin/env python3
import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

# Parse posts from snapshot text
def parse_posts_from_snapshot(snapshot_text, search_query):
    posts = []
    # Split by article tags
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {}
        
        # Extract author and handle
        author_match = re.search(r'^([^\s@]+(?:\s+[^\s@]+)*)\s+(@[\w]+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = author_match.group(2).strip()
        else:
            author_match = re.search(r'^([^\s]+(?:\s+[^\s]+)?)\s+Verified account\s+(@[\w]+)', article_text)
            if author_match:
                post['author'] = author_match.group(1).strip()
                post['handle'] = author_match.group(2).strip()
        
        # Extract date/time
        time_match = re.search(r'(\d+\s+(?:hour|hours|day|days|month|months|year|years)\s+ago|\d+\s*(?:h|d|m|y)\b|\w+\s+\d+,\s+\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s', article_text)
        if time_match:
            post['date'] = time_match.group(1).strip()
        
        # Extract text content (everything between handle and metrics)
        text_start = article_text.find(' ')
        if text_start > 0:
            remaining = article_text[text_start:]
            # Remove metrics from end
            metrics_pos = remaining.rfind('group')
            if metrics_pos > 0:
                remaining = remaining[:metrics_pos]
            # Clean up common X patterns
            remaining = re.sub(r'\s+(?:Embedded video|Play Video|Image)\s+', ' ', remaining)
            post['text'] = remaining.strip()
        
        # Extract engagement metrics
        metrics_match = re.search(r'(\d+)\s+repl(y|ies)?\s*,\s*(\d+)\s+reposts?\s*,\s*(\d+)\s+likes?\s*,\s*(?:(\d+)\s+bookmarks?\s*,\s*)?(\d+[\.\d]*[KM]?)\s+views?', article_text)
        if metrics_match:
            post['replies'] = int(metrics_match.group(1))
            post['reposts'] = int(metrics_match.group(3))
            post['likes'] = int(metrics_match.group(4))
            post['bookmarks'] = int(metrics_match.group(5)) if metrics_match.group(5) else 0
            post['views'] = metrics_match.group(6)
        
        # Extract URL - look for status pattern
        url_match = re.search(r'/(\w+)/status/(\d+)', article_text)
        if url_match:
            post['url'] = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
        
        if post.get('author') and post.get('text'):
            post['search_query'] = search_query
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
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER,
            reposts INTEGER,
            likes INTEGER,
            bookmarks INTEGER,
            views TEXT,
            url TEXT UNIQUE,
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
                (author, handle, date, text, replies, reposts, likes, bookmarks, views, url, search_query)
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
        print("Usage: python parse_x_posts.py <snapshot_file> <search_query>")
        sys.exit(1)
    
    snapshot_file = sys.argv[1]
    search_query = sys.argv[2]
    db_path = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
    
    # Read snapshot
    with open(snapshot_file, 'r') as f:
        snapshot_text = f.read()
    
    # Parse posts
    posts = parse_posts_from_snapshot(snapshot_text, search_query)
    print(f"Parsed {len(posts)} posts from snapshot")
    
    # Save to database
    inserted = save_to_db(posts, db_path)
    print(f"Inserted {inserted} new posts into database")
    
    # Print summary
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    print(f"\nHigh engagement posts (>{50} likes): {len(high_engagement)}")
    for post in high_engagement:
        print(f"  - {post.get('author')} (@{post.get('handle', '').lstrip('@')}): {post.get('likes')} likes")