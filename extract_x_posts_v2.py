#!/usr/bin/env python3
import json
import re
from datetime import datetime

def extract_posts_from_snapshot(snapshot_text):
    """Extract X/Twitter posts from accessibility tree snapshot"""
    posts = []
    
    # Better regex to find article blocks
    article_pattern = r'article "([^"]+)" \[ref=e\d+\] \[cursor=pointer\]([^[]*?)(?=article "|\Z)'
    
    for match in re.finditer(article_pattern, snapshot_text, re.DOTALL):
        article_content = match.group(2)
        
        post = {}
        
        # Extract author name - look for first name after link
        author_match = re.search(r'link "([^"]+)"[^[]*\[ref=e\d+\]', article_content)
        if author_match:
            post['author'] = author_match.group(1).strip()
        
        # Extract handle
        handle_match = re.search(r'link "@([a-zA-Z0-9_]+)"', article_content)
        if handle_match:
            post['handle'] = f"@{handle_match.group(1)}"
        
        # Extract timestamp
        time_match = re.search(r'time \[ref=e\d+\]:\s*([^\n\[]+)', article_content)
        if time_match:
            post['date'] = time_match.group(1).strip()
        else:
            # Try alternative pattern
            time_match2 = re.search(r'"(\d+[mh\d hours ago|\d+ days ago|Jul \d+)"', article_content)
            if time_match2:
                post['date'] = time_match2.group(1)
        
        # Extract engagement metrics
        metrics = {}
        
        # Replies
        replies_match = re.search(r'"(\d+) Replies?\. Reply"', article_content)
        if not replies_match:
            replies_match = re.search(r'(\d+) Replies?\. Reply', article_content)
        if replies_match:
            metrics['replies'] = int(replies_match.group(1))
        else:
            metrics['replies'] = 0
        
        # Reposts
        reposts_match = re.search(r'"(\d+) reposts?\. Repost"', article_content)
        if not reposts_match:
            reposts_match = re.search(r'(\d+) reposts?\. Repost', article_content)
        if reposts_match:
            metrics['reposts'] = int(reposts_match.group(1))
        else:
            metrics['reposts'] = 0
        
        # Likes
        likes_match = re.search(r'"(\d+) Likes?\. Like"', article_content)
        if not likes_match:
            likes_match = re.search(r'(\d+) Likes?\. Like', article_content)
        if likes_match:
            metrics['likes'] = int(likes_match.group(1))
        else:
            metrics['likes'] = 0
        
        # Bookmarks
        bookmarks_match = re.search(r'(\d+) bookmarks?', article_content)
        if bookmarks_match:
            metrics['bookmarks'] = int(bookmarks_match.group(1))
        
        # Views
        views_match = re.search(r'(\d+(?:\.\d+)?[K]?) views', article_content)
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
        url_match = re.search(r'/url:\s*(/[a-zA-Z0-9_]+/status/\d+)', article_content)
        if url_match:
            post['url'] = f"https://x.com{url_match.group(1)}"
        
        # Extract text content - find main content area
        # Skip quoted tweets and focus on main text
        text_parts = []
        
        # Find generic blocks with text content (not inside quote)
        # Look for pattern: text: "content" outside of Quote sections
        text_section = article_content
        
        # Remove quote sections first
        quote_pattern = r'Quote[^[]+\[ref=e\d+\][^[]*(?:Quote|article)[^[]*'
        text_section = re.sub(quote_pattern, '', text_section, flags=re.DOTALL)
        
        # Remove embedded video sections
        video_pattern = r'Embedded video[^[]*'
        text_section = re.sub(video_pattern, '', text_section, flags=re.DOTALL)
        
        # Extract text and links
        text_elements = re.findall(r'text:\s*"([^"]*)"', text_section)
        for elem in text_elements:
            if elem and elem not in ['Replying to', 'Quote', 'Embedded video']:
                text_parts.append(elem)
        
        # Also capture hashtags and mentions
        hashtag_elements = re.findall(r'#(\w+)', text_section)
        mention_elements = re.findall(r'@(\w+)', text_section)
        
        if text_parts:
            post['text'] = ' '.join(text_parts)
        else:
            post['text'] = ''
        
        # Extract hashtags
        if hashtag_elements:
            post['hashtags'] = [f"#{tag}" for tag in hashtag_elements]
        
        # Extract mentions (excluding author's own handle)
        if mention_elements and 'handle' in post:
            post['mentions'] = [f"@{m}" for m in mention_elements if f"@{m}" != post['handle']]
        
        # Only add if we have essential fields
        if 'author' in post and 'handle' in post and 'url' in post:
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