#!/usr/bin/env python3
"""
Extract posts from X/Twitter snapshots and save to SQLite database.
"""
import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
MARKDOWN_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

def parse_metric(metric_str):
    """Parse metric string like '23' or '4.1K' to integer."""
    if not metric_str:
        return 0
    metric_str = metric_str.strip()
    if not metric_str:
        return 0
    
    # Handle K, M suffixes
    if metric_str.endswith('K'):
        try:
            return int(float(metric_str[:-1]) * 1000)
        except:
            return 0
    elif metric_str.endswith('M'):
        try:
            return int(float(metric_str[:-1]) * 1000000)
        except:
            return 0
    else:
        try:
            return int(metric_str)
        except:
            return 0

def extract_posts_from_snapshot(snapshot_text, query_group):
    """Extract posts from snapshot text."""
    posts = []
    
    # Split by article tags
    articles = re.split(r'article "', snapshot_text)
    
    for article in articles[1:]:  # Skip first empty split
        try:
            # Extract author and handle - format: "Author Name @handle"
            author_match = re.search(r'^([^@]+) (@\w+)', article)
            if author_match:
                author = author_match.group(1).strip()
                handle = author_match.group(2).strip()
            else:
                author = ""
                handle = ""
            
            # Extract date - look for various patterns
            date_match = re.search(r'"(\d+ hours? ago|\d+d|\w+ \d+,?\s*\d{0,4})"', article)
            if date_match:
                date = date_match.group(1)
            else:
                time_match = re.search(r'time[^"]*"([^"]+)"', article)
                date = time_match.group(1) if time_match else ""
            
            # Extract URL - format: /status/...
            url_match = re.search(r'/url: (/\w+/status/\d+)', article)
            if url_match:
                url = f"https://x.com{url_match.group(1)}"
            else:
                # Try another pattern
                url_match2 = re.search(r'/status/(\d+)', article)
                url = f"https://x.com/status/{url_match2.group(1)}" if url_match2 else ""
            
            # Extract post text - this is tricky
            # Look for text between the metadata and metrics
            text_match = re.search(r'(?:text:|generic \[ref=e\d+\]:)(.*?)(?=generic \[ref=e\d+\].*?(?:Embedded|Image|group))', article, re.DOTALL)
            if text_match:
                text = text_match.group(1)
                # Clean up the text
                text = re.sub(r'\s+', ' ', text).strip()
                # Remove ref markers
                text = re.sub(r'\[ref=e\d+\]', '', text)
                text = re.sub(r'link "[^"]*"', '', text)
                text = re.sub(r'text: ', '', text)
            else:
                # Fallback: extract text content
                text = ""
            
            # Extract metrics
            likes = 0
            reposts = 0
            replies = 0
            views = 0
            
            # Look for engagement metrics in group section
            metrics_match = re.search(r'group "([^"]+)"', article)
            if metrics_match:
                metrics_str = metrics_match.group(1)
                
                # Extract likes
                likes_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s*[Ll]ikes?', metrics_str)
                if likes_match:
                    likes = parse_metric(likes_match.group(1))
                
                # Extract reposts
                reposts_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s*reposts?', metrics_str)
                if reposts_match:
                    reposts = parse_metric(reposts_match.group(1))
                
                # Extract replies
                replies_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s*repl', metrics_str)
                if replies_match:
                    replies = parse_metric(replies_match.group(1))
                
                # Extract views
                views_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s*views?', metrics_str)
                if views_match:
                    views = parse_metric(views_match.group(1))
            
            if url and (author or text):
                posts.append({
                    'query_group': query_group,
                    'author': author,
                    'handle': handle,
                    'post_url': url,
                    'posted_at': date,
                    'post_text': text[:500],  # Limit text length
                    'replies': replies,
                    'reposts': reposts,
                    'likes': likes,
                    'views': views,
                    'bookmarks': 0
                })
        except Exception as e:
            print(f"Error parsing article: {e}")
            continue
    
    return posts

def save_posts_to_db(posts):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    new_posts = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO x_posts_v2 
                (query_group, author, handle, post_url, posted_at, post_text, 
                 replies, reposts, likes, views, bookmarks)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['query_group'],
                post['author'],
                post['handle'],
                post['post_url'],
                post['posted_at'],
                post['post_text'],
                post['replies'],
                post['reposts'],
                post['likes'],
                post['views'],
                post['bookmarks']
            ))
            new_posts += 1
        except sqlite3.IntegrityError:
            # URL already exists
            pass
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return new_posts

def generate_markdown_report(posts, query_group, new_count, high_engagement):
    """Generate markdown report."""
    today = datetime.now().strftime('%Y-%m-%d')
    timestamp = datetime.now().strftime('%H:%M:%S')
    
    report = f"\n\n## Scrape: {timestamp}\n\n"
    report += f"**Query Group:** {query_group}\n\n"
    report += f"**Results:** {len(posts)} posts found, {new_count} new, {high_engagement} high-engagement (>50 likes)\n\n"
    
    if posts:
        report += "### Posts\n\n"
        for i, post in enumerate(posts[:10], 1):  # Limit to first 10
            report += f"{i}. **{post['author']}** ({post['handle']})\n"
            report += f"   - {post['post_text'][:200]}{'...' if len(post['post_text']) > 200 else ''}\n"
            report += f"   - ❤️ {post['likes']} | 🔄 {post['reposts']} | 💬 {post['replies']} | 👁 {post['views']}\n"
            report += f"   - [Link]({post['post_url']})\n\n"
    
    return report

def append_to_markdown(report):
    """Append report to markdown file."""
    Path(MARKDOWN_PATH).parent.mkdir(parents=True, exist_ok=True)
    
    # Check if file exists and create header if not
    if not Path(MARKDOWN_PATH).exists():
        header = f"# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d')}\n\n"
        header += "Automated scrape of neurointervention-related posts.\n"
        with open(MARKDOWN_PATH, 'w') as f:
            f.write(header)
    
    with open(MARKDOWN_PATH, 'a') as f:
        f.write(report)

if __name__ == "__main__":
    print("Post extraction script loaded")