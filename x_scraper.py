#!/usr/bin/env python3
"""
X/Twitter scraper for neurointervention and stroke posts
"""
import json
import sqlite3
import os
from datetime import datetime
from pathlib import Path

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

def init_database():
    """Initialize SQLite database with posts table"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            author TEXT,
            handle TEXT,
            text TEXT,
            datetime TEXT,
            date_text TEXT,
            replies TEXT,
            reposts TEXT,
            likes TEXT,
            views TEXT,
            bookmarks TEXT,
            search_query TEXT,
            scraped_at TEXT
        )
    ''')
    
    conn.commit()
    return conn

def parse_engagement(metric_str):
    """Parse engagement metrics like '1.3K', '504', etc"""
    if not metric_str:
        return 0
    metric_str = metric_str.strip().replace(',', '')
    
    multipliers = {'K': 1000, 'M': 1000000}
    
    if metric_str[-1] in multipliers:
        return int(float(metric_str[:-1]) * multipliers[metric_str[-1]])
    
    try:
        return int(float(metric_str))
    except:
        return 0

def save_posts(posts, search_query, conn):
    """Save posts to database"""
    cursor = conn.cursor()
    scraped_at = datetime.utcnow().isoformat()
    
    new_count = 0
    high_engagement = []
    
    for post in posts:
        try:
            likes_count = parse_engagement(post.get('likes', '0'))
            
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (url, author, handle, text, datetime, date_text, replies, reposts, likes, views, bookmarks, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('url'),
                post.get('author'),
                post.get('handle'),
                post.get('text'),
                post.get('datetime'),
                post.get('date_text'),
                post.get('replies'),
                post.get('reposts'),
                post.get('likes'),
                post.get('views'),
                post.get('bookmarks'),
                search_query,
                scraped_at
            ))
            
            if cursor.rowcount > 0:
                new_count += 1
                if likes_count > 50:
                    high_engagement.append({
                        'author': post.get('author'),
                        'handle': post.get('handle'),
                        'text': post.get('text', '')[:100] + '...',
                        'likes': likes_count,
                        'url': post.get('url')
                    })
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()
    return new_count, high_engagement

def create_markdown_report(all_posts, new_count, high_engagement_posts, search_queries):
    """Create markdown report"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    report_date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report = f"""# X/Twitter Scrape Report - {report_date}

## Summary

- **Total new posts extracted**: {new_count}
- **Search queries**: {', '.join(search_queries)}
- **High-engagement posts (>50 likes)**: {len(high_engagement_posts)}

## High-Engagement Posts

"""
    
    if high_engagement_posts:
        for i, post in enumerate(high_engagement_posts, 1):
            report += f"""### {i}. {post['author']} ({post['handle']})
- **Likes**: {post['likes']}
- **Text**: {post['text']}
- **URL**: [{post['url']}]({post['url']})

"""
    else:
        report += "_No high-engagement posts found._\n\n"
    
    report += """## All Posts Extracted

"""
    
    for i, post in enumerate(all_posts, 1):
        report += f"""### Post {i}

- **Author**: {post.get('author', 'N/A')}
- **Handle**: {post.get('handle', 'N/A')}
- **Text**: {post.get('text', 'N/A')}
- **Date**: {post.get('date_text', 'N/A')} ({post.get('datetime', 'N/A')})
- **Engagement**:
  - Replies: {post.get('replies', '0')}
  - Reposts: {post.get('reposts', '0')}
  - Likes: {post.get('likes', '0')}
  - Views: {post.get('views', 'N/A')}
- **URL**: [{post.get('url', 'N/A')}]({post.get('url', '#')})

---

"""
    
    with open(REPORT_PATH, 'w') as f:
        f.write(report)
    
    return REPORT_PATH

if __name__ == "__main__":
    print("X/Twitter Scraper for Neurointervention")
    print("=" * 50)