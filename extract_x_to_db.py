#!/usr/bin/env python3
"""
Extract X/Twitter posts from browser snapshots and save to SQLite database.
"""

import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

def parse_engagement(text):
    """Parse engagement numbers like '23', '1.8K', '61K'"""
    if not text:
        return 0
    text = text.strip().upper()
    if 'K' in text:
        match = re.search(r'(\d+\.?\d*)', text)
        if match:
            return int(float(match.group(1)) * 1000)
    match = re.search(r'(\d+)', text)
    return int(match.group(1)) if match else 0

def parse_posts_from_markdown(markdown_text):
    """Parse posts from markdown snapshot format"""
    posts = []
    
    # Split into article sections
    articles = re.findall(r'article "(.*?)" \[ref=', markdown_text, re.DOTALL)
    
    for article in articles:
        try:
            # Extract author
            author_match = re.search(r'^([^\[]+?)(?:\s+Verified account)?', article)
            author = author_match.group(1).strip() if author_match else ''
            
            # Extract handle
            handle_match = re.search(r'@(\w+)', article)
            handle = f"@{handle_match.group(1)}" if handle_match else ''
            
            # Extract text - find the content after the metadata
            text_start = article.find(']')
            if text_start > 0:
                # Get the main text content
                text_part = article[text_start:]
                # Remove hashtags and links for clean text
                text = text_part.split('\n')[0].strip()
            else:
                text = ''
            
            # Extract URL
            url_match = re.search(r'/url:\s*(https?://[^\s]+)', article)
            if not url_match:
                url_match = re.search(r'/status/(\d+)', article)
                if url_match:
                    url = f"https://x.com/status/{url_match.group(1)}"
                else:
                    url = ''
            else:
                url = url_match.group(1)
            
            # Extract date/time
            date_match = re.search(r'time \[ref=\w+\]:\s*(\w+\s+\d+|\d+h|\d+m|\d+s|\w+)', article)
            if date_match:
                date_str = date_match.group(1)
                if 'h' in date_str or 'm' in date_str or 's' in date_str:
                    # Relative time - convert to hours ago
                    num = int(re.search(r'(\d+)', date_str).group(1))
                    if 'h' in date_str:
                        hours_ago = num
                    elif 'm' in date_str:
                        hours_ago = num / 60
                    elif 's' in date_str:
                        hours_ago = num / 3600
                    else:
                        hours_ago = 0
                    # Approximate date
                    date = datetime.now().strftime('%Y-%m-%d')
                else:
                    date = date_str
            else:
                date = ''
            
            # Extract engagement metrics
            likes_match = re.search(r'(\d+(?:\.\d+)?[Kk]?)\s*Likes?', article)
            likes = parse_engagement(likes_match.group(1)) if likes_match else 0
            
            replies_match = re.search(r'(\d+(?:\.\d+)?[Kk]?)\s*[Rr]eplies?', article)
            replies = parse_engagement(replies_match.group(1)) if replies_match else 0
            
            reposts_match = re.search(r'(\d+(?:\.\d+)?[Kk]?)\s*[Rr]eposts?', article)
            reposts = parse_engagement(reposts_match.group(1)) if reposts_match else 0
            
            views_match = re.search(r'(\d+(?:\.\d+)?[Kk]?)\s*views', article)
            views = parse_engagement(views_match.group(1)) if views_match else 0
            
            posts.append({
                'author': author,
                'handle': handle,
                'text': text[:500] if text else '',  # Limit text length
                'url': url,
                'date': date,
                'likes': likes,
                'replies': replies,
                'reposts': reposts,
                'views': views
            })
        except Exception as e:
            print(f"Error parsing article: {e}")
            continue
    
    return posts

def save_to_sqlite(posts, db_path):
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
    
    # Create index
    cursor.execute('''
        CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)
    ''')
    
    # Insert posts
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, text, url, date, likes, replies, reposts, views)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['text'],
                post['url'],
                post['date'],
                post['likes'],
                post['replies'],
                post['reposts'],
                post['views']
            ))
        except sqlite3.IntegrityError:
            pass  # Skip duplicates
    
    conn.commit()
    
    # Get count
    cursor.execute('SELECT COUNT(*) FROM x_posts')
    count = cursor.fetchone()[0]
    
    conn.close()
    return count

def generate_markdown_report(posts, output_path, search_date):
    """Generate markdown report"""
    
    # Separate high-engagement posts (likes > 50)
    high_engagement = [p for p in posts if p['likes'] > 50]
    
    report = f"""# X/Twitter Scrape Report - {search_date}

## Summary

- **Total posts extracted:** {len(posts)}
- **High-engagement posts (>50 likes):** {len(high_engagement)}
- **Search queries:** 
  - neurointervention OR thrombectomy OR #Neurointervention OR #stroke
  - cerebral AVM OR intracranial aneurysm OR endovascular

## High-Engagement Posts (>50 Likes)

"""
    
    if high_engagement:
        for i, post in enumerate(sorted(high_engagement, key=lambda x: x['likes'], reverse=True), 1):
            report += f"""### {i}. {post['author']} ({post['handle']})
- **Likes:** {post['likes']} | **Replies:** {post['replies']} | **Reposts:** {post['reposts']} | **Views:** {post['views']}
- **Date:** {post['date']}
- **Text:** {post['text'][:200]}...
- **URL:** {post['url']}

"""
    else:
        report += "No posts with >50 likes found in this scrape.\n\n"
    
    report += """## All Posts Extracted

"""
    
    for i, post in enumerate(posts, 1):
        report += f"""{i}. **{post['author']}** ({post['handle']}) - {post['date']}
   - {post['text'][:150]}{'...' if len(post['text']) > 150 else ''}
   - Engagement: {post['likes']} likes, {post['replies']} replies, {post['reposts']} reposts, {post['views']} views
   - URL: {post['url']}

"""
    
    # Write report
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(report)
    
    return len(posts)

if __name__ == '__main__':
    # This would be called with snapshot data
    pass