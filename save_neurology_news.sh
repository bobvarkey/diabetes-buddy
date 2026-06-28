#!/bin/bash

# Extract posts from the snapshot and create markdown

# Get the snapshot
SNAPSHOT=$(openclaw browser snapshot 2>&1 | grep -v "Config warnings" | grep -v "Doctor warnings" | grep -v "┌" | grep -v "│" | grep -v "├" | grep -v "┘" | grep -v "OpenClaw")

# Parse articles from snapshot using Python
python3 << 'PYTHON_SCRIPT' > /Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-05-22.md

import re
import json

snapshot = """
SNAPSHOT_PLACEHOLDER
"""

# Find all articles in the snapshot
articles = re.findall(r"article \"([^\"]+)\" \[ref=e\d+\] \[cursor=pointer\]", snapshot)

posts = []
for i, article in enumerate(articles[:10], 1):  # Get top 10
    # Parse the article text
    # Format: "Author @handle date text engagement metrics"
    
    # Extract author - first part before @
    author_match = re.match(r'^([^\n]+?)(?=\s+@)', article)
    author = author_match.group(1).strip() if author_match else "Unknown"
    
    # Extract handle
    handle_match = re.search(r'@(\w+)', article)
    handle = handle_match.group(1) if handle_match else "unknown"
    
    # Extract engagement
    engagement_match = re.search(r'(\d+)\s+replies?,\s*(\d+)\s+reposts?,\s*(\d+)\s+likes?,', article)
    replies = engagement_match.group(1) if engagement_match else "0"
    reposts = engagement_match.group(2) if engagement_match else "0"
    likes = engagement_match.group(3) if engagement_match else "0"
    
    views_match = re.search(r',\s*(\d+[,\d]*\s*(?:views?|K|M))', article)
    views = views_match.group(1).strip() if views_match else "N/A"
    
    # Extract text - between the end of author/handle info and engagement
    # Find the text after date patterns
    text_match = re.search(r'(?:Jun|Jan|Feb|Mar|Apr|May|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d+\s+(.+?)(?:\d+\s+replies)', article, re.DOTALL)
    text = text_match.group(1).strip() if text_match else ""
    
    # Clean up text
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s+(Embedded|video|Image).*$', '', text, flags=re.IGNORECASE)
    
    posts.append({
        'author': author,
        'handle': handle,
        'text': text,
        'replies': replies,
        'reposts': reposts,
        'likes': likes,
        'views': views
    })

# Print markdown
print("# X/Twitter Neurology News Scrape")
print("**Date:** Friday, June 26th, 2026 - 03:00 (Asia/Calcutta)")
print("**Search Query:** neurology OR #neurotwitter OR #NeuroX")
print("**URL:** https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top")
print("")
print("---")
print("")

flagged = []
for i, post in enumerate(posts, 1):
    print(f"## Post {i}")
    print(f"**Author:** {post['author']} (@{post['handle']})")
    print(f"**Text:** {post['text']}")
    print(f"**Engagement:** {post['replies']} replies | {post['reposts']} reposts | {post['likes']} likes | {post['views']} views")
    print("")
    
    # Flag posts with >100 likes
    try:
        likes_num = int(post['likes'].replace(',', ''))
        if likes_num > 100:
            flagged.append((i, post['author'], likes_num, 'High engagement'))
    except:
        pass

if flagged:
    print("---")
    print("")
    print("## 🚨 Flagged Posts")
    for post_num, author, likes, reason in flagged:
        print(f"- **Post {post_num}** by {author}: {likes} likes ({reason})")

PYTHON_SCRIPT