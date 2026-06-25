#!/usr/bin/env python3
import re
import json
import sys
from datetime import datetime

def parse_article(article_text, url):
    """Parse a single X/Twitter article text."""
    post = {}
    
    # Extract author (text before @handle)
    author_match = re.search(r'^([^@]+?)\s+@', article_text)
    if author_match:
        post['author'] = author_match.group(1).strip()
    
    # Extract handle
    handle_match = re.search(r'@(\w+)', article_text)
    if handle_match:
        post['handle'] = handle_match.group(1)
    
    # Extract date (Month Day format)
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
    
    views_match = re.search(r'([\d.]+[KkM]?)\s+views', article_text)
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
    
    # Extract text (between date and metrics/embedded content)
    text_match = re.search(r'@\w+\s+[A-Za-z]+\s+\d+\s+(.+?)(?:Embedded|Image|\d+\s+replies)', article_text, re.DOTALL)
    if text_match:
        post['text'] = text_match.group(1).strip()
    
    post['url'] = url
    return post

def main():
    snapshot = sys.stdin.read()
    
    # Extract URLs with proper pairing - each article has a link before it
    # Pattern: link "Jun 12" [ref=e211]: - /url: /GreenJournal/status/2065190115090042937
    url_matches = re.findall(r'link "[A-Za-z]+\s+\d+".*?/url: /(\w+)/status/(\d+)', snapshot, re.DOTALL)
    urls = [f"https://x.com/{handle}/status/{id}" for handle, id in url_matches]
    
    # Also try the simpler pattern for articles
    article_matches = re.findall(r'article "([^"]+)"', snapshot)
    
    # If URLs don't match articles count, try another pattern
    if len(urls) != len(article_matches):
        # Try extracting all status URLs
        all_urls = re.findall(r'/url: /(\w+)/status/(\d+)', snapshot)
        urls = [f"https://x.com/{handle}/status/{id}" for handle, id in all_urls]
    
    posts = []
    for i, article_text in enumerate(article_matches):
        url = urls[i] if i < len(urls) else ""
        post = parse_article(article_text, url)
        if post:
            posts.append(post)
    
    print(json.dumps(posts, indent=2))

if __name__ == "__main__":
    main()