#!/usr/bin/env python3
import sqlite3
import json
import re
from datetime import datetime
import os

# Create database directory if it doesn't exist
db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Parse posts from first search (neurointervention/stroke)
posts_first_search = [
    {
        "author": "JNIS",
        "handle": "@JNIS_BMJ",
        "text": "Can we expand thrombectomy access in resource-limited settings? 🌍 The GRASSROOT Trial shows excellent safety and efficacy of a value-based stent retriever for LVO stroke in an Low to middle income country. 📊 94% reperfusion | 50% mRS 0–2 👉 jnis.bmj.com/content/early/2025/12/09/jnis-2025-024470 #Stroke",
        "replies": 1,
        "reposts": 6,
        "likes": 23,
        "views": "1.6K",
        "date": "Dec 18, 2025",
        "url": "https://x.com/JNIS_BMJ/status/2074518695691641169"
    },
    {
        "author": "JNIS",
        "handle": "@JNIS_BMJ",
        "text": "Endovascular thrombectomy is a cornerstone treatment for acute ischemic stroke due to large vessel occlusion. Success depends on securely engaging the clot with the aspiration catheter, but direct visualization of this contact is not possible.",
        "replies": 0,
        "reposts": 9,
        "likes": 32,
        "views": "2.5K",
        "date": "Jul 22, 2025",
        "url": "https://x.com/JNIS_BMJ/status/2074518695691641170"
    },
    {
        "author": "Zafar Hashim",
        "handle": "@zafarhashim_INR",
        "text": "For all my Neurointervention buddies out there remember this website. It's fabulous. Gave me some really useful info on device compatibility for a thrombectomy at 4 am this morning. https://neurotool.org @UKNGNeuro @esmintsociety @svinsociety",
        "replies": 4,
        "reposts": 9,
        "likes": 7,
        "views": "49.2K",
        "date": "Feb 1, 2023",
        "url": "https://x.com/zafarhashim_INR/status/1989311229446201369"
    },
    {
        "author": "American Academy of Neurology",
        "handle": "@AANmember",
        "text": "Take a look at this case and see if your thinking aligns with what's presented in the full NeuroBytes video. Based on this case, when is the ideal time to start a direct oral anticoagulant (DOAC)? Watch to learn more: https://hubs.la/Q04p5C630 #Neurology #MedEd",
        "replies": 14,
        "reposts": 5,
        "likes": 30,
        "views": "Unknown",
        "date": "9h",
        "url": "https://x.com/AANmember/status/2075284622166917436"
    },
    {
        "author": "Dr M Shujat Rasool",
        "handle": "@DrMShujat",
        "text": "As a doctor working in the Emergency Department, what will you treat FIRST? A. BP 70/40 B. HR 130 C. RR 30 D. SpO2 86% on RA This is a fundamental rule every doctor must know.",
        "replies": 74,
        "reposts": 42,
        "likes": 422,
        "views": "222K",
        "date": "Jul 8",
        "url": "https://x.com/DrMShujat/status/2074831846899388448"
    },
    {
        "author": "Dr M Shujat Rasool",
        "handle": "@DrMShujat",
        "text": "Answer: D. SpO₂ 86% on room air. An SpO₂ of 86% means the patient is hypoxemic. Without adequate oxygen, the brain, heart, and other vital organs begin to fail within minutes. Always correct oxygenation first, then move on to circulation and the underlying cause.",
        "replies": 8,
        "reposts": 12,
        "likes": 139,
        "views": "42K",
        "date": "Jul 8",
        "url": "https://x.com/DrMShujat/status/2074851931051479180"
    },
    {
        "author": "Chail Shah, MD",
        "handle": "@ChailShah",
        "text": "Excited to share our latest publication! Blood Pressure Variability in Acute Ischemic Stroke: Clinical Evidence, Measurement Challenges, and Future Directions Read the article: onlinelibrary.wiley.com/doi/10.1111/jc #Stroke #Neurology #NeurocriticalCare #Hypertension #meded #foamed",
        "replies": 1,
        "reposts": 1,
        "likes": 2,
        "views": "86",
        "date": "Jul 8",
        "url": "https://x.com/ChailShah/status/2074562217005973648"
    },
    {
        "author": "Mohamed Elfil, MD",
        "handle": "@MohamedElfilMD",
        "text": "In neurointervention, it's all 'wax in, wax out': Repeat, refine, master. Check our article entitled 'Innovations in Thrombectomy Training: A Systematic Review and Expert Recommendations from the SVIN-Mission Thrombectomy Initiative.",
        "replies": 0,
        "reposts": 4,
        "likes": 27,
        "views": "2.4K",
        "date": "Nov 14, 2025",
        "url": "https://x.com/MohamedElfilMD/status/1989311229446201369"
    },
    {
        "author": "Frontiers - Stroke",
        "handle": "@FrontStroke_",
        "text": "New Research: Age, race, and education as moderators of post-stroke cognitive decline following dental care frontiersin.org/articles/10.33 #FrontiersIn #Stroke",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "27",
        "date": "Jul 7",
        "url": "https://x.com/FrontStroke_/status/2074518695691641169"
    },
    {
        "author": "Neuroscience News",
        "handle": "@NeuroscienceNew",
        "text": "Electrical Therapy Offers Promise for Stroke Patients http://neurosciencenews.com/stroke-apahsia-tdcs-3773 #stroke #science #health",
        "replies": 12,
        "reposts": 9,
        "likes": 1,
        "views": "19",
        "date": "Mar 2, 2016",
        "url": "https://x.com/NeuroscienceNew/status/1"
    },
    {
        "author": "Neuroscience News",
        "handle": "@NeuroscienceNew",
        "text": "Set of Genes Linked to Stroke and Dementia Identified http://neurosciencenews.com/foxf2-stroke-dementia-genetics-3999 #stroke #alzheimers #neuroscience",
        "replies": 4,
        "reposts": 3,
        "likes": 8,
        "views": "5.2K",
        "date": "Apr 8, 2016",
        "url": "https://x.com/NeuroscienceNew/status/2"
    }
]

# Parse posts from second search (cerebral AVM/intracranial aneurysm/endovascular)
posts_second_search = [
    {
        "author": "Vineeth Jaison",
        "handle": "@JaisonVineeth",
        "text": "Endovascular Mechanical Thrombectomy for a young adult within 2 hours of occlusion - TICI 3 achieved patient improved from GCS improved from E2M2Vt to E4V4M6 within 24 hours @pb10_bmt @preethijaison #cmcludhiana Post EVT video #neurointervention",
        "replies": 0,
        "reposts": 3,
        "likes": 10,
        "views": "13",
        "date": "Nov 25, 2018",
        "url": "https://x.com/JaisonVineeth/status/1"
    },
    {
        "author": "Nimer Abushehab, MD",
        "handle": "@NimerAdeeb",
        "text": "Large arteriovenous malformation (AVM), Spetzler-Martin Grade III, in a young man presenting with seizures and headaches. No history of rupture. Angiography before surgery (Left) demonstrated a high-flow AVM with significant vascular steal, diverting flow from the anterior",
        "replies": 14,
        "reposts": 3,
        "likes": 31,
        "views": "1.4K",
        "date": "Jun 15",
        "url": "https://x.com/NimerAdeeb/status/1"
    }
]

# Insert posts into database
def parse_views(views_str):
    """Parse views string like '1.6K', '222K', '49.2K' to integer"""
    if not views_str or views_str == 'Unknown':
        return 0
    views_str = views_str.strip().upper()
    if 'K' in views_str:
        return int(float(views_str.replace('K', '')) * 1000)
    elif 'M' in views_str:
        return int(float(views_str.replace('M', '')) * 1000000)
    else:
        try:
            return int(views_str)
        except:
            return 0

all_posts = []
for post in posts_first_search:
    post['search_query'] = 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    all_posts.append(post)

for post in posts_second_search:
    post['search_query'] = 'cerebral AVM OR intracranial aneurysm OR endovascular'
    all_posts.append(post)

# Insert into database
inserted_count = 0
for post in all_posts:
    try:
        views_num = parse_views(post.get('views', '0'))
        cursor.execute('''
            INSERT OR IGNORE INTO posts (author, handle, text, replies, reposts, likes, views, post_date, url, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post.get('author', 'Unknown'),
            post.get('handle', 'Unknown'),
            post.get('text', ''),
            post.get('replies', 0),
            post.get('reposts', 0),
            post.get('likes', 0),
            views_num,
            post.get('date', ''),
            post.get('url', ''),
            post.get('search_query', '')
        ))
        if cursor.rowcount > 0:
            inserted_count += 1
    except Exception as e:
        print(f"Error inserting post: {e}")

conn.commit()
print(f"Inserted {inserted_count} new posts into database")

# Create markdown report
report_lines = [
    "# X/Twitter Neurointervention Scraping Report",
    f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    f"**Timezone:** Asia/Calcutta",
    "",
    "## Summary",
    f"- **Total posts collected:** {len(all_posts)}",
    f"- **Posts from first search (neurointervention/stroke):** {len(posts_first_search)}",
    f"- **Posts from second search (cerebral AVM/aneurysm/endovascular):** {len(posts_second_search)}",
    f"- **High-engagement posts (>50 likes):** {sum(1 for p in all_posts if p.get('likes', 0) > 50)}",
    "",
    "## High-Engagement Posts (>50 Likes)",
    ""
]

# Add high-engagement posts
high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
for post in high_engagement:
    report_lines.extend([
        f"### {post['author']} {post['handle']}",
        f"**Date:** {post['date']}",
        f"**Text:** {post['text'][:200]}{'...' if len(post['text']) > 200 else ''}",
        f"**Engagement:** {post['replies']} replies · {post['reposts']} reposts · {post['likes']} likes · {post['views']} views",
        f"**URL:** {post['url']}",
        ""
    ])

report_lines.extend([
    "",
    "## All Posts",
    ""
])

# Add all posts organized by search query
for query in ['neurointervention OR thrombectomy OR #Neurointervention OR #stroke', 
              'cerebral AVM OR intracranial aneurysm OR endovascular']:
    report_lines.extend([
        f"### Search Query: `{query}`",
        ""
    ])
    query_posts = [p for p in all_posts if p.get('search_query') == query]
    for post in query_posts:
        report_lines.extend([
            f"#### {post['author']} {post['handle']}",
            f"**Date:** {post['date']}",
            f"**Text:** {post['text']}",
            f"**Engagement:** {post['replies']} replies · {post['reposts']} reposts · {post['likes']} likes · {post['views']} views",
            f"**URL:** {post['url']}",
            ""
        ])

# Write report
report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-07-10.md'
os.makedirs(os.path.dirname(report_path), exist_ok=True)

with open(report_path, 'w') as f:
    f.write('\n'.join(report_lines))

print(f"Report saved to: {report_path}")

# Query database for summary
cursor.execute('SELECT COUNT(*) FROM posts')
total_in_db = cursor.fetchone()[0]
print(f"Total posts in database: {total_in_db}")

cursor.execute('SELECT COUNT(*) FROM posts WHERE likes > 50')
high_engagement_in_db = cursor.fetchone()[0]
print(f"High-engagement posts in database: {high_engagement_in_db}")

conn.close()