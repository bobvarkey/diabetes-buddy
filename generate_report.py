#!/usr/bin/env python3
import sqlite3
from datetime import datetime
from pathlib import Path

def generate_markdown_report(db_path, output_path):
    """Generate markdown report from database"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all posts
    cursor.execute('''
        SELECT author, handle, date, text, likes, replies, reposts, views, url, search_query
        FROM posts
        ORDER BY likes DESC, views DESC
    ''')
    posts = cursor.fetchall()
    conn.close()
    
    # Get unique search queries
    search_queries = list(set([p[9] for p in posts]))
    
    # Count high engagement posts
    high_engagement = [p for p in posts if p[4] > 50]
    
    md_content = f"""# X/Twitter Scrape Report
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Search Queries:** {', '.join(search_queries)}

## Summary
- **Total posts found:** {len(posts)}
- **High engagement posts (>50 likes):** {len(high_engagement)}

"""
    
    if high_engagement:
        md_content += "## High Engagement Posts (>50 likes)\n\n"
        for i, post in enumerate(high_engagement, 1):
            author, handle, date, text, likes, replies, reposts, views, url, query = post
            md_content += f"""### {i}. {author} (@{handle})
- **Date:** {date}
- **Engagement:** {likes} likes, {replies} replies, {reposts} reposts, {views} views
- **URL:** [{url}]({url})
- **Text:** {text}

---

"""
    
    md_content += "## All Posts\n\n"
    
    for i, post in enumerate(posts, 1):
        author, handle, date, text, likes, replies, reposts, views, url, query = post
        md_content += f"""### {i}. {author} (@{handle})
- **Date:** {date}
- **Engagement:** {likes} likes, {replies} replies, {reposts} reposts, {views} views
- **URL:** [{url}]({url})
- **Search Query:** {query}
- **Text:** {text}

---

"""
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(md_content)
    print(f"📝 Markdown report saved to: {output_path}")
    print(f"📊 Total posts: {len(posts)}")
    print(f"🔥 High engagement posts (>50 likes): {len(high_engagement)}")

if __name__ == '__main__':
    db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
    markdown_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
    
    generate_markdown_report(db_path, markdown_path)