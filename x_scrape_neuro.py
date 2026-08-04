#!/usr/bin/env python3
"""
X/Twitter Neurointervention Scraper
Scrapes neurointervention and stroke posts using OpenClaw browser
"""

import sqlite3
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path

# Database and report paths
DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

# Search URLs
SEARCH_URLS = [
    "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today",
    "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"
]

def init_database():
    """Initialize SQLite database with posts table"""
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
            url TEXT UNIQUE,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def parse_engagement(text):
    """Parse engagement numbers like '2.8K', '1.1M' etc."""
    if not text:
        return 0
    text = text.strip().lower()
    
    if text.endswith('k'):
        try:
            return int(float(text[:-1]) * 1000)
        except:
            return 0
    elif text.endswith('m'):
        try:
            return int(float(text[:-1]) * 1000000)
        except:
            return 0
    else:
        try:
            return int(text.replace(',', ''))
        except:
            return 0

def extract_posts_from_page():
    """Extract posts from current browser page using evaluate"""
    
    js_code = '''
    const posts = [];
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    
    articles.forEach(article => {
        try {
            // Get URL
            const link = article.querySelector('a[href*="/status/"]');
            const url = link ? "https://x.com" + link.getAttribute("href") : null;
            
            if (!url) return;
            
            // Get author
            const authorLinks = article.querySelectorAll('a[href^="/"]');
            let author = "";
            let handle = "";
            
            for (let link of authorLinks) {
                const href = link.getAttribute("href");
                if (href.includes("/status")) continue;
                const span = link.querySelector("span");
                if (span && span.textContent.startsWith("@")) {
                    handle = span.textContent;
                } else {
                    author = link.textContent.trim();
                }
                if (author && handle) break;
            }
            
            // Get date
            const timeEl = article.querySelector("time");
            const date = timeEl ? timeEl.getAttribute("datetime") : "";
            
            // Get text
            const textEl = article.querySelector('[data-testid="tweetText"]');
            const text = textEl ? textEl.textContent : "";
            
            // Get engagement
            const replyBtn = article.querySelector('[data-testid="reply"]');
            const replyText = replyBtn ? replyBtn.getAttribute("aria-label") : "";
            const replies = replyText.match(/(\\d+)/) ? parseInt(replyText.match(/(\\d+)/)[1]) : 0;
            
            const repostBtn = article.querySelector('[data-testid="retweet"]');
            const repostText = repostBtn ? repostBtn.getAttribute("aria-label") : "";
            const reposts = repostText.match(/(\\d+)/) ? parseInt(repostText.match(/(\\d+)/)[1]) : 0;
            
            const likeBtn = article.querySelector('[data-testid="like"]');
            const likeText = likeBtn ? likeBtn.getAttribute("aria-label") : "";
            const likes = likeText.match(/(\\d+)/) ? parseInt(likeText.match(/(\\d+)/)[1]) : 0;
            
            // Get views
            const viewSpan = article.querySelector('[data-testid="views"]');
            const viewsText = viewSpan ? viewSpan.textContent : "0";
            const views = viewsText.includes('K') ? 
                parseInt(parseFloat(viewsText) * 1000) : 
                parseInt(viewsText.replace(',', '') || "0");
            
            posts.push({
                author: author,
                handle: handle,
                date: date,
                text: text.substring(0, 500),
                replies: replies,
                reposts: reposts,
                likes: likes,
                views: views,
                url: url
            });
        } catch (e) {
            // Skip malformed posts
        }
    });
    
    JSON.stringify(posts);
    '''
    
    # Run browser evaluate
    result = subprocess.run(
        ['openclaw', 'browser', 'evaluate', '--fn', js_code],
        capture_output=True,
        text=True,
        timeout=30
    )
    
    if result.returncode != 0:
        print(f"Error extracting posts: {result.stderr}")
        return []
    
    # Parse the output to extract JSON
    output = result.stdout
    
    # Find JSON in output (might have warnings before it)
    json_match = re.search(r'\[.*\]', output, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            return []
    
    return []

def scroll_and_extract():
    """Scroll page and extract all posts"""
    all_posts = []
    seen_urls = set()
    
    # Extract initial posts
    posts = extract_posts_from_page()
    for post in posts:
        if post['url'] not in seen_urls:
            all_posts.append(post)
            seen_urls.add(post['url'])
    
    print(f"Found {len(posts)} initial posts")
    
    # Scroll multiple times to load more
    for i in range(5):
        print(f"Scrolling... ({i+1}/5)")
        subprocess.run(['openclaw', 'browser', 'press', 'End'], timeout=15)
        subprocess.run(['sleep', '2'], shell=True)
        
        posts = extract_posts_from_page()
        new_count = 0
        for post in posts:
            if post['url'] not in seen_urls:
                all_posts.append(post)
                seen_urls.add(post['url'])
                new_count += 1
        
        print(f"  Found {new_count} new posts (total: {len(all_posts)})")
        
        if new_count == 0:
            print("No new posts, stopping")
            break
    
    return all_posts

def save_posts_to_db(posts, search_query):
    """Save posts to SQLite database"""
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
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('likes', 0),
                post.get('views', 0),
                post.get('url', ''),
                search_query
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return inserted

def generate_report(posts1, posts2, high_engagement):
    """Generate markdown report"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(REPORT_PATH, 'w') as f:
        f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
        f.write(f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        
        f.write(f"## Summary\n\n")
        f.write(f"- **Search 1 (Neurointervention/Stroke):** {len(posts1)} posts\n")
        f.write(f"- **Search 2 (AVM/Aneurysm/Endovascular):** {len(posts2)} posts\n")
        f.write(f"- **Total new posts:** {len(posts1) + len(posts2)}\n")
        f.write(f"- **High-engagement posts (>50 likes):** {len(high_engagement)}\n\n")
        
        if high_engagement:
            f.write(f"## High-Engagement Posts\n\n")
            for post in high_engagement:
                f.write(f"### {post.get('author', 'Unknown')} {post.get('handle', '')}\n\n")
                f.write(f"**Date:** {post.get('date', 'Unknown')}\n\n")
                f.write(f"**Text:**\n{post.get('text', '')}\n\n")
                f.write(f"**Engagement:** {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('replies', 0)} replies, {post.get('views', 0)} views\n\n")
                f.write(f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n")
                f.write(f"---\n\n")
        
        f.write(f"## All Posts - Search 1 (Neurointervention/Stroke)\n\n")
        for post in posts1:
            f.write(f"- **{post.get('author', 'Unknown')}** {post.get('handle', '')}: {post.get('text', '')[:100]}...\n")
            f.write(f"  - {post.get('likes', 0)} likes, {post.get('url', '')}\n\n")
        
        f.write(f"\n## All Posts - Search 2 (AVM/Aneurysm/Endovascular)\n\n")
        for post in posts2:
            f.write(f"- **{post.get('author', 'Unknown')}** {post.get('handle', '')}: {post.get('text', '')[:100]}...\n")
            f.write(f"  - {post.get('likes', 0)} likes, {post.get('url', '')}\n\n")

def main():
    print("Initializing database...")
    init_database()
    
    all_posts_1 = []
    all_posts_2 = []
    
    # Scrape first search
    print(f"\n{'='*60}")
    print(f"Navigating to Search 1: Neurointervention/Stroke")
    print(f"{'='*60}\n")
    
    subprocess.run([
        'openclaw', 'browser', 'navigate',
        'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today'
    ], timeout=30)
    
    subprocess.run(['sleep', '3'], shell=True)
    
    all_posts_1 = scroll_and_extract()
    print(f"\nTotal posts from Search 1: {len(all_posts_1)}")
    
    # Save to database
    inserted = save_posts_to_db(all_posts_1, "neurointervention")
    print(f"Inserted {inserted} new posts to database")
    
    # Scrape second search
    print(f"\n{'='*60}")
    print(f"Navigating to Search 2: AVM/Aneurysm/Endovascular")
    print(f"{'='*60}\n")
    
    subprocess.run([
        'openclaw', 'browser', 'navigate',
        'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today'
    ], timeout=30)
    
    subprocess.run(['sleep', '3'], shell=True)
    
    all_posts_2 = scroll_and_extract()
    print(f"\nTotal posts from Search 2: {len(all_posts_2)}")
    
    # Save to database
    inserted = save_posts_to_db(all_posts_2, "avm_aneurysm")
    print(f"Inserted {inserted} new posts to database")
    
    # Find high engagement posts
    all_posts = all_posts_1 + all_posts_2
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    high_engagement.sort(key=lambda x: x.get('likes', 0), reverse=True)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Search 1: {len(all_posts_1)} posts")
    print(f"Search 2: {len(all_posts_2)} posts")
    print(f"Total: {len(all_posts)} posts")
    print(f"High-engagement (>50 likes): {len(high_engagement)} posts")
    
    # Generate report
    print(f"\nGenerating report...")
    generate_report(all_posts_1, all_posts_2, high_engagement)
    print(f"Report saved to: {REPORT_PATH}")
    
    # Print high engagement posts
    if high_engagement:
        print(f"\n{'='*60}")
        print(f"HIGH-ENGAGEMENT POSTS (>50 likes)")
        print(f"{'='*60}\n")
        for post in high_engagement[:5]:  # Show top 5
            print(f"- {post.get('author', 'Unknown')} ({post.get('likes', 0)} likes)")
            print(f"  {post.get('text', '')[:100]}...")
            print()

if __name__ == "__main__":
    main()