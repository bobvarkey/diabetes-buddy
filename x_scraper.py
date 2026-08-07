#!/usr/bin/env python3
"""
X/Twitter Scraper for Neurointervention Posts
Extracts posts and saves to SQLite database and markdown report
"""

import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

# Ensure directories exist
REPORT_DIR.mkdir(parents=True, exist_ok=True)

def init_database():
    """Initialize SQLite database with posts table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            post_date TEXT,
            post_text TEXT,
            likes INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            search_query TEXT
        )
    ''')
    
    conn.commit()
    return conn

def parse_engagement(text):
    """Parse engagement metrics from text like '2 replies, 6 reposts, 23 likes, 7 bookmarks, 4257 views'"""
    metrics = {
        'replies': 0,
        'reposts': 0,
        'likes': 0,
        'views': 0
    }
    
    # Extract numbers with K/M suffixes
    def parse_number(match):
        num_str = match.group(1)
        suffix = match.group(2) if match.lastindex >= 2 else ''
        
        if suffix == 'K':
            return float(num_str) * 1000
        elif suffix == 'M':
            return float(num_str) * 1000000
        else:
            return int(num_str)
    
    # Match patterns like "23 likes" or "4.2K views"
    likes_match = re.search(r'(\d+(?:\.\d+)?)\s*([KM])?\s*likes?', text, re.IGNORECASE)
    reposts_match = re.search(r'(\d+(?:\.\d+)?)\s*([KM])?\s*reposts?', text, re.IGNORECASE)
    replies_match = re.search(r'(\d+(?:\.\d+)?)\s*([KM])?\s*replies?', text, re.IGNORECASE)
    views_match = re.search(r'(\d+(?:\.\d+)?)\s*([KM])?\s*views?', text, re.IGNORECASE)
    
    if likes_match:
        metrics['likes'] = int(parse_number(likes_match))
    if reposts_match:
        metrics['reposts'] = int(parse_number(reposts_match))
    if replies_match:
        metrics['replies'] = int(parse_number(replies_match))
    if views_match:
        metrics['views'] = int(parse_number(views_match))
    
    return metrics

def save_posts(posts_data, search_query):
    """Save posts to database and return count of new posts"""
    conn = init_database()
    cursor = conn.cursor()
    
    new_posts_count = 0
    new_posts = []
    
    for post in posts_data:
        try:
            cursor.execute('''
                INSERT INTO posts (author, handle, post_date, post_text, likes, reposts, replies, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['reposts'],
                post['replies'],
                post['views'],
                post['url'],
                search_query
            ))
            new_posts_count += 1
            new_posts.append(post)
        except sqlite3.IntegrityError:
            # URL already exists, skip
            pass
    
    conn.commit()
    conn.close()
    
    return new_posts_count, new_posts

def create_markdown_report(posts_data, search_query, report_date):
    """Create or append to markdown report"""
    
    report_content = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {report_date}
**Search Query:** {search_query}
**Total Posts Found:** {len(posts_data)}

---

"""
    
    for i, post in enumerate(posts_data, 1):
        report_content += f"""## Post {i}

**Author:** {post['author']}
**Handle:** {post['handle']}
**Date:** {post['date']}
**URL:** {post['url']}

**Text:**
{post['text']}

**Engagement:**
- 👍 Likes: {post['likes']}
- 🔄 Reposts: {post['reposts']}
- 💬 Replies: {post['replies']}
- 👁️ Views: {post['views']}

---

"""
    
    return report_content

def main():
    """Main function - data will be passed from browser automation"""
    print("X/Twitter Scraper initialized")
    print(f"Database: {DB_PATH}")
    print(f"Report: {REPORT_PATH}")

if __name__ == "__main__":
    main()