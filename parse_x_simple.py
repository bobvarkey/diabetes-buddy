#!/usr/bin/env python3
import re
import json
import sqlite3
from datetime import datetime
from pathlib import Path
import sys
import hashlib

def parse_x_page(filename):
    """Parse X posts from saved page text"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # The content is a JSON string with embedded newlines
    # Parse it as a single string
    text = content.replace('\\n', '\n')
    
    posts = []
    
    # Pattern to find posts: Name\n@handle\n·\ntimestamp\ncontent
    # Split into potential posts by looking for @handle patterns
    
    lines = text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for handle pattern: @username
        handle_match = re.match(r'^(@[\w]+)$', line)
        if handle_match:
            handle = handle_match.group(1)
            
            # Get author (previous non-empty line that's not a metric)
            author = ""
            for j in range(i-1, max(0, i-10), -1):
                prev = lines[j].strip()
                if prev and not prev.startswith('@') and not prev.startswith('·'):
                    # Check if it's a name (not a number)
                    if not re.match(r'^\d+[KkMm]?$', prev) and not re.match(r'^\d+[hdm]$', prev):
                        author = prev
                        break
            
            # Skip "·" and timestamp
            k = i + 1
            while k < len(lines) and (lines[k].strip() == '·' or 
                                       re.match(r'^\d+[hdm]$', lines[k].strip()) or
                                       re.match(r'^[A-Z][a-z]+ \d+,? \d+$', lines[k].strip()) or
                                       re.match(r'^[A-Z][a-z]+ \d+$', lines[k].strip()) or
                                       lines[k].strip() == ''):
                k += 1
            
            # Collect content until next handle or metrics
            content_lines = []
            while k < len(lines):
                l = lines[k].strip()
                
                # Stop at next handle
                if re.match(r'^@[\w]+$', l):
                    break
                
                # Stop at metrics (standalone numbers in sequence)
                if re.match(r'^\d+[KkMm]?$', l):
                    # Check if next lines are also metrics
                    if k + 1 < len(lines) and re.match(r'^\d+[KkMm]?$', lines[k+1].strip()):
                        # This is metrics, stop collecting content
                        break
                
                # Skip UI elements
                if l in ['Top', 'Latest', 'People', 'Media', 'Lists', 'See new posts',
                         'Search timeline', '·', 'Replying to']:
                    k += 1
                    continue
                
                if l.startswith('Show more'):
                    content_lines.append('...')
                    k += 1
                    break
                
                if l:
                    content_lines.append(l)
                k += 1
            
            text = ' '.join(content_lines)
            
            # Extract metrics
            metrics = []
            m = k
            while m < len(lines) and len(metrics) < 4:
                metric_line = lines[m].strip()
                if re.match(r'^\d+[KkMm]?$', metric_line):
                    # Parse metric
                    val = metric_line.replace(',', '')
                    if 'K' in val or 'k' in val:
                        metrics.append(int(float(val.replace('K', '').replace('k', '')) * 1000))
                    elif 'M' in val or 'm' in val:
                        metrics.append(int(float(val.replace('M', '').replace('m', '')) * 1000000))
                    else:
                        try:
                            metrics.append(int(val))
                        except:
                            pass
                    m += 1
                else:
                    break
            
            if author and handle and text and len(text) > 20:
                replies = metrics[0] if len(metrics) > 0 else 0
                reposts = metrics[1] if len(metrics) > 1 else 0
                likes = metrics[2] if len(metrics) > 2 else 0
                views = metrics[3] if len(metrics) > 3 else 0
                
                # Generate pseudo-URL
                content_hash = hashlib.md5(f"{author}:{handle}:{text[:100]}".encode()).hexdigest()[:16]
                url = f"https://x.com/{handle}/status/{content_hash}"
                
                posts.append({
                    'author': author,
                    'handle': handle,
                    'text': text,
                    'replies': replies,
                    'reposts': reposts,
                    'likes': likes,
                    'views': views,
                    'url': url
                })
            
            i = k
        else:
            i += 1
    
    return posts

def save_posts(posts, query):
    """Save posts to database"""
    db_path = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_count = 0
    high_engagement = []
    
    for post in posts:
        # Check if exists
        cursor.execute("SELECT id FROM posts WHERE url = ?", (post['url'],))
        if cursor.fetchone():
            continue
        
        # Insert
        try:
            cursor.execute("""
                INSERT INTO posts (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                post['author'],
                post['handle'],
                datetime.utcnow().isoformat(),
                post['text'],
                post['likes'],
                post['replies'],
                post['reposts'],
                post['views'],
                post['url'],
                query,
                datetime.utcnow().isoformat()
            ))
            new_count += 1
            
            if post['likes'] > 50:
                high_engagement.append(post)
        except:
            continue
    
    conn.commit()
    conn.close()
    
    return new_count, high_engagement

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: script.py <query> <file1> [file2] ...")
        sys.exit(1)
    
    query = sys.argv[1]
    files = sys.argv[2:]
    
    all_posts = []
    for f in files:
        posts = parse_x_page(f)
        all_posts.extend(posts)
    
    # Deduplicate
    seen = set()
    unique = []
    for p in all_posts:
        key = p['url']
        if key not in seen:
            seen.add(key)
            unique.append(p)
    
    new_count, high_eng = save_posts(unique, query)
    
    print(json.dumps({
        'total_found': len(unique),
        'new_posts_saved': new_count,
        'high_engagement_posts': len(high_eng),
        'sample_posts': unique[:3]
    }, indent=2))