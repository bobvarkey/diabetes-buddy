#!/usr/bin/env python3
"""
Extract X/Twitter posts from aria snapshots with better post detection.
"""
import re
import os
from pathlib import Path

def extract_posts_from_aria(filepath):
    """Extract posts from aria snapshot with better parsing."""
    with open(filepath, 'r') as f:
        content = f.read()
    
    posts = []
    
    # Find all article elements in the aria tree
    # Pattern: article "POST_TITLE_TEXT"
    # Articles appear as: - article "..."
    article_pattern = r'- article "([^"]+)"'
    matches = re.findall(article_pattern, content)
    
    for match in matches:
        # Each match is the full text content of an article
        # Parse it to extract fields
        post = {}
        
        # Try to extract structured data
        text = match
        
        # The format is typically: "Author Name [@handle] Date PostText Metrics"
        # But X's aria format can vary
        
        # Extract @handle
        handle_match = re.search(r'@(\w+)', text)
        if handle_match:
            post['handle'] = '@' + handle_match.group(1)
        
        # Author is typically before the handle
        if post.get('handle'):
            author_match = re.search(r'^(.+?)\s*(?:Verified account\s+)?@' + post['handle'][1:], text)
            if author_match:
                post['author'] = author_match.group(1).strip()
        
        # Extract metrics - X uses format: "X replies, Y reposts, Z likes, W views"
        metrics_match = re.search(r'(\d+)\s+repl(?:y|ies).*?(\d+)\s+reposts?.*?(\d+)\s+likes?.*?(\d+)\s+views?', text)
        if metrics_match:
            post['replies'] = metrics_match.group(1)
            post['reposts'] = metrics_match.group(2)
            post['likes'] = metrics_match.group(3)
            post['views'] = metrics_match.group(4)
        
        # Find date pattern
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
        
        # The remaining text after removing known fields is the post content
        # This is approximate
        post['text'] = text[:500]  # Store first 500 chars
        
        posts.append(post)
    
    return posts

def main():
    # Process all captured aria files
    files = [
        '/tmp/x_search1_aria.txt',
        '/tmp/x_search2_aria.txt',
        '/tmp/x_search1_extended.txt',
        '/tmp/x_search2_extended.txt',
        '/tmp/x_search1_full.txt',
        '/tmp/x_search1_final.txt',
    ]
    
    all_posts = []
    seen = set()
    
    for filepath in files:
        if os.path.exists(filepath):
            posts = extract_posts_from_aria(filepath)
            print(f"{filepath}: {len(posts)} articles")
            for post in posts:
                key = post.get('handle', '') + post.get('text', '')[:50]
                if key not in seen:
                    seen.add(key)
                    all_posts.append(post)
    
    print(f"\n✅ Total unique posts found: {len(all_posts)}")
    
    for post in all_posts:
        print(f"\n📝 {post.get('author', 'Unknown')} {post.get('handle', '@unknown')}")
        print(f"   Date: {post.get('date', 'N/A')}")
        print(f"   Text: {post.get('text', '')[:100]}...")
        if post.get('likes'):
            print(f"   ❤️ {post.get('likes')} likes")

if __name__ == '__main__':
    main()