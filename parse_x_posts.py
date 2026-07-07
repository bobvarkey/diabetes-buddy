#!/usr/bin/env python3
import re
import json
from datetime import datetime

def parse_x_snapshot(snapshot_file):
    with open(snapshot_file, 'r') as f:
        content = f.read()
    
    # Find all articles (posts)
    articles = re.findall(r'article "(.*?)"', content, re.DOTALL)
    
    posts = []
    for i, article in enumerate(articles[:10]):  # Top 10 posts
        post_data = {
            'author': '',
            'handle': '',
            'text': '',
            'likes': 0,
            'replies': 0,
            'reposts': 0,
            'views': 0,
            'url': '',
            'timestamp': ''
        }
        
        # Extract author name
        author_match = re.search(r'link "([^"]+?)(?:\s+Verified account)?"', article)
        if author_match:
            post_data['author'] = author_match.group(1)
        
        # Extract handle
        handle_match = re.search(r'link "@([^"]+)"', article)
        if handle_match:
            post_data['handle'] = '@' + handle_match.group(1)
        
        # Extract engagement metrics
        engagement_match = re.search(r'(\d+) repl(y|ies), (\d+) reposts?, (\d+) likes?, (\d+) views?', article)
        if engagement_match:
            post_data['replies'] = int(engagement_match.group(1))
            post_data['reposts'] = int(engagement_match.group(3))
            post_data['likes'] = int(engagement_match.group(4))
            post_data['views'] = int(engagement_match.group(5))
        
        # Try alternate format
        if not engagement_match:
            # Look for individual metrics
            likes_match = re.search(r'(\d+) Likes?\. Like', article)
            if likes_match:
                post_data['likes'] = int(likes_match.group(1))
            
            replies_match = re.search(r'(\d+) Repl(y|ies)\. Reply', article)
            if replies_match:
                post_data['replies'] = int(replies_match.group(1))
            
            reposts_match = re.search(r'(\d+) reposts?\. Repost', article)
            if reposts_match:
                post_data['reposts'] = int(reposts_match.group(1))
            
            views_match = re.search(r'(\d+(?:\.\d+[KM])?) views?', article)
            if views_match:
                views_str = views_match.group(1)
                if 'K' in views_str:
                    post_data['views'] = int(float(views_str.replace('K', '')) * 1000)
                elif 'M' in views_str:
                    post_data['views'] = int(float(views_str.replace('M', '')) * 1000000)
                else:
                    post_data['views'] = int(views_str)
        
        # Extract timestamp
        time_match = re.search(r'(\d+) (hours?|minutes?|days?) ago', article)
        if time_match:
            post_data['timestamp'] = f"{time_match.group(1)} {time_match.group(2)} ago"
        
        # Extract text - get everything after the timestamp and before engagement metrics
        # Find StaticText elements that contain the post content
        text_parts = re.findall(r'StaticText "([^"]+)"', article)
        # Filter out UI elements and keep post content
        content_parts = []
        for part in text_parts:
            # Skip if it's a UI element
            if part in ['Show more', 'Reply', 'Repost', 'Like', 'Bookmark', 'Share post']:
                continue
            # Skip if it's just a number (engagement metric)
            if part.isdigit() or re.match(r'^\d+[KM]?$', part):
                continue
            # Skip if it's a handle
            if part.startswith('@'):
                continue
            # Skip if it's just the author name (we already have that)
            if part == post_data['author']:
                continue
            # Keep it
            content_parts.append(part)
        
        post_data['text'] = ' '.join(content_parts[:10])  # First 10 meaningful text parts
        
        # Extract URL - construct from handle and approximate timestamp
        # X URLs are in format: https://x.com/[handle]/status/[tweet_id]
        # Since we don't have the tweet_id, we'll note the handle and timestamp
        if post_data['handle']:
            post_data['url'] = f"https://x.com/{post_data['handle'][1:]}/status/[need_tweet_id]"
        
        posts.append(post_data)
    
    return posts

def format_markdown(posts, output_file):
    today = datetime.now().strftime('%Y-%m-%d')
    
    md_content = f"""# X/Twitter Neurology News Scraping
**Date:** {today}
**Search Query:** neurology OR #neurotwitter OR #NeuroX
**Filter:** Top posts, Today only
**Source:** https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today

---

## Top 10 Posts

"""
    
    for i, post in enumerate(posts, 1):
        md_content += f"### {i}. {post['author']} ({post['handle']})\n\n"
        md_content += f"**Posted:** {post['timestamp']}\n\n"
        md_content += f"**Content:**\n{post['text']}\n\n"
        md_content += f"**Engagement:**\n"
        md_content += f"- 👍 {post['likes']} likes\n"
        md_content += f"- 💬 {post['replies']} replies\n"
        md_content += f"- 🔄 {post['reposts']} reposts\n"
        md_content += f"- 👁️ {post['views']} views\n\n"
        md_content += f"**URL:** {post['url']}\n\n"
        
        # Flag posts with >100 likes
        if post['likes'] > 100:
            md_content += "⚠️ **FLAGGED: >100 likes - High engagement post**\n\n"
        
        # Flag breaking news (heuristic: posts with "breaking", "announced", "new study", etc.)
        breaking_keywords = ['breaking', 'announced', 'new study', 'just published', 'breaking news', 'major', 'landmark']
        if any(keyword in post['text'].lower() for keyword in breaking_keywords):
            md_content += "🔥 **POTENTIAL BREAKING NEWS**\n\n"
        
        md_content += "---\n\n"
    
    # Summary section
    md_content += f"""## Summary

- Total posts scraped: {len(posts)}
- Posts with >100 likes: {sum(1 for p in posts if p['likes'] > 100)}
- Potential breaking news: {sum(1 for p in posts if any(kw in p['text'].lower() for kw in breaking_keywords))}

---

*Scraped on {datetime.now().strftime('%Y-%m-%d at %H:%M:%S')}*
"""
    
    with open(output_file, 'w') as f:
        f.write(md_content)
    
    return md_content

if __name__ == '__main__':
    import sys
    
    snapshot_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/x_full_snapshot.txt'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md'
    
    posts = parse_x_snapshot(snapshot_file)
    md_content = format_markdown(posts, output_file)
    
    print(f"Extracted {len(posts)} posts")
    print(f"Saved to {output_file}")
    print("\nPreview:")
    print(md_content[:500])