#!/usr/bin/env python3
"""
Extract X/Twitter posts from browser snapshot by parsing aria tree
"""

import subprocess
import sqlite3
from datetime import datetime
from pathlib import Path
import re

def get_snapshot():
    """Get browser snapshot"""
    result = subprocess.run(
        ['openclaw', 'browser', 'snapshot'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
        return ""
    
    return result.stdout

def parse_snapshot(snapshot, search_query):
    """Parse posts from snapshot aria tree"""
    posts = []
    
    # Find all article elements
    # Pattern: article "Author Verified account @handle time text metrics"
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot)
    
    print(f"Found {len(articles)} articles in snapshot")
    
    for article_text in articles:
        post = {}
        
        # Skip navigation articles
        if 'Timeline' in article_text or 'keyboard shortcuts' in article_text:
            continue
        
        # Extract author name (before "Verified account" or before @handle)
        author_match = re.match(r'^([^(]+?)(?:\s+Verified account)?\s+(@\w+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = author_match.group(2)
        else:
            # Try alternate pattern
            parts = article_text.split('@')
            if len(parts) > 0:
                post['author'] = parts[0].replace('Verified account', '').strip()
                handle_match = re.search(r'(@\w+)', article_text)
                post['handle'] = handle_match.group(1) if handle_match else '@unknown'
        
        # Extract date/time
        time_match = re.search(r'(\d+\s*(?:hours?|minutes?|days?|h|m)\s+ago|\w{3,9}\s+\d{1,2},?\s+\d{4})', article_text, re.IGNORECASE)
        if time_match:
            post['date'] = time_match.group(1)
        else:
            # Try to find any time indicator
            time_match = re.search(r'(\d+[hms]|\d+\s*[hms])', article_text)
            if time_match:
                post['date'] = time_match.group(1)
        
        # Extract engagement metrics
        likes_match = re.search(r'(\d+)\s+likes?', article_text, re.IGNORECASE)
        post['likes'] = likes_match.group(1) if likes_match else '0'
        
        replies_match = re.search(r'(\d+)\s+replies?', article_text, re.IGNORECASE)
        post['replies'] = replies_match.group(1) if replies_match else '0'
        
        reposts_match = re.search(r'(\d+)\s+reposts?', article_text, re.IGNORECASE)
        post['reposts'] = reposts_match.group(1) if reposts_match else '0'
        
        views_match = re.search(r'([\d.]+[KM]?)\s+views?', article_text, re.IGNORECASE)
        post['views'] = views_match.group(1) if views_match else '0'
        
        # Extract text - everything between handle/time and engagement metrics
        # Look for text after the handle and before metrics
        text_patterns = [
            # Pattern: "@handle time text metrics"
            r'@\w+\s+(?:·\s+)?(?:\d+\s*[hms]|\d+\s*hours?\s+ago|\w{3,9}\s+\d{1,2},?\s+\d{4})\s+(.+?)(?:\d+\s+replies|\d+\s+likes|\d+\s+views)',
            # Pattern: "Replying to @handle text metrics"
            r'Replying to\s+@\w+\s+(.+?)(?:\d+\s+replies|\d+\s+likes|\d+\s+views)',
            # Fallback: text after time
            r'(?:\d+[hms]|\d+\s*hours?\s+ago)\s+(.+?)\s+(?:\d+\s+replies|\d+\s+likes)',
        ]
        
        for pattern in text_patterns:
            text_match = re.search(pattern, article_text, re.DOTALL)
            if text_match:
                # Clean up the text
                text = text_match.group(1).strip()
                # Remove "Show more" and similar UI elements
                text = re.sub(r'Show more.*$', '', text, flags=re.IGNORECASE)
                text = re.sub(r'Replying to\s+@\w+\s*', '', text)
                post['text'] = text[:500]  # Limit to 500 chars
                break
        
        # If still no text, use a simple heuristic
        if 'text' not in post:
            # Find the longest part after the handle
            parts = article_text.split('·')
            if len(parts) > 1:
                # Text is typically after the metadata
                text_candidate = ' '.join(parts[1:])
                # Remove metrics
                text_candidate = re.sub(r'\d+\s+(?:replies|likes|reposts|views|bookmarks).*$', '', text_candidate, flags=re.IGNORECASE)
                post['text'] = text_candidate.strip()[:500]
        
        # Extract URL from article text or construct from status ID
        url_match = re.search(r'/status/(\d+)', article_text)
        if url_match:
            handle_clean = post.get('handle', '@unknown').replace('@', '')
            post['url'] = f"https://x.com/{handle_clean}/status/{url_match.group(1)}"
        else:
            post['url'] = ''
        
        post['search_query'] = search_query
        
        # Only add if we have author and text
        if post.get('author') and post.get('text') and len(post.get('text', '')) > 10:
            posts.append(post)
            print(f"  Extracted: {post.get('author')} - {post.get('text')[:50]}...")
    
    return posts

def main():
    # Navigate to first URL
    url1 = "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today"
    
    print(f"Navigating to: {url1}")
    subprocess.run(['openclaw', 'browser', 'navigate', url1], capture_output=True)
    
    import time
    time.sleep(3)
    
    print("Getting snapshot for first search...")
    snapshot1 = get_snapshot()
    
    with open('/tmp/snapshot1_debug.txt', 'w') as f:
        f.write(snapshot1)
    
    posts1 = parse_snapshot(snapshot1, 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
    print(f"Found {len(posts1)} posts in first search\n")
    
    # Navigate to second URL
    url2 = "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"
    
    print(f"Navigating to: {url2}")
    subprocess.run(['openclaw', 'browser', 'navigate', url2], capture_output=True)
    
    time.sleep(3)
    
    print("Getting snapshot for second search...")
    snapshot2 = get_snapshot()
    
    with open('/tmp/snapshot2_debug.txt', 'w') as f:
        f.write(snapshot2)
    
    posts2 = parse_snapshot(snapshot2, 'cerebral AVM OR intracranial aneurysm OR endovascular')
    print(f"Found {len(posts2)} posts in second search\n")
    
    all_posts = posts1 + posts2
    
    # Save to database
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_count = 0
    for post in all_posts:
        # Parse engagement numbers
        likes_str = post.get('likes', '0')
        if 'K' in likes_str:
            likes = int(float(likes_str.replace('K', '').replace(',', '')) * 1000)
        elif 'M' in likes_str:
            likes = int(float(likes_str.replace('M', '').replace(',', '')) * 1000000)
        else:
            likes = int(likes_str.replace(',', '')) if likes_str.replace(',', '').isdigit() else 0
        
        replies = int(post.get('replies', '0').replace(',', '')) if post.get('replies', '0').replace(',', '').isdigit() else 0
        reposts = int(post.get('reposts', '0').replace(',', '')) if post.get('reposts', '0').replace(',', '').isdigit() else 0
        
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', 'Unknown'),
                post.get('handle', '@unknown'),
                post.get('date', ''),
                post.get('text', ''),
                likes,
                replies,
                reposts,
                post.get('views', '0'),
                post.get('url', ''),
                post.get('search_query', ''),
                datetime.now().isoformat()
            ))
            
            if cursor.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Error inserting: {e}")
    
    conn.commit()
    conn.close()
    
    print(f"Total posts: {len(all_posts)}")
    print(f"New posts added: {new_count}")
    
    # Generate report
    report = generate_report(all_posts, new_count)
    
    report_path = Path(f'/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-{datetime.now().strftime("%Y-%m-%d")}.md')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"\nReport saved to: {report_path}")

def generate_report(posts, new_count):
    """Generate markdown report"""
    report = f"""# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d')}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Total posts scraped:** {len(posts)}

**New posts added to database:** {new_count}

---

## Summary

"""
    
    queries = {}
    for post in posts:
        q = post.get('search_query', 'Unknown')
        queries[q] = queries.get(q, 0) + 1
    
    for query, count in queries.items():
        report += f"- **Search Query:** {query}\n"
        report += f"  - Posts found: {count}\n\n"
    
    # High engagement
    high_eng = []
    for p in posts:
        likes_str = p.get('likes', '0')
        if 'K' in likes_str:
            likes = int(float(likes_str.replace('K', '').replace(',', '')) * 1000)
        elif 'M' in likes_str:
            likes = int(float(likes_str.replace('M', '').replace(',', '')) * 1000000)
        else:
            likes = int(likes_str.replace(',', '')) if likes_str.replace(',', '').isdigit() else 0
        
        if likes > 50:
            high_eng.append((p, likes))
    
    high_eng.sort(key=lambda x: x[1], reverse=True)
    
    if high_eng:
        report += f"## High Engagement Posts (>50 likes): {len(high_eng)}\n\n"
        
        for post, likes in high_eng:
            report += f"### {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})\n\n"
            report += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            report += f"**Text:**\n```\n{post.get('text', '')}\n```\n\n"
            report += f"**Engagement:** {likes} likes, {post.get('replies', '0')} replies, {post.get('reposts', '0')} reposts\n\n"
            if post.get('url'):
                report += f"**URL:** [{post.get('url')}]({post.get('url')})\n\n"
            report += f"**Search Query:** {post.get('search_query', '')}\n\n"
            report += "---\n\n"
    
    return report

if __name__ == '__main__':
    main()