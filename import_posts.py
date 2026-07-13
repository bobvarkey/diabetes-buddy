#!/usr/bin/env python3
import json
import sqlite3
import sys

# Read JSON from stdin
data = sys.stdin.read().strip()
# Remove outer quotes if present
if data.startswith('"') and data.endswith('"'):
    data = data[1:-1]

# Unescape for proper JSON
data = data.encode().decode('unicode_escape')

posts = json.loads(data)
query = sys.argv[1] if len(sys.argv) > 1 else "unknown"

conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
c = conn.cursor()

for post in posts:
    try:
        c.execute('''INSERT OR IGNORE INTO posts
                     (author, handle, datetime, text, url, replies, reposts, likes, views, search_query)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                 (post.get('author', ''),
                  post.get('handle', ''),
                  post.get('time', ''),
                  post.get('text', ''),
                  post.get('url', ''),
                  post.get('replies', 0),
                  post.get('reposts', 0),
                  post.get('likes', 0),
                  post.get('views', 0),
                  query))
    except Exception as e:
        print(f"Error inserting: {e}", file=sys.stderr)

conn.commit()
conn.close()
print(f"Inserted {len(posts)} posts for query: {query}")