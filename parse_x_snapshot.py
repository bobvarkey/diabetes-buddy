#!/usr/bin/env python3
import re
import json
import sqlite3
from datetime import datetime
import os

def parse_snapshot_articles(snapshot_text):
    """Extract articles from browser snapshot"""
    # Split by article markers
    articles = []
    lines = snapshot_text.split('\n')
    
    current_article = None
    article_content = []
    
    for line in lines:
        # Start of a new article
        if 'article "' in line or "'article \"" in line:
            if current_article:
                articles.append('\n'.join(article_content))
            current_article = line
            article_content = [line]
        elif current_article:
            article_content.append(line)
    
    # Don't forget the last article
    if current_article and article_content:
        articles.append('\n'.join(article_content))
    
    return articles

def extract_post_from_article(article_text):
    """Extract post data from a single article"""
    post = {}
    
    # Extract the article header line which contains most info
    # Pattern: article "Name @handle time text..."
    header_match = re.search(r'article "([^"]+)"', article_text)
    if not header_match:
        header_match = re.search(r"'article \"([^\"]+)\"", article_text)
    
    if header_match:
        header = header_match.group(1)
        
        # Extract author and handle
        # Pattern: "Name @handle" or "Name Verified account @handle"
        author_match = re.match(r'^([^(]+?)\s*(?:Verified account)?\s*@(\w+)', header)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = '@' + author_match.group(2)
        
        # Extract date/time from header
        time_patterns = [
            r'(\d+\s+(?:seconds?|minutes?|hours?|days?)\s+ago)',
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+'
        ]
        
        for pattern in time_patterns:
            time_match = re.search(pattern, header)
            if time_match:
                post['date'] = time_match.group(1)
                break
    
    # Extract URL
    url_match = re.search(r'/status/(\d+)', article_text)
    if url_match:
        status_id = url_match.group(1)
        handle = post.get('handle', '').replace('@', '')
        post['url'] = f"https://x.com/{handle}/status/{status_id}"
    
    # Extract text - look for the text content
    # In the snapshot, text appears after the author/handle
    text_sections = []
    
    # Find text nodes
    text_matches = re.findall(r'- text: "([^"]+)"', article_text)
    for txt in text_matches:
        if txt and len(txt) > 5:  # Skip very short fragments
            text_sections.append(txt)
    
    # Also extract hashtag links
    hashtag_matches = re.findall(r'- link "#(\w+)"', article_text)
    hashtags = ['#' + tag for tag in hashtag_matches]
    
    if text_sections:
        post['text'] = ' '.join(text_sections)
        if hashtags:
            post['text'] += ' ' + ' '.join(hashtags[:3])  # Limit hashtags
    else:
        # Fallback: extract from header
        if header_match:
            # Get text after date
            header = header_match.group(1)
            # Remove author and date part
            text_part = re.sub(r'^[^(]+?\s*(?:Verified account)?\s*@\w+\s+(?:\d+\s+\w+\s+ago|\w+\s+\d+)\s*', '', header)
            if text_part and len(text_part) > 10:
                post['text'] = text_part[:500]
    
    # Extract engagement metrics from the group at the end
    metrics = {}
    
    # Look for the group line that has all metrics
    group_match = re.search(r'group "([^"]+)"', article_text)
    if group_match:
        group_text = group_match.group(1)
        
        # Extract numbers
        replies_match = re.search(r'(\d+)\s+repl', group_text)
        metrics['replies'] = int(replies_match.group(1)) if replies_match else 0
        
        reposts_match = re.search(r'(\d+)\s+repost', group_text)
        metrics['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
        
        likes_match = re.search(r'(\d+)\s+like', group_text)
        metrics['likes'] = int(likes_match.group(1)) if likes_match else 0
        
        views_match = re.search(r'([\d.]+[KkMm]?)\s+views', group_text)
        metrics['views'] = views_match.group(1) if views_match else '0'
    else:
        metrics = {'replies': 0, 'reposts': 0, 'likes': 0, 'views': '0'}
    
    post['metrics'] = metrics
    
    return post if post.get('text') and post.get('url') else None

def save_to_sqlite(posts, db_path, search_term):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Use existing table schema
    # Create table if not exists (with existing schema)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author_name TEXT,
            handle TEXT,
            datetime TEXT,
            text TEXT,
            url TEXT UNIQUE,
            replies TEXT,
            reposts TEXT,
            likes TEXT,
            bookmarks TEXT,
            views TEXT,
            search_query TEXT,
            scraped_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Insert posts
    new_count = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO posts (author_name, handle, datetime, text, url, replies, reposts, likes, views, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', 'Unknown'),
                post.get('handle', 'Unknown'),
                post.get('date', ''),
                post.get('text', ''),
                post.get('url', ''),
                str(post['metrics']['replies']),
                str(post['metrics']['reposts']),
                str(post['metrics']['likes']),
                post['metrics']['views'],
                search_term
            ))
            new_count += 1
        except sqlite3.IntegrityError:
            # URL already exists, skip
            pass
    
    conn.commit()
    conn.close()
    return new_count

def generate_markdown_report(posts, high_engagement_posts, search_term, output_path):
    """Append markdown report section"""
    report_lines = [
        f"## Search: {search_term}",
        f"**Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"**Posts found:** {len(posts)}",
        f"**High engagement (>50 likes):** {len(high_engagement_posts)}",
        ""
    ]
    
    if posts:
        report_lines.append("### All Posts\n")
        for i, post in enumerate(posts, 1):
            author = post.get('author', 'Unknown')
            handle = post.get('handle', 'Unknown')
            date = post.get('date', 'Unknown')
            url = post.get('url', 'N/A')
            text = post.get('text', 'N/A')
            if len(text) > 300:
                text = text[:300] + '...'
            
            m = post['metrics']
            report_lines.extend([
                f"{i}. **{author}** ({handle}) - {date}",
                f"   - Text: {text}",
                f"   - Engagement: {m['replies']} replies, {m['reposts']} reposts, {m['likes']} likes, {m['views']} views",
                f"   - URL: {url}",
                ""
            ])
    
    if high_engagement_posts:
        report_lines.append("\n### ⭐ High Engagement Posts (>50 likes)\n")
        for post in high_engagement_posts:
            author = post.get('author', 'Unknown')
            handle = post.get('handle', 'Unknown')
            url = post.get('url', 'N/A')
            text = post.get('text', 'N/A')
            if len(text) > 200:
                text = text[:200] + '...'
            likes = post['metrics']['likes']
            
            report_lines.extend([
                f"**{author}** ({handle}) - **{likes} likes**",
                f"   - {text}",
                f"   - {url}",
                ""
            ])
    
    # Append to file
    with open(output_path, 'a') as f:
        f.write('\n'.join(report_lines) + '\n\n---\n\n')
    
    print(f"Report appended to: {output_path}")

def main(snapshot_file, search_term):
    # Read snapshot
    with open(snapshot_file, 'r') as f:
        snapshot_text = f.read()
    
    # Parse articles
    articles = parse_snapshot_articles(snapshot_text)
    print(f"Found {len(articles)} articles in snapshot")
    
    # Extract posts
    posts = []
    for article in articles:
        post = extract_post_from_article(article)
        if post:
            posts.append(post)
    
    print(f"Extracted {len(posts)} valid posts")
    
    # Identify high engagement posts (>50 likes)
    high_engagement = [p for p in posts if p['metrics']['likes'] > 50]
    
    # Save to SQLite
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    new_count = save_to_sqlite(posts, db_path, search_term)
    print(f"Saved {new_count} new posts to database")
    
    # Generate markdown report
    report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    # Create report file with header if it doesn't exist
    if not os.path.exists(report_path):
        with open(report_path, 'w') as f:
            f.write(f"# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d')}\n\n")
    
    generate_markdown_report(posts, high_engagement, search_term, report_path)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"SCRAPING SUMMARY")
    print(f"{'='*60}")
    print(f"Search term: {search_term}")
    print(f"Total posts found: {len(posts)}")
    print(f"New posts saved: {new_count}")
    print(f"High engagement posts (>50 likes): {len(high_engagement)}")
    
    if high_engagement:
        print(f"\nHigh Engagement Posts:")
        for p in high_engagement:
            print(f"  - {p['author']} ({p['handle']}): {p['metrics']['likes']} likes")
            print(f"    {p['text'][:100]}...")
    
    return posts, high_engagement

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python parse_x_snapshot.py <snapshot_file> [search_term]")
        sys.exit(1)
    
    snapshot_file = sys.argv[1]
    search_term = sys.argv[2] if len(sys.argv) > 2 else 'unknown'
    
    main(snapshot_file, search_term)