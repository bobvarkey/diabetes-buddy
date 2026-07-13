#!/usr/bin/env python3
"""Helper script to extract X posts from browser snapshot text"""

import re
import json
from datetime import datetime
from typing import List, Dict

def extract_posts_from_snapshot(snapshot_text: str, url: str) -> List[Dict]:
    """Extract post data from browser snapshot text"""
    posts = []
    
    # Look for tweet patterns in the snapshot
    # X/Twitter uses various aria-labels and structures
    
    # Pattern for tweet articles
    lines = snapshot_text.split('\n')
    
    current_post = {}
    in_post = False
    
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Detect post boundaries
        if 'tweet' in line.lower() or 'post' in line.lower():
            if current_post and 'text' in current_post:
                posts.append(current_post)
            current_post = {}
            in_post = True
        
        # Extract author info
        if in_post:
            # Look for @handle patterns
            handle_match = re.search(r'@[\w]+', line)
            if handle_match and 'handle' not in current_post:
                current_post['handle'] = handle_match.group(0)
            
            # Look for engagement metrics
            if any(metric in line.lower() for metric in ['like', 'repost', 'reply', 'view']):
                numbers = re.findall(r'[\d,]+', line)
                if numbers:
                    metric_type = 'likes' if 'like' in line.lower() else \
                                'reposts' if 'repost' in line.lower() else \
                                'replies' if 'reply' in line.lower() else \
                                'views' if 'view' in line.lower() else None
                    if metric_type:
                        current_post[metric_type] = numbers[0].replace(',', '')
            
            # Look for timestamp
            time_patterns = [
                r'\d{1,2}[hm]',  # 2h, 15m
                r'\d{1,2}\s*(?:hour|minute|second)s?',
                r'(?:today|yesterday)',
            ]
            for pattern in time_patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    current_post['timestamp'] = line
                    break
            
            # Accumulate text content
            if 'text' not in current_post:
                current_post['text'] = line
            else:
                current_post['text'] += ' ' + line
    
    # Don't forget the last post
    if current_post and 'text' in current_post:
        posts.append(current_post)
    
    # Add URL and scrape time
    for post in posts:
        post['scrape_url'] = url
        post['scrape_time'] = datetime.now().isoformat()
    
    return posts

def format_posts_for_markdown(posts: List[Dict]) -> str:
    """Format posts for markdown output"""
    md_lines = []
    md_lines.append(f"## X Scrape - {datetime.now().strftime('%Y-%m-%d %H:%M')}\n")
    
    for i, post in enumerate(posts, 1):
        md_lines.append(f"### Post {i}")
        if 'handle' in post:
            md_lines.append(f"**Handle:** {post['handle']}")
        if 'timestamp' in post:
            md_lines.append(f"**Time:** {post['timestamp']}")
        if 'text' in post:
            md_lines.append(f"**Text:** {post['text'][:500]}...")  # Truncate long posts
        if 'likes' in post:
            md_lines.append(f"**Likes:** {post['likes']}")
        if 'reposts' in post:
            md_lines.append(f"**Reposts:** {post['reposts']}")
        md_lines.append("")  # Blank line between posts
    
    return '\n'.join(md_lines)

if __name__ == "__main__":
    import sys
    import sqlite3
    import os
    
    # Read snapshot from stdin
    snapshot = sys.stdin.read()
    
    # Extract posts
    posts = extract_posts_from_snapshot(snapshot, sys.argv[1] if len(sys.argv) > 1 else "unknown")
    
    # Output as JSON
    print(json.dumps(posts, indent=2))