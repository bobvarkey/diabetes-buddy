#!/usr/bin/env python3
import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

# Initialize database
db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Table already exists with this schema:
# CREATE TABLE posts (
#   id INTEGER PRIMARY KEY AUTOINCREMENT,
#   author_name TEXT,
#   handle TEXT,
#   datetime TEXT,
#   text TEXT,
#   url TEXT UNIQUE,
#   replies TEXT,
#   reposts TEXT,
#   likes TEXT,
#   bookmarks TEXT,
#   views TEXT,
#   search_query TEXT,
#   scraped_at TEXT DEFAULT CURRENT_TIMESTAMP
# );

def parse_metric(value):
    """Parse metric value, handling K/M suffixes"""
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, str):
        value = value.strip()
        if 'K' in value or 'k' in value:
            return str(int(float(value.replace('K', '').replace('k', '')) * 1000))
        elif 'M' in value or 'm' in value:
            return str(int(float(value.replace('M', '').replace('m', '')) * 1000000))
        else:
            return value
    return '0'

def save_posts(posts_json, search_query):
    """Save posts to database"""
    posts = json.loads(posts_json)
    new_posts = 0
    
    for post in posts:
        try:
            # Insert post with existing schema
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author_name, handle, datetime, text, url, replies, reposts, likes, views, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('postDate', ''),
                post.get('text', ''),
                post.get('url', ''),
                parse_metric(post.get('replies', 0)),
                parse_metric(post.get('retweets', 0)),
                parse_metric(post.get('likes', 0)),
                parse_metric(post.get('views', 0)),
                search_query
            ))
            
            if cursor.rowcount > 0:
                new_posts += 1
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()
    return new_posts, len(posts)

def get_high_engagement_posts(min_likes=50):
    """Get posts with likes >= min_likes"""
    cursor.execute('''
        SELECT author_name, handle, datetime, text, likes, reposts, replies, views, url, search_query
        FROM posts
        WHERE CAST(likes AS INTEGER) >= ?
        ORDER BY CAST(likes AS INTEGER) DESC
    ''', (min_likes,))
    
    return cursor.fetchall()

def get_all_posts():
    """Get all posts organized by search query"""
    cursor.execute('''
        SELECT author_name, handle, datetime, text, likes, reposts, replies, views, url, search_query
        FROM posts
        ORDER BY search_query, CAST(likes AS INTEGER) DESC
    ''')
    
    return cursor.fetchall()

def get_stats():
    """Get database statistics"""
    cursor.execute('SELECT COUNT(*) FROM posts')
    total = cursor.fetchone()[0]
    
    cursor.execute('SELECT COUNT(*) FROM posts WHERE CAST(likes AS INTEGER) >= 50')
    high_engagement = cursor.fetchone()[0]
    
    return total, high_engagement

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        if command == 'save':
            if len(sys.argv) > 3:
                posts_json = sys.argv[2]
                query = sys.argv[3]
                new, total = save_posts(posts_json, query)
                print(f"Saved {new} new posts out of {total} extracted")
            else:
                print("Usage: python3 process_posts.py save '<json>' '<query>'")
        
        elif command == 'stats':
            total, high_eng = get_stats()
            print(f"Total posts: {total}")
            print(f"High engagement (>=50 likes): {high_eng}")
        
        elif command == 'high-engagement':
            posts = get_high_engagement_posts()
            print(f"\nHigh-engagement posts (>=50 likes): {len(posts)}")
            for post in posts:
                author, handle, date, text, likes, rt, replies, views, url, query = post
                print(f"\n{author} {handle}")
                print(f"Likes: {likes}, RT: {rt}, Replies: {replies}")
                print(f"Text: {text[:100]}...")
                print(f"URL: {url}")
        
        elif command == 'export':
            posts = get_all_posts()
            print(f"\nAll posts by query:")
            current_query = None
            for post in posts:
                author, handle, date, text, likes, rt, replies, views, url, query = post
                if query != current_query:
                    print(f"\n{'='*80}")
                    print(f"Query: {query}")
                    print(f"{'='*80}")
                    current_query = query
                print(f"\n{author} {handle} | {date}")
                print(f"Likes: {likes}, RT: {rt}, Replies: {replies}, Views: {views}")
                print(f"Text: {text}")
                print(f"URL: {url}")
    
    conn.close()