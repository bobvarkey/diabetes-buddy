#!/usr/bin/env python3
import sqlite3
import re
import json
from datetime import datetime
from pathlib import Path

def extract_posts_from_accessibility_tree(tree_text, search_query):
    """Extract posts from browser accessibility tree snapshot"""
    posts = []
    
    # Skip config warnings at the beginning
    lines = tree_text.split('\n')
    start_idx = 0
    for i, line in enumerate(lines):
        if 'article "' in line or "article '" in line:
            start_idx = i
            break
    
    tree_text = '\n'.join(lines[start_idx:])
    
    # Split into articles
    current_article = None
    articles_data = []
    
    for line in lines[start_idx:]:
        # Check for article starting with - (list item)
        if 'article "' in line or "article '" in line:
            if current_article:
                articles_data.append(current_article)
            current_article = line
        elif current_article:
            current_article += '\n' + line
    
    if current_article:
        articles_data.append(current_article)
    
    print(f"Found {len(articles_data)} articles in snapshot")
    
    for article_text in articles_data:
        try:
            # Extract author - look for first name before @handle
            author_match = re.search(r'article\s+"([^@]+?)\s+@', article_text)
            if not author_match:
                author_match = re.search(r'article\s+"([^"]+?)\s+\d', article_text)
            
            author = author_match.group(1).strip() if author_match else "Unknown"
            # Clean up author name
            author = re.sub(r'\s+Verified.*', '', author)
            author = author.strip()
            
            # Extract handle
            handle_match = re.search(r'@(\w+)', article_text)
            handle = handle_match.group(1) if handle_match else 'unknown'
            
            # Extract date/time
            date_patterns = [
                r'(\d+\s*(?:hours?|h|minutes?|m|days?|d)\s+ago)',
                r'(Jan\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Feb\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Mar\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Apr\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(May\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Jun\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Jul\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Aug\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Sep\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Oct\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Nov\s+\d{1,2}(?:,?\s+\d{4})?)',
                r'(Dec\s+\d{1,2}(?:,?\s+\d{4})?)'
            ]
            
            date = "Unknown"
            for pattern in date_patterns:
                date_match = re.search(pattern, article_text)
                if date_match:
                    date = date_match.group(1)
                    break
            
            # Extract post text - look for main content after date
            # Find text after the metadata (author, handle, date)
            text_start = article_text.find(date)
            if text_start > 0:
                text_section = article_text[text_start:]
                # Extract text from "text:" fields
                text_parts = re.findall(r'text:\s*"([^"]+)"', text_section)
                # Also get link text
                link_parts = re.findall(r'link\s+"([^"]+)"', text_section)
                
                # Combine, but exclude handles and URLs
                all_text = []
                for part in text_parts + link_parts:
                    if not part.startswith('@') and not part.startswith('http') and not part.startswith('#'):
                        all_text.append(part)
                
                text = ' '.join(all_text[:15])  # Limit to first 15 parts
            else:
                text = ''
            
            # Extract engagement metrics
            # Look for patterns like "36 replies, 2 reposts, 144 likes, 12 bookmarks, 17019 views"
            metrics_section = article_text[article_text.rfind('group'):]
            
            def parse_metric(label, section):
                # Handle K and M suffixes
                pattern = rf'(\d+\.?\d*)\s*{label}'
                match = re.search(pattern, section)
                if match:
                    val = match.group(1)
                    if 'K' in val:
                        return int(float(val.replace('K', '')) * 1000)
                    elif 'M' in val:
                        return int(float(val.replace('M', '')) * 1000000)
                    return int(float(val))
                return 0
            
            replies = parse_metric('replies', metrics_section)
            reposts = parse_metric('reposts', metrics_section)
            likes = parse_metric('likes', metrics_section)
            views = parse_metric('views', metrics_section)
            
            # Also check the simpler format "6 likes, 1158 views"
            if likes == 0:
                likes_match = re.search(r'(\d+\.?\d*[KkMm]?)\s+likes?', metrics_section)
                if likes_match:
                    val = likes_match.group(1)
                    if 'K' in val.upper():
                        likes = int(float(val.replace('K', '').replace('k', '')) * 1000)
                    elif 'M' in val.upper():
                        likes = int(float(val.replace('M', '').replace('m', '')) * 1000000)
                    else:
                        likes = int(float(val))
            
            if views == 0:
                views_match = re.search(r'(\d+\.?\d*[KkMm]?)\s+views?', metrics_section)
                if views_match:
                    val = views_match.group(1)
                    if 'K' in val.upper():
                        views = int(float(val.replace('K', '').replace('k', '')) * 1000)
                    elif 'M' in val.upper():
                        views = int(float(val.replace('M', '').replace('m', '')) * 1000000)
                    else:
                        views = int(float(val))
            
            # Extract URL
            url_match = re.search(r'/url:\s*([^\s\]]+)', article_text)
            if url_match:
                url_path = url_match.group(1)
                # Extract status ID from URL
                status_match = re.search(r'/status/(\d+)', url_path)
                if status_match:
                    url = f"https://x.com/{handle}/status/{status_match.group(1)}"
                else:
                    url = f"https://x.com{url_path}"
            else:
                url = f"https://x.com/{handle}"
            
            if author != "Unknown" and text:
                post = {
                    'author': author,
                    'handle': handle,
                    'date': date,
                    'text': text[:500],  # Limit text length
                    'likes': likes,
                    'replies': replies,
                    'reposts': reposts,
                    'views': views,
                    'url': url,
                    'search_query': search_query
                }
                posts.append(post)
                print(f"✓ Extracted: @{handle} - {text[:50]}...")
                
        except Exception as e:
            print(f"✗ Error parsing article: {e}")
            continue
    
    return posts

def save_to_database(posts, db_path):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            handle TEXT NOT NULL,
            date TEXT,
            text TEXT,
            likes INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE NOT NULL,
            search_query TEXT,
            extracted_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    inserted_count = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['replies'],
                post['reposts'],
                post['views'],
                post['url'],
                post['search_query']
            ))
            if cursor.rowcount > 0:
                inserted_count += 1
        except sqlite3.IntegrityError:
            print(f"  Duplicate: {post['url']}")
    
    conn.commit()
    conn.close()
    return inserted_count

def generate_markdown_report(posts, output_path, search_queries):
    """Generate markdown report"""
    md_content = f"""# X/Twitter Scrape Report
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Search Queries:** {', '.join(search_queries)}

## Summary
- **Total posts found:** {len(posts)}
- **High engagement posts (>50 likes):** {sum(1 for p in posts if p['likes'] > 50)}

## Posts

"""
    
    for i, post in enumerate(posts, 1):
        md_content += f"""### {i}. {post['author']} (@{post['handle']})
- **Date:** {post['date']}
- **URL:** [{post['url']}]({post['url']})
- **Engagement:** {post['likes']} likes, {post['replies']} replies, {post['reposts']} reposts, {post['views']} views
- **Search Query:** {post['search_query']}
- **Text:** {post['text']}

---

"""
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(md_content)
    print(f"\n📝 Markdown report saved to: {output_path}")

if __name__ == '__main__':
    import sys
    
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    markdown_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    # Read snapshot from stdin or file
    if len(sys.argv) > 1:
        snapshot_file = sys.argv[1]
        search_query = sys.argv[2] if len(sys.argv) > 2 else 'unknown'
        snapshot_text = Path(snapshot_file).read_text()
    else:
        print("Usage: python extract_from_snapshot.py <snapshot_file> [search_query]")
        sys.exit(1)
    
    posts = extract_posts_from_accessibility_tree(snapshot_text, search_query)
    
    if posts:
        inserted = save_to_database(posts, db_path)
        print(f"\n✅ Inserted {inserted} new posts into database")
        print(f"📊 Total posts in snapshot: {len(posts)}")
    else:
        print("\n⚠️ No posts extracted from snapshot")