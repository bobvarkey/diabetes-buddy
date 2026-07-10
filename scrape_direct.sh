#!/bin/bash
# X/Twitter Scraper for Neurointervention Posts
# This script extracts posts from X/Twitter search results

DB_PATH="/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH="/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Create directories
mkdir -p "$(dirname "$REPORT_PATH")"

# Initialize SQLite database
sqlite3 "$DB_PATH" << 'EOF'
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
);
EOF

echo "Database initialized: $DB_PATH"

# Focus neurointervention tab
echo "Focusing neurointervention-stroke-search tab..."
openclaw browser focus neurointervention-stroke-search

# Capture snapshot
echo "Capturing snapshot..."
openclaw browser snapshot --format aria --limit 3000 > /tmp/x_snapshot_1.txt

# Focus cerebral AVM tab
echo "Focusing cerebral AVM tab (t97)..."
openclaw browser focus t97

# Capture snapshot
echo "Capturing snapshot..."
openclaw browser snapshot --format aria --limit 3000 > /tmp/x_snapshot_2.txt

echo "Snapshots saved to /tmp/x_snapshot_*.txt"

# Parse snapshots with Python
python3 << 'PYTHON_SCRIPT'
import re
import sqlite3
import os
from datetime import datetime

DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
REPORT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'

def parse_aria_file(filepath, search_query):
    """Parse aria snapshot file and extract posts"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    posts = []
    
    # Split by articles (each article is a tweet/post)
    # Look for article elements with content
    article_pattern = r'article\s+"([^"]+(?:@\w+)[^"]*)"'
    
    # Find all article sections
    articles = re.findall(article_pattern, content)
    
    for article_text in articles:
        # Extract handle
        handle_match = re.search(r'@(\w+)', article_text)
        if not handle_match:
            continue
        
        handle = handle_match.group(1)
        
        # Extract author (text before handle)
        parts = article_text.split('@' + handle)
        author = parts[0].strip() if len(parts) > 0 else ''
        
        # Extract engagement metrics
        likes = 0
        reposts = 0
        replies = 0
        views = 0
        
        # Pattern: "2 replies, 6 reposts, 23 likes, 7 bookmarks, 4216 views"
        metrics = re.search(r'(\d+)\s+replies?,\s+(\d+)\s+reposts?,\s+(\d+)\s+likes?,\s+\d+\s+bookmarks?,\s+([\dKM]+)\s+views', article_text)
        if metrics:
            replies = int(metrics.group(1))
            reposts = int(metrics.group(2))
            likes = int(metrics.group(3))
            views_str = metrics.group(4)
            if 'K' in views_str:
                views = int(float(views_str.replace('K', '')) * 1000)
            elif 'M' in views_str:
                views = int(float(views_str.replace('M', '')) * 1000000)
            else:
                views = int(views_str)
        
        # Extract text (between handle and metrics)
        text_parts = article_text.split(',')
        text = ''
        for part in text_parts:
            if 'replies' in part or 'likes' in part or 'views' in part or 'bookmarks' in part:
                break
            if '@' + handle in part:
                text += part.split('@' + handle)[-1]
        
        text = text.strip()[:500]  # Limit text length
        
        # Extract date
        date_match = re.search(r'(\w+\s+\d+)', article_text)
        date = date_match.group(1) if date_match else ''
        
        post = {
            'author': author[:100],
            'handle': handle,
            'date': date,
            'text': text,
            'likes': likes,
            'retweets': reposts,
            'replies': replies,
            'views': views,
            'url': '',
            'search_query': search_query
        }
        
        posts.append(post)
    
    return posts

def save_to_db(posts, db_path):
    """Save posts to database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted = 0
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
        except Exception as e:
            print(f"Error: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def append_report(posts, report_path, search_query):
    """Append to markdown report"""
    high_engagement = [p for p in posts if p['likes'] > 50]
    
    report = f"\n\n---\n\n## Scrape: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    report += f"**Search Query:** {search_query}\n\n"
    report += f"**Total Posts:** {len(posts)}\n\n"
    
    if high_engagement:
        report += f"### High-Engagement Posts ({len(high_engagement)} >50 likes)\n\n"
        for post in high_engagement:
            report += f"#### @{post['handle']} ({post['likes']} likes)\n"
            report += f"{post['text']}\n\n"
    
    report += f"### All Posts\n\n"
    for post in posts:
        report += f"- **@{post['handle']}** ({post['likes']} likes): {post['text'][:150]}...\n"
    
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'a') as f:
        f.write(report)
    
    return len(posts), len(high_engagement)

# Process snapshot files
all_posts = []

# Snapshot 1: neurointervention search
if os.path.exists('/tmp/x_snapshot_1.txt'):
    posts1 = parse_aria_file('/tmp/x_snapshot_1.txt', 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
    all_posts.extend(posts1)
    print(f"Snapshot 1: {len(posts1)} posts from neurointervention search")

# Snapshot 2: cerebral AVM search
if os.path.exists('/tmp/x_snapshot_2.txt'):
    posts2 = parse_aria_file('/tmp/x_snapshot_2.txt', 'cerebral AVM OR intracranial aneurysm OR endovascular')
    all_posts.extend(posts2)
    print(f"Snapshot 2: {len(posts2)} posts from cerebral AVM search")

# Remove duplicates
seen = set()
unique_posts = []
for post in all_posts:
    key = (post['handle'], post['text'][:100])
    if key not in seen:
        seen.add(key)
        unique_posts.append(post)

print(f"\nTotal unique posts: {len(unique_posts)}")

# Save to database
inserted = save_to_db(unique_posts, DB_PATH)
print(f"Inserted {inserted} new posts")

# Generate report
total, high_eng = append_report(unique_posts, REPORT_PATH, 'X/Twitter Scrape')

print(f"\n=== SCRAPE SUMMARY ===")
print(f"Total posts: {total}")
print(f"High-engagement (>50 likes): {high_eng}")
print(f"Database: {DB_PATH}")
print(f"Report: {REPORT_PATH}")

PYTHON_SCRIPT

echo "Scraping complete!"