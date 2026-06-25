#!/usr/bin/env python3
import json
import sqlite3
import os
from datetime import datetime
import re

# Parse the AI snapshot text to extract posts
def parse_ai_snapshot(snapshot_text):
    posts = []
    lines = snapshot_text.split('\n')
    
    current_post = {}
    for line in lines:
        line = line.strip()
        if line.startswith("'article"):
            if current_post and 'text' in current_post:
                posts.append(current_post)
            current_post = {}
        elif line.startswith("article"):
            if current_post and 'text' in current_post:
                posts.append(current_post)
            current_post = {}
    
    return posts

# Function to extract posts from AI snapshot more directly
def extract_posts_from_snapshot(snapshot):
    posts = []
    
    # Find all article elements in the snapshot
    # The snapshot format shows articles with quoted content
    article_pattern = r"'article \"([^\"]+)\""
    
    import re
    matches = re.findall(article_pattern, snapshot)
    
    for match in matches:
        # Parse each matched article string
        posts.append(match)
    
    return posts

# Main processing
def process_snapshot():
    snapshot_file = "/Users/bobvarkey/.openclaw/workspace/snapshot.txt"
    if os.path.exists(snapshot_file):
        with open(snapshot_file, 'r') as f:
            content = f.read()
        posts = extract_posts_from_snapshot(content)
        return posts
    return []

if __name__ == "__main__":
    posts = process_snapshot()
    print(json.dumps(posts, indent=2))