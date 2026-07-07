#!/usr/bin/env python3
import re
from datetime import datetime

def parse_x_snapshot(snapshot_file):
    with open(snapshot_file, 'r') as f:
        content = f.read()
    
    # Find all article elements in the snapshot
    # Articles contain the full post text in their accessible name
    articles = re.findall(r'article "([^"]+)"', content)
    
    posts = []
    for i, article_text in enumerate(articles[:10]):  # Top 10 posts
        post = parse_article(article_text)
        if post:
            posts.append(post)
    
    return posts

def parse_article(article_text):
    """Parse a single X article element"""
    post = {
        'author': '',
        'handle': '',
        'text': '',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 0,
        'timestamp': '',
        'url': '',
        'has_media': False
    }
    
    # Pattern: Author Name @handle time_ago content [Image/Video] metrics
    # Example: "Neurology Journal @GreenJournal 5 hours ago Application of... Image 1 reply, 4 reposts, 8 likes, 1223 views"
    
    # Extract handle (starts with @)
    handle_match = re.search(r'(@[\w]+)', article_text)
    if handle_match:
        post['handle'] = handle_match.group(1)
        # Extract everything before the handle as potential author name
        before_handle = article_text[:handle_match.start()].strip()
        # The last part before handle is usually the author name
        parts = before_handle.split()
        if parts:
            # Take all parts except the last one if it's not a name
            post['author'] = ' '.join(parts[-5:])  # Take up to 5 words as author name
    
    # Extract timestamp
    time_match = re.search(r'(\d+) (seconds?|minutes?|hours?|days?) ago', article_text)
    if time_match:
        post['timestamp'] = f"{time_match.group(1)} {time_match.group(2)} ago"
    
    # Check for media
    if 'Image' in article_text or 'Video' in article_text:
        post['has_media'] = True
    
    # Extract engagement metrics
    # Pattern: X reply(s), Y reposts, Z likes, W views
    # Or: X Reply. Reply, Y reposts. Repost, Z Likes. Like, W views
    
    # More flexible pattern
    likes_match = re.search(r'(\d+) Likes?\.? Like', article_text)
    if likes_match:
        post['likes'] = int(likes_match.group(1))
    
    replies_match = re.search(r'(\d+) Repl(y|ies)\.? Repl(y|ies)', article_text)
    if replies_match:
        post['replies'] = int(replies_match.group(1))
    
    reposts_match = re.search(r'(\d+) reposts?\.? Repost', article_text)
    if reposts_match:
        post['reposts'] = int(reposts_match.group(1))
    
    # Try the alternate format in the group element
    group_match = re.search(r'group "(\d+) repl(y|ies), (\d+) reposts?, (\d+) likes?, (\d+) views?"', article_text)
    if group_match:
        post['replies'] = int(group_match.group(1))
        post['reposts'] = int(group_match.group(3))
        post['likes'] = int(group_match.group(4))
        post['views'] = int(group_match.group(5))
    
    # Extract views
    if not group_match:
        views_match = re.search(r'(\d+(?:\.\d+[KM])?) views?', article_text)
        if views_match:
            views_str = views_match.group(1)
            if 'K' in views_str:
                post['views'] = int(float(views_str.replace('K', '')) * 1000)
            elif 'M' in views_str:
                post['views'] = int(float(views_str.replace('M', '')) * 1000000)
            else:
                post['views'] = int(views_str)
    
    # Extract text content
    # Everything between handle+timestamp and metrics
    if post['handle'] and post['timestamp']:
        # Find the position after handle and timestamp
        handle_pos = article_text.find(post['handle'])
        if handle_pos != -1:
            # Move past the handle
            start = handle_pos + len(post['handle'])
            # Find "ago" to get past timestamp
            ago_match = re.search(r'\d+ \w+ ago', article_text[start:])
            if ago_match:
                start += ago_match.end()
                # Find where metrics start
                # Look for "Image" or "Video" or reply/likes pattern
                end = len(article_text)
                
                # Try to find metrics start
                metrics_patterns = [
                    r'\d+ repl',
                    r'\d+ Repost',
                    r'\d+ Like',
                    r'\d+ view',
                    r'Image',
                    r'Video'
                ]
                
                for pattern in metrics_patterns:
                    match = re.search(pattern, article_text[start:])
                    if match:
                        end = min(end, start + match.start())
                
                text = article_text[start:end].strip()
                # Clean up
                text = re.sub(r'^\s+', '', text)
                text = re.sub(r'\s+$', '', text)
                post['text'] = text
    
    # Construct URL (we'll need to click to get actual tweet ID)
    # For now, use a placeholder
    if post['handle']:
        post['url'] = f"https://x.com/{post['handle'][1:]}"
    
    return post if post['handle'] else None

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
        
        if post['text']:
            md_content += f"**Content:**\n{post['text']}\n\n"
        
        md_content += f"**Engagement:**\n"
        md_content += f"- 👍 {post['likes']} likes\n"
        md_content += f"- 💬 {post['replies']} replies\n"
        md_content += f"- 🔄 {post['reposts']} reposts\n"
        md_content += f"- 👁️ {post['views']} views\n\n"
        
        if post['has_media']:
            md_content += "📸 **Contains media**\n\n"
        
        md_content += f"**URL:** {post['url']}\n\n"
        
        # Flag posts with >100 likes
        if post['likes'] > 100:
            md_content += "⚠️ **FLAGGED: >100 likes - High engagement post**\n\n"
        
        # Flag breaking news
        breaking_keywords = ['breaking', 'announced', 'new study', 'just published', 'breaking news', 'major', 'landmark', 'first time', 'revolutionary']
        if any(keyword in post['text'].lower() for keyword in breaking_keywords):
            md_content += "🔥 **POTENTIAL BREAKING NEWS**\n\n"
        
        md_content += "---\n\n"
    
    # Summary section
    md_content += f"""## Summary

- **Total posts scraped:** {len(posts)}
- **Posts with >100 likes:** {sum(1 for p in posts if p['likes'] > 100)}
- **Potential breaking news:** {sum(1 for p in posts if any(kw in p['text'].lower() for kw in breaking_keywords))}

### High Engagement Posts (>100 likes):
"""
    
    for post in posts:
        if post['likes'] > 100:
            md_content += f"- {post['author']} ({post['handle']}): {post['likes']} likes\n"
    
    md_content += "\n### Breaking News Candidates:\n"
    for post in posts:
        if any(kw in post['text'].lower() for kw in breaking_keywords):
            md_content += f"- {post['author']}: {post['text'][:100]}...\n"
    
    md_content += f"""

---

*Scraped on {datetime.now().strftime('%Y-%m-%d at %H:%M:%S')} by OpenClaw*
"""
    
    with open(output_file, 'w') as f:
        f.write(md_content)
    
    return md_content

if __name__ == '__main__':
    import sys
    
    snapshot_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/x_full_snapshot2.txt'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md'
    
    # Ensure output directory exists
    import os
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    posts = parse_x_snapshot(snapshot_file)
    
    if posts:
        md_content = format_markdown(posts, output_file)
        print(f"✓ Extracted {len(posts)} posts")
        print(f"✓ Saved to {output_file}")
        print("\n" + "="*60)
        print("PREVIEW:")
        print("="*60)
        print(md_content[:1000])
    else:
        print("⚠ No posts found in snapshot")
        sys.exit(1)