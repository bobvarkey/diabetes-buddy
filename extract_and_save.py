#!/usr/bin/env python3
"""
Extract posts from browser snapshot and save to database
"""

import sys
import re
import json
from datetime import datetime
from pathlib import Path

# Add the workspace to path
sys.path.insert(0, '/Users/bobvarkey/.openclaw/workspace')
from x_scraper import init_db, insert_post, append_markdown

def parse_engagement(text):
    """Parse engagement metrics from text like '2 replies, 6 reposts, 23 likes, 7 bookmarks, 4229 views'"""
    metrics = {
        'replies': 0,
        'reposts': 0,
        'likes': 0,
        'views': 0
    }
    
    # Extract numbers before each metric
    replies_match = re.search(r'(\d+)\s+repl', text, re.IGNORECASE)
    if replies_match:
        metrics['replies'] = int(replies_match.group(1))
    
    reposts_match = re.search(r'(\d+)\s+repost', text, re.IGNORECASE)
    if reposts_match:
        metrics['reposts'] = int(reposts_match.group(1))
    
    likes_match = re.search(r'(\d+)\s+like', text, re.IGNORECASE)
    if likes_match:
        metrics['likes'] = int(likes_match.group(1))
    
    views_match = re.search(r'(\d+\.?\d*[Kk]?)\s+view', text, re.IGNORECASE)
    if views_match:
        view_str = views_match.group(1)
        if 'K' in view_str or 'k' in view_str:
            metrics['views'] = int(float(view_str.replace('K', '').replace('k', '')) * 1000)
        else:
            metrics['views'] = int(view_str)
    
    return metrics

def extract_posts_from_snapshot(snapshot_text, search_query):
    """Extract posts from aria snapshot text"""
    posts = []
    
    # Find all article sections
    article_pattern = r'article "([^"]+)"'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        try:
            # Parse article metadata
            # Format: "Author @handle date text ... metrics"
            
            # Extract author (first part before @)
            author_match = re.match(r'^([^\@]+)', article_text)
            author = author_match.group(1).strip() if author_match else "Unknown"
            
            # Extract handle
            handle_match = re.search(r'@(\w+)', article_text)
            handle = handle_match.group(1) if handle_match else "unknown"
            
            # Extract date/time - look for patterns like "Jun 12" or "3 hours ago" or "3h"
            date_match = re.search(r'(?:@[\w]+\s+)?(\w+ \d+|\d+[hmd]|today|\d+ hours? ago|\d+ days? ago)', article_text)
            post_date = date_match.group(1) if date_match else "Unknown"
            
            # Extract URL - look for /status/ pattern
            url_match = re.search(r'/([@\w]+)/status/(\d+)', article_text)
            if url_match:
                url = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
            else:
                url = f"https://x.com/{handle}"
            
            # Extract engagement from the end of the article
            engagement_match = re.search(r'(\d+\s+repl[^"]+|\d+\s+like[^"]+|\d+\s+repost[^"]+|\d+\s+view[^"]+)$', article_text, re.IGNORECASE)
            engagement_text = engagement_match.group(1) if engagement_match else ""
            
            # Parse engagement metrics
            metrics = parse_engagement(engagement_text)
            
            # Extract text - everything between handle/date and metrics
            # Remove the engagement part from the text
            text = article_text
            # Remove author and handle prefix
            text = re.sub(r'^[^\@]+\@\w+\s+', '', text)
            # Remove date
            text = re.sub(r'^(\w+ \d+|\d+[hmd]|today|\d+ hours? ago|\d+ days? ago)\s+', '', text)
            # Remove engagement metrics from end
            text = re.sub(r'\s*\d+\s+(replies|reposts|likes|bookmarks|views).*$', '', text, flags=re.IGNORECASE)
            
            # Clean up text
            text = text.strip()
            # Remove common UI elements
            text = re.sub(r'\s*(Embedded video|Play Video)\s*', ' ', text)
            # Limit length
            text = text[:500]
            
            # Create post dict
            post = {
                'author': author,
                'handle': handle,
                'post_date': post_date,
                'text': text,
                'likes': metrics['likes'],
                'reposts': metrics['reposts'],
                'replies': metrics['replies'],
                'views': metrics['views'],
                'url': url,
                'scrape_date': datetime.now().strftime('%Y-%m-%d'),
                'search_query': search_query
            }
            
            posts.append(post)
            print(f"Extracted: {author} (@{handle}) - {text[:50]}...", file=sys.stderr)
            
        except Exception as e:
            print(f"Error parsing article: {e}", file=sys.stderr)
            continue
    
    return posts

if __name__ == "__main__":
    # Read snapshot from stdin or file
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            snapshot_text = f.read()
        search_query = sys.argv[2] if len(sys.argv) > 2 else "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    else:
        snapshot_text = sys.stdin.read()
        search_query = "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    
    # Extract posts
    posts = extract_posts_from_snapshot(snapshot_text, search_query)
    
    # Save to database
    conn = init_db()
    new_posts = 0
    for post in posts:
        if insert_post(conn, post):
            new_posts += 1
    
    # Append to markdown
    if posts:
        append_markdown(posts, search_query)
    
    conn.close()
    
    # Output summary
    print(json.dumps({
        'total_posts': len(posts),
        'new_posts': new_posts,
        'high_engagement': len([p for p in posts if p.get('likes', 0) > 50])
    }))