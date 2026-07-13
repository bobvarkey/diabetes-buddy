#!/usr/bin/env python3
import sqlite3
import json
import re
from datetime import datetime
import os

def init_database(db_path):
    """Initialize SQLite database for X posts"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS x_posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            hashtags TEXT,
            mentions TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            search_query TEXT
        )
    ''')
    
    conn.commit()
    return conn

def parse_number(num_str):
    """Parse numbers like 1.2K, 58K, etc"""
    if not num_str:
        return 0
    num_str = str(num_str).strip()
    if 'K' in num_str:
        return int(float(num_str.replace('K', '').replace(',', '')) * 1000)
    elif 'M' in num_str:
        return int(float(num_str.replace('M', '').replace(',', '')) * 1000000)
    else:
        try:
            return int(num_str.replace(',', ''))
        except:
            return 0

def extract_posts_simple(snapshot_text):
    """Extract X posts from snapshot using simpler regex"""
    posts = []
    
    # Find all article sections
    # Article pattern: starts with 'article "' and ends before next 'article "' or end
    article_blocks = re.split(r'(article "[^"]+")', snapshot_text)
    
    current_article_header = None
    for i, block in enumerate(article_blocks):
        if re.match(r'article "', block):
            current_article_header = block
        elif current_article_header and block.strip():
            # This is content after an article header
            full_article = current_article_header + block
            
            post = {}
            
            # Extract author name (first link after article header)
            author_match = re.search(r'link "([^"]+)"[^[]*\[ref=e\d+\]', full_article)
            if author_match:
                post['author'] = author_match.group(1).strip()
            
            # Extract handle
            handle_match = re.search(r'"@([a-zA-Z0-9_]+)"', full_article)
            if handle_match:
                post['handle'] = f"@{handle_match.group(1)}"
            
            # Extract date/time
            time_match = re.search(r'time \[\s*ref=e\d+\s*\]:\s*([^\n\[\]]+)', full_article)
            if time_match:
                post['date'] = time_match.group(1).strip()
            
            # Extract engagement metrics
            # Likes
            likes_match = re.search(r'(\d+(?:\.\d+)?[K]?)\s+Likes?', full_article)
            if likes_match:
                post['likes'] = parse_number(likes_match.group(1))
            else:
                post['likes'] = 0
            
            # Replies
            replies_match = re.search(r'(\d+(?:\.\d+)?[K]?)\s+Repl', full_article)
            if replies_match:
                post['replies'] = parse_number(replies_match.group(1))
            else:
                post['replies'] = 0
            
            # Reposts
            reposts_match = re.search(r'(\d+(?:\.\d+)?[K]?)\s+reposts?', full_article)
            if reposts_match:
                post['reposts'] = parse_number(reposts_match.group(1))
            else:
                post['reposts'] = 0
            
            # Views
            views_match = re.search(r'(\d+(?:\.\d+)?[K]?)\s+views', full_article)
            if views_match:
                post['views'] = parse_number(views_match.group(1))
            else:
                post['views'] = 0
            
            # Bookmarks
            bookmarks_match = re.search(r'(\d+(?:\.\d+)?[K]?)\s+bookmarks?', full_article)
            if bookmarks_match:
                post['bookmarks'] = parse_number(bookmarks_match.group(1))
            else:
                post['bookmarks'] = 0
            
            # Extract URL
            url_match = re.search(r'/url:\s*(/[a-zA-Z0-9_]+/status/\d+)', full_article)
            if url_match:
                post['url'] = f"https://x.com{url_match.group(1)}"
            
            # Extract text - look for text between generic blocks after the header info
            # Find main content (skip quoted posts and embedded content)
            text_parts = []
            in_quote = False
            
            # Split by generic and text markers
            lines = full_article.split('\n')
            for line in lines:
                # Skip quote sections
                if 'Quote' in line:
                    in_quote = True
                elif in_quote and 'Embedded video' in line:
                    in_quote = False
                    continue
                
                if not in_quote:
                    # Look for text content
                    if 'text:' in line and 'Replying to' not in line and 'Quote' not in line:
                        text_match = re.search(r'text:\s*"([^"]*)"', line)
                        if text_match and text_match.group(1).strip():
                            text_parts.append(text_match.group(1))
            
            post['text'] = ' '.join(text_parts) if text_parts else ''
            
            # Extract hashtags
            hashtags = re.findall(r'#(\w+)', full_article)
            if hashtags:
                post['hashtags'] = ', '.join([f"#{tag}" for tag in hashtags[:10]])  # Limit to 10
            
            # Extract mentions
            mentions = re.findall(r'@([a-zA-Z0-9_]+)', full_article)
            if mentions:
                unique_mentions = list(set(mentions))[:10]  # Limit to 10 unique
                post['mentions'] = ', '.join([f"@{m}" for m in unique_mentions])
            
            # Only add if we have essential fields
            if 'author' in post and 'handle' in post and 'url' in post:
                posts.append(post)
            
            current_article_header = None
    
    return posts

def save_posts_to_db(conn, posts, search_query):
    """Save posts to database"""
    cursor = conn.cursor()
    
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO x_posts 
                (author, handle, date, text, likes, replies, reposts, views, bookmarks, url, hashtags, mentions, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('views', 0),
                post.get('bookmarks', 0),
                post.get('url', ''),
                post.get('hashtags', ''),
                post.get('mentions', ''),
                search_query
            ))
        except Exception as e:
            print(f"Error saving post: {e}", file=__import__('sys').stderr)
    
    conn.commit()
    return cursor.rowcount

def main():
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python x_scraper.py <db_path> <search_query>", file=sys.stderr)
        sys.exit(1)
    
    db_path = sys.argv[1]
    search_query = sys.argv[2]
    
    # Initialize database
    conn = init_database(db_path)
    
    # Read snapshot from stdin
    snapshot = sys.stdin.read()
    
    # Extract posts
    posts = extract_posts_simple(snapshot)
    
    # Save to database
    saved = save_posts_to_db(conn, posts, search_query)
    
    # Output summary
    result = {
        'posts_found': len(posts),
        'posts_saved': saved,
        'high_engagement': [p for p in posts if p.get('likes', 0) > 50]
    }
    
    print(json.dumps(result, indent=2))
    
    conn.close()

if __name__ == '__main__':
    main()