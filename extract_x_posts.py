#!/usr/bin/env python3
import json
import re
from datetime import datetime

def extract_posts_from_snapshot(snapshot_text):
    """Extract X/Twitter posts from accessibility tree snapshot"""
    posts = []
    
    # Split by article tags
    articles = re.split(r'article "[^"]+" \[ref=e\d+\]', snapshot_text)
    
    for article in articles:
        if not article.strip():
            continue
            
        post = {}
        
        # Extract author name
        author_match = re.search(r'link "([^"]+)"(?:\s+Verified account)?(?:\s+\[ref=e\d+\])?', article)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract handle
        handle_match = re.search(r'link "@([a-zA-Z0-9_]+)"', article)
        if handle_match:
            post['handle'] = f"@{handle_match.group(1)}"
        
        # Extract timestamp
        time_match = re.search(r'link "([^"]+)"[^[]*\[\s*time \[\s*ref=e\d+\]\s*\]', article)
        if time_match:
            post['date'] = time_match.group(1)
        else:
            time_match2 = re.search(r'time \[\s*ref=e\d+\]\s*:\s*([^[]+)', article)
            if time_match2:
                post['date'] = time_match2.group(1).strip()
        
        # Extract post text - improved extraction
        text_parts = []
        
        # Find the main text content after the handle/timestamp
        # Look for the main generic that contains the tweet text
        main_text_section = re.search(r'generic \[\s*ref=e\d+\s*\]:\s*(.+?)(?=\s*- group|"article "[^"]+" \[ref)', article, re.DOTALL)
        if main_text_section:
            text_content = main_text_section.group(1)
            
            # Extract text and links
            # Match: text: "content" or link "text" [ref]
            text_elements = re.findall(r'text:\s*"([^"]*)"\s*|link "([^"]*)"', text_content)
            for elem in text_elements:
                if elem[0]:  # text
                    text_parts.append(elem[0])
                elif elem[1]:  # link
                    text_parts.append(elem[1])
        
        if text_parts:
            post['text'] = ' '.join(text_parts)
        else:
            post['text'] = ''
        
        # Extract engagement metrics
        metrics = {}
        
        # Extract replies
        replies_match = re.search(r'(\d+) Replies?\. Reply', article)
        if replies_match:
            metrics['replies'] = int(replies_match.group(1))
        else:
            metrics['replies'] = 0
        
        # Extract reposts
        reposts_match = re.search(r'(\d+) reposts?\. Repost', article)
        if reposts_match:
            metrics['reposts'] = int(reposts_match.group(1))
        else:
            metrics['reposts'] = 0
        
        # Extract likes
        likes_match = re.search(r'(\d+) Likes?\. Like', article)
        if likes_match:
            metrics['likes'] = int(likes_match.group(1))
        else:
            metrics['likes'] = 0
        
        # Extract bookmarks if present
        bookmarks_match = re.search(r'(\d+) bookmarks?', article)
        if bookmarks_match:
            metrics['bookmarks'] = int(bookmarks_match.group(1))
        
        # Extract views
        views_match = re.search(r'(\d+(?:\.\d+)?[K]?) views', article)
        if views_match:
            views_str = views_match.group(1)
            if 'K' in views_str:
                metrics['views'] = int(float(views_str.replace('K', '')) * 1000)
            else:
                metrics['views'] = int(views_str)
        else:
            metrics['views'] = 0
        
        post['metrics'] = metrics
        
        # Extract URL
        url_match = re.search(r'/url:\s*(/[a-zA-Z0-9_]+/status/\d+)', article)
        if url_match:
            post['url'] = f"https://x.com{url_match.group(1)}"
        
        # Only add if we have essential fields
        if 'author' in post and 'handle' in post:
            posts.append(post)
    
    return posts

def main():
    import sys
    
    # Read snapshot from stdin
    snapshot = sys.stdin.read()
    
    posts = extract_posts_from_snapshot(snapshot)
    
    # Output as JSON
    print(json.dumps(posts, indent=2))

if __name__ == '__main__':
    main()