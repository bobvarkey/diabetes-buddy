#!/usr/bin/env python3
import sqlite3
from datetime import datetime
import os

# Initialize database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all posts from today's scrape
cursor.execute('''
    SELECT author, handle, date, text, replies, reposts, likes, views, url, search_query 
    FROM x_posts 
    WHERE date(scraped_at) = date('now')
    ORDER BY likes DESC, views DESC
''')
posts = cursor.fetchall()

# Get high engagement posts (>50 likes)
cursor.execute('SELECT * FROM x_posts WHERE likes > 50 ORDER BY likes DESC')
high_engagement = cursor.fetchall()

conn.close()

# Create markdown report
report = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} IST

## Summary

- **Total new posts found:** {len(posts)}
- **High engagement posts (>50 likes):** {len(high_engagement)}
- **Search queries:**
  1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
  2. `cerebral AVM OR intracranial aneurysm OR endovascular`

## High Engagement Posts (>50 likes)

"""

if high_engagement:
    for idx, post in enumerate(high_engagement[:10], 1):
        report += f"""### {idx}. {post[1]} ({post[2]})
- **Text:** {post[4][:150]}...
- **Engagement:** {post[6]} likes, {post[7]} views
- **URL:** {post[9]}

"""
else:
    report += "_No posts with >50 likes found in this scrape._\n\n"

report += """## All Posts from Today's Scrape

"""

for idx, post in enumerate(posts, 1):
    author, handle, date, text, replies, reposts, likes, views, url, search_query = post
    report += f"""### {idx}. {author} {handle}
- **Date:** {date}
- **Text:** {text[:200]}{'...' if len(text) > 200 else ''}
- **Engagement:** {likes} likes, {reposts} reposts, {replies} replies, {views:,} views
- **URL:** {url}
- **Search:** {search_query}

"""

report += f"""
## Database Location
All posts saved to: `/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db`

## Notes
- Posts were scraped using OpenClaw browser automation
- Data includes posts from X/Twitter search results for neurointervention-related topics
- Database includes deduplication by URL to avoid duplicate entries
"""

# Save report
report_dir = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
os.makedirs(report_dir, exist_ok=True)
report_path = f"{report_dir}/x-scrape-2026-05-22.md"

with open(report_path, 'w') as f:
    f.write(report)

print(f"Report saved to: {report_path}")
print(f"\nTotal posts: {len(posts)}")
print(f"High engagement posts: {len(high_engagement)}")