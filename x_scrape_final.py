#!/usr/bin/env python3
"""Final extraction and reporting for X/Twitter posts."""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
REPORT_DIR = Path.home() / ".openclaw" / "workspace" / "knowledge-base" / "x-scrapes"

# Posts from first search query
posts_query1 = [
    {
        "author": "Josh Farkas MD 💊",
        "handle": "PulmCrit",
        "date": "2 hours ago",
        "text": "The approach to CT scanning has changed (for sure), but I think this actually makes sense. Why CT scans make more sense in 2026 than 10-30 years ago: [1] Modern contrast dye isn't nephrotoxic. [2] Modern patients are increasingly complex. I'm increasingly seeing patients who",
        "likes": 68,
        "replies": 5,
        "reposts": 6,
        "views": 10187,
        "url": "https://x.com/PulmCrit/status/2074888397764616637"
    },
    {
        "author": "Chikitshock",
        "handle": "zebrahoofbeat",
        "date": "19 minutes ago",
        "text": "Replying to @PulmCrit: He is not saying don't scan He is saying that you should have a clearly articulated ddx 90% of EM referrals I get are patient confused, CT done Come take a look Its non neurological roughly 60-70% of the time",
        "likes": 0,
        "replies": 1,
        "reposts": 0,
        "views": 36,
        "url": "https://x.com/zebrahoofbeat/status/2074919937290940558"
    },
    {
        "author": "Chikitshock",
        "handle": "zebrahoofbeat",
        "date": "17 minutes ago",
        "text": "The problem with weak ddx is that you won't know when to press harder I had a suspected post circulation infarct Initial CT was neg as expected Initial 2 MR brains were negative The 3rd MR brain with very thin sections got the infarct My provisional dx was clear",
        "likes": 0,
        "replies": 1,
        "reposts": 0,
        "views": 13,
        "url": "https://x.com/zebrahoofbeat/status/2074920360827629694"
    },
    {
        "author": "The University of Texas System",
        "handle": "utsystem",
        "date": "5 minutes ago",
        "text": "Globally, more than 12 million people experience a stroke each year — so quality rehabilitation can make a lasting difference around the world. 🌎 🩺 A @UTHealthHouston neurologist helped develop a new international certification program for health providers designed to improve",
        "likes": 0,
        "replies": 0,
        "reposts": 0,
        "views": 27,
        "url": "https://x.com/utsystem/status/2074923417640276436"
    }
]

# Posts from second search query (cerebral AVM, intracranial aneurysm, endovascular)
posts_query2 = [
    {
        "author": "Behindwoods",
        "handle": "behindwoods",
        "date": "4 hours ago",
        "text": "இளம் வயதில் கூட Heart Attack வரக்கூடுமா? 🤯 DR Babu Ezhumalai Awareness பேட்டி Dr. Babu Ezhumalai is a Senior Interventional Cardiologist at MGM Healthcare, Nelson Manickam Road, Chennai, specializing in Complex High-Risk (CHIP) angioplasty, structural heart interventions,",
        "likes": 2,
        "replies": 0,
        "reposts": 0,
        "views": 3012,
        "url": "https://x.com/behindwoods/status/2074857447140028747"
    },
    {
        "author": "ɴᴀᴠᴇᴇɴ ᴋᴜᴍᴀʀ",
        "handle": "DrNovinoTailor",
        "date": "1 hour ago",
        "text": "Ewart's sign (dullness below left scapula) is seen in: #MedX",
        "likes": 6,
        "replies": 4,
        "reposts": 1,
        "views": 464,
        "url": "https://x.com/DrNovinoTailor/status/2074906479505920031"
    }
]

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
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
            url TEXT UNIQUE,
            search_query TEXT,
            scraped_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_posts_url ON posts(url)")
    conn.commit()
    return conn

def save_posts_to_db(posts, search_query):
    """Save posts to database."""
    conn = init_db()
    cursor = conn.cursor()
    new_count = 0
    
    for post in posts:
        try:
            cursor.execute("""
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, replies, reposts, views, url, search_query, scraped_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                post.get('author', 'Unknown'),
                post.get('handle', 'unknown'),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('replies', 0),
                post.get('reposts', 0),
                post.get('views', 0),
                post.get('url', ''),
                search_query,
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()
    conn.close()
    return new_count

def generate_markdown_report(posts, search_query, new_count):
    """Generate markdown report."""
    today = datetime.now().strftime("%Y-%m-%d")
    report_file = REPORT_DIR / f"x-scrape-{today}.md"
    
    existing_content = ""
    if report_file.exists():
        existing_content = report_file.read_text()
    
    new_content = f"\n## Search: {search_query}\n\n"
    new_content += f"**Scraped at:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    new_content += f"**New posts found:** {new_count}\n\n"
    
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    if high_engagement:
        new_content += "### High Engagement Posts (>50 likes)\n\n"
        for post in high_engagement:
            new_content += f"#### {post.get('author', 'Unknown')} (@{post.get('handle', 'unknown')})\n\n"
            new_content += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            new_content += f"{post.get('text', '')[:500]}...\n\n"
            new_content += f"**Engagement:** {post.get('likes', 0)} likes, {post.get('replies', 0)} replies, {post.get('reposts', 0)} reposts, {post.get('views', 0)} views\n\n"
            new_content += f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n"
            new_content += "---\n\n"
    
    if not existing_content:
        header = f"# X/Twitter Scrape Report - {today}\n\n"
        header += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        report_file.write_text(header + new_content)
    else:
        report_file.write_text(existing_content + new_content)
    
    return report_file

if __name__ == "__main__":
    # Process both search queries
    query1 = "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    query2 = "cerebral AVM OR intracranial aneurysm OR endovascular"
    
    # Save first query
    new_count1 = save_posts_to_db(posts_query1, query1)
    print(f"Query 1: Saved {new_count1} new posts")
    
    # Save second query
    new_count2 = save_posts_to_db(posts_query2, query2)
    print(f"Query 2: Saved {new_count2} new posts")
    
    # Generate reports
    generate_markdown_report(posts_query1, query1, new_count1)
    report_file = generate_markdown_report(posts_query2, query2, new_count2)
    
    # Summary
    all_posts = posts_query1 + posts_query2
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    
    print(f"\n✓ Total new posts: {new_count1 + new_count2}")
    print(f"✓ High engagement posts (>50 likes): {len(high_engagement)}")
    print(f"✓ Report saved: {report_file}")
    
    for post in high_engagement:
        print(f"  - {post['author']} (@{post['handle']}): {post['likes']} likes")