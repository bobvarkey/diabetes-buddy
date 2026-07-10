#!/usr/bin/env python3
"""Extract posts from X/Twitter using browser automation."""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

# Initialize database
DB_PATH = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
REPORT_DIR = Path.home() / ".openclaw" / "workspace" / "knowledge-base" / "x-scrapes"

DB_PATH.parent.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            handle TEXT NOT NULL,
            date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            search_query TEXT,
            scraped_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_url ON posts(url)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date)")
    conn.commit()
    return conn

def save_posts_to_db(posts, search_query):
    """Save posts to database."""
    conn = init_db()
    cursor = conn.cursor()
    new_count = 0
    
    for post in posts:
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                post.get('author', 'Unknown'),
                post.get('handle', 'unknown'),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('views', 0),
                post.get('url', ''),
                search_query,
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()
    conn.close()
    return new_count

def generate_markdown_report(posts, search_query, new_count):
    """Generate markdown report."""
    today = datetime.now().strftime("%Y-%m-%d")
    report_file = REPORT_DIR / f"x-scrape-{today}.md"
    
    existing_content = ""
    if report_file.exists():
        existing_content = report_file.read_text()
    
    new_content = f"\n## Search: {search_query}\n\n"
    new_content += f"**Scraped at:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    new_content += f"**New posts found:** {new_count}\n\n"
    
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    if high_engagement:
        new_content += "### High Engagement Posts (>50 likes)\n\n"
        for post in high_engagement:
            new_content += f"#### {post.get('author', 'Unknown')} (@{post.get('handle', 'unknown')})\n\n"
            new_content += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            new_content += f"{post.get('text', '')[:500]}...\n\n"
            new_content += f"**Engagement:** {post.get('likes', 0)} likes, {post.get('replies', 0)} replies, {post.get('reposts', 0)} reposts\n\n"
            new_content += f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n"
            new_content += "---\n\n"
    
    if not existing_content:
        header = f"# X/Twitter Scrape Report - {today}\n\n"
        header += f"Generated: {datetime.now().strftime('%Y-%-%d %H:%M:%S')}\n\n"
        report_file.write_text(header + new_content)
    else:
        report_file.write_text(existing_content + new_content)
    
    return report_file

# This script will be populated by extracting data from the browser
if __name__ == "__main__":
    print("Database initialized at:", DB_PATH)
    print("Report directory:", REPORT_DIR)