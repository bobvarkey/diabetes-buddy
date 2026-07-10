#!/usr/bin/env python3
"""
Extract X/Twitter posts using OpenClaw browser automation
"""

import json
import subprocess
import sqlite3
import re
from datetime import datetime
from pathlib import Path

def extract_posts_from_page():
    """Extract posts using browser evaluate with inline function"""
    js_code = """
const allPosts = [];
const seenUrls = new Set();

const articles = document.querySelectorAll("article");

articles.forEach((article) => {
  try {
    const authorEl = article.querySelector('[data-testid="User-Name"]');
    let author = "";
    let handle = "";
    if (authorEl) {
      const links = authorEl.querySelectorAll('a');
      if (links.length > 0) {
        author = links[0].querySelector('span')?.textContent || "";
      }
      if (links.length > 1) {
        handle = links[1].querySelector('span')?.textContent || "";
      }
    }
    
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl?.textContent || "";
    
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const repostBtn = article.querySelector('[data-testid="retweet"]');
    const likeBtn = article.querySelector('[data-testid="like"]');
    const viewCount = article.querySelector('[data-testid="viewCount"]');
    
    let replies = "0", reposts = "0", likes = "0";
    
    if (replyBtn) {
      const ariaLabel = replyBtn.getAttribute("aria-label") || "";
      const match = ariaLabel.match(/(\\d+)/);
      replies = match ? match[1] : "0";
    }
    
    if (repostBtn) {
      const ariaLabel = repostBtn.getAttribute("aria-label") || "";
      const match = ariaLabel.match(/(\\d+)/);
      reposts = match ? match[1] : "0";
    }
    
    if (likeBtn) {
      const ariaLabel = likeBtn.getAttribute("aria-label") || "";
      const match = ariaLabel.match(/(\\d+)/);
      likes = match ? match[1] : "0";
    }
    
    const views = viewCount?.textContent || "";
    
    const timeLink = article.querySelector('time')?.closest('a');
    const url = timeLink?.href || "";
    const dateEl = article.querySelector('time');
    const date = dateEl?.getAttribute('datetime') || dateEl?.textContent || "";
    
    if (url && !seenUrls.has(url) && author && text) {
      seenUrls.add(url);
      allPosts.push({
        author,
        handle,
        date,
        text,
        replies,
        reposts,
        likes,
        views,
        url
      });
    }
  } catch (e) {}
});

return JSON.stringify({
  total: allPosts.length,
  posts: allPosts
}, null, 2);
"""
    
    # Save to temp file
    with open('/tmp/extract_fn.js', 'w') as f:
        f.write(js_code)
    
    # Run the evaluate command
    result = subprocess.run(
        ['openclaw', 'browser', 'evaluate', '--fn', '/tmp/extract_fn.js'],
        capture_output=True,
        text=True
    )
    
    if result.returncode != 0:
        print(f"Error running evaluate: {result.stderr}")
        return []
    
    # Parse the output
    output = result.stdout
    
    # Find the JSON in the output
    json_match = re.search(r'\{[\s\S]*\}', output)
    if json_match:
        try:
            data = json.loads(json_match.group(0))
            return data.get('posts', [])
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return []
    return []

def parse_engagement_number(text):
    """Parse engagement numbers like '102', '12.5K', '7.9K'"""
    if not text:
        return 0
    
    text = text.strip().upper()
    
    if 'K' in text:
        num = text.replace('K', '').replace(',', '').strip()
        try:
            return int(float(num) * 1000)
        except:
            return 0
    elif 'M' in text:
        num = text.replace('M', '').replace(',', '').strip()
        try:
            return int(float(num) * 1000000)
        except:
            return 0
    else:
        try:
            return int(text.replace(',', ''))
        except:
            return 0

def parse_date(date_str):
    """Parse various date formats from X posts"""
    if not date_str:
        return None
    
    # Try ISO format first
    try:
        return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
    except:
        pass
    
    # Try relative dates
    date_str_lower = date_str.lower()
    if 'hour' in date_str_lower or 'minute' in date_str_lower or 'now' in date_str_lower:
        return datetime.now()
    elif 'today' in date_str_lower:
        return datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    elif 'yesterday' in date_str_lower:
        return (datetime.now() - timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    
    return None

def save_to_database(posts, search_query):
    """Save posts to SQLite database"""
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    new_posts = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('text', ''),
                parse_engagement_number(post.get('likes', '0')),
                parse_engagement_number(post.get('replies', '0')),
                parse_engagement_number(post.get('reposts', '0')),
                parse_engagement_number(post.get('views', '0')),
                post.get('url', ''),
                search_query,
                datetime.now().isoformat()
            ))
            
            if cursor.rowcount > 0:
                new_posts += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    
    return new_posts

def generate_markdown_report(posts, search_queries, new_posts_count):
    """Generate markdown report"""
    report = f"""# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d')}

**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Total posts scraped:** {len(posts)}

**New posts added to database:** {new_posts_count}

---

## Summary

"""
    
    for query, count in search_queries.items():
        report += f"- **Search Query:** {query}\n"
        report += f"  - Posts found: {count}\n\n"
    
    # Find high engagement posts
    high_engagement = []
    for post in posts:
        likes = parse_engagement_number(post.get('likes', '0'))
        if likes > 50:
            high_engagement.append((post, likes))
    
    high_engagement.sort(key=lambda x: x[1], reverse=True)
    
    if high_engagement:
        report += f"## High Engagement Posts (>50 likes): {len(high_engagement)}\n\n"
        
        for post, likes in high_engagement:
            report += f"### {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})\n\n"
            report += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            report += f"**Text:**\n```\n{post.get('text', '')}\n```\n\n"
            report += f"**Engagement:** {likes} likes, {post.get('replies', '0')} replies, {post.get('reposts', '0')} reposts, {post.get('views', '0')} views\n\n"
            report += f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n"
            report += f"**Search Query:** {post.get('search_query', '')}\n\n"
            report += "---\n\n"
    
    return report

def main():
    # Define search queries
    search_queries_urls = [
        ("neurointervention OR thrombectomy OR #Neurointervention OR #stroke",
         "https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today"),
        ("cerebral AVM OR intracranial aneurysm OR endovascular",
         "https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today")
    ]
    
    all_posts = []
    query_counts = {}
    
    for query, url in search_queries_urls:
        print(f"Scraping: {query}")
        
        # Navigate to the search URL
        result = subprocess.run(
            ['openclaw', 'browser', 'navigate', url],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print(f"Error navigating to {url}: {result.stderr}")
            continue
        
        # Wait for page to load
        import time
        time.sleep(3)
        
        # Extract posts
        posts = extract_posts_from_page()
        
        # Add search query to each post
        for post in posts:
            post['search_query'] = query
        
        all_posts.extend(posts)
        query_counts[query] = len(posts)
        
        print(f"Found {len(posts)} posts for query: {query}")
    
    # Save to database
    total_new = 0
    for query, _ in search_queries_urls:
        query_posts = [p for p in all_posts if p.get('search_query') == query]
        new_count = save_to_database(query_posts, query)
        total_new += new_count
    
    print(f"\nTotal posts: {len(all_posts)}")
    print(f"New posts added: {total_new}")
    
    # Generate report
    report = generate_markdown_report(all_posts, query_counts, total_new)
    
    # Save report
    report_path = Path(f'/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-{datetime.now().strftime("%Y-%m-%d")}.md')
    report_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(report_path, 'w') as f:
        f.write(report)
    
    print(f"Report saved to: {report_path}")

if __name__ == '__main__':
    main()