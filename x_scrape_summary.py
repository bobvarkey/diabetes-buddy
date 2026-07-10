#!/usr/bin/env python3
"""Final comprehensive scrape summary for X/Twitter posts."""

import json
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path.home() / ".openclaw" / "workspace" / "memory_x_posts.db"
REPORT_DIR = Path.home() / ".openclaw" / "workspace" / "knowledge-base" / "x-scrapes"

# All posts from both search queries
all_posts = [
    # Query 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke
    {
        "author": "Josh Farkas MD 💊",
        "handle": "PulmCrit",
        "date": "2 hours ago",
        "text": "The approach to CT scanning has changed (for sure), but I think this actually makes sense. Why CT scans make more sense in 2026 than 10-30 years ago: [1] Modern contrast dye isn't nephrotoxic. [2] Modern patients are increasingly complex. I'm increasingly seeing patients who",
        "likes": 68,
        "replies": 5,
        "reposts": 6,
        "views": 10187,
        "url": "https://x.com/PulmCrit/status/2074888397764616637",
        "query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
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
        "url": "https://x.com/zebrahoofbeat/status/2074919937290940558",
        "query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
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
        "url": "https://x.com/zebrahoofbeat/status/2074920360827629694",
        "query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
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
        "url": "https://x.com/utsystem/status/2074923417640276436",
        "query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    # Query 2: cerebral AVM OR intracranial aneurysm OR endovascular
    {
        "author": "Behindwoods",
        "handle": "behindwoods",
        "date": "4 hours ago",
        "text": "இளம் வயதில் கூட Heart Attack வரக்கூடுமா? 🤯 DR Babu Ezhumalai Awareness பேட்டி Dr. Babu Ezhumalai is a Senior Interventional Cardiologist at MGM Healthcare, Nelson Manickam Road, Chennai, specializing in Complex High-Risk (CHIP) angioplasty, structural heart interventions,",
        "likes": 2,
        "replies": 0,
        "reposts": 0,
        "views": 3012,
        "url": "https://x.com/behindwoods/status/2074857447140028747",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
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
        "url": "https://x.com/DrNovinoTailor/status/2074906479505920031",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Marcus Pinto, MD, MS",
        "handle": "MarcusVPinto",
        "date": "Mar 13, 2025",
        "text": "Lumbar spine MRI with and without IV contrast should be part of the evaluation of the lumbosacral plexopathies to exclude structural radiculopathies or other pathologies. Lumbar puncture is recommended in acute/subacute or chronic cases. CSF analysis is important to rule out",
        "likes": 8,
        "replies": 1,
        "reposts": 0,
        "views": 1062,
        "url": "https://x.com/MarcusVPinto/status/1899924509827678554",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Marcus Pinto, MD, MS",
        "handle": "MarcusVPinto",
        "date": "Mar 13, 2025",
        "text": "Causes • Trauma: High-energy injuries, such as pelvic fractures from car accidents, can directly damage the plexus. Pelvic or hip surgeries may also lead to plexopathy due to nerve compression or stretching. A less common cause is intrapartum plexopathy, where prolonged labor",
        "likes": 10,
        "replies": 3,
        "reposts": 0,
        "views": 1187,
        "url": "https://x.com/MarcusVPinto/status/1899924513279639721",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Asahi Intecc USA, Inc. Medical Sales",
        "handle": "AIU_Medical",
        "date": "Jul 7",
        "text": "#Meded - Navigating complex anatomy demands a system that delivers precision without compromise. From superior tracking in tortuous vessels to real-time control over wire support, quickly see how specialized microcatheter engineering optimizes your procedural workflow. #MedTech",
        "likes": 6,
        "replies": 1,
        "reposts": 1,
        "views": 731,
        "url": "https://x.com/AIU_Medical/status/2074463522361110762",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "XRP Ledger Announces",
        "handle": "XRPL__A",
        "date": "Aug 3, 2025",
        "text": "An unusual phenomenon, noticed after flow diverter placement for unruptured aneurysms- new onset headache. Some of~ our patients had, but I did not have an explanation for it until this paper-[ Cephalgia following Flow Diversion of Unruptured Intracranial Aneurysms. World",
        "likes": 19,
        "replies": 2,
        "reposts": 3,
        "views": 2721,
        "url": "https://x.com/XRPL__A/status/1951894401648578688",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "sikandar adwani",
        "handle": "SikandarAdwani",
        "date": "Jul 2",
        "text": "Not every hemorrhagic transformation after an ischemic stroke deserves the same reaction. The CT says there is blood. The neurologist must decide how that blood is behaving. I teach my Intensivist's to remember four personalities. HI1 A few scattered petechiae. The infarct",
        "likes": 46,
        "replies": 4,
        "reposts": 6,
        "views": 2221,
        "url": "https://x.com/SikandarAdwani/status/2072570655414104091",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Anthony DiGiorgio, DO, MHA",
        "handle": "DrDiGiorgio",
        "date": "Jul 4",
        "text": "It's July. Brand new interns are starting, freshly minted doctors thrown into the deep end of the pool. One intern, starting on neurosurgery, is managing a list of 60+ patients, from ruptured aneruysms to spinal cord injury. He's only been a doctor for a few days and this is",
        "likes": 436,
        "replies": 56,
        "reposts": 43,
        "views": 54775,
        "url": "https://x.com/DrDiGiorgio/status/2073425809579417888",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "CVIR Endovascular",
        "handle": "cvirendo",
        "date": "Jul 7",
        "text": "A safe seal: controlled flow arrest with dual balloon protection for embolisation of a large spontaneous splenic arteriovenous fistula—a case report",
        "likes": 7,
        "replies": 0,
        "reposts": 2,
        "views": 437,
        "url": "https://x.com/cvirendo/status/2074438048859762763",
        "query": "cerebral AVM OR intracranial aneurysm OR endovascular"
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

def save_posts_to_db(posts):
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
                post.get('query', ''),
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                new_count += 1
        except Exception as e:
            print(f"Error saving post: {e}")
    
    conn.commit()
    conn.close()
    return new_count

def generate_final_report(posts, new_count):
    """Generate final markdown report."""
    today = datetime.now().strftime("%Y-%m-%d")
    report_file = REPORT_DIR / f"x-scrape-{today}.md"
    
    # Group posts by query
    query1_posts = [p for p in posts if "neurointervention" in p.get('query', '')]
    query2_posts = [p for p in posts if "AVM" in p.get('query', '')]
    
    # High engagement posts
    high_engagement = [p for p in posts if p.get('likes', 0) > 50]
    
    # Generate report
    content = f"# X/Twitter Scrape Report - {today}\n\n"
    content += f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    content += f"**Total posts scraped:** {len(posts)}\n\n"
    content += f"**New posts added to database:** {new_count}\n\n"
    
    content += "---\n\n"
    
    content += "## Summary\n\n"
    content += f"- **Search Query 1:** neurointervention OR thrombectomy OR #Neurointervention OR #stroke\n"
    content += f"  - Posts found: {len(query1_posts)}\n\n"
    content += f"- **Search Query 2:** cerebral AVM OR intracranial aneurysm OR endovascular\n"
    content += f"  - Posts found: {len(query2_posts)}\n\n"
    
    if high_engagement:
        content += f"## High Engagement Posts (>50 likes): {len(high_engagement)}\n\n"
        for post in sorted(high_engagement, key=lambda x: x.get('likes', 0), reverse=True):
            content += f"### {post['author']} (@{post['handle']})\n\n"
            content += f"**Date:** {post.get('date', 'Unknown')}\n\n"
            content += f"**Text:**\n```\n{post.get('text', '')[:500]}...\n```\n\n"
            content += f"**Engagement:** {post.get('likes', 0)} likes, {post.get('replies', 0)} replies, {post.get('reposts', 0)} reposts, {post.get('views', 0)} views\n\n"
            content += f"**URL:** [{post.get('url', '')}]({post.get('url', '')})\n\n"
            content += f"**Search Query:** {post.get('query', '')}\n\n"
            content += "---\n\n"
    
    report_file.write_text(content)
    return report_file

if __name__ == "__main__":
    # Save all posts
    new_count = save_posts_to_db(all_posts)
    
    # Generate final report
    report_file = generate_final_report(all_posts, new_count)
    
    # Summary
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    
    print(f"\n{'='*60}")
    print(f"X/Twitter Scrape Summary - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}")
    print(f"\n✓ Total posts scraped: {len(all_posts)}")
    print(f"✓ New posts added to database: {new_count}")
    print(f"✓ High engagement posts (>50 likes): {len(high_engagement)}")
    print(f"\n{'='*60}")
    print(f"High Engagement Posts:")
    print(f"{'='*60}")
    for post in sorted(high_engagement, key=lambda x: x.get('likes', 0), reverse=True):
        print(f"  • {post['author']} (@{post['handle']}): {post['likes']} likes, {post['views']} views")
        print(f"    {post.get('text', '')[:80]}...")
        print()
    print(f"{'='*60}")
    print(f"✓ Report saved: {report_file}")
    print(f"✓ Database: {DB_PATH}")
    print(f"{'='*60}\n")