#!/usr/bin/env python3
"""
Extract X/Twitter posts from browser snapshot
"""
import json
import re
import sqlite3
from datetime import datetime
from pathlib import Path

# Parse the snapshot from stdin or file
def parse_snapshot_text(snapshot_text):
    """Parse browser snapshot into structured posts."""
    posts = []
    
    # Split by article sections
    # The snapshot format has articles with quoted content
    article_pattern = r"'article \"([^\"]+)\""
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {}
        
        # Extract author and handle - format: "Author Name @handle Date ..."
        author_handle_match = re.match(r'^([^(]+?)\s+(@\w+)', article_text)
        if author_handle_match:
            post['author'] = author_handle_match.group(1).strip()
            post['handle'] = author_handle_match.group(2)
        
        # Extract handle from @mention
        if 'handle' not in post:
            handle_match = re.search(r'@(\w+)', article_text)
            if handle_match:
                post['handle'] = '@' + handle_match.group(1)
        
        # Extract date
        date_match = re.search(r'@\w+\s+(Jun \d+|Nov \d+, \d+|\w+ \d+,? \d*)', article_text)
        if date_match:
            post['date'] = date_match.group(1).strip()
        
        # Extract URL - look for /status/ pattern
        url_match = re.search(r'/(\w+)/status/(\d+)', article_text)
        if url_match:
            post['url'] = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
        
        # Extract engagement metrics
        # Format: "X replies, Y reposts, Z likes, ... N views"
        metrics_pattern = r'(\d+)\s+(replies?|reposts?|likes?|bookmarks?|views?)'
        metrics = re.findall(metrics_pattern, article_text.lower())
        
        post['replies'] = 0
        post['reposts'] = 0
        post['likes'] = 0
        post['views'] = 0
        
        for num, metric_type in metrics:
            num_val = int(num)
            if 'repl' in metric_type:
                post['replies'] = num_val
            elif 'repost' in metric_type:
                post['reposts'] = num_val
            elif 'like' in metric_type:
                post['likes'] = num_val
            elif 'view' in metric_type:
                post['views'] = num_val
        
        # Extract text - between handle/date and metrics
        # Find the tweet text (after the date, before engagement metrics)
        text_match = re.search(r'\d{4}\s+(.+?)\s+\d+\s+replies', article_text, re.DOTALL)
        if text_match:
            post['text'] = text_match.group(1).strip()
        else:
            # Alternative: extract text between date and first number
            alt_match = re.search(r'(?:Jun|Nov|\w+)\s+\d+(?:,?\s+\d*)?\s+(.+?)(?=\d+\s+(?:replies|reposts|likes|views|bookmarks))', article_text, re.DOTALL)
            if alt_match:
                post['text'] = alt_match.group(1).strip()
        
        # Only add posts with text
        if 'text' in post and post['text']:
            posts.append(post)
    
    return posts

def save_to_sqlite(posts, db_path):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER,
            reposts INTEGER,
            likes INTEGER,
            views INTEGER,
            url TEXT UNIQUE,
            scrape_date TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create index on url
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)')
    
    # Insert posts
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, text, replies, reposts, likes, views, url, scrape_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('views', 0),
                post.get('url', ''),
                datetime.now().isoformat()
            ))
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()

def generate_markdown_report(posts, output_path):
    """Generate markdown report of scraped posts."""
    report = []
    report.append("# X/Twitter Neurointervention Scrape Report")
    report.append(f"\n**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    report.append(f"\n**Total Posts:** {len(posts)}\n")
    
    # High engagement posts (>50 likes)
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    if high_engagement:
        report.append("\n## High Engagement Posts (>50 likes)\n")
        for post in sorted(high_engagement, key=lambda x: x.get('likes', 0), reverse=True):
            report.append(f"\n### {post.get('author', 'Unknown')} {post.get('handle', '')}")
            report.append(f"- **Date:** {post.get('date', 'Unknown')}")
            report.append(f"- **Engagement:** {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('replies', 0)} replies")
            report.append(f"- **URL:** {post.get('url', '')}")
            report.append(f"\n{post.get('text', '')}\n")
    
    # All posts
    report.append("\n## All Scraped Posts\n")
    for i, post in enumerate(posts, 1):
        report.append(f"\n### Post {i}: {post.get('author', 'Unknown')} {post.get('handle', '')}")
        report.append(f"- **Date:** {post.get('date', 'Unknown')}")
        report.append(f"- **Engagement:** {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('replies', 0)} replies")
        if post.get('views', 0) > 0:
            report.append(f"- **Views:** {post.get('views', 0):,}")
        report.append(f"- **URL:** {post.get('url', '')}")
        report.append(f"\n{post.get('text', '')}\n")
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text('\n'.join(report))

if __name__ == '__main__':
    import sys
    
    # Read snapshot from stdin
    snapshot = sys.stdin.read()
    
    posts = parse_snapshot_text(snapshot)
    
    print(f"Extracted {len(posts)} posts")
    for p in posts:
        print(json.dumps(p, indent=2))