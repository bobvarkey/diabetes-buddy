#!/usr/bin/env python3
import re
from datetime import datetime
import html

def parse_x_snapshot(snapshot_file):
    with open(snapshot_file, 'r') as f:
        content = f.read()
    
    # Find all article elements
    # Articles have the format: article "Author @handle time_ago content metrics"
    articles = re.findall(r'article "([^"]+)"', content)
    
    posts = []
    for article_text in articles[:10]:  # Top 10 posts
        post = parse_article(article_text)
        if post:
            posts.append(post)
    
    return posts

def parse_article(article_text):
    """Parse a single X article element"""
    # Debug: print raw article
    # print(f"DEBUG: Parsing article: {article_text[:200]}")
    
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
        'has_media': False,
        'is_breaking': False
    }
    
    # Pattern examples:
    # "NEJM Verified account @NEJM 34 minutes ago Original Article: ... 1 repost, 7 likes, 2 bookmarks, 3666 views"
    # "Neurology Journal @GreenJournal 5 hours ago Application of ... Image 1 reply, 4 reposts, 8 likes, 1223 views"
    
    # Extract handle (starts with @, followed by alphanumeric)
    handle_match = re.search(r'(@[\w]+)', article_text)
    if not handle_match:
        return None
    
    post['handle'] = handle_match.group(1)
    
    # Extract author name (everything before the handle, removing "Verified account" if present)
    before_handle = article_text[:handle_match.start()].strip()
    before_handle = re.sub(r'Verified account\s*$', '', before_handle)
    post['author'] = before_handle.strip() if before_handle else 'Unknown'
    
    # Extract timestamp
    time_match = re.search(r'(\d+) (seconds?|minutes?|hours?|days?) ago', article_text)
    if time_match:
        post['timestamp'] = f"{time_match.group(1)} {time_match.group(2)} ago"
        timestamp_end = time_match.end()
    else:
        timestamp_end = handle_match.end()
    
    # Check for media (Image/Video in text)
    if re.search(r'\b(Image|Video|Embedded video)\b', article_text):
        post['has_media'] = True
    
    # Extract engagement metrics
    # Pattern: X reply(s), Y reposts, Z likes, W bookmarks, V views
    # Or: X replies, Y reposts, Z likes, W bookmarks, V views
    # Note: Sometimes bookmarks appear before likes
    
    # Find all number-unit pairs at the end of the article
    metrics_section = article_text
    
    # Extract views (usually last)
    views_match = re.search(r'(\d+(?:,\d+)*(?:\.\d+[KM])?) views?', metrics_section)
    if views_match:
        views_str = views_match.group(1).replace(',', '')
        if 'K' in views_str:
            post['views'] = int(float(views_str.replace('K', '')) * 1000)
        elif 'M' in views_str:
            post['views'] = int(float(views_str.replace('M', '')) * 1000000)
        else:
            post['views'] = int(views_str)
    
    # Extract likes
    likes_match = re.search(r'(\d+(?:,\d+)*) likes?', metrics_section)
    if likes_match:
        post['likes'] = int(likes_match.group(1).replace(',', ''))
    
    # Extract replies
    replies_match = re.search(r'(\d+(?:,\d+)*) repl(y|ies)', metrics_section)
    if replies_match:
        post['replies'] = int(replies_match.group(1).replace(',', ''))
    
    # Extract reposts
    reposts_match = re.search(r'(\d+(?:,\d+)*) reposts?', metrics_section)
    if reposts_match:
        post['reposts'] = int(reposts_match.group(1).replace(',', ''))
    
    # Extract text content
    # Everything between timestamp and the metrics
    if post['timestamp']:
        # Find position after timestamp
        timestamp_pos = article_text.find(post['timestamp'])
        if timestamp_pos != -1:
            start = timestamp_pos + len(post['timestamp'])
            
            # Find where metrics start (look for pattern like "X reply", "X repost", etc.)
            metrics_patterns = [
                r'\d+ repl(y|ies)',
                r'\d+ reposts?',
                r'\d+ likes?',
                r'\d+ bookmarks?',
                r'\d+ views?',
                r'Image$',
                r'Video$',
                r'This image',
                r'A composite'
            ]
            
            end = len(article_text)
            for pattern in metrics_patterns:
                match = re.search(pattern, article_text[start:])
                if match:
                    end = min(end, start + match.start())
            
            text = article_text[start:end].strip()
            # Clean up and decode HTML entities
            text = html.unescape(text)
            text = re.sub(r'\s+', ' ', text)
            # Remove common noise
            text = re.sub(r'^(This image|A composite|Graph [A-Z]:).*?$', '', text, flags=re.MULTILINE)
            text = text.strip()
            post['text'] = text
    
    # Check for breaking news keywords
    breaking_keywords = [
        'breaking', 'announced', 'new study', 'just published', 'breaking news',
        'major', 'landmark', 'first time', 'revolutionary', 'breakthrough',
        'significant', 'important', 'critical', 'urgent'
    ]
    if any(keyword in post['text'].lower() for keyword in breaking_keywords):
        post['is_breaking'] = True
    
    # Construct URL
    if post['handle']:
        post['url'] = f"https://x.com/{post['handle'][1:]}"
    
    return post

def format_markdown(posts, output_file):
    today = datetime.now().strftime('%Y-%m-%d')
    time_now = datetime.now().strftime('%Y-%m-%d at %H:%M:%S')
    
    md_content = f"""# X/Twitter Neurology News Scraping
**Date:** {today}  
**Time:** {time_now}  
**Search Query:** `neurology OR #neurotwitter OR #NeuroX`  
**Filter:** Top posts, Today only  
**Source:** https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today

---

## Top {len(posts)} Posts

"""
    
    for i, post in enumerate(posts, 1):
        md_content += f"### {i}. {post['author']}"
        if post['handle']:
            md_content += f" ({post['handle']})"
        md_content += "\n\n"
        
        md_content += f"**Posted:** {post['timestamp']}\n\n"
        
        if post['text']:
            md_content += f"**Content:**\n{post['text']}\n\n"
        
        md_content += "**Engagement:**\n"
        md_content += f"- 👍 {post['likes']:,} likes\n"
        md_content += f"- 💬 {post['replies']:,} replies\n"
        md_content += f"- 🔄 {post['reposts']:,} reposts\n"
        md_content += f"- 👁️ {post['views']:,} views\n\n"
        
        if post['has_media']:
            md_content += "📸 **Contains media (image/video)**\n\n"
        
        md_content += f"**URL:** {post['url']}\n\n"
        
        # Flag posts with >100 likes
        if post['likes'] > 100:
            md_content += "⚠️ **FLAGGED: High engagement (>100 likes)**\n\n"
        
        # Flag breaking news
        if post['is_breaking']:
            md_content += "🔥 **POTENTIAL BREAKING NEWS**\n\n"
        
        md_content += "---\n\n"
    
    # Summary section
    high_engagement = [p for p in posts if p['likes'] > 100]
    breaking_news = [p for p in posts if p['is_breaking']]
    
    md_content += f"""## Summary

- **Total posts scraped:** {len(posts)}
- **Posts with >100 likes:** {len(high_engagement)}
- **Potential breaking news:** {len(breaking_news)}

"""
    
    if high_engagement:
        md_content += "### High Engagement Posts (>100 likes):\n"
        for post in high_engagement:
            md_content += f"- **{post['author']}** ({post['handle']}): {post['likes']:,} likes\n"
            md_content += f"  {post['text'][:150]}...\n\n"
    
    if breaking_news:
        md_content += "\n### Breaking News Candidates:\n"
        for post in breaking_news:
            md_content += f"- **{post['author']}**\n"
            md_content += f"  {post['text'][:200]}...\n\n"
    
    md_content += f"""
---

*Scraped by OpenClaw on {time_now}*
"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(md_content)
    
    return md_content

if __name__ == '__main__':
    import sys
    import os
    
    snapshot_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/x_final_snapshot.txt'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md'
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    posts = parse_x_snapshot(snapshot_file)
    
    if posts:
        md_content = format_markdown(posts, output_file)
        print(f"✓ Extracted {len(posts)} posts")
        print(f"✓ Saved to: {output_file}")
        print("\n" + "="*70)
        print("SUMMARY:")
        print("="*70)
        print(f"High engagement (>100 likes): {sum(1 for p in posts if p['likes'] > 100)}")
        print(f"Breaking news candidates: {sum(1 for p in posts if p['is_breaking'])}")
        print("\n" + "="*70)
        print("PREVIEW (first 1500 chars):")
        print("="*70)
        print(md_content[:1500])
    else:
        print("⚠ No posts found in snapshot")
        sys.exit(1)