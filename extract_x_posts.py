#!/usr/bin/env python3
import re
import json
import sqlite3
from datetime import datetime
import os

def parse_snapshot_to_posts(snapshot_text):
    """Parse browser snapshot text to extract post data"""
    posts = []
    
    # Split by articles
    article_pattern = r'- \'?article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {}
        
        # Extract author name (first part before @)
        # Format: "Author Name @handle time" or "Author Name Verified account @handle time"
        author_match = re.match(r'^([^(]+?)\s*(?:Verified account)?\s*@(\w+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = '@' + author_match.group(2)
        
        # Extract date/time
        time_patterns = [
            r'(\d+\s+(?:seconds?|minutes?|hours?|days?)\s+ago)',
            r'(Jun \d+)',
            r'(Jul \d+)',
            r'(Jan \d+)',
            r'(Feb \d+)',
            r'(Mar \d+)',
            r'(Apr \d+)',
            r'(May \d+)',
            r'(Aug \d+)',
            r'(Sep \d+)',
            r'(Oct \d+)',
            r'(Nov \d+)',
            r'(Dec \d+)'
        ]
        
        for pattern in time_patterns:
            time_match = re.search(pattern, article_text)
            if time_match:
                post['date'] = time_match.group(1)
                break
        
        # Extract text (everything before the engagement metrics)
        text_match = re.search(r'@\w+\s+(.*?)(?=\d+ (?:replies?|likes?|reposts?|views?|bookmarks?)|$)', article_text, re.DOTALL)
        if text_match:
            post['text'] = text_match.group(1).strip()
        
        # Extract engagement metrics
        metrics = {}
        
        # Replies
        replies_match = re.search(r'(\d+)\s+replies?', article_text)
        if replies_match:
            metrics['replies'] = int(replies_match.group(1))
        else:
            metrics['replies'] = 0
            
        # Reposts
        reposts_match = re.search(r'(\d+)\s+reposts?', article_text)
        if reposts_match:
            metrics['reposts'] = int(reposts_match.group(1))
        else:
            metrics['reposts'] = 0
            
        # Likes
        likes_match = re.search(r'(\d+)\s+likes?', article_text)
        if likes_match:
            metrics['likes'] = int(likes_match.group(1))
        else:
            metrics['likes'] = 0
            
        # Views
        views_match = re.search(r'([\d.]+[KkMm]?)\s+views?', article_text)
        if views_match:
            metrics['views'] = views_match.group(1)
        else:
            metrics['views'] = '0'
        
        post['metrics'] = metrics
        
        # Extract URL from article text
        # Look for status ID in patterns like "/status/1234567890"
        url_match = re.search(r'/status/(\d+)', article_text)
        if url_match:
            handle_match = re.search(r'@(\w+)', article_text)
            if handle_match:
                post['url'] = f"https://x.com/{handle_match.group(1)}/status/{url_match.group(1)}"
        
        if post.get('text') and post.get('url'):
            posts.append(post)
    
    return posts

def save_to_sqlite(posts, db_path, search_term):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            url TEXT UNIQUE,
            replies INTEGER,
            reposts INTEGER,
            likes INTEGER,
            views TEXT,
            search_term TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert posts
    new_count = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO posts (author, handle, date, text, url, replies, reposts, likes, views, search_term)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('url', ''),
                post['metrics']['replies'],
                post['metrics']['reposts'],
                post['metrics']['likes'],
                post['metrics']['views'],
                search_term
            ))
            new_count += 1
        except sqlite3.IntegrityError:
            # URL already exists, skip
            pass
    
    conn.commit()
    conn.close()
    return new_count

def generate_markdown_report(posts, high_engagement_posts, search_term, output_path):
    """Generate markdown report"""
    report_lines = [
        f"# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "",
        f"## Search Term: {search_term}",
        "",
        f"**Total posts found:** {len(posts)}",
        "",
        f"**High engagement posts (>50 likes):** {len(high_engagement_posts)}",
        "",
        "### All Posts",
        ""
    ]
    
    for i, post in enumerate(posts, 1):
        report_lines.extend([
            f"#### Post {i}",
            f"**Author:** {post.get('author', 'Unknown')} ({post.get('handle', 'Unknown')})",
            f"**Date:** {post.get('date', 'Unknown')}",
            f"**URL:** {post.get('url', 'N/A')}",
            f"**Text:** {post.get('text', 'N/A')[:500]}{'...' if len(post.get('text', '')) > 500 else ''}",
            f"**Engagement:** {post['metrics']['replies']} replies, {post['metrics']['reposts']} reposts, {post['metrics']['likes']} likes, {post['metrics']['views']} views",
            ""
        ])
    
    if high_engagement_posts:
        report_lines.extend([
            "### High Engagement Posts (>50 likes)",
            ""
        ])
        for post in high_engagement_posts:
            report_lines.extend([
                f"**{post.get('author', 'Unknown')} ({post.get('handle', 'Unknown')})** - {post['metrics']['likes']} likes",
                f"URL: {post.get('url', 'N/A')}",
                f"Text: {post.get('text', 'N/A')[:300]}{'...' if len(post.get('text', '')) > 300 else ''}",
                ""
            ])
    
    # Append to file
    with open(output_path, 'a') as f:
        f.write('\n'.join(report_lines) + '\n\n---\n\n')

if __name__ == '__main__':
    import sys
    
    # Read snapshot from stdin or file
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            snapshot_text = f.read()
    else:
        snapshot_text = sys.stdin.read()
    
    # Parse posts
    posts = parse_snapshot_to_posts(snapshot_text)
    
    # Print JSON output
    print(json.dumps(posts, indent=2))