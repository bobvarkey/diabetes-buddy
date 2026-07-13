#!/usr/bin/env python3
"""
Final X/Twitter posts extraction and database/report generation.
"""
import sqlite3
import re
import os
import json
import hashlib
from datetime import datetime

def parse_posts_from_aria(filepath):
    """Extract posts from aria snapshot."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    posts = []
    seen = set()
    
    # Find all article elements
    article_pattern = r'- article "([^"]+)"'
    matches = re.findall(article_pattern, content)
    
    for match in matches:
        post = {}
        text = match
        
        # Extract @handle
        handle_match = re.search(r'@(\w+)', text)
        if handle_match:
            post['handle'] = '@' + handle_match.group(1)
        
        # Extract author
        if post.get('handle'):
            author_match = re.search(r'^(.+?)\s*(?:Verified account\s+)?@' + post['handle'][1:], text)
            if author_match:
                post['author'] = author_match.group(1).strip()
        
        # Extract metrics
        metrics_match = re.search(r'(\d+)\s+repl(?:y|ies).*?(\d+)\s+reposts?.*?(\d+)\s+likes?.*?(\d+)\s+views?', text)
        if metrics_match:
            post['replies'] = metrics_match.group(1)
            post['reposts'] = metrics_match.group(2)
            post['likes'] = metrics_match.group(3)
            post['views'] = metrics_match.group(4)
        
        # Also check for simplified metrics format
        if not post.get('likes'):
            likes_match = re.search(r'(\d+)\s+likes', text)
            if likes_match:
                post['likes'] = likes_match.group(1)
            views_match = re.search(r'(\d+)\s+views', text)
            if views_match:
                post['views'] = views_match.group(1)
        
        # Extract date
        date_patterns = [
            r'(\w{3}\s+\d{1,2}(?:,?\s+\d{4})?)',
            r'(\d+[mh])\s',
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, text)
            if date_match:
                post['date'] = date_match.group(1)
                break
        
        # Extract hashtags
        hashtags = re.findall(r'#(\w+)', text)
        if hashtags:
            post['hashtags'] = hashtags
        
        # Extract URLs
        urls = re.findall(r'(https?://[^\s]+)', text)
        if urls:
            post['url'] = urls[0]
        
        # Store text
        post['text'] = text
        
        # Deduplicate
        if post.get('handle') and post.get('text'):
            key = post['handle'] + hashlib.md5(post['text'][:100].encode()).hexdigest()
            if key not in seen:
                seen.add(key)
                posts.append(post)
    
    return posts

def create_database(db_path):
    """Create SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id TEXT PRIMARY KEY,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            views TEXT,
            url TEXT,
            hashtags TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            search_query TEXT
        )
    ''')
    
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_likes ON posts(likes)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_handle ON posts(handle)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON posts(date)')
    
    conn.commit()
    return conn

def parse_metric(value):
    """Parse metric value handling K/M suffixes."""
    if not value:
        return 0
    value = str(value).upper().strip()
    if 'K' in value:
        return int(float(value.replace('K', '')) * 1000)
    elif 'M' in value:
        return int(float(value.replace('M', '')) * 1000000)
    else:
        try:
            return int(re.sub(r'[^\d]', '', value))
        except:
            return 0

def save_to_db(posts, conn, search_query):
    """Save posts to database."""
    cursor = conn.cursor()
    
    for post in posts:
        post_id = hashlib.md5(f"{post.get('handle', '')}_{post.get('text', '')[:100]}".encode()).hexdigest()[:16]
        
        replies = parse_metric(post.get('replies'))
        reposts = parse_metric(post.get('reposts'))
        likes = parse_metric(post.get('likes'))
        bookmarks = parse_metric(post.get('bookmarks'))
        views = post.get('views', '0')
        
        hashtags_json = json.dumps(post.get('hashtags', []))
        
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO posts 
                (id, author, handle, date, text, replies, reposts, likes, bookmarks, views, url, hashtags, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post_id,
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                replies,
                reposts,
                likes,
                bookmarks,
                views,
                post.get('url', ''),
                hashtags_json,
                search_query
            ))
        except Exception as e:
            print(f"Error: {e}")
    
    conn.commit()

def generate_markdown_report(posts, output_path):
    """Generate markdown report."""
    today = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    md = f"""# X/Twitter Neurointervention Scrape Report
**Generated:** {today}
**Total Posts:** {len(posts)}

---

## Summary

This report contains posts scraped from X/Twitter related to neurointervention, thrombectomy, stroke, cerebral AVM, intracranial aneurysm, and endovascular treatments.

---

## 🔥 High-Engagement Posts (>50 likes)

"""
    
    # Sort by likes
    high_engagement = sorted(posts, key=lambda x: parse_metric(x.get('likes', '0')), reverse=True)
    high_likes = [p for p in high_engagement if parse_metric(p.get('likes', '0')) > 50]
    
    if high_likes:
        for post in high_likes:
            md += f"""### {post.get('author', 'Unknown')}
**{post.get('handle', '@unknown')}** • {post.get('date', 'N/A')}

{post.get('text', 'No text available')[:500]}

📊 **{post.get('likes', '0')} likes** • {post.get('reposts', '0')} reposts • {post.get('replies', '0')} replies • {post.get('views', '0')} views

---

"""
    else:
        md += "No high-engagement posts found in this scrape.\n\n---\n\n"
    
    # All posts
    md += f"## All Posts ({len(posts)} total)\n\n"
    
    for i, post in enumerate(posts, 1):
        md += f"""### {i}. {post.get('author', 'Unknown')}
**{post.get('handle', '@unknown')}** • {post.get('date', 'N/A')}

{post.get('text', 'No text available')[:300]}{'...' if len(post.get('text', '')) > 300 else ''}

📊 {post.get('likes', '0')} likes • {post.get('reposts', '0')} reposts • {post.get('views', '0')} views

---

"""
    
    # Write file
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(md)

def main():
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-07-11.md'
    
    # Create database
    conn = create_database(db_path)
    
    # Process all aria files
    files = {
        '/tmp/x_search1_aria.txt': 'neurointervention/thrombectomy/stroke',
        '/tmp/x_search2_aria.txt': 'AVM/aneurysm/endovascular',
        '/tmp/x_search1_extended.txt': 'neurointervention/thrombectomy/stroke',
        '/tmp/x_search2_extended.txt': 'AVM/aneurysm/endovascular',
        '/tmp/x_search1_full.txt': 'neurointervention/thrombectomy/stroke',
        '/tmp/x_search1_final.txt': 'neurointervention/thrombectomy/stroke',
        '/tmp/x_search2_full.txt': 'AVM/aneurysm/endovascular',
    }
    
    all_posts = []
    seen = set()
    
    for filepath, search_query in files.items():
        if os.path.exists(filepath):
            posts = parse_posts_from_aria(filepath)
            print(f"{filepath}: {len(posts)} posts")
            
            for post in posts:
                key = post.get('handle', '') + post.get('text', '')[:50]
                if key not in seen:
                    seen.add(key)
                    all_posts.append(post)
                    save_to_db([post], conn, search_query)
    
    # Generate report
    generate_markdown_report(all_posts, report_path)
    
    conn.close()
    
    # Stats
    high_engagement_count = sum(1 for p in all_posts if parse_metric(p.get('likes', '0')) > 50)
    
    print(f"\n✅ Total unique posts saved: {len(all_posts)}")
    print(f"🔥 High-engagement posts (>50 likes): {high_engagement_count}")
    print(f"📄 Report saved to: {report_path}")
    print(f"🗄️  Database saved to: {db_path}")
    
    # Show top posts by engagement
    print(f"\n📊 Top posts by likes:")
    sorted_posts = sorted(all_posts, key=lambda x: parse_metric(x.get('likes', '0')), reverse=True)
    for post in sorted_posts[:5]:
        print(f"  • {post.get('author', 'Unknown')} {post.get('handle', '@unknown')}: {post.get('likes', '0')} likes")
        print(f"    {post.get('text', '')[:80]}...")

if __name__ == '__main__':
    main()