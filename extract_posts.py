#!/usr/bin/env python3
import sqlite3
import json
import re
from datetime import datetime
from pathlib import Path

# Read the snapshot data from files
def parse_post_from_snapshot(snapshot_text, search_query):
    """Extract posts from browser snapshot accessibility tree"""
    posts = []
    
    # Split into articles
    articles = snapshot_text.split('article "')
    
    for article in articles[1:]:  # Skip first split (before any articles)
        try:
            # Extract author name
            author_match = re.search(r'^([^"]+(?:\s[^"]+)?)\s+@', article)
            if not author_match:
                author_match = re.search(r'^([^"]+)@', article)
            author = author_match.group(1).strip() if author_match else "Unknown"
            
            # Clean up author name (remove extra text after @)
            author = re.sub(r'\s+Verified.*', '', author)
            author = re.sub(r'\s+@.*', '', author)
            
            # Extract handle
            handle_match = re.search(r'@([\w]+)', article)
            handle = handle_match.group(1) if handle_match else "unknown"
            
            # Extract date
            date_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}(?:,?\s+\d{4})?|\d+\s*(?:hours?|h|minutes?|m|days?|d)\s+ago', article)
            date = date_match.group(0) if date_match else datetime.now().strftime('%Y-%m-%d')
            
            # Extract post text - find the text content
            # Look for text after the handle/date section
            text_section = article
            # Remove the header part (author, handle, date)
            text_section = re.sub(r'^[^"]+?"[^"]*"\s*\[ref=', '', text_section)
            
            # Extract text from generic elements
            text_parts = []
            text_matches = re.findall(r'text:\s*"([^"]+)"', article)
            link_text_matches = re.findall(r'- link\s+"([^"]+)"[^[]+\[ref=', article)
            
            # Combine text and link text
            for match in text_matches:
                if not match.startswith('@') and not match.startswith('·'):
                    text_parts.append(match)
            
            for match in link_text_matches:
                if not match.startswith('@') and not match.startswith('http'):
                    text_parts.append(match)
            
            text = ' '.join(text_parts[:10])  # Limit to first 10 matches to avoid noise
            
            # Extract engagement metrics
            likes = 0
            replies = 0
            reposts = 0
            views = 0
            
            # Try to extract numbers from engagement section
            metrics_match = re.search(r'(\d+)\s+replies?.*?(\d+)\s+reposts?.*?(\d+)\s+likes?.*?(\d+)\s+views?', article)
            if metrics_match:
                replies = int(metrics_match.group(1))
                reposts = int(metrics_match.group(2))
                likes = int(metrics_match.group(3))
                views = int(metrics_match.group(4))
            else:
                # Alternative format: "6 likes, 1158 views"
                likes_match = re.search(r'(\d+)\s+likes?', article)
                if likes_match:
                    likes = int(likes_match.group(1))
                
                views_match = re.search(r'(\d+)\s+views?', article)
                if views_match:
                    views = int(views_match.group(1))
                
                replies_match = re.search(r'(\d+)\s+replies?', article)
                if replies_match:
                    replies = int(replies_match.group(1))
                
                reposts_match = re.search(r'(\d+)\s+reposts?', article)
                if reposts_match:
                    reposts = int(reposts_match.group(1))
            
            # Extract URL
            url_match = re.search(r'/url:\s*([^\s\]]+)', article)
            if url_match:
                url_path = url_match.group(1)
                # Extract status ID from URL
                status_match = re.search(r'/status/(\d+)', url_path)
                if status_match:
                    url = f"https://x.com/{handle}/status/{status_match.group(1)}"
                else:
                    url = f"https://x.com{url_path}"
            else:
                url = f"https://x.com/{handle}"
            
            if author != "Unknown" and text:
                post = {
                    'author': author,
                    'handle': handle,
                    'date': date,
                    'text': text[:500],  # Limit text length
                    'likes': likes,
                    'replies': replies,
                    'reposts': reposts,
                    'views': views,
                    'url': url,
                    'search_query': search_query
                }
                posts.append(post)
                
        except Exception as e:
            print(f"Error parsing article: {e}")
            continue
    
    return posts

def save_to_database(posts, db_path):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    inserted_count = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['replies'],
                post['reposts'],
                post['views'],
                post['url'],
                post['search_query']
            ))
            if cursor.rowcount > 0:
                inserted_count += 1
        except sqlite3.IntegrityError:
            pass  # Duplicate URL, skip
    
    conn.commit()
    conn.close()
    return inserted_count

def main():
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    markdown_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    # Note: You'll need to manually copy the snapshot output into these files
    # or pass them as arguments. For now, this is a template.
    
    print("Script ready. Pass snapshot files as arguments to process.")
    print(f"Database: {db_path}")
    print(f"Markdown: {markdown_path}")

if __name__ == '__main__':
    main()