#!/usr/bin/env python3
import json
import sqlite3
import os
from datetime import datetime
import requests

# Browser CDP endpoint
CDP_URL = "http://127.0.0.1:18800"

def cdp_request(method, params=None):
    """Make a CDP request to the browser"""
    url = f"{CDP_URL}/json"
    try:
        # Get the list of targets
        response = requests.get(url, timeout=5)
        targets = response.json()
        
        # Find our tab (neurointervention-stroke-search)
        target_id = None
        for target in targets:
            if 'neurointervention' in target.get('url', '') or 'stroke' in target.get('url', ''):
                target_id = target.get('id')
                break
        
        if not target_id:
            print("No matching target found")
            return None
            
        # Send CDP command
        ws_url = f"ws://127.0.0.1:18800/devtools/page/{target_id}"
        # For now, return the target info
        return target
    except Exception as e:
        print(f"Error: {e}")
        return None

def init_database(db_path):
    """Initialize SQLite database for X posts"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            retweets INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    return conn

def save_posts_to_db(posts, conn, search_query):
    """Save posts to database"""
    cursor = conn.cursor()
    
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, text, likes, retweets, replies, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('retweets', 0),
                post.get('replies', 0),
                post.get('views', 0),
                post.get('url', ''),
                search_query
            ))
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()

def generate_markdown_report(posts, output_path, search_query):
    """Generate markdown report"""
    date_str = datetime.now().strftime('%Y-%m-%d')
    
    report = f"# X/Twitter Scrape Report\n\n"
    report += f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    report += f"**Search Query:** {search_query}\n\n"
    report += f"## Summary\n\n"
    report += f"- Total posts found: {len(posts)}\n"
    
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    report += f"- High-engagement posts (>50 likes): {len(high_engagement)}\n\n"
    
    if high_engagement:
        report += "## High-Engagement Posts\n\n"
        for post in high_engagement:
            report += f"### {post.get('author', 'Unknown')} (@{post.get('handle', 'unknown')})\n"
            report += f"**Likes:** {post.get('likes', 0)} | "
            report += f"**Retweets:** {post.get('retweets', 0)} | "
            report += f"**Replies:** {post.get('replies', 0)}\n\n"
            report += f"{post.get('text', '')}\n\n"
            report += f"[Link]({post.get('url', '')})\n\n---\n\n"
    
    report += "## All Posts\n\n"
    for i, post in enumerate(posts, 1):
        report += f"{i}. **{post.get('author', 'Unknown')}** (@{post.get('handle', 'unknown')})\n"
        report += f"   - Likes: {post.get('likes', 0)}\n"
        text = post.get('text', '')[:200]
        if len(post.get('text', '')) > 200:
            text += '...'
        report += f"   - {text}\n\n"
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Append to file
    with open(output_path, 'a') as f:
        f.write(report)
    
    return len(posts), len(high_engagement)

if __name__ == '__main__':
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    print("X/Twitter scraper initialized")
    print(f"Database: {db_path}")
    print(f"Report: {report_path}")
    
    # Test CDP connection
    target = cdp_request("test")
    if target:
        print(f"Connected to target: {target.get('url', 'unknown')}")
    else:
        print("Could not connect to browser via CDP")