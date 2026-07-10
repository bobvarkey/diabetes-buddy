#!/usr/bin/env python3
"""
X/Twitter Neurointervention Scraper
Scrapes neurointervention and stroke-related posts and saves to SQLite + Markdown
"""

import sqlite3
import json
import os
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
MARKDOWN_DIR = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
TODAY = datetime.now().strftime("%Y-%m-%d")
MARKDOWN_FILE = f"{MARKDOWN_DIR}/x-scrape-{TODAY}.md"

# Ensure directories exist
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
os.makedirs(MARKDOWN_DIR, exist_ok=True)

# Initialize SQLite database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            post_date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            scrape_date TEXT,
            search_query TEXT
        )
    ''')
    conn.commit()
    return conn

# Insert post into database
def insert_post(conn, post):
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO posts 
            (author, handle, post_date, text, likes, reposts, replies, views, url, scrape_date, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post['author'],
            post['handle'],
            post['post_date'],
            post['text'],
            post.get('likes', 0),
            post.get('reposts', 0),
            post.get('replies', 0),
            post.get('views', 0),
            post['url'],
            post['scrape_date'],
            post['search_query']
        ))
        conn.commit()
        return cursor.rowcount > 0
    except sqlite3.IntegrityError:
        return False

# Append to markdown report
def append_markdown(posts, search_query):
    # Check if file exists to determine if we need header
    file_exists = os.path.exists(MARKDOWN_FILE)
    
    with open(MARKDOWN_FILE, 'a' if file_exists else 'w') as f:
        if not file_exists:
            f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
            f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            f.write(f"---\n\n")
        
        f.write(f"\n## Search Query: {search_query}\n\n")
        f.write(f"**Scraped at:** {datetime.now().strftime('%H:%M:%S')}\n\n")
        
        for post in posts:
            f.write(f"\n### {post['author']} (@{post['handle']})\n\n")
            f.write(f"**Date:** {post['post_date']}\n\n")
            f.write(f"**Text:** {post['text']}\n\n")
            f.write(f"**Engagement:** {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('replies', 0)} replies, {post.get('views', 0)} views\n\n")
            f.write(f"**URL:** {post['url']}\n\n")
            if post.get('likes', 0) > 50:
                f.write(f"🔥 **High Engagement Post (>{50} likes)**\n\n")
            f.write(f"---\n")

if __name__ == "__main__":
    # This will be called by the main scraper script
    print("Database and markdown utilities initialized")