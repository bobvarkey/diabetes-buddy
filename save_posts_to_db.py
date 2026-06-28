#!/usr/bin/env python3
"""Save X posts to database and generate report."""

import sqlite3
import json
from datetime import datetime
from pathlib import Path

# Combined posts from both searches
all_posts = [
    # From first search query
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2024-05-04T04:01:05.000Z",
        "text": "#NeuroImage: Migration of Iophendylate Myelography Contrast to the Brain With Successful Thrombectomy https://bit.ly/3JIcvfP",
        "likes": 18,
        "reposts": 8,
        "replies": 1,
        "views": 4441,
        "bookmarks": 1,
        "url": "https://x.com/GreenJournal/status/1786606951595418107",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Resham Singh Thakur",
        "handle": "@doctorResham09",
        "date": "2026-06-26T18:24:54.000Z",
        "text": "From complex neurointerventions and H & N embolisation to lienorenal shunt embolisation for recurrent HE and minimally invasive aortoiliac reconstruction and SFA revascularisation for PAD—our IR team continues to deliver scarless treatments across the head to toe spectrum.",
        "likes": 0,
        "reposts": 0,
        "replies": 4,
        "views": 4,
        "bookmarks": 0,
        "url": "https://x.com/doctorResham09/status/2070574038322176347",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Dr Sharath Kumar G",
        "handle": "@SharathKumarGG7",
        "date": "2026-06-15T01:51:49.000Z",
        "text": "New insights from the PEARL Trial! A post hoc analysis shows that adjunctive intra-arterial (IA) alteplase (0.225 mg/kg) is associated with improved 90-day functional outcomes for acute ischemic stroke patients who achieved near-complete or complete reperfusion (eTICI 2c/3)",
        "likes": 8,
        "reposts": 4,
        "replies": 4,
        "views": 569,
        "bookmarks": 5,
        "url": "https://x.com/SharathKumarGG7/status/2066337854134128735",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "dietbloom",
        "handle": "@dietbloom",
        "date": "2026-06-22T14:15:31.000Z",
        "text": "A stroke doesn't always happen \"suddenly.\" In many people, the body has been sending warning signs for years; high blood pressure, poor diet, uncontrolled sugar levels, smoking, inactivity, until one day, blood flow to the brain is disrupted.",
        "likes": 2,
        "reposts": 1,
        "replies": 1,
        "views": 1014,
        "bookmarks": 0,
        "url": "https://x.com/dietbloom/status/2069061727983952319",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "dietbloom",
        "handle": "@dietbloom",
        "date": "2026-06-22T14:15:33.000Z",
        "text": "And when that happens, brain cells begin dying within minutes. A stroke occurs when the brain stops receiving enough blood and oxygen. This can happen because a blood vessel becomes blocked (ischemic stroke) or a blood vessel bursts and bleeds into the brain.",
        "likes": 0,
        "reposts": 0,
        "replies": 1,
        "views": 133,
        "bookmarks": 0,
        "url": "https://x.com/dietbloom/status/2069061736208945342",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "dietbloom",
        "handle": "@dietbloom",
        "date": "2026-06-22T14:15:34.000Z",
        "text": "This is called haemorrhagic stroke. Both are medical emergencies. What makes stroke so dangerous? The brain controls movement, speech, memory, breathing, vision, and coordination. So when part of the brain is damaged, the effects can be life-changing.",
        "likes": 0,
        "reposts": 0,
        "replies": 1,
        "views": 105,
        "bookmarks": 0,
        "url": "https://x.com/dietbloom/status/2069061740789174581",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Pranjal Rai, MD",
        "handle": "@pranj_rad",
        "date": "2026-06-24T19:31:12.000Z",
        "text": "This @radiology_rsna study shows that thrombectomy technique in posterior circulation tandem occlusions can affect the long term outcomes of patients? Come find out more with me in this #RIAM @VChernyakMD @RadiologyEditor @RITEditor @SuhnyAbbara : https://pubs.rsna.org/doi/10.1148/radiol.252830",
        "likes": 7,
        "reposts": 7,
        "replies": 7,
        "views": 703,
        "bookmarks": 0,
        "url": "https://x.com/pranj_rad/status/2069865948085895566",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Penumbra, Inc.",
        "handle": "@penumbrainc",
        "date": "2026-06-11T20:11:55.000Z",
        "text": "Penumbra's THUNDERBOLT receives FDA clearance - bringing computer assisted vacuum thrombectomy technology to neuro intervention. Read more here: https://bit.ly/4uqFXMl. #NeuroIntervention #CAVT #MedDevice #MedTech",
        "likes": 22,
        "reposts": 11,
        "replies": 11,
        "views": 566,
        "bookmarks": 0,
        "url": "https://x.com/penumbrainc/status/2065165151112671403",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    # From second search query
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2021-11-17T15:32:01.000Z",
        "text": "Available online: Neurology 97 (20 Supplement 2)—Endovascular Approaches to Ischemic #Stroke: An Update From the Society for Vascular and Interventional #Neurology http://bit.ly/32c0SLR",
        "likes": 44,
        "reposts": 12,
        "replies": 12,
        "views": 0,
        "bookmarks": 4,
        "url": "https://x.com/GreenJournal/status/1460994140133539840",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2026-01-30T17:11:33.000Z",
        "text": "Admission Systolic Blood Pressure and Outcomes After Endovascular Thrombectomy: An International EVA-TRISP Cohort Study https://hubs.la/Q040X_K60",
        "likes": 4,
        "reposts": 1,
        "replies": 2,
        "views": 1097,
        "bookmarks": 4,
        "url": "https://x.com/GreenJournal/status/2017284562699665497",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Michael T. Lawton, MD",
        "handle": "@mtlawton",
        "date": "2026-06-26T16:13:31.000Z",
        "text": "Pulled out all stops for this basilar aneurysm: rapid ventricular pacing to soften aneurysm; tandem curved clipping to reduce its girth; tentorium disassembly to increase transsylvian exposure for proximal control lateral to trochlear n.; aneurysm clipping thru 3 triangles:",
        "likes": 61,
        "reposts": 8,
        "replies": 4,
        "views": 12131,
        "bookmarks": 16,
        "url": "https://x.com/mtlawton/status/2070540973042458660",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "2025-10-24T14:39:33.000Z",
        "text": "Cost-Effectiveness of Endovascular Thrombectomy in Large Vessel Occlusion Stroke for the Very Elderly: https://hubs.la/Q03Q1ctk0",
        "likes": 16,
        "reposts": 6,
        "replies": 6,
        "views": 1983,
        "bookmarks": 6,
        "url": "https://x.com/GreenJournal/status/1981732297100370173",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "NEJM",
        "handle": "@NEJM",
        "date": "2026-06-21T19:00:12.000Z",
        "text": "Original Article: Endovascular Therapy for Post-Thrombotic Syndrome — A Randomized Trial (phase 3 C-TRACT trial) https://nej.md/3QsqxJ2 Editorial: Stenting for Post-Thrombotic Syndrome — A Step Forward https://nej.md/4mhaFoJ #Surgery #Cardiology",
        "likes": 45,
        "reposts": 16,
        "replies": 16,
        "views": 11891,
        "bookmarks": 8,
        "url": "https://x.com/NEJM/status/2068770979409539426",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    }
]

def main():
    db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
    report_path = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
    
    # Initialize database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            likes INTEGER,
            reposts INTEGER,
            replies INTEGER,
            views INTEGER,
            bookmarks INTEGER,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(handle, text)
        )
    ''')
    
    # Count existing posts
    cursor.execute("SELECT COUNT(*) FROM posts")
    existing_count = cursor.fetchone()[0]
    
    # Insert posts
    inserted = 0
    for post in all_posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, likes, reposts, replies, views, bookmarks, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['reposts'],
                post['replies'],
                post['views'],
                post['bookmarks'],
                post['url'],
                post['search_query']
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    
    # Get total count
    cursor.execute("SELECT COUNT(*) FROM posts")
    total_count = cursor.fetchone()[0]
    
    # Get high engagement posts (>50 likes)
    cursor.execute("SELECT * FROM posts WHERE likes > 50 ORDER BY likes DESC")
    high_engagement = cursor.fetchall()
    
    conn.close()
    
    # Generate report
    today = datetime.now().strftime("%A, %B %dth, %Y - %H:%M (Asia/Calcutta)")
    utc_ref = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    
    report = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {today}
**Reference UTC:** {utc_ref}

## Summary

Scraped X/Twitter for neurointervention and stroke-related posts using the following search queries:
1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
2. `cerebral AVM OR intracranial aneurysm OR endovascular`

### Statistics
- **Total Posts in Database:** {total_count}
- **Posts Found This Session:** {len(all_posts)}
- **New Posts Added:** {inserted}
- **High-Engagement Posts (>50 likes):** {len(high_engagement)}

## High-Engagement Posts (>50 Likes)

"""
    
    if high_engagement:
        for post in high_engagement:
            author, handle, date, text, likes, reposts, replies, views, bookmarks, url, search_query = post[:11]
            report += f"""### {author} ({handle})
**Date:** {date}
**Likes:** {likes} | **Reposts:** {reposts} | **Replies:** {replies} | **Views:** {views:,}
**Text:** "{text[:200]}{'...' if len(text) > 200 else ''}"
**URL:** {url}

"""
    
    report += """## All Posts from This Session

"""
    
    for post in all_posts:
        report += f"""### {post['author']} ({post['handle']})
**Date:** {post['date']}
**Likes:** {post['likes']} | **Reposts:** {post['reposts']} | **Replies:** {post['replies']} | **Views:** {post['views']:,}
**Text:** "{post['text'][:200]}{'...' if len(post['text']) > 200 else ''}"
**URL:** {post['url']}
**Query:** `{post['search_query']}`

"""
    
    report += """## Key Topics Identified

1. **Endovascular Thrombectomy** - Multiple posts discussing outcomes, techniques, and clinical trials
2. **Stroke Treatment** - Posts about stroke management, outcomes, and patient education
3. **Aneurysm Treatment** - Surgical and endovascular approaches to intracranial aneurysms
4. **Neurointervention Technology** - FDA clearances, new devices, and techniques
5. **Clinical Research** - Studies from NEJM, Neurology Journal, and radiology journals

## Notes

- Posts were scraped using the browser automation tool
- Engagement metrics include likes, reposts, replies, views, and bookmarks
- High-engagement posts (>50 likes) are highlighted above
- All posts are stored in the SQLite database for future reference

## Database Storage

All posts have been saved to: `/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db`

Table: `posts`
- Contains all scraped posts with metadata
- Fields: id, author, handle, date, text, likes, reposts, replies, views, bookmarks, url, search_query, scraped_at
"""
    
    # Write report
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"Report saved to: {report_path}")
    print(f"Database updated: {db_path}")
    print(f"Total posts: {total_count}")
    print(f"New posts added: {inserted}")
    print(f"High-engagement posts (>50 likes): {len(high_engagement)}")
    
    return inserted

if __name__ == '__main__':
    main()