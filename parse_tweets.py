#!/usr/bin/env python3
import re
import json

def parse_x_snapshot(snapshot_text):
    """Parse X/Twitter snapshot and extract post data."""
    posts = []
    
    # Extract all article lines
    article_matches = re.findall(r'article "([^"]+)"', snapshot_text)
    
    for article_text in article_matches:
        post = {}
        
        # Extract author
        author_match = re.search(r'^([^@]+?)\s+@', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract handle
        handle_match = re.search(r'@(\w+)', article_text)
        if handle_match:
            post['handle'] = handle_match.group(1)
        
        # Extract date
        date_match = re.search(r'@[\w]+\s+([A-Za-z]+\s+\d+)', article_text)
        if date_match:
            post['date'] = date_match.group(1)
        
        # Extract engagement metrics
        replies_match = re.search(r'(\d+)\s+replies', article_text)
        post['replies'] = int(replies_match.group(1)) if replies_match else 0
        
        reposts_match = re.search(r'(\d+)\s+reposts', article_text)
        post['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
        
        likes_match = re.search(r'(\d+)\s+likes', article_text)
        post['likes'] = int(likes_match.group(1)) if likes_match else 0
        
        bookmarks_match = re.search(r'(\d+)\s+bookmarks', article_text)
        post['bookmarks'] = int(bookmarks_match.group(1)) if bookmarks_match else 0
        
        views_match = re.search(r'(\d+(?:\.\d+)?[KkM]?)\s+views', article_text)
        if views_match:
            views_str = views_match.group(1)
            if 'K' in views_str or 'k' in views_str:
                post['views'] = int(float(views_str.replace('K', '').replace('k', '')) * 1000)
            elif 'M' in views_str:
                post['views'] = int(float(views_str.replace('M', '')) * 1000000)
            else:
                post['views'] = int(views_str)
        else:
            post['views'] = 0
        
        # Extract text content (from author to metrics)
        text_match = re.search(r'@\w+\s+[A-Za-z]+\s+\d+\s+(.+?)\s+\d+\s+replies', article_text)
        if text_match:
            post['text'] = text_match.group(1).strip()
        else:
            # Alternative: extract text after date
            text_match2 = re.search(r'@\w+\s+[A-Za-z]+\s+\d+\s+(.+?)(?:Embedded|Image|\d+\s+replies)', article_text)
            if text_match2:
                post['text'] = text_match2.group(1).strip()
        
        posts.append(post)
    
    return posts

if __name__ == "__main__":
    import sys
    snapshot = sys.stdin.read()
    posts = parse_x_snapshot(snapshot)
    print(json.dumps(posts, indent=2))