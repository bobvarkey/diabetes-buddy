#!/usr/bin/env python3
"""
Simple X/Twitter post extractor - parses browser evaluate output
"""
import sqlite3
import subprocess
import re
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def parse_number(num_str):
    """Parse numbers like 2.8K, 1.1M"""
    if not num_str:
        return 0
    num_str = str(num_str).strip().lower().replace(',', '')
    if 'k' in num_str:
        return int(float(num_str.replace('k', '')) * 1000)
    elif 'm' in num_str:
        return int(float(num_str.replace('m', '')) * 1000000)
    try:
        return int(float(num_str))
    except:
        return 0

def extract_posts_from_tab(tab_id):
    """Extract posts from current browser tab"""
    cmd = f'openclaw browser evaluate --fn \'Array.from(document.querySelectorAll("article")).map(a => a.innerText).join("|||POST|||")\''
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
    
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return []
    
    # Extract the actual content from the output
    output = result.stdout
    
    # Find the quoted string in the output
    match = re.search(r'"(.+)"', output, re.DOTALL)
    if not match:
        return []
    
    posts_text = match.group(1)
    posts_raw = posts_text.split('|||POST|||')
    
    posts = []
    for post_raw in posts_raw:
        if not post_raw.strip():
            continue
        
        # Parse the post
        lines = post_raw.strip().split('\n')
        
        # Try to extract components
        author = ""
        handle = ""
        date = ""
        text_lines = []
        engagement = []
        
        reading_text = False
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # First two lines are usually author and handle
            if i == 0:
                author = line
            elif i == 1 and line.startswith('@'):
                handle = line
                reading_text = True
            elif i == 2 and '·' in line:
                # Date line
                parts = line.split('·')
                if len(parts) > 1:
                    date = parts[-1].strip()
                reading_text = True
            elif reading_text:
                # Check if this is engagement metrics (just numbers)
                if re.match(r'^[\d.KM]+$', line):
                    engagement.append(line)
                else:
                    text_lines.append(line)
        
        # Parse engagement metrics (last few items)
        replies = 0
        reposts = 0
        likes = 0
        views = 0
        
        if len(engagement) >= 3:
            # Engagement is usually in order: replies, reposts, likes, views
            replies = parse_number(engagement[0]) if len(engagement) > 0 else 0
            reposts = parse_number(engagement[1]) if len(engagement) > 1 else 0
            likes = parse_number(engagement[2]) if len(engagement) > 2 else 0
            views = parse_number(engagement[3]) if len(engagement) > 3 else 0
        
        # Generate a URL from handle and approximate timestamp
        url = f"https://x.com/{handle.replace('@', '')}/status/unknown"
        
        text = ' '.join(text_lines)
        if text and author:
            posts.append({
                'author': author,
                'handle': handle,
                'date': date,
                'text': text[:500],
                'replies': replies,
                'reposts': reposts,
                'likes': likes,
                'views': views,
                'url': url
            })
    
    return posts

def scroll_and_extract(tab_id, num_scrolls=5):
    """Scroll page and extract all posts"""
    all_posts = []
    
    for i in range(num_scrolls):
        print(f"Scrolling {i+1}/{num_scrolls}...")
        
        # Extract posts from current page
        posts = extract_posts_from_tab(tab_id)
        new_count = 0
        
        for post in posts:
            # Check if we already have this post (by text similarity)
            if not any(p['text'][:50] == post['text'][:50] for p in all_posts):
                all_posts.append(post)
                new_count += 1
        
        print(f"  Found {new_count} new posts (total: {len(all_posts)})")
        
        if new_count == 0:
            break
        
        # Scroll down
        subprocess.run(['openclaw', 'browser', 'press', 'End'], timeout=15, capture_output=True)
        subprocess.run(['sleep', '3'], shell=True)
    
    return all_posts

def save_posts_to_db(posts, search_query):
    """Save posts to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, replies, reposts, likes, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['replies'],
                post['reposts'],
                post['likes'],
                post['views'],
                post['url'],
                search_query
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def generate_report(posts1, posts2, high_engagement):
    """Generate markdown report"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(REPORT_PATH, 'w') as f:
        f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (Asia/Calcutta)\n\n")
        f.write(f"**Reference UTC:** 2026-07-14 12:32 UTC\n\n")
        
        f.write(f"## Summary\n\n")
        f.write(f"- **Search 1 (Neurointervention/Stroke):** {len(posts1)} posts\n")
        f.write(f"- **Search 2 (AVM/Aneurysm/Endovascular):** {len(posts2)} posts\n")
        f.write(f"- **Total posts:** {len(posts1) + len(posts2)}\n")
        f.write(f"- **High-engagement posts (>50 likes):** {len(high_engagement)}\n\n")
        
        if high_engagement:
            f.write(f"## High-Engagement Posts (>50 likes)\n\n")
            for post in high_engagement:
                f.write(f"### {post['author']} {post['handle']}\n\n")
                if post['date']:
                    f.write(f"**Date:** {post['date']}\n\n")
                f.write(f"{post['text']}\n\n")
                f.write(f"**Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies")
                if post['views']:
                    f.write(f", {post['views']} views")
                f.write(f"\n\n---\n\n")
        
        f.write(f"## All Posts - Search 1 (Neurointervention/Stroke)\n\n")
        for post in posts1:
            f.write(f"- **{post['author']}** {post['handle']}")
            if post['date']:
                f.write(f" · {post['date']}")
            f.write(f"\n  {post['text'][:150]}{'...' if len(post['text']) > 150 else ''}\n")
            f.write(f"  _{post['likes']} likes, {post['reposts']} reposts_\n\n")
        
        f.write(f"\n## All Posts - Search 2 (AVM/Aneurysm/Endovascular)\n\n")
        for post in posts2:
            f.write(f"- **{post['author']}** {post['handle']}")
            if post['date']:
                f.write(f" · {post['date']}")
            f.write(f"\n  {post['text'][:150]}{'...' if len(post['text']) > 150 else ''}\n")
            f.write(f"  _{post['likes']} likes, {post['reposts']} reposts_\n\n")

def main():
    print("Initializing database...")
    init_database()
    
    # Extract from tab t358 (first search)
    print("\n" + "="*60)
    print("Extracting posts from Search 1 (Neurointervention/Stroke)")
    print("="*60)
    
    subprocess.run(['openclaw', 'browser', 'focus', 't358'], timeout=15, capture_output=True)
    subprocess.run(['sleep', '2'], shell=True)
    
    posts1 = scroll_and_extract('t358', num_scrolls=5)
    print(f"\nTotal posts from Search 1: {len(posts1)}")
    
    inserted = save_posts_to_db(posts1, "neurointervention")
    print(f"Inserted {inserted} new posts to database")
    
    # Extract from tab t362 (second search)
    print("\n" + "="*60)
    print("Extracting posts from Search 2 (AVM/Aneurysm/Endovascular)")
    print("="*60)
    
    subprocess.run(['openclaw', 'browser', 'focus', 't362'], timeout=15, capture_output=True)
    subprocess.run(['sleep', '2'], shell=True)
    
    posts2 = scroll_and_extract('t362', num_scrolls=5)
    print(f"\nTotal posts from Search 2: {len(posts2)}")
    
    inserted = save_posts_to_db(posts2, "avm_aneurysm")
    print(f"Inserted {inserted} new posts to database")
    
    # Find high engagement posts
    all_posts = posts1 + posts2
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    high_engagement.sort(key=lambda x: x.get('likes', 0), reverse=True)
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Search 1: {len(posts1)} posts")
    print(f"Search 2: {len(posts2)} posts")
    print(f"Total: {len(all_posts)} posts")
    print(f"High-engagement (>50 likes): {len(high_engagement)} posts")
    
    # Generate report
    print("\nGenerating report...")
    generate_report(posts1, posts2, high_engagement)
    print(f"Report saved to: {REPORT_PATH}")
    
    # Print high engagement posts
    if high_engagement:
        print("\n" + "="*60)
        print("HIGH-ENGAGEMENT POSTS (>50 likes)")
        print("="*60)
        for post in high_engagement[:5]:
            print(f"\n- {post['author']} ({post['likes']} likes)")
            print(f"  {post['text'][:100]}...")

if __name__ == "__main__":
    main()