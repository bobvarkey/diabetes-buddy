#!/usr/bin/env python3
"""
X/Twitter Neurointervention Scraper
Requires Chrome with remote debugging enabled.

Run once to enable remote debugging:
  ./enable_remote_debugging.sh

Then run this scraper:
  browser-harness x_scrape_interactive.py
"""

import sqlite3
import json
import re
import hashlib
import time
from datetime import datetime
from pathlib import Path

# Database path
DB_PATH = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
REPORT_DIR = Path.home() / ".openclaw" / "workspace" / "knowledge-base" / "x-scrapes"

# Search queries
QUERIES = [
    {
        "name": "Stroke & Neurointervention",
        "url": "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top"
    },
    {
        "name": "Vascular Neurology",
        "url": "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top"
    }
]

def create_database():
    """Create database and tables if not exists"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # The table already exists, but we ensure the schema is correct
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            search_query TEXT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            url TEXT,
            scrape_date TEXT DEFAULT CURRENT_DATE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def parse_posts_from_snapshot(snapshot_text, search_query):
    """Parse posts from accessibility snapshot text"""
    posts = []
    
    # Split by article tags
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {'search_query': search_query}
        
        # Extract author and handle - handle "Verified account" pattern
        author_match = re.search(r'^([^\s@]+(?:\s+[^\s@]+)*?)\s+(?:Verified account\s+)?(@[\w]+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = author_match.group(2).strip()
        
        # Extract date/time - look for time patterns
        time_patterns = [
            (r'(\d+\s+hours?\s+ago)', None),
            (r'(\d+\s+days?\s+ago)', None),
            (r'(\d+h)', None),
            (r'(\d+d)', None),
            (r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:,?\s+\d{4})?', None)
        ]
        
        for pattern, _ in time_patterns:
            time_match = re.search(pattern, article_text)
            if time_match:
                post['date'] = time_match.group(1)
                break
        
        # Extract text content - between author and metrics
        text_start = 0
        if 'handle' in post:
            handle_pos = article_text.find(post['handle'])
            if handle_pos >= 0:
                text_start = handle_pos + len(post['handle'])
        
        if text_start > 0:
            remaining = article_text[text_start:]
            
            # Remove date patterns from beginning of text
            for pattern, _ in time_patterns:
                remaining = re.sub(r'^\s*' + pattern + r'\s*', ' ', remaining)
            
            # Remove metrics from end
            metrics_pos = remaining.find('Embedded video')
            if metrics_pos < 0:
                metrics_pos = remaining.find('Image')
            if metrics_pos < 0:
                metrics_pos = remaining.find('group')
            
            if metrics_pos > 0:
                remaining = remaining[:metrics_pos]
            
            post['text'] = remaining.strip()
        
        # Extract engagement metrics
        metrics_match = re.search(r'(\d+)\s+repl(y|ies)?\s*,\s*(\d+)\s+reposts?\s*,\s*(\d+)\s+likes?\s*,\s*(?:(\d+)\s+bookmarks?\s*,\s*)?(\d+[\.\d]*[KM]?)\s+views?', article_text)
        if metrics_match:
            post['replies'] = int(metrics_match.group(1))
            post['reposts'] = int(metrics_match.group(3))
            post['likes'] = int(metrics_match.group(4))
            post['bookmarks'] = int(metrics_match.group(5)) if metrics_match.group(5) else 0
            post['views'] = metrics_match.group(6)
        else:
            # Try simpler pattern for metrics
            simple_metrics = re.search(r'(\d+)\s+like[s]?', article_text)
            if simple_metrics:
                post['likes'] = int(simple_metrics.group(1))
                post['replies'] = 0
                post['reposts'] = 0
                post['bookmarks'] = 0
                post['views'] = '0'
        
        # Extract URL - look for status pattern
        url_match = re.search(r'/(\w+)/status/(\d+)', article_text)
        if url_match:
            post['url'] = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
        
        if post.get('author') and post.get('text'):
            # Generate a unique ID for deduplication based on content
            content_hash = hashlib.md5(
                f"{post.get('author', '')}{post.get('text', '')}".encode()
            ).hexdigest()
            post['content_id'] = content_hash
            posts.append(post)
    
    return posts

def save_to_db(posts):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    inserted = 0
    for post in posts:
        try:
            # Check if post already exists by URL or content
            if post.get('url'):
                cursor.execute('SELECT id FROM posts WHERE url = ?', (post['url'],))
                if cursor.fetchone():
                    continue
            
            cursor.execute('''
                INSERT INTO posts 
                (search_query, author, handle, date, text, replies, reposts, likes, bookmarks, views, url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('search_query', ''),
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('bookmarks', 0),
                post.get('views', '0'),
                post.get('url', '')
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def generate_report(all_posts, query_name):
    """Generate markdown report"""
    today = datetime.now().strftime("%Y-%m-%d")
    report_path = REPORT_DIR / f"x-scrape-{today}.md"
    
    # Group posts by query
    query_posts = {}
    for post in all_posts:
        q = post.get('search_query', 'unknown')
        if q not in query_posts:
            query_posts[q] = []
        query_posts[q].append(post)
    
    # Find high engagement posts (>50 likes)
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    
    # Generate report
    report_lines = [
        f"# X/Twitter Neurointervention Scrape Report",
        f"**Date:** {datetime.now().strftime('%A, %B %d, %Y - %H:%M (%Z)')}",
        f"",
        f"## Summary",
        f"- **Total posts found:** {len(all_posts)}",
        f"- **New posts saved:** {len(all_posts)}",
        f"- **High engagement posts (>50 likes):** {len(high_engagement)}",
        f"",
        f"## Queries Run",
    ]
    
    for i, query in enumerate(QUERIES, 1):
        q_posts = query_posts.get(query['name'], [])
        report_lines.append(f"{i}. **{query['name']}** ({len(q_posts)} posts)")
        report_lines.append(f"   - URL: {query['url']}")
    
    if high_engagement:
        report_lines.append("")
        report_lines.append("## High Engagement Posts")
        report_lines.append("")
        for post in high_engagement:
            report_lines.append(f"### {post.get('author', 'Unknown')} ({post.get('handle', 'N/A')})")
            report_lines.append(f"- **Likes:** {post.get('likes', 0)}")
            report_lines.append(f"- **Replies:** {post.get('replies', 0)}")
            report_lines.append(f"- **Reposts:** {post.get('reposts', 0)}")
            report_lines.append(f"- **URL:** {post.get('url', 'N/A')}")
            report_lines.append(f"- **Text:** {post.get('text', 'N/A')[:200]}...")
            report_lines.append("")
    
    for query_name, posts in query_posts.items():
        report_lines.append(f"## Posts from: {query_name}")
        report_lines.append("")
        for post in posts[:20]:  # Limit to 20 per query
            report_lines.append(f"### {post.get('author', 'Unknown')} ({post.get('handle', 'N/A'})")
            report_lines.append(f"- **Date:** {post.get('date', 'N/A')}")
            report_lines.append(f"- **Engagement:** {post.get('likes', 0)} likes, {post.get('replies', 0)} replies, {post.get('reposts', 0)} reposts")
            report_lines.append(f"- **URL:** {post.get('url', 'N/A')}")
            report_lines.append(f"- **Text:**")
            report_lines.append(f"  {post.get('text', 'N/A')}")
            report_lines.append("")
    
    report_lines.append("---")
    report_lines.append("*This report was generated automatically by the Neurointervention X Scraper.*")
    
    # Write report
    with open(report_path, 'w') as f:
        f.write('\n'.join(report_lines))
    
    return report_path

# Main execution
if __name__ == "__main__":
    print("X/Twitter Neurointervention Scraper")
    print("=" * 50)
    print()
    
    # Ensure database exists
    create_database()
    
    all_posts = []
    
    # Process each query
    for query in QUERIES:
        print(f"\nQuery: {query['name']}")
        print(f"URL: {query['url']}")
        
        # This script should be run via browser-harness which provides:
        # - new_tab(), goto(), wait_for_load(), screenshot(), js()
        # 
        # For interactive use, run:
        #   browser-harness <<'PY'
        #   # ... code to navigate and extract ...
        #   PY
        
        print("This script requires browser-harness to be active.")
        print("Run: browser-harness x_scrape_interactive.py")