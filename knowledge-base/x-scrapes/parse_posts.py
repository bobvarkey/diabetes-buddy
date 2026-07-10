#!/usr/bin/env python3
"""Parse X posts from snapshot and save to database."""

import re
import sqlite3
from datetime import datetime
from pathlib import Path

def parse_posts_from_snapshot(snapshot_content):
    """Extract posts from X/Twitter browser snapshot."""
    posts = []
    
    # Find all article elements in the snapshot
    # Article pattern includes the full post content in quotes
    article_pattern = r"'article \"([^\"]+)\" \[ref=\w+\]"
    articles = re.findall(article_pattern, snapshot_content)
    
    for article in articles:
        post = {}
        
        # Parse the article content
        # Format: "Author Name @handle date text metrics"
        
        # Extract handle (starts with @)
        handle_match = re.search(r'@(\S+)', article)
        if handle_match:
            post['handle'] = handle_match.group(1)
        
        # Extract author name (before the handle)
        author_match = re.search(r"^(.+?) @", article)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract date
        date_match = re.search(r'·\s*(\d+\s*(?:minutes?|hours?|days?)\s*ago)', article)
        if not date_match:
            date_match = re.search(r'·\s*(\w+\s+\d+(?:,?\s+\d{4})?)', article)
        if date_match:
            post['date'] = date_match.group(1)
        
        # Extract metrics
        # Replies
        replies_match = re.search(r'(\d+)\s*[Rr]epl(?:y|ies)', article)
        post['replies'] = int(replies_match.group(1)) if replies_match else 0
        
        # Reposts
        reposts_match = re.search(r'(\d+)\s*[Rr]eposts?', article)
        post['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
        
        # Likes
        likes_match = re.search(r'(\d+)\s*[Ll]ikes?', article)
        post['likes'] = int(likes_match.group(1)) if likes_match else 0
        
        # Bookmarks
        bookmarks_match = re.search(r'(\d+)\s*[Bb]ookmarks?', article)
        post['bookmarks'] = int(bookmarks_match.group(1)) if bookmarks_match else 0
        
        # Views (can include K for thousands)
        views_match = re.search(r'([\d.]+[Kk]?)\s*[Vv]iews?', article)
        if views_match:
            views_str = views_match.group(1)
            if 'K' in views_str or 'k' in views_str:
                post['views'] = int(float(views_str.replace('K', '').replace('k', '')) * 1000)
            else:
                post['views'] = int(views_str)
        else:
            post['views'] = 0
        
        # Extract text content (between date and metrics)
        # The text is after the date and before the metrics
        text_match = re.search(r'·\s*\d+[^·]+?\s+(.+?)(?=\d+\s*(?:reply|repost|like|view|bookmark|$))', article, re.DOTALL)
        if text_match:
            post['text'] = text_match.group(1).strip()
        else:
            # Fallback: extract text between handle and metrics
            post['text'] = ''
        
        # Generate URL from status ID if available
        status_match = re.search(r'/status/(\d+)', snapshot_content)
        if status_match and post.get('handle'):
            post['url'] = f"https://x.com/{post['handle']}/status/{status_match.group(1)}"
        elif post.get('handle'):
            post['url'] = f"https://x.com/{post['handle']}/status/unknown"
        
        posts.append(post)
    
    return posts

def save_posts_to_db(posts, search_query, db_path):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    added = 0
    for post in posts:
        if not post.get('handle'):
            continue
        
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, dateDisplay, text, likes, reposts, replies, views, url, scrape_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('reposts', 0),
                post.get('replies', 0),
                post.get('views', 0),
                post.get('url', ''),
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                added += 1
        except Exception as e:
            print(f"Error: {e}")
    
    conn.commit()
    conn.close()
    return added

def main():
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python parse_posts.py <snapshot_file>")
        sys.exit(1)
    
    snapshot_file = Path(sys.argv[1])
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    
    with open(snapshot_file) as f:
        content = f.read()
    
    posts = parse_posts_from_snapshot(content)
    print(f"Found {len(posts)} posts")
    
    for i, post in enumerate(posts, 1):
        print(f"\n--- Post {i} ---")
        print(f"Author: {post.get('author', 'Unknown')}")
        print(f"Handle: {post.get('handle', 'Unknown')}")
        print(f"Date: {post.get('date', 'Unknown')}")
        print(f"Likes: {post.get('likes', 0)}")
        print(f"Reposts: {post.get('reposts', 0)}")
        print(f"Views: {post.get('views', 0)}")
    
    search_query = "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    added = save_posts_to_db(posts, search_query, db_path)
    print(f"\nAdded {added} new posts to database")

if __name__ == '__main__':
    main()