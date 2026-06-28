#!/usr/bin/env python3
"""Parse X/Twitter posts from aria snapshot files."""

import re
import json
import sqlite3
from datetime import datetime
from pathlib import Path

def parse_aria_snapshot(content):
    """Parse aria snapshot to extract posts."""
    posts = []
    
    # Split by article elements
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, content)
    
    for article_text in articles:
        post = {
            'author': '',
            'handle': '',
            'date': '',
            'text': '',
            'likes': 0,
            'reposts': 0,
            'replies': 0,
            'views': 0,
            'bookmarks': 0,
            'url': ''
        }
        
        # Parse author - format is "Name @handle Date text..."
        # First, try to extract the article text which contains all info
        # Format: "Author Name @handle date text metrics"
        
        # Extract author name (before @handle)
        author_match = re.match(r'^([A-Za-z\s\.\-]+(?:Verified account)?)\s+(@[\w]+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).replace('Verified account', '').strip()
            post['handle'] = author_match.group(2)
        
        # Try another pattern - "Name @handle"
        if not post['author']:
            name_handle = re.match(r'^([A-Za-z\s\.\-]+)\s+(@[\w]+)', article_text)
            if name_handle:
                post['author'] = name_handle.group(1).strip()
                post['handle'] = name_handle.group(2)
        
        # Extract handle if not found
        if not post['handle']:
            handle_match = re.search(r'(@[\w]+)', article_text)
            if handle_match:
                post['handle'] = handle_match.group(1)
        
        # Extract date
        date_patterns = [
            r'(\d+ minutes? ago)',
            r'(\d+ hours? ago)',
            r'(\d+ days? ago)',
            r'(Jun \d+)',
            r'(May \d+)',
            r'(Jan \d+)',
            r'(Feb \d+)',
            r'(Mar \d+)',
            r'(Apr \d+)',
            r'(Jul \d+)',
            r'(Aug \d+)',
            r'(Sep \d+)',
            r'(Oct \d+)',
            r'(Nov \d+)',
            r'(Dec \d+)',
            r'(\d+/\d+/\d+)',
            r'(\w+ \d+, \d+)',
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, article_text)
            if date_match:
                post['date'] = date_match.group(1)
                break
        
        # Extract metrics - look for pattern like "X replies, Y likes, Z views"
        metrics_pattern = r'(\d+)\s*repl(?:y|ies),?\s*(?:(\d+)\s*reposts?,?\s*)?(\d+)\s*likes?,?\s*(?:(\d+)\s*bookmarks?,?\s*)?(\d+[\d,KkMm]*)\s*views?'
        metrics_match = re.search(metrics_pattern, article_text, re.IGNORECASE)
        if metrics_match:
            post['replies'] = int(metrics_match.group(1) or 0)
            post['reposts'] = int(metrics_match.group(2) or 0)
            post['likes'] = int(metrics_match.group(3) or 0)
            post['bookmarks'] = int(metrics_match.group(4) or 0)
            views_str = metrics_match.group(5) or '0'
            if 'K' in views_str:
                post['views'] = int(float(views_str.replace('K', '').replace(',', '')) * 1000)
            elif 'M' in views_str:
                post['views'] = int(float(views_str.replace('M', '').replace(',', '')) * 1000000)
            else:
                post['views'] = int(views_str.replace(',', ''))
        
        # Alternative: group pattern "X replies, Y likes, Z views"
        group_pattern = r'group "(\d+) repl(?:y|ies),?\s*(\d+)\s*likes?,?\s*(?:(\d+)\s*bookmarks?,?\s*)?(\d+[.,]?\d*[KkMm]?)\s*views?"'
        group_match = re.search(group_pattern, content, re.IGNORECASE)
        if group_match and not post['likes']:
            post['replies'] = int(group_match.group(1) or 0)
            post['likes'] = int(group_match.group(2) or 0)
            post['bookmarks'] = int(group_match.group(3) or 0)
            views_str = group_match.group(4) or '0'
            if 'K' in views_str.upper():
                post['views'] = int(float(views_str.upper().replace('K', '').replace(',', '')) * 1000)
            elif 'M' in views_str.upper():
                post['views'] = int(float(views_str.upper().replace('M', '').replace(',', '')) * 1000000)
            else:
                post['views'] = int(views_str.replace(',', '').replace('.', ''))
        
        # Extract text - this is tricky from aria
        # Look for the main text after handle and date
        # Text is usually between date and metrics
        
        # Extract URL - need to look for status link
        url_pattern = r'https://x\.com/\w+/status/(\d+)'
        # This won't be in aria directly, need to construct from handle
        
        posts.append(post)
    
    return posts

def parse_aria_detailed(content):
    """More detailed parsing of aria snapshot."""
    posts = []
    
    # Find all article sections
    # Each article starts with 'article "' and the content is the accessible name
    
    # Pattern to find articles
    article_sections = re.split(r'(\s*-\s*article ")', content)
    
    current_article = None
    for section in article_sections:
        if section.strip().startswith('"'):
            # This is the start of an article - get the quote content
            match = re.match(r'"([^"]+)"', section.strip())
            if match:
                current_article = match.group(1)
        elif current_article:
            # Parse the article content
            article_text = current_article
            
            post = {
                'author': '',
                'handle': '',
                'date': '',
                'text': '',
                'likes': 0,
                'reposts': 0,
                'replies': 0,
                'views': 0,
                'bookmarks': 0,
                'url': ''
            }
            
            # Extract handle (@handle)
            handle_match = re.search(r'(@[\w]+)', article_text)
            if handle_match:
                post['handle'] = handle_match.group(1)
            
            # Extract author - text before @handle
            author_match = re.match(r'^([A-Za-z\s\.\-]+?)(?:\s+Verified account)?\s+@', article_text)
            if author_match:
                post['author'] = author_match.group(1).strip()
            
            # Extract date
            date_patterns = [
                (r'(\d+ minutes? ago)', None),
                (r'(\d+ hours? ago)', None),
                (r'(\d+ days? ago)', None),
                (r'(Jun \d+,? \d{0,4})', None),
                (r'(May \d+,? \d{0,4})', None),
                (r'(Jan \d+,? \d{0,4})', None),
                (r'(Feb \d+,? \d{0,4})', None),
                (r'(Mar \d+,? \d{0,4})', None),
                (r'(Apr \d+,? \d{0,4})', None),
                (r'(Jul \d+,? \d{0,4})', None),
                (r'(Aug \d+,? \d{0,4})', None),
                (r'(Sep \d+,? \d{0,4})', None),
                (r'(Oct \d+,? \d{0,4})', None),
                (r'(Nov \d+,? \d{0,4})', None),
                (r'(Dec \d+,? \d{0,4})', None),
            ]
            for pattern, _ in date_patterns:
                date_match = re.search(pattern, article_text)
                if date_match:
                    post['date'] = date_match.group(1)
                    break
            
            # Extract metrics from the article text
            # Format: "X replies, Y likes, Z views" or "X replies, Y reposts, Z likes, W views"
            metrics_patterns = [
                r'(\d+)\s*repl(?:y|ies)[,\s]+(?:(\d+)\s*reposts?[,\s]+)?(\d+)\s*likes?[,\s]+(?:(\d+)\s*bookmarks?[,\s]+)?(\d+[.,]?\d*[KkMm]?)\s*views?',
                r'(\d+)\s*likes?[,\s]+(\d+)\s*reposts?[,\s]+(\d+)\s*views?',
                r'(\d+)\s*likes?[,\s]+(\d+)\s*views?',
            ]
            
            for pattern in metrics_patterns:
                match = re.search(pattern, article_text, re.IGNORECASE)
                if match:
                    groups = match.groups()
                    if 'reply' in pattern.lower():
                        post['replies'] = int(groups[0] or 0)
                        if groups[1] and 'repost' in pattern.lower():
                            post['reposts'] = int(groups[1])
                            post['likes'] = int(groups[2] or 0)
                        else:
                            post['likes'] = int(groups[2] or 0)
                        # Parse views
                        views_str = groups[-1] or '0'
                        if 'K' in views_str.upper():
                            post['views'] = int(float(views_str.upper().replace('K', '').replace(',', '')) * 1000)
                        elif 'M' in views_str.upper():
                            post['views'] = int(float(views_str.upper().replace('M', '').replace(',', '')) * 1000000)
                        else:
                            post['views'] = int(views_str.replace(',', '').replace('.', ''))
                    break
            
            # Extract text - everything after date and before metrics
            # This is complex, so we'll use a simpler approach
            # Find InlineTextBox elements that contain the post text
            
            # Construct URL from handle
            if post['handle']:
                post['url'] = f"https://x.com/{post['handle']}/status/placeholder"
            
            posts.append(post)
            current_article = None
    
    return posts

def extract_posts_from_aria_file(filepath):
    """Extract posts from an aria snapshot file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    posts = []
    
    # Find article lines
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if 'article "' in line:
            # Extract the article quoted content
            match = re.search(r'article "([^"]+)"', line)
            if match:
                article_text = match.group(1)
                
                post = {
                    'author': '',
                    'handle': '',
                    'date': '',
                    'text': '',
                    'likes': 0,
                    'reposts': 0,
                    'replies': 0,
                    'views': 0,
                    'bookmarks': 0,
                    'url': ''
                }
                
                # Parse handle
                handle_match = re.search(r'(@[\w]+)', article_text)
                if handle_match:
                    post['handle'] = handle_match.group(1)
                
                # Parse author - text before @handle
                parts = article_text.split('@')
                if len(parts) > 0:
                    author_part = parts[0].strip()
                    # Remove "Verified account" if present
                    author_part = author_part.replace('Verified account', '').strip()
                    post['author'] = author_part
                
                # Parse date
                date_patterns = [
                    r'(\d+ minutes? ago)',
                    r'(\d+ hours? ago)',
                    r'(\d+ days? ago)',
                    r'(Jun \d+,? ?\d*)',
                    r'(May \d+,? ?\d*)',
                    r'(Jan \d+,? ?\d*)',
                    r'(Feb \d+,? ?\d*)',
                    r'(Mar \d+,? ?\d*)',
                    r'(Apr \d+,? ?\d*)',
                    r'(Jul \d+,? ?\d*)',
                    r'(Aug \d+,? ?\d*)',
                    r'(Sep \d+,? ?\d*)',
                    r'(Oct \d+,? ?\d*)',
                    r'(Nov \d+,? ?\d*)',
                    r'(Dec \d+,? ?\d*)',
                ]
                for pattern in date_patterns:
                    match = re.search(pattern, article_text)
                    if match:
                        post['date'] = match.group(1)
                        break
                
                # Parse metrics - look for the pattern in the article text
                # "X replies, Y likes, Z views" or "X replies, Y reposts, Z likes, W views"
                metrics_match = re.search(
                    r'(\d+)\s*repl(?:y|ies)[,\s]*(?:(\d+)\s*reposts?[,\s]*)?(\d+)\s*likes?[,\s]*(?:(\d+)\s*bookmarks?[,\s]*)?(\d+[.,]?\d*[KkMm]?)\s*views?',
                    article_text, re.IGNORECASE
                )
                if metrics_match:
                    post['replies'] = int(metrics_match.group(1) or 0)
                    post['reposts'] = int(metrics_match.group(2) or 0)
                    post['likes'] = int(metrics_match.group(3) or 0)
                    post['bookmarks'] = int(metrics_match.group(4) or 0)
                    views_str = metrics_match.group(5) or '0'
                    if 'K' in views_str.upper():
                        post['views'] = int(float(views_str.upper().replace('K', '').replace(',', '')) * 1000)
                    elif 'M' in views_str.upper():
                        post['views'] = int(float(views_str.upper().replace('M', '').replace(',', '')) * 1000000)
                    else:
                        post['views'] = int(views_str.replace(',', '').replace('.', ''))
                
                # URL
                if post['handle']:
                    post['url'] = f"https://x.com/{post['handle'].replace('@', '')}/status/placeholder"
                
                posts.append(post)
    
    return posts

def save_to_database(posts, db_path, search_query):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'")
    if not cursor.fetchone():
        cursor.execute('''
            CREATE TABLE posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                author TEXT,
                handle TEXT,
                date TEXT,
                text TEXT,
                likes INTEGER,
                reposts INTEGER,
                replies INTEGER,
                views INTEGER,
                bookmarks INTEGER,
                url TEXT,
                search_query TEXT,
                scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(author, text)
            )
        ''')
    
    # Insert posts
    for post in posts:
        if post['handle'] and post['date']:  # Only insert valid posts
            try:
                cursor.execute('''
                    INSERT OR IGNORE INTO posts 
                    (author, handle, date, text, likes, reposts, replies, views, bookmarks, url, search_query)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    post['author'],
                    post['handle'],
                    post['date'],
                    post['text'],
                    post['likes'],
                    post['reposts'],
                    post['replies'],
                    post['views'],
                    post['bookmarks'],
                    post['url'],
                    search_query
                ))
            except Exception as e:
                print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python parse_x_aria.py <snapshot_file> [search_query]")
        sys.exit(1)
    
    snapshot_file = sys.argv[1]
    search_query = sys.argv[2] if len(sys.argv) > 2 else 'neurointervention'
    
    posts = extract_posts_from_aria_file(snapshot_file)
    
    # Print as JSON
    print(json.dumps(posts, indent=2))