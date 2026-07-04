#!/usr/bin/env python3
"""
Process X/Twitter snapshots and extract post data
"""

import sqlite3
import re
from datetime import datetime
from pathlib import Path

def parse_engagement(text):
    """Parse engagement numbers like '23', '1.8K', '61K'"""
    if not text:
        return 0
    text = str(text).strip().upper()
    if 'K' in text:
        match = re.search(r'(\d+\.?\d*)', text)
        if match:
            return int(float(match.group(1)) * 1000)
    match = re.search(r'(\d+)', text)
    return int(match.group(1)) if match else 0

def extract_posts_from_snapshot(snapshot_text):
    """Extract posts from browser snapshot"""
    posts = []
    
    # Find all article elements
    article_pattern = r'article\s+"([^"]+)\s+([^\[]+)\s+\[ref='
    articles = re.finditer(article_pattern, snapshot_text)
    
    for match in articles:
        full_match = match.group(0)
        
        # Extract author and handle
        author_text = match.group(1)
        handle_text = match.group(2)
        
        # Clean up author
        author = author_text.strip()
        if 'Verified account' in author:
            author = author.replace('Verified account', '').strip()
        
        # Extract handle
        handle_match = re.search(r'@(\w+)', handle_text)
        handle = f"@{handle_match.group(1)}" if handle_match else ''
        
        # Get the rest of the article content
        start_pos = match.end()
        end_match = re.search(r'\n\s*-\s*article', snapshot_text[start_pos:])
        if end_match:
            article_content = snapshot_text[start_pos:start_pos + end_match.start()]
        else:
            article_content = snapshot_text[start_pos:start_pos + 2000]
        
        # Extract date/time
        time_match = re.search(r'time \[ref=\w+\]:\s*(\S+)', article_content)
        if time_match:
            date_val = time_match.group(1)
        else:
            time_text_match = re.search(r'(\d+\s*(?:hours?|minutes?|seconds?)\s+ago)', article_content)
            date_val = time_text_match.group(1) if time_text_match else ''
        
        # Extract URL
        url_match = re.search(r'/status/(\d+)', article_content)
        url = f"https://x.com/status/{url_match.group(1)}" if url_match else ''
        
        # Extract text - get content between metadata and engagement stats
        text_match = re.search(r'generic \[ref=\w+\]:\s*(.+?)(?=\n\s*-\s*group|\n\s*-\s*link)', article_content, re.DOTALL)
        if text_match:
            text = text_match.group(1).strip()
            # Clean up text
            text = re.sub(r'\[ref=\w+\]', '', text)
            text = re.sub(r'\s+', ' ', text)
        else:
            text = ''
        
        # Extract engagement metrics
        likes_match = re.search(r'"(\d+(?:\.\d+)?[Kk]?)\s*Likes?[^"]*"', article_content)
        likes = parse_engagement(likes_match.group(1)) if likes_match else 0
        
        if likes == 0:
            likes_match2 = re.search(r'(\d+(?:\.\d+)?[Kk]?)\s*Likes?', article_content)
            likes = parse_engagement(likes_match2.group(1)) if likes_match2 else 0
        
        replies_match = re.search(r'"(\d+(?:\.\d+)?[Kk]?)\s*[Rr]eplies?[^"]*"', article_content)
        replies = parse_engagement(replies_match.group(1)) if replies_match else 0
        
        reposts_match = re.search(r'"(\d+(?:\.\d+)?[Kk]?)\s*[Rr]eposts?[^"]*"', article_content)
        reposts = parse_engagement(reposts_match.group(1)) if reposts_match else 0
        
        views_match = re.search(r'"(\d+(?:\.\d+)?[Kk]?)\s*views[^"]*"', article_content)
        views = parse_engagement(views_match.group(1)) if views_match else 0
        
        posts.append({
            'author': author,
            'handle': handle,
            'text': text[:500],
            'url': url,
            'date': date_val,
            'likes': likes,
            'replies': replies,
            'reposts': reposts,
            'views': views
        })
    
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
            text TEXT,
            url TEXT UNIQUE,
            date TEXT,
            likes INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON x_posts(date)')
    
    # Insert posts
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, text, url, date, likes, replies, reposts, views, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['text'],
                post['url'],
                post['date'],
                post['likes'],
                post['replies'],
                post['reposts'],
                post['views'],
                search_query
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return inserted

def create_markdown_report(db_path, output_path, search_date):
    """Create markdown report from database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all posts
    cursor.execute('''
        SELECT author, handle, text, url, date, likes, replies, reposts, views, search_query
        FROM x_posts
        ORDER BY likes DESC, views DESC
    ''')
    all_posts = cursor.fetchall()
    
    # Get high-engagement posts
    cursor.execute('''
        SELECT author, handle, text, url, date, likes, replies, reposts, views
        FROM x_posts
        WHERE likes > 50
        ORDER BY likes DESC
    ''')
    high_engagement = cursor.fetchall()
    
    # Get new posts today
    cursor.execute('''
        SELECT COUNT(*) FROM x_posts
        WHERE date(scraped_at) = date('now')
    ''')
    new_today = cursor.fetchone()[0]
    
    conn.close()
    
    # Generate report
    report = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {search_date}

## Summary

- **Total posts in database:** {len(all_posts)}
- **New posts scraped today:** {new_today}
- **High-engagement posts (>50 likes):** {len(high_engagement)}

## Search Queries Used

1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
2. `cerebral AVM OR intracranial aneurysm OR endovascular`

---

## High-Engagement Posts (>50 Likes)

"""
    
    if high_engagement:
        for i, post in enumerate(high_engagement, 1):
            author, handle, text, url, date, likes, replies, reposts, views = post
            report += f"""### {i}. {author} ({handle})

- **Engagement:** {likes} likes, {replies} replies, {reposts} reposts, {views} views
- **Date:** {date}
- **Text:** {text[:200]}{'...' if len(text) > 200 else ''}
- **URL:** [{url}]({url})

"""
    else:
        report += "*No posts with >50 likes found in this scrape.*\n\n"
    
    report += """---

## All Posts Extracted Today

"""
    
    for i, post in enumerate(all_posts, 1):
        author, handle, text, url, date, likes, replies, reposts, views, query = post
        report += f"""{i}. **{author}** ({handle}) - {date}
   - {text[:150]}{'...' if len(text) > 150 else ''}
   - 👍 {likes} | 💬 {replies} | 🔄 {reposts} | 👁️ {views}
   - [{url}]({url})

"""
    
    # Write report
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(report)
    
    return len(all_posts)

if __name__ == '__main__':
    import sys
    
    # Database path
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-07-01.md'
    search_date = '2026-07-01'
    
    # Read snapshot from stdin
    snapshot = sys.stdin.read()
    
    # Extract posts
    posts = extract_posts_from_snapshot(snapshot)
    print(f"Extracted {len(posts)} posts from snapshot")
    
    # Save to database
    query = 'neurointervention OR thrombectomy OR cerebral AVM OR intracranial aneurysm'
    inserted = save_posts_to_db(posts, db_path, query)
    print(f"Inserted {inserted} new posts to database")
    
    # Create report
    total = create_markdown_report(db_path, report_path, search_date)
    print(f"Created report with {total} total posts")
    print(f"Report saved to: {report_path}")