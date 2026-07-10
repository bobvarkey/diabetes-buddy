#!/usr/bin/env python3
"""
Extract X/Twitter posts from browser snapshot
"""

import subprocess
import re
import sqlite3
from datetime import datetime
from pathlib import Path

def extract_from_snapshot():
    """Extract posts from browser snapshot"""
    result = subprocess.run(
        ['openclaw', 'browser', 'snapshot'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Error getting snapshot: {result.stderr}")
        return []
    
    snapshot = result.stdout
    
    posts = []
    
    # Parse the snapshot for article elements
    # Pattern: article "..." contains the post data
    article_pattern = r'article "([^"]*?)"\s+\[ref=([^\]]+)\]'
    
    articles = re.findall(article_pattern, snapshot)
    
    for article_text, ref in articles:
        # Extract author, handle, date, text from article_text
        # Pattern: "Author Name Verified account @handle date text..."
        post = {}
        
        # Try to extract author name (usually first text before "Verified account")
        author_match = re.search(r'^([^"]+?)\s+(?:Verified account\s+)?@(\w+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = '@' + author_match.group(2)
        else:
            # Alternative: look for patterns
            parts = article_text.split('·')
            if len(parts) >= 2:
                # First part has author
                author_part = parts[0].strip()
                post['author'] = author_part.split()[0] if author_part else 'Unknown'
        
        # Extract handle (@handle)
        handle_match = re.search(r'@(\w+)', article_text)
        if handle_match:
            post['handle'] = '@' + handle_match.group(1)
        
        # Extract date
        date_patterns = [
            r'(\w+ \d{1,2}, \d{4})',  # "Dec 14, 2022"
            r'(\d{1,2}h)',  # "2h" for hours
            r'(\d{1,2}m)',  # "5m" for minutes
            r'(\d+s)',  # "30s" for seconds
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, article_text)
            if date_match:
                post['date'] = date_match.group(1)
                break
        
        # Extract text - everything after handle and date until engagement metrics
        # Look for text between the handle/date and "replies" or other metrics
        text_match = re.search(r'@\w+\s+·\s+(?:\w+ \d{1,2}, \d{4}|\d+[hm]?)\s+(.+?)(?:\d+\s+replies|\d+\s+reposts|\d+\s+likes|$)', article_text, re.DOTALL)
        if text_match:
            post['text'] = text_match.group(1).strip()
        
        # Extract engagement metrics
        # Likes
        likes_match = re.search(r'(\d+)\s+likes?', article_text, re.IGNORECASE)
        if likes_match:
            post['likes'] = likes_match.group(1)
        else:
            post['likes'] = '0'
        
        # Replies
        replies_match = re.search(r'(\d+)\s+replies?', article_text, re.IGNORECASE)
        if replies_match:
            post['replies'] = replies_match.group(1)
        else:
            post['replies'] = '0'
        
        # Reposts
        reposts_match = re.search(r'(\d+)\s+reposts?', article_text, re.IGNORECASE)
        if reposts_match:
            post['reposts'] = reposts_match.group(1)
        else:
            post['reposts'] = '0'
        
        # Views
        views_match = re.search(r'([\d.]+[KM]?)\s+views?', article_text, re.IGNORECASE)
        if views_match:
            post['views'] = views_match.group(1)
        else:
            post['views'] = '0'
        
        # Extract URL from ref
        # Find the status URL
        url_match = re.search(r'/status/(\d+)', snapshot)
        if url_match:
            post['url'] = f"https://x.com/status/{url_match.group(1)}"
        
        if post.get('author') and post.get('text'):
            posts.append(post)
    
    return posts

def parse_engagement_number(text):
    """Parse engagement numbers like '102', '12.5K', '7.9K'"""
    if not text:
        return 0
    
    text = str(text).strip().upper()
    
    if 'K' in text:
        num = text.replace('K', '').replace(',', '').strip()
        try:
            return int(float(num) * 1000)
        except:
            return 0
    elif 'M' in text:
        num = text.replace('M', '').replace(',', '').strip()
        try:
            return int(float(num) * 1000000)
        except:
            return 0
    else:
        try:
            return int(text.replace(',', ''))
        except:
            return 0

def save_to_database(posts, search_query):
    """Save posts to SQLite database"""
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_posts = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                parse_engagement_number(post.get('likes', '0')),
                parse_engagement_number(post.get('replies', '0')),
                parse_engagement_number(post.get('reposts', '0')),
                parse_engagement_number(post.get('views', '0')),
                post.get('url', ''),
                search_query,
                datetime.now().isoformat()
            ))
            
            if cursor.rowcount > 0:
                new_posts += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return new_posts

def main():
    # Navigate to first search URL
    url1 = "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today"
    
    print("Navigating to first search URL...")
    result = subprocess.run(
        ['openclaw', 'browser', 'navigate', url1],
        capture_output=True,
        text=True
    )
    
    import time
    time.sleep(3)
    
    print("Extracting posts from first search...")
    posts1 = extract_from_snapshot()
    
    for post in posts1:
        post['search_query'] = 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    
    print(f"Found {len(posts1)} posts in first search")
    
    # Navigate to second search URL
    url2 = "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"
    
    print("\nNavigating to second search URL...")
    result = subprocess.run(
        ['openclaw', 'browser', 'navigate', url2],
        capture_output=True,
        text=True
    )
    
    time.sleep(3)
    
    print("Extracting posts from second search...")
    posts2 = extract_from_snapshot()
    
    for post in posts2:
        post['search_query'] = 'cerebral AVM OR intracranial aneurysm OR endovascular'
    
    print(f"Found {len(posts2)} posts in second search")
    
    all_posts = posts1 + posts2
    
    # Save to database
    total_new = 0
    for query in ['neurointervention OR thrombectomy OR #Neurointervention OR #stroke',
                  'cerebral AVM OR intracranial aneurysm OR endovascular']:
        query_posts = [p for p in all_posts if p.get('search_query') == query]
        new_count = save_to_database(query_posts, query)
        total_new += new_count
    
    print(f"\nTotal posts: {len(all_posts)}")
    print(f"New posts added: {total_new}")
    
    # Generate report
    report = generate_markdown_report(all_posts, total_new)
    
    # Save report
    report_path = Path(f'/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-{datetime.now().strftime("%Y-%m-%d")}.md')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"Report saved to: {report_path}")

def generate_markdown_report(posts, new_posts_count):
    """Generate markdown report"""
    report = f"""# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d')}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Total posts scraped:** {len(posts)}

**New posts added to database:** {new_posts_count}

---

## Summary

"""
    
    queries = {}
    for post in posts:
        query = post.get('search_query', 'Unknown')
        queries[query] = queries.get(query, 0) + 1
    
    for query, count in queries.items():
        report += f"- **Search Query:** {query}\n"
        report += f"  - Posts found: {count}\n\n"
    
    # Find high engagement posts
    high_engagement = []
    for post in posts:
        likes = parse_engagement_number(post.get('likes', '0'))
        if likes > 50:
            high_engagement.append((post, likes))
    
    high_engagement.sort(key=lambda x: x[1], reverse=True)
    
    if high_engagement:
        report += f"## High Engagement Posts (>50 likes): {len(high_engagement)}\n\n"
        
        for post, likes in high_engagement:
            report += f"### {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})\n\n"
            report += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            report += f"**Text:**\n```\n{post.get('text', '')}\n```\n\n"
            report += f"**Engagement:** {likes} likes, {post.get('replies', '0')} replies, {post.get('reposts', '0')} reposts, {post.get('views', '0')} views\n\n"
            report += f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n"
            report += f"**Search Query:** {post.get('search_query', '')}\n\n"
            report += "---\n\n"
    
    return report

if __name__ == '__main__':
    main()