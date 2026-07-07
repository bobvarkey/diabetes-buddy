#!/usr/bin/env python3
"""
Extract X/Twitter posts from aria snapshot and save to database
"""
import re
import sqlite3
import json
from pathlib import Path
from datetime import datetime

def extract_posts_from_aria(aria_text):
    """Extract structured post data from aria snapshot"""
    posts = []
    
    # Split by article tags
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, aria_text)
    
    for article_content in articles:
        post = {}
        
        # Extract author name (usually first non-handle text before @)
        author_match = re.search(r'^([^(]+?)\s+@', article_content)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract handle
        handle_match = re.search(r'@(\w+)', article_content)
        if handle_match:
            post['handle'] = handle_match.group(0)
        
        # Extract timestamp
        time_patterns = [
            r'(\d+\s+(?:seconds?|minutes?|hours?|days?)\s+ago)',
            r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+)',
        ]
        for pattern in time_patterns:
            match = re.search(pattern, article_content)
            if match:
                post['timestamp'] = match.group(1)
                break
        
        # Extract text - everything after timestamp until engagement metrics
        text_match = re.search(r'(?:ago|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+)\s+(.+?)(?=\d+\s+(?:replies|likes|views|reposts)|$)', 
                              article_content, re.DOTALL)
        if text_match:
            post['text'] = text_match.group(1).strip()[:500]  # Limit text length
        else:
            # Fallback: extract from the article summary
            text_match2 = re.search(r'@\w+\s+(.+)', article_content)
            if text_match2:
                post['text'] = text_match2.group(1).strip()[:500]
        
        # Extract engagement metrics
        metrics_patterns = {
            'replies': r'(\d+)\s+(?:Replies|reply)',
            'reposts': r'(\d+)\s+(?:reposts?|Retweet)',
            'likes': r'(\d+)\s+(?:Likes?|like)',
            'views': r'(\d+)\s+views?'
        }
        
        for metric, pattern in metrics_patterns.items():
            match = re.search(pattern, article_content, re.IGNORECASE)
            post[metric] = int(match.group(1)) if match else 0
        
        # Generate URL
        if 'handle' in post:
            # Extract status ID if available, otherwise use handle
            status_match = re.search(r'/status/(\d+)', aria_text)
            if status_match:
                post['url'] = f"https://x.com/{post['handle'][1:]}/status/{status_match.group(1)}"
            else:
                post['url'] = f"https://x.com/{post['handle'][1:]}"
        
        if post.get('text') or post.get('author'):
            posts.append(post)
    
    return posts

def save_posts_to_db(posts, db_path, search_query):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            timestamp TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(handle, text)
        )
    ''')
    
    # Create index for faster queries
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_posts_handle ON x_posts(handle)
    ''')
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_posts_likes ON x_posts(likes DESC)
    ''')
    
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, timestamp, text, replies, reposts, likes, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('timestamp', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('views', 0),
                post.get('url', ''),
                search_query
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def generate_markdown_report(posts, report_path):
    """Generate markdown report of scraped posts"""
    with open(report_path, 'w') as f:
        f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Posts:** {len(posts)}\n\n")
        
        # High engagement posts (>50 likes)
        high_engagement = [p for p in posts if p.get('likes', 0) > 50]
        if high_engagement:
            f.write(f"## High Engagement Posts (>50 likes)\n\n")
            for i, post in enumerate(high_engagement, 1):
                f.write(f"### {i}. {post.get('author', 'Unknown')} ({post.get('handle', 'N/A')})\n\n")
                f.write(f"**Likes:** {post.get('likes', 0)} | **Views:** {post.get('views', 0)} | **Replies:** {post.get('replies', 0)}\n\n")
                f.write(f"**Text:** {post.get('text', 'N/A')}\n\n")
                f.write(f"**URL:** {post.get('url', 'N/A')}\n\n")
                f.write(f"**Timestamp:** {post.get('timestamp', 'N/A')}\n\n")
                f.write("---\n\n")
        
        # All posts summary
        f.write(f"## All Posts\n\n")
        for i, post in enumerate(posts, 1):
            f.write(f"{i}. **{post.get('author', 'Unknown')}** ({post.get('handle', 'N/A')}) - ")
            f.write(f"{post.get('likes', 0)} likes, {post.get('views', 0)} views\n")
            f.write(f"   {post.get('text', 'N/A')[:100]}...\n\n")

if __name__ == '__main__':
    import sys
    
    # Paths
    db_path = Path.home() / '.openclaw' / 'workspace' / 'memory_x_posts.db'
    report_dir = Path.home() / '.openclaw' / 'workspace' / 'knowledge-base' / 'x-scrapes'
    report_dir.mkdir(parents=True, exist_ok=True)
    
    # Parse aria files
    all_posts = []
    
    # Parse AVM/aneurysm posts
    aria_avm_path = Path('/tmp/aria_avm.txt')
    if aria_avm_path.exists():
        with open(aria_avm_path) as f:
            aria_text = f.read()
            posts = extract_posts_from_aria(aria_text)
            print(f"Extracted {len(posts)} posts from AVM/aneurysm search")
            for p in posts:
                p['search_query'] = 'cerebral AVM OR intracranial aneurysm OR endovascular'
            all_posts.extend(posts)
    
    # Parse neurointervention posts  
    aria_neuro_path = Path('/tmp/aria_neuro.txt')
    if aria_neuro_path.exists():
        with open(aria_neuro_path) as f:
            aria_text = f.read()
            posts = extract_posts_from_aria(aria_text)
            print(f"Extracted {len(posts)} posts from neurointervention search")
            for p in posts:
                p['search_query'] = '#AVM OR #aneurysm OR #endovascular'
            all_posts.extend(posts)
    
    # Save to database
    inserted = 0
    for post in all_posts:
        inserted += save_posts_to_db([post], str(db_path), post.get('search_query', ''))
    
    print(f"Saved {inserted} new posts to database")
    
    # Generate report
    from datetime import datetime
    report_path = report_dir / f'x-scrape-{datetime.now().strftime("%Y-%m-%d")}.md'
    generate_markdown_report(all_posts, str(report_path))
    print(f"Report saved to {report_path}")
    
    # Summary
    print(f"\n=== Summary ===")
    print(f"Total posts found: {len(all_posts)}")
    print(f"New posts inserted: {inserted}")
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    print(f"High engagement posts (>50 likes): {len(high_engagement)}")