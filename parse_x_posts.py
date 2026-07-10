#!/usr/bin/env python3
import re
import json
import sys
from datetime import datetime
from pathlib import Path

def parse_posts_from_text(text_content):
    """Parse X posts from page text content"""
    posts = []
    
    # Split by post pattern - look for handles (@username)
    # Pattern: Author\n@handle\n·\ntimestamp\ncontent\nengagement
    
    lines = text_content.replace('\\n', '\n').split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for post start (handle pattern)
        handle_match = re.match(r'^@[\w]+$', line)
        if handle_match:
            handle = line
            
            # Try to get author from previous line
            author = ""
            if i > 0:
                prev_line = lines[i-1].strip()
                if not prev_line.startswith('@') and not prev_line.startswith('·') and prev_line:
                    author = prev_line
            
            # Skip · and timestamp
            j = i + 1
            while j < len(lines) and (lines[j].strip().startswith('·') or 
                                      re.match(r'^\d+[hm]$', lines[j].strip()) or
                                      re.match(r'^[A-Z][a-z]+ \d+,? \d+$', lines[j].strip()) or
                                      re.match(r'^\d+h$', lines[j].strip()) or
                                      re.match(r'^\d+ hours?$', lines[j].strip())):
                j += 1
            
            # Collect content until engagement metrics
            content_lines = []
            while j < len(lines):
                content_line = lines[j].strip()
                
                # Check if this looks like engagement metrics (number followed by number or K/M)
                if re.match(r'^\d+[KkMm]?$', content_line):
                    # This might be engagement, but let's check if next lines are also metrics
                    # Engagement pattern: usually small numbers for replies/reposts, then likes, then views
                    break
                
                # Skip navigation/UI elements
                if content_line in ['Top', 'Latest', 'People', 'Media', 'Lists', 'See new posts', 
                                   'Search timeline', 'View keyboard shortcuts', 
                                   'To view keyboard shortcuts, press question mark']:
                    j += 1
                    continue
                
                if content_line.startswith('http://') or content_line.startswith('https://'):
                    # URL
                    content_lines.append(content_line)
                    j += 1
                    continue
                
                if content_line:
                    content_lines.append(content_line)
                j += 1
            
            content = ' '.join(content_lines)
            
            # Try to extract engagement metrics
            likes, replies, reposts, views = 0, 0, 0, 0
            metric_idx = j
            while metric_idx < len(lines) and metric_idx < j + 4:
                metric = lines[metric_idx].strip()
                if re.match(r'^\d+[KkMm]?$', metric):
                    # Parse metric
                    def parse_metric(m):
                        m = m.replace(',', '')
                        if 'K' in m or 'k' in m:
                            return int(float(m.replace('K', '').replace('k', '')) * 1000)
                        elif 'M' in m or 'm' in m:
                            return int(float(m.replace('M', '').replace('m', '')) * 1000000)
                        try:
                            return int(m)
                        except:
                            return 0
                    
                    # First metric is usually replies
                    if replies == 0:
                        replies = parse_metric(metric)
                    elif reposts == 0:
                        reposts = parse_metric(metric)
                    elif likes == 0:
                        likes = parse_metric(metric)
                    elif views == 0:
                        views = parse_metric(metric)
                        break
                metric_idx += 1
            
            if author and handle and content:
                # Generate a pseudo-URL based on handle and timestamp
                # We'll need to fix this with actual URLs from the page
                url = f"https://x.com/{handle}/status/unknown"
                
                posts.append({
                    'author': author,
                    'handle': handle,
                    'date': datetime.utcnow().isoformat(),
                    'text': content,
                    'likes': likes,
                    'replies': replies,
                    'reposts': reposts,
                    'views': views,
                    'url': url
                })
        
        i += 1
    
    return posts

def main():
    # Read from stdin or file
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r') as f:
            text = f.read()
    else:
        text = sys.stdin.read()
    
    posts = parse_posts_from_text(text)
    print(json.dumps(posts, indent=2))

if __name__ == '__main__':
    main()