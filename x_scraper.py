#!/usr/bin/env python3
"""
X/Twitter scraper for neurointervention and stroke posts
"""
import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
MARKDOWN_PATH = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            handle TEXT NOT NULL,
            date TEXT,
            text TEXT NOT NULL,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TEXT,
            UNIQUE(handle, date, text)
        )
    ''')
    conn.commit()
    return conn

def parse_engagement_metrics(metrics_text):
    """Parse engagement metrics from text like '2 replies, 6 reposts, 23 likes'"""
    result = {
        'replies': 0,
        'reposts': 0,
        'likes': 0,
        'bookmarks': 0,
        'views': 0
    }
    
    # Extract numbers with their labels
    patterns = {
        'replies': r'(\d+)\s+repl',
        'reposts': r'(\d+)\s+repost',
        'likes': r'(\d+)\s+like',
        'bookmarks': r'(\d+)\s+bookmark',
        'views': r'(\d+(?:\.\d+[KkMm]?)?)\s+views?'
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, metrics_text, re.IGNORECASE)
        if match:
            value = match.group(1)
            # Handle K/M suffixes
            if 'K' in value or 'k' in value:
                result[key] = int(float(value.replace('K', '').replace('k', '')) * 1000)
            elif 'M' in value or 'm' in value:
                result[key] = int(float(value.replace('M', '').replace('m', '')) * 1000000)
            else:
                result[key] = int(value)
    
    return result

def add_post(conn, author, handle, date, text, engagement, url, search_query):
    """Add a post to the database"""
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO posts (author, handle, date, text, replies, reposts, likes, bookmarks, views, url, search_query, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            author, handle, date, text,
            engagement.get('replies', 0),
            engagement.get('reposts', 0),
            engagement.get('likes', 0),
            engagement.get('bookmarks', 0),
            engagement.get('views', 0),
            url, search_query,
            datetime.now().isoformat()
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def get_high_engagement_posts(conn, min_likes=50):
    """Get posts with more than min_likes likes"""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT author, handle, date, text, replies, reposts, likes, bookmarks, views, url
        FROM posts
        WHERE likes >= ?
        ORDER BY likes DESC
    ''', (min_likes,))
    return cursor.fetchall()

def generate_markdown_report(posts, search_queries):
    """Generate markdown report"""
    report_date = datetime.now().strftime("%Y-%m-%d")
    report_path = MARKDOWN_PATH / f"x-scrape-{report_date}.md"
    MARKDOWN_PATH.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write(f"# X/Twitter Scrape Report - {report_date}\n\n")
        f.write(f"**Scraped at:** {datetime.now().isoformat()}\n\n")
        f.write(f"**Search Queries:**\n")
        for query in search_queries:
            f.write(f"- {query}\n")
        f.write(f"\n---\n\n")
        
        f.write(f"## Summary\n\n")
        f.write(f"**Total posts scraped:** {len(posts)}\n\n")
        
        high_engagement = [p for p in posts if p[6] >= 50]  # likes >= 50
        if high_engagement:
            f.write(f"## High-Engagement Posts (>50 likes)\n\n")
            for post in high_engagement:
                author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
                f.write(f"### {author} (@{handle})\n\n")
                f.write(f"**Date:** {date}\n\n")
                f.write(f"**Text:** {text}\n\n")
                f.write(f"**Engagement:** {likes} likes, {reposts} reposts, {replies} replies, {views} views\n\n")
                f.write(f"**URL:** {url}\n\n")
                f.write(f"---\n\n")
        
        f.write(f"## All Posts\n\n")
        for post in posts:
            author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
            f.write(f"- **{author} (@{handle})** - {date}\n")
            f.write(f"  {text[:200]}{'...' if len(text) > 200 else ''}\n")
            f.write(f"  💬 {replies} 🔄 {reposts} ❤️ {likes} 👁 {views}\n\n")
    
    return report_path

if __name__ == "__main__":
    # This script will be used to process the extracted data
    print("X/Twitter scraper module loaded")