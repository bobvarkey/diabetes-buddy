#!/usr/bin/env python3
"""
Extract posts from X/Twitter browser snapshot and save to database.
"""

import re
import sqlite3
from datetime import datetime
from pathlib import Path

def parse_snapshot_text(snapshot_text):
    """Parse posts from snapshot text."""
    posts = []
    
    # Look for article elements with post content
    # Pattern: 'article "...author @handle date text ...replies, X reposts, Y likes, Z views"'
    
    # Find all article sections
    article_pattern = r"'article \"([^\"]+)\""
    articles = re.findall(article_pattern, snapshot_text)
    
    for article in articles:
        # Parse author
        author_match = re.search(r'^([^@]+)', article)
        author = author_match.group(1).strip() if author_match else ''
        
        # Parse handle
        handle_match = re.search(r'@([^\s·]+)', article)
        handle = handle_match.group(1) if handle_match else ''
        
        # Parse date - look for patterns like "Jul 3" or "8 minutes ago" or "Oct 1, 2025"
        date_match = re.search(r'·\s*(\d+\s*(?:minutes?|hours?|days?)\s*ago)', article)
        if not date_match:
            date_match = re.search(r'·\s*(\w+\s+\d+(?:,?\s+\d{4})?)', article)
        date = date_match.group(1) if date_match else ''
        
        # Parse metrics
        metrics = {}
        
        # Look for replies
        replies_match = re.search(r'(\d+)\s*[Rr]epl(?:y|ies)', article)
        if replies_match:
            metrics['replies'] = int(replies_match.group(1))
        else:
            metrics['replies'] = 0
        
        # Look for reposts
        reposts_match = re.search(r'(\d+)\s*[Rr]eposts?', article)
        if reposts_match:
            metrics['reposts'] = int(reposts_match.group(1))
        else:
            metrics['reposts'] = 0
        
        # Look for likes
        likes_match = re.search(r'(\d+)\s*[Ll]ikes?', article)
        if likes_match:
            metrics['likes'] = int(likes_match.group(1))
        else:
            metrics['likes'] = 0
        
        # Look for bookmarks
        bookmarks_match = re.search(r'(\d+)\s*[Bb]ookmarks?', article)
        if bookmarks_match:
            metrics['bookmarks'] = int(bookmarks_match.group(1))
        else:
            metrics['bookmarks'] = 0
        
        # Look for views
        views_match = re.search(r'([\d.]+[Kk]?)\s*[Vv]iews?', article)
        if views_match:
            views_str = views_match.group(1)
            if 'K' in views_str or 'k' in views_str:
                metrics['views'] = int(float(views_str.replace('K', '').replace('k', '')) * 1000)
            else:
                metrics['views'] = int(views_str)
        else:
            metrics['views'] = 0
        
        posts.append({
            'author': author,
            'handle': handle,
            'date': date,
            'metrics': metrics,
            'raw': article[:200]  # First 200 chars for debugging
        })
    
    return posts

def save_to_database(posts, search_query, db_path):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    added = 0
    for post in posts:
        try:
            # Construct URL from handle and extract status ID
            # We'll need to get status ID from the snapshot
            # For now, use a placeholder
            url = f"https://x.com/{post['handle']}/status/placeholder"
            
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, dateDisplay, text, likes, reposts, replies, views, url, scrape_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['date'],
                post.get('text', ''),
                post['metrics'].get('likes', 0),
                post['metrics'].get('reposts', 0),
                post['metrics'].get('replies', 0),
                post['metrics'].get('views', 0),
                url,
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                added += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return added

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python extract_posts_from_snapshot.py <snapshot_file>")
        sys.exit(1)
    
    snapshot_file = sys.argv[1]
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    
    with open(snapshot_file, 'r') as f:
        snapshot_text = f.read()
    
    posts = parse_snapshot_text(snapshot_text)
    print(f"Found {len(posts)} posts")
    
    for post in posts:
        print(f"\nAuthor: {post['author']}")
        print(f"Handle: {post['handle']}")
        print(f"Date: {post['date']}")
        print(f"Metrics: {post['metrics']}")