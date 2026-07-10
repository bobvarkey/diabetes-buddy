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
    
    # Find all article elements in the snapshot
    # Pattern: article "Author Name @handle date text ... metrics"
    
    # Split by articles
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot)
    
    for article_text in articles:
        post = {}
        
        # Skip if not a real post (missing key indicators)
        if 'replies' not in article_text.lower() and 'likes' not in article_text.lower():
            continue
        
        # Extract author and handle
        # Pattern: "Author Name Verified account @handle" or "Author Name @handle"
        author_match = re.search(r'^([^(]+?)\s+(?:Verified account\s+)?(@\w+)', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
            post['handle'] = author_match.group(2)
        else:
            # Try alternate pattern
            parts = article_text.split('·')
            if len(parts) > 0:
                first_part = parts[0].strip()
                # Extract handle
                handle_match = re.search(r'(@\w+)', first_part)
                if handle_match:
                    post['handle'] = handle_match.group(1)
                    # Author is before handle
                    author = first_part.replace(handle_match.group(1), '').replace('Verified account', '').strip()
                    post['author'] = author if author else 'Unknown'
        
        # Extract date
        # Pattern: "Dec 14, 2022" or "2h" or "5m"
        date_match = re.search(r'(?:·\s*)?(\w{3,9}\s+\d{1,2},?\s+\d{4}|\d+[hm])', article_text)
        if date_match:
            post['date'] = date_match.group(1).strip()
        
        # Extract engagement metrics
        # Pattern: "X replies, Y reposts, Z likes"
        likes_match = re.search(r'(\d+)\s+likes?', article_text, re.IGNORECASE)
        post['likes'] = likes_match.group(1) if likes_match else '0'
        
        replies_match = re.search(r'(\d+)\s+replies?', article_text, re.IGNORECASE)
        post['replies'] = replies_match.group(1) if replies_match else '0'
        
        reposts_match = re.search(r'(\d+)\s+reposts?', article_text, re.IGNORECASE)
        post['reposts'] = reposts_match.group(1) if reposts_match else '0'
        
        views_match = re.search(r'([\d.]+[KM]?)\s+views?', article_text, re.IGNORECASE)
        post['views'] = views_match.group(1) if views_match else '0'
        
        # Extract text - everything between date and metrics
        # This is tricky because the snapshot has aria labels
        # Let's try to extract the main content
        text_match = re.search(r'\d{4}|\d+[hm]\s+(.+?)\s+\d+\s+replies', article_text, re.DOTALL)
        if not text_match:
            # Try without replies requirement
            text_match = re.search(r'\d{4}|\d+[hm]\s+(.+?)\s+\d+\s+likes', article_text, re.DOTALL)
        
        if text_match:
            post['text'] = text_match.group(1).strip()
        else:
            # Fallback: extract text after handle
            text_parts = article_text.split('·')
            if len(text_parts) >= 2:
                # Text is usually in the second or third part
                for part in text_parts[1:]:
                    if 'replies' not in part and 'likes' not in part and 'reposts' not in part and len(part) > 20:
                        post['text'] = part.strip()
                        break
        
        # URL is constructed from the status ID
        # We'll need to extract from snapshot separately
        post['url'] = ''
        post['search_query'] = search_query
        
        if post.get('author') and post.get('text'):
            posts.append(post)
    
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
    
    posts1 = parse_snapshot(snapshot1, 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
    print(f"Found {len(posts1)} posts in first search")
    
    # Navigate to second URL
    url2 = "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today"
    
    print(f"\nNavigating to: {url2}")
    subprocess.run(['openclaw', 'browser', 'navigate', url2], capture_output=True)
    
    time.sleep(3)
    
    print("Getting snapshot for second search...")
    snapshot2 = get_snapshot()
    
    posts2 = parse_snapshot(snapshot2, 'cerebral AVM OR intracranial aneurysm OR endovascular')
    print(f"Found {len(posts2)} posts in second search")
    
    all_posts = posts1 + posts2
    
    # Save to database
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_count = 0
    for post in all_posts:
        # Parse engagement numbers
        likes = int(post.get('likes', '0').replace('K', '000').replace('M', '000000'))
        replies = int(post.get('replies', '0'))
        reposts = int(post.get('reposts', '0'))
        
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
    
    print(f"\nTotal posts: {len(all_posts)}")
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
    high_eng = [(p, int(p.get('likes', '0'))) for p in posts if int(p.get('likes', '0').replace('K', '000').replace('M', '000000')) > 50]
    high_eng.sort(key=lambda x: x[1], reverse=True)
    
    if high_eng:
        report += f"## High Engagement Posts (>50 likes): {len(high_eng)}\n\n"
        
        for post, likes in high_eng:
            report += f"### {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})\n\n"
            report += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            report += f"**Text:**\n```\n{post.get('text', '')}\n```\n\n"
            report += f"**Engagement:** {likes} likes, {post.get('replies', '0')} replies, {post.get('reposts', '0')} reposts\n\n"
            report += f"**URL:** {post.get('url', 'N/A')}\n\n"
            report += f"**Search Query:** {post.get('search_query', '')}\n\n"
            report += "---\n\n"
    
    return report

if __name__ == '__main__':
    main()