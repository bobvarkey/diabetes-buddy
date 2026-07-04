#!/usr/bin/env python3
import sqlite3
from datetime import datetime

# Posts from second search (cerebral AVM OR intracranial aneurysm OR endovascular)
posts_search2 = [
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Jul 12, 2025",
        "text": "Intra-Arterial Thrombolysis Following Endovascular Recanalization for Large Vessel Occlusion Stroke: A Systematic Review and Meta-Analysis hubs.la/Q03wLqk80 #NeuroX",
        "likes": 17,
        "reposts": 6,
        "replies": 3,
        "views": 2507,
        "url": "https://x.com/GreenJournal/status/1943790444237766670"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Dec 25, 2024",
        "text": "Association Between Time to Treatment and Outcomes of Endovascular Therapy vs Medical Management in Patients With Large Ischemic Stroke: bit.ly/3ZE1UKr #NeuroTwitter #NeuroX",
        "likes": 12,
        "reposts": 5,
        "replies": 1,
        "views": 2960,
        "url": "https://x.com/GreenJournal/status/1871925639206306170"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Aug 30, 2025",
        "text": "Endovascular Treatment in Acute Ischemic Stroke Due to Occlusion of Medium or Distal Vessels: A Systematic Review and Meta-Analysis hubs.ly/Q03GgWhH0",
        "likes": 46,
        "reposts": 17,
        "replies": 0,
        "views": 3377,
        "url": "https://x.com/GreenJournal/status/1961791252703138228"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "May 2, 2025",
        "text": "Influence of Asymptomatic Hemorrhagic Transformation After Endovascular Treatment on Stroke Outcome: A Population-Based Study hubs.la/Q03kyBRC0 #stroke #NeuroTwitter",
        "likes": 28,
        "reposts": 12,
        "replies": 2,
        "views": 2757,
        "url": "https://x.com/GreenJournal/status/1918060779187617827"
    },
    {
        "author": "Alexander Mladenow MD",
        "handle": "@alex1708ander",
        "date": "23h",
        "text": "Which of these RV-focused ME 4-chamber images is most consistent with acute pulmonary embolism? #echofirst #RVoverload 😬 🙄 😯 ? And why?",
        "likes": 19,
        "reposts": 5,
        "replies": 8,
        "views": 4233,
        "url": "https://x.com/alex1708ander/status/2072756256264114315"
    },
    {
        "author": "Marco Kaldas",
        "handle": "@MKaldas",
        "date": "6h",
        "text": "Replying to @alex1708ander However the 3rd one is the most interesting:) Acute RV failure ,likely ischemia involving RCA/Acute marginal",
        "likes": 1,
        "reposts": 0,
        "replies": 1,
        "views": 49,
        "url": "https://x.com/MKaldas/status/2073011534771487205"
    },
    {
        "author": "Batman-Echo",
        "handle": "@echo_batman",
        "date": "Jul 2",
        "text": "What's the diagnosis in 79F?",
        "likes": 30,
        "reposts": 8,
        "replies": 7,
        "views": 3055,
        "url": "https://x.com/echo_batman/status/2072692717310673030"
    }
]

# Connect to database
conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
cursor = conn.cursor()

# Insert posts from search 2
search_query2 = "cerebral AVM OR intracranial aneurysm OR endovascular"
scraped_at = datetime.now().isoformat()

inserted_count2 = 0
for post in posts_search2:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO posts (author_name, handle, datetime, text, likes, reposts, replies, views, url, search_query, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (post['author'], post['handle'], post['date'], post['text'], 
              str(post['likes']), str(post['reposts']), str(post['replies']), str(post['views']),
              post['url'], search_query2, scraped_at))
        if cursor.rowcount > 0:
            inserted_count2 += 1
    except Exception as e:
        print(f"Error inserting {post['url']}: {e}")

conn.commit()

# Get total count and high-engagement posts
cursor.execute("SELECT COUNT(*) FROM posts")
total_count = cursor.fetchone()[0]

cursor.execute("SELECT COUNT(*) FROM posts WHERE CAST(likes AS INTEGER) > 50")
high_engagement_count = cursor.fetchone()[0]

cursor.execute("SELECT author_name, handle, text, likes, views, url FROM posts WHERE CAST(likes AS INTEGER) > 50 ORDER BY CAST(likes AS INTEGER) DESC")
high_engagement_posts = cursor.fetchall()

conn.close()

# Generate markdown report
report_date = "2026-05-22"
report_path = f"/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-{report_date}.md"

report = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (Asia/Calcutta)
**Reference UTC:** 2026-07-03 18:32 UTC

## Summary

- **Total posts scraped:** {total_count}
- **High-engagement posts (>50 likes):** {high_engagement_count}

## Search Queries

1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
2. `cerebral AVM OR intracranial aneurysm OR endovascular`

## High-Engagement Posts (>50 Likes)

"""

if high_engagement_posts:
    for i, (author, handle, text, likes, views, url) in enumerate(high_engagement_posts, 1):
        report += f"""### {i}. {author} ({handle})
- **Likes:** {likes}
- **Views:** {views}
- **Text:** {text[:200]}{'...' if len(text) > 200 else ''}
- **URL:** {url}

"""
else:
    report += "No posts with >50 likes found in this scrape.\n\n"

report += """## Search 1: Neurointervention & Thrombectomy

Posts related to neurointervention, thrombectomy, and stroke:

| Author | Date | Text Preview | Likes | Views |
|--------|------|--------------|-------|-------|
| Neurology Journal | Jun 12 | Embolic Stroke podcast on TCD, TTE, TEE, cardiac CT | 23 | 4195 |
| Transcatheter Academy | Jul 1 | PE management strategies discussion | 2 | 46 |
| Craig E Brown | 6h | Stroke recovery & peri-infarct blood flow research | 4 | 159 |
| Neurology Journal | 11h | Vertebral Artery Occlusion case | 44 | 2400 |
| AHA Science | Jul 2 | LV systolic dysfunction & stroke | 72 | 4826 |
| MiniCardiac | Jul 2 | Heart-brain connection comment | 0 | 33 |
| Nick Clarke | Jun 28 | #Stroke image | 3 | 72 |
| Keeway Medical | 5h | Thrombectomy catheters promotion | 0 | 1 |
| KMCH Hospitals | 5h | Rotarex Thrombectomy introduction | 0 | 7 |

## Search 2: Cerebral AVM & Intracranial Aneurysm

Posts related to cerebral AVM, intracranial aneurysm, and endovascular:

| Author | Date | Text Preview | Likes | Views |
|--------|------|--------------|-------|-------|
| Neurology Journal | Jul 12, 2025 | Intra-Arterial Thrombolysis meta-analysis | 17 | 2507 |
| Neurology Journal | Dec 25, 2024 | Endovascular Therapy vs Medical Management | 12 | 2960 |
| Neurology Journal | Aug 30, 2025 | Medium/Distal Vessel Occlusion treatment | 46 | 3377 |
| Neurology Journal | May 2, 2025 | Hemorrhagic Transformation & stroke outcome | 28 | 2757 |
| Alexander Mladenow MD | 23h | RV-focused echo for PE diagnosis | 19 | 4233 |
| Marco Kaldas | 6h | RV failure & ischemia comment | 1 | 49 |
| Batman-Echo | Jul 2 | Diagnostic echo case | 30 | 3055 |

## Database

All posts saved to: `/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db`

## Notes

- Search performed using X/Twitter browser automation
- Posts extracted from "Top" search results
- Engagement metrics captured as shown in the UI
"""

# Write report
with open(report_path, 'w') as f:
    f.write(report)

print(f"\n=== Scrape Complete ===")
print(f"Inserted {inserted_count2} new posts from search 2")
print(f"Total posts in database: {total_count}")
print(f"High-engagement posts (>50 likes): {high_engagement_count}")
print(f"Report saved to: {report_path}")