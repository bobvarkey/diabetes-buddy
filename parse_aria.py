#!/usr/bin/env python3
import re
import sqlite3
from datetime import datetime
import os

# Read aria snapshot
with open('/tmp/aria_snapshot.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse articles from aria
articles = re.findall(r'article "([^"]+)"', content)

posts = []
for article in articles:
    post = {}
    
    # Extract author and handle
    author_match = re.search(r'link "([^"]+)"[\s\S]*?link "@([^"]+)"', article)
    if author_match:
        post['author'] = author_match.group(1)
        post['handle'] = '@' + author_match.group(2)
    else:
        author_match2 = re.search(r'link "([^"]+)"[\s\S]*?- StaticText "([^"]+)"[\s\S]*?link "@([^"]+)"', article)
        if author_match2:
            post['author'] = author_match2.group(2)
            post['handle'] = '@' + author_match2.group(3)
    
    # Extract date
    date_match = re.search(r'link "([^"]+)"[\s\S]*?time', article)
    if date_match:
        post['date'] = date_match.group(1)
    
    # Extract text (after handle and before metrics)
    # Find StaticText after the links
    text_parts = re.findall(r'StaticText "([^"]+)"', article)
    if len(text_parts) > 3:
        # Skip first few (author, handle, date) and last few (metrics)
        post['text'] = ' '.join(text_parts[3:-10])
    
    # Extract metrics from the article description (at the end)
    metrics_match = re.search(r'(\d+) repl[^,]*,\s*(\d+) repost[^,]*,\s*(\d+) like[^,]*,\s*(\d+) bookmark[^,]*,\s*(\d+) view', article)
    if metrics_match:
        post['replies'] = int(metrics_match.group(1))
        post['reposts'] = int(metrics_match.group(2))
        post['likes'] = int(metrics_match.group(3))
        post['bookmarks'] = int(metrics_match.group(4))
        post['views'] = int(metrics_match.group(5))
    else:
        # Try alternative format
        metrics_match2 = re.search(r'(\d+)\s+(\d+)\s+(\d+)\s+(\d+[KkMm]?)\s*$', article)
        if metrics_match2:
            post['replies'] = int(metrics_match2.group(1))
            post['reposts'] = int(metrics_match2.group(2))
            post['likes'] = int(metrics_match2.group(3))
            # Convert K/M to numbers
            views_str = metrics_match2.group(4)
            if 'K' in views_str or 'k' in views_str:
                post['views'] = int(float(views_str.replace('K', '').replace('k', '')) * 1000)
            elif 'M' in views_str or 'm' in views_str:
                post['views'] = int(float(views_str.replace('M', '').replace('m', '')) * 1000000)
            else:
                post['views'] = int(views_str)
    
    # Generate URL (we'll need to construct it)
    if 'handle' in post:
        # Extract status ID if available, or we'll construct a placeholder
        post['url'] = f"https://x.com/{post['handle'].lstrip('@')}/status/placeholder"
    
    posts.append(post)

print(f"Found {len(posts)} posts")
for i, post in enumerate(posts[:3], 1):
    print(f"\n{i}. {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})")
    print(f"   Date: {post.get('date', 'Unknown')}")
    print(f"   Text: {post.get('text', 'No text')[:100]}...")
    print(f"   Metrics: {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('views', 0)} views")

# Save to database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Insert posts
for post in posts:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts 
            (author, handle, date, text, url, replies, reposts, likes, bookmarks, views, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post.get('author', ''),
            post.get('handle', ''),
            post.get('date', ''),
            post.get('text', ''),
            post.get('url', ''),
            post.get('replies', 0),
            post.get('reposts', 0),
            post.get('likes', 0),
            post.get('bookmarks', 0),
            post.get('views', 0),
            'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
        ))
    except Exception as e:
        print(f"Error inserting post: {e}")

conn.commit()
conn.close()

print(f"\nSaved {len(posts)} posts to database")