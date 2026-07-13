#!/usr/bin/env python3
import json
import sqlite3
import sys

# Read JSON data from stdin
data = json.loads(sys.stdin.read())

# Connect to database
conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
cursor = conn.cursor()

# Insert posts
for post in data:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO posts (author, handle, text, datetime, dateText, url, replies, reposts, likes, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post.get('author', ''),
            post.get('handle', ''),
            post.get('text', ''),
            post.get('datetime', ''),
            post.get('dateText', ''),
            post.get('url', ''),
            post.get('replies', ''),
            post.get('reposts', ''),
            post.get('likes', ''),
            post.get('search_query', '')
        ))
    except Exception as e:
        print(f"Error inserting post: {e}", file=sys.stderr)

conn.commit()
conn.close()
print(f"Processed {len(data)} posts")