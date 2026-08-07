#!/usr/bin/env python3
import json
import re

def parse_snapshot_to_posts(snapshot_text):
    """Parse browser snapshot text into structured post data."""
    posts = []
    
    # Split by article sections
    article_pattern = r'article "([^"]+)"\s*\[ref=e\d+\]'
    articles = re.findall(article_pattern, snapshot_text)
    
    for article_text in articles:
        post = {}
        
        # Extract author name (first quoted text before @)
        author_match = re.search(r'^([^(]+?)\s*@', article_text)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract handle (@username)
        handle_match = re.search(r'@(\w+)', article_text)
        if handle_match:
            post['handle'] = '@' + handle_match.group(1)
        
        # Extract date
        date_match = re.search(r'@\w+\s+(Jun \d+|Nov \d+, \d+)', article_text)
        if date_match:
            post['date'] = date_match.group(1)
        
        # Extract text content - between date and engagement metrics
        # Look for text after date pattern
        text_match = re.search(r'(?:Jun \d+|Nov \d+, \d+)\s+(.+?)\s+\d+ (?:replies|reposts)', article_text)
        if text_match:
            post['text'] = text_match.group(1).strip()
        
        # Extract engagement metrics
        replies_match = re.search(r'(\d+)\s+replies?', article_text)
        post['replies'] = int(replies_match.group(1)) if replies_match else 0
        
        reposts_match = re.search(r'(\d+)\s+reposts?', article_text)
        post['reposts'] = int(reposts_match.group(1)) if reposts_match else 0
        
        likes_match = re.search(r'(\d+)\s+likes?', article_text)
        post['likes'] = int(likes_match.group(1)) if likes_match else 0
        
        views_match = re.search(r'(\d+)\s+views?', article_text)
        post['views'] = int(views_match.group(1)) if views_match else 0
        
        # Extract URL pattern from handle
        if 'handle' in post:
            handle_clean = post['handle'].replace('@', '')
            # Look for status URL in article text
            url_match = re.search(r'/(\w+)/status/(\d+)', article_text)
            if url_match:
                post['url'] = f"https://x.com/{url_match.group(1)}/status/{url_match.group(2)}"
        
        if post.get('text'):
            posts.append(post)
    
    return posts

# Example snapshot text (will be replaced with actual)
snapshot = """
article "Neurology Journal @GreenJournal Jun 12 Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke Embedded video 0:31 2 replies, 6 reposts, 23 likes, 7 bookmarks, 4263 views"
"""

posts = parse_snapshot_to_posts(snapshot)
print(json.dumps(posts, indent=2))