#!/usr/bin/env python3
"""
Process X/Twitter posts from aria snapshots and save to database
"""
import re
import sqlite3
import json
from pathlib import Path
from datetime import datetime

def parse_article_line(article_text):
    """Parse a single article line from aria snapshot"""
    post = {}
    
    # Extract author name - everything before @
    author_match = re.match(r'^([^(]+?)\s+@', article_text)
    if author_match:
        post['author'] = author_match.group(1).strip()
    
    # Extract handle - @username
    handle_match = re.search(r'@(\w+)', article_text)
    if handle_match:
        post['handle'] = '@' + handle_match.group(1)
    
    # Extract timestamp
    time_patterns = [
        r'(\d+\s+(?:seconds?|minutes?|hours?|days?)\s+ago)',
        r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+(?:,\s+\d{4})?)',
    ]
    for pattern in time_patterns:
        match = re.search(pattern, article_text)
        if match:
            post['timestamp'] = match.group(1)
            break
    
    # Extract text - between timestamp and engagement metrics
    # Find where timestamp ends
    timestamp_end = 0
    for pattern in time_patterns:
        match = re.search(pattern, article_text)
        if match:
            timestamp_end = match.end()
            break
    
    # Find where engagement metrics start
    metrics_match = re.search(r'(\d+\s+replies?|\d+\s+reposts?|\d+\s+likes?|\d+\s+views?|\d+\s+bookmarks?)', article_text)
    
    if timestamp_end > 0:
        text_start = timestamp_end
        text_end = metrics_match.start() if metrics_match else len(article_text)
        post['text'] = article_text[text_start:text_end].strip()
    
    # Extract engagement metrics
    metrics_patterns = {
        'replies': r'(\d+)\s+replies?',
        'reposts': r'(\d+)\s+reposts?',
        'likes': r'(\d+)\s+likes?',
        'views': r'(\d+)\s+views?',
        'bookmarks': r'(\d+)\s+bookmarks?'
    }
    
    for metric, pattern in metrics_patterns.items():
        match = re.search(pattern, article_text, re.IGNORECASE)
        post[metric] = int(match.group(1)) if match else 0
    
    # Generate URL
    if 'handle' in post:
        # Extract status ID if available in aria
        post['url'] = f"https://x.com/{post['handle'][1:]}"
    
    return post

def process_aria_file(filepath, search_query):
    """Process an aria snapshot file and extract posts"""
    posts = []
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Find all article lines
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, content)
    
    for article_text in articles:
        post = parse_article_line(article_text)
        if post.get('text') or post.get('author'):
            post['search_query'] = search_query
            posts.append(post)
    
    return posts

def save_posts_to_database(posts, db_path):
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
            bookmarks INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(handle, text)
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_handle ON x_posts(handle)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes DESC)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_scraped_at ON x_posts(scraped_at)')
    
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, timestamp, text, replies, reposts, likes, views, bookmarks, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('timestamp', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('views', 0),
                post.get('bookmarks', 0),
                post.get('url', ''),
                post.get('search_query', '')
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def generate_report(posts, report_path):
    """Generate markdown report"""
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
                f.write(f"**Timestamp:** {post.get('timestamp', 'N/A')}\n\n")
                f.write(f"**Text:** {post.get('text', 'N/A')}\n\n")
                f.write(f"**Engagement:** {post.get('likes', 0)} likes | {post.get('views', 0)} views | ")
                f.write(f"{post.get('replies', 0)} replies | {post.get('reposts', 0)} reposts\n\n")
                if post.get('url'):
                    f.write(f"**URL:** {post['url']}\n\n")
                f.write("---\n\n")
        
        # All posts by search query
        f.write(f"## All Posts by Search Query\n\n")
        
        queries = {}
        for post in posts:
            query = post.get('search_query', 'Unknown')
            if query not in queries:
                queries[query] = []
            queries[query].append(post)
        
        for query, query_posts in queries.items():
            f.write(f"### Search: {query}\n\n")
            for i, post in enumerate(query_posts, 1):
                f.write(f"{i}. **{post.get('author', 'Unknown')}** ({post.get('handle', 'N/A')})\n")
                f.write(f"   {post.get('text', 'N/A')[:150]}...\n")
                f.write(f"   {post.get('likes', 0)} likes, {post.get('views', 0)} views\n\n")
        
        f.write("---\n\n")
        f.write(f"Generated by OpenClaw X/Twitter Scraper\n")

def main():
    db_path = Path.home() / '.openclaw' / 'workspace' / 'memory_x_posts.db'
    report_dir = Path.home() / '.openclaw' / 'workspace' / 'knowledge-base' / 'x-scrapes'
    report_dir.mkdir(parents=True, exist_ok=True)
    
    # Process all aria files
    all_posts = []
    
    aria_files = [
        ('/tmp/aria_avm_scrolled.txt', 'cerebral AVM OR intracranial aneurysm OR endovascular'),
        ('/tmp/aria_neuro_scrolled.txt', '#AVM OR #aneurysm OR #endovascular'),
        ('/tmp/aria_neuro_today.txt', 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke (today)'),
        ('/tmp/aria_avm_today.txt', 'cerebral AVM OR intracranial aneurysm OR endovascular (today)')
    ]
    
    for filepath, query in aria_files:
        path = Path(filepath)
        if path.exists():
            posts = process_aria_file(path, query)
            print(f"Extracted {len(posts)} posts from {filepath}")
            all_posts.extend(posts)
    
    # Save to database
    inserted = save_posts_to_database(all_posts, str(db_path))
    print(f"\nSaved {inserted} new posts to database")
    
    # Generate report
    from datetime import datetime
    report_path = report_dir / f'x-scrape-{datetime.now().strftime("%Y-%m-%d")}.md'
    generate_report(all_posts, str(report_path))
    print(f"Report saved to {report_path}")
    
    # Summary
    print(f"\n=== Summary ===")
    print(f"Total posts found: {len(all_posts)}")
    print(f"New posts inserted: {inserted}")
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    print(f"High engagement posts (>50 likes): {len(high_engagement)}")
    
    if high_engagement:
        print("\n=== High Engagement Posts ===")
        for post in high_engagement:
            print(f"- {post.get('author', 'Unknown')} ({post.get('handle', 'N/A')}): {post.get('likes', 0)} likes")

if __name__ == '__main__':
    main()