#!/usr/bin/env python3
"""
Parse X/Twitter posts from aria snapshot format
"""
import re
import json
from datetime import datetime
from typing import List, Dict, Any

def parse_aria_snapshot(aria_text: str, search_query: str) -> List[Dict[str, Any]]:
    """Extract posts from aria snapshot text"""
    posts = []
    
    # Split into articles (each article is a post)
    articles = re.split(r'article\s+"', aria_text)
    
    for article in articles[1:]:  # Skip first empty part
        post = {
            'author': '',
            'handle': '',
            'date': '',
            'text': '',
            'likes': 0,
            'retweets': 0,
            'replies': 0,
            'views': 0,
            'url': '',
            'search_query': search_query
        }
        
        # Extract the full article text
        article_end = article.find('"', article.find('"') + 1)
        if article_end == -1:
            article_end = len(article)
        
        full_article = article[:article_end]
        
        # Extract author and handle
        # Pattern: "Author Name @handle"
        author_handle = re.search(r'([A-Za-z0-9_\s]+)\s+@(\w+)', full_article)
        if author_handle:
            post['author'] = author_handle.group(1).strip()
            post['handle'] = author_handle.group(2)
        
        # Extract date
        date_match = re.search(r'-\s+link\s+"(\w+\s+\d+)"', article)
        if date_match:
            post['date'] = date_match.group(1)
        
        # Extract engagement metrics
        # Pattern: "2 replies, 6 reposts, 23 likes, 7 bookmarks, 4216 views"
        metrics = re.search(r'(\d+)\s+replies?,\s+(\d+)\s+reposts?,\s+(\d+)\s+likes?,\s+(\d+)\s+bookmarks?,\s+([\dKM]+)\s+views', article)
        if metrics:
            post['replies'] = int(metrics.group(1))
            post['retweets'] = int(metrics.group(2))
            post['likes'] = int(metrics.group(3))
            post['views'] = parse_metric(metrics.group(5))
        else:
            # Try simpler pattern
            likes_match = re.search(r'(\d+)\s+likes?', article)
            if likes_match:
                post['likes'] = int(likes_match.group(1))
            
            reposts_match = re.search(r'(\d+)\s+reposts?', article)
            if reposts_match:
                post['retweets'] = int(reposts_match.group(1))
            
            replies_match = re.search(r'(\d+)\s+replies?', article)
            if replies_match:
                post['replies'] = int(replies_match.group(1))
            
            views_match = re.search(r'([\dKM]+)\s+views', article)
            if views_match:
                post['views'] = parse_metric(views_match.group(1))
        
        # Extract text - look for StaticText after the date/time
        # Find text between the handle and the metrics
        text_parts = []
        
        # Split into lines and look for StaticText
        lines = article.split('\n')
        in_text = False
        text_buffer = []
        
        for line in lines:
            # Start capturing after we see the handle/date
            if '@' in line and 'link' in line:
                in_text = True
                continue
            
            # Stop when we hit engagement metrics
            if 'replies' in line.lower() or 'likes' in line.lower():
                break
            
            # Capture text
            if in_text and 'StaticText' in line:
                # Extract text from StaticText "content"
                text_match = re.search(r'StaticText\s+"([^"]+)"', line)
                if text_match:
                    text_buffer.append(text_match.group(1))
        
        if text_buffer:
            post['text'] = ' '.join(text_buffer).strip()
        
        # Only add if we have meaningful content
        if post['handle'] or post['text']:
            posts.append(post)
    
    return posts

def parse_metric(value: str) -> int:
    """Parse engagement metric like '4K' or '2M' to integer"""
    if not value:
        return 0
    
    value = value.strip()
    
    if 'K' in value:
        num = float(value.replace('K', '').replace(',', ''))
        return int(num * 1000)
    elif 'M' in value:
        num = float(value.replace('M', '').replace(',', ''))
        return int(num * 1000000)
    else:
        return int(value.replace(',', ''))

def save_to_sqlite(posts: List[Dict[str, Any]], db_path: str):
    """Save posts to SQLite database"""
    import sqlite3
    
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
            likes INTEGER DEFAULT 0,
            retweets INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert posts
    inserted = 0
    duplicates = 0
    
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, text, likes, retweets, replies, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['retweets'],
                post['replies'],
                post['views'],
                post.get('url', ''),
                post['search_query']
            ))
            
            if cursor.rowcount > 0:
                inserted += 1
            else:
                duplicates += 1
        except Exception as e:
            print(f"Error inserting: {e}")
    
    conn.commit()
    conn.close()
    
    return inserted, duplicates

def append_markdown_report(posts: List[Dict[str, Any]], report_path: str, search_query: str):
    """Append posts to markdown report"""
    import os
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    # Create report
    report = f"\n\n---\n\n## X/Twitter Scrape - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    report += f"**Search Query:** `{search_query}`\n\n"
    report += f"**Total Posts:** {len(posts)}\n\n"
    
    # High engagement posts (>50 likes)
    high_engagement = [p for p in posts if p['likes'] > 50]
    
    if high_engagement:
        report += f"### 🔥 High-Engagement Posts ({len(high_engagement)} posts >50 likes)\n\n"
        for post in high_engagement:
            report += f"#### @{post['handle']} ({post['likes']} likes)\n"
            if post['author']:
                report += f"**Author:** {post['author']}\n\n"
            report += f"{post['text']}\n\n"
            report += f"- **Likes:** {post['likes']}\n"
            report += f"- **Reposts:** {post['retweets']}\n"
            report += f"- **Replies:** {post['replies']}\n"
            report += f"- **Views:** {post['views']}\n\n"
    
    # All posts
    report += f"### 📊 All Posts ({len(posts)} total)\n\n"
    for i, post in enumerate(posts, 1):
        report += f"{i}. **@{post['handle']}** ({post['likes']} likes)\n"
        text_preview = post['text'][:150]
        if len(post['text']) > 150:
            text_preview += '...'
        report += f"   {text_preview}\n\n"
    
    # Append to file
    with open(report_path, 'a') as f:
        f.write(report)
    
    return len(posts), len(high_engagement)

if __name__ == '__main__':
    # Example usage
    print("X/Twitter Aria Parser initialized")