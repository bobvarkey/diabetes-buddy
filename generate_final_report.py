#!/usr/bin/env python3
"""
Generate final comprehensive report from database
"""

import sqlite3
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

def create_report():
    """Create markdown report from database"""
    report_dir = REPORT_DIR
    report_dir.mkdir(parents=True, exist_ok=True)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get all posts ordered by likes
    cursor.execute('''
        SELECT author, handle, post_date, post_text, likes, reposts, replies, views, url, search_query
        FROM posts
        ORDER BY likes DESC
    ''')
    
    all_posts = cursor.fetchall()
    
    # Group by search query
    posts_by_query = {}
    for post in all_posts:
        query = post[9]
        if query not in posts_by_query:
            posts_by_query[query] = []
        posts_by_query[query].append({
            'author': post[0],
            'handle': post[1],
            'date': post[2],
            'text': post[3],
            'likes': post[4],
            'reposts': post[5],
            'replies': post[6],
            'views': post[7],
            'url': post[8]
        })
    
    total_posts = len(all_posts)
    high_engagement = [p for p in all_posts if p[4] > 50]
    
    # Generate report
    report_content = f"""# X/Twitter Neurointervention Scrape Report

**Date:** 2026-05-22  
**Time:** {datetime.now().strftime('%H:%M:%S')} IST  
**Total Posts Extracted:** {total_posts}

---

## 📊 Executive Summary

- **Total Posts:** {total_posts}
- **High-Engagement Posts (>50 likes):** {len(high_engagement)}
- **Search Queries:** {len(posts_by_query)}

"""
    
    if high_engagement:
        report_content += """### 🔥 Top Performing Posts

"""
        for i, post in enumerate(high_engagement[:5], 1):
            author, handle, date, text, likes, reposts, replies, views, url = post
            report_content += f"""{i}. **{author}** ({handle})
   - {likes} likes, {reposts} reposts, {views:,} views
   - {text[:100]}...

"""
    
    for query, posts in posts_by_query.items():
        report_content += f"""---

## Search Query: `{query}`

**Posts Found:** {len(posts)}

"""
        
        high_eng_query = [p for p in posts if p['likes'] > 50]
        if high_eng_query:
            report_content += f"**High-Engagement Posts (>50 likes):** {len(high_eng_query)}\n\n"
        
        report_content += "### All Posts\n\n"
        
        for i, post in enumerate(posts, 1):
            report_content += f"""#### Post {i}

**Author:** {post['author']}  
**Handle:** {post['handle']}  
**Date:** {post['date']}  
**URL:** {post['url']}

**Content:**
> {post['text']}

**Engagement:**
- 👍 Likes: {post['likes']:,}
- 🔄 Reposts: {post['reposts']}
- 💬 Replies: {post['replies']}
- 👁️ Views: {post['views']:,}

---

"""
    
    conn.close()
    
    # Save to file
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    return report_content, total_posts, len(high_engagement)

if __name__ == "__main__":
    report, total, high_eng = create_report()
    print(f"✅ Report saved to {REPORT_PATH}")
    print(f"📊 Total posts: {total}")
    print(f"🔥 High-engagement posts (>50 likes): {high_eng}")
