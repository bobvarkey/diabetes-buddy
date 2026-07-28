#!/usr/bin/env python3
import sqlite3
from datetime import datetime
import os

# Create output directory
output_dir = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes"
os.makedirs(output_dir, exist_ok=True)

# Query database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all posts
cursor.execute('''
    SELECT author, handle, date, text, url, replies, reposts, likes, bookmarks, views, search_query
    FROM x_posts
    ORDER BY scraped_at DESC
''')

posts = cursor.fetchall()
conn.close()

# Generate markdown report
report_date = "2026-05-22"
report_path = f"{output_dir}/x-scrape-{report_date}.md"

with open(report_path, 'w', encoding='utf-8') as f:
    f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
    f.write(f"**Date:** {report_date}\n\n")
    f.write(f"**Scraped At:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"---\n\n")

    f.write(f"## Summary\n\n")
    f.write(f"- **Total Posts Found:** {len(posts)}\n")

    # Count high-engagement posts (>50 likes)
    high_engagement = [p for p in posts if p[7] > 50]
    f.write(f"- **High-Engagement Posts (>50 likes):** {len(high_engagement)}\n\n")

    f.write(f"## Posts by Search Query\n\n")

    # Group by search query
    queries = {}
    for post in posts:
        query = post[10]
        if query not in queries:
            queries[query] = []
        queries[query].append(post)

    for query, query_posts in queries.items():
        f.write(f"### Query: `{query}`\n\n")
        f.write(f"**Posts:** {len(query_posts)}\n\n")

        for post in query_posts:
            author, handle, date, text, url, replies, reposts, likes, bookmarks, views, _ = post

            f.write(f"#### {author} ({handle})\n\n")
            f.write(f"**Date:** {date}\n\n")
            f.write(f"**Text:**\n> {text[:300]}{'...' if len(text) > 300 else ''}\n\n")

            f.write(f"**Engagement:**\n")
            f.write(f"- 👍 {likes} likes\n")
            f.write(f"- 🔄 {reposts} reposts\n")
            f.write(f"- 💬 {replies} replies\n")
            if views > 0:
                f.write(f"- 👁 {views} views\n")

            if likes > 50:
                f.write(f"\n🔥 **HIGH ENGAGEMENT** ({likes} likes)\n")

            if url:
                f.write(f"\n**URL:** [{url}]({url})\n")

            f.write(f"\n---\n\n")

    f.write(f"## High-Engagement Posts (>50 likes)\n\n")

    if high_engagement:
        for post in high_engagement:
            author, handle, date, text, url, replies, reposts, likes, bookmarks, views, query = post
            f.write(f"### {author} ({handle}) - {likes} likes\n\n")
            f.write(f"**Query:** `{query}`\n\n")
            f.write(f"**Date:** {date}\n\n")
            f.write(f"**Text:**\n> {text[:300]}{'...' if len(text) > 300 else ''}\n\n")
            if url:
                f.write(f"**URL:** [{url}]({url})\n\n")
            f.write(f"---\n\n")
    else:
        f.write("No high-engagement posts found in this scrape.\n\n")

print(f"✓ Report created: {report_path}")
print(f"  Total posts: {len(posts)}")
print(f"  High-engagement posts: {len(high_engagement)}")