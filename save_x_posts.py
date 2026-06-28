#!/usr/bin/env python3
import sqlite3
import json
from datetime import datetime
import os

# Posts extracted from first search (neurointervention OR thrombectomy OR #Neurointervention OR #stroke)
posts_search1 = [
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Jun 12, 2026",
        "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
        "replies": 2,
        "reposts": 6,
        "likes": 23,
        "views": 4132,
        "url": "https://x.com/GreenJournal/status/2065190115090042937"
    },
    {
        "author": "Inquis Medical",
        "handle": "@Inquismedical",
        "date": "Jun 26, 2026",
        "text": "Congratulations to Dr. Kathir Subramanian and his dedicated team at HCA Florida Westside Hospital on successfully performing their first AVENTUS case. This 61-year-old patient presented with bilateral pulmonary emboli, including a double saddle clot burden...",
        "replies": 0,
        "reposts": 0,
        "likes": 1,
        "views": 10,
        "url": "https://x.com/Inquismedical/status/2070164308709740676"
    },
    {
        "author": "Imperative Care Stroke",
        "handle": "@ImpCare_Stroke",
        "date": "Jun 26, 2026",
        "text": "In 2013, ADAPT changed the conversation around aspiration thrombectomy. So what comes next? In the latest NeuroNews feature, Dr. Quill Turk reflects on the evolution of aspiration thrombectomy and the innovations that helped shape the ADAPT 2.0 technique",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": 10,
        "url": "https://x.com/ImpCare_Stroke/status/2070198592229315057"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Mar 1, 2026",
        "text": "New evidence suggests patients with #stroke due to anterior circulation large vessel occlusion, IV tenecteplase plus thrombectomy is associated with better functional outcomes at 3 months compared with thrombectomy alone: hubs.la/Q0451Cg20 #NeuroTwitter",
        "replies": 1,
        "reposts": 9,
        "likes": 33,
        "views": 2861,
        "url": "https://x.com/GreenJournal/status/2027881501354758525"
    },
    {
        "author": "Medical Global Academy",
        "handle": "@MGA_Courses",
        "date": "Jun 26, 2026",
        "text": "🚨 Stroke Case A 64-year-old patient arrives with facial droop, slurred speech, and right-sided weakness. Symptoms began 45 minutes ago. Most doctors know the diagnosis. What is the first investigation you would order? 🧠 👇 #stroke #acutestroke #neurology #neurologycase",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": 1,
        "url": "https://x.com/MGA_Courses/status/2070152535558512644"
    }
]

# Posts from second search (cerebral AVM OR intracranial aneurysm OR endovascular)
posts_search2 = [
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Jan 21, 2026",
        "text": "This study assessed the relationship between individualized autoregulation-based blood pressure thresholds after endovascular thrombectomy and secondary brain injury and functional outcomes: hubs.la/Q03_xxc50",
        "replies": 1,
        "reposts": 4,
        "likes": 13,
        "views": 1083,
        "url": "https://x.com/GreenJournal/status/2013989136928026870"
    },
    {
        "author": "Shaaz A Khan",
        "handle": "@neuronsmultiply",
        "date": "Jun 26, 2026",
        "text": "Thought for the night",
        "replies": 1,
        "reposts": 0,
        "likes": 1,
        "views": 25,
        "url": "https://x.com/neuronsmultiply/status/2070188232411897899"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Jul 31, 2025",
        "text": "This study provides Class IV evidence that in patients with basilar artery occlusion, selection for endovascular therapy (EVT) using noncontrast CT yields similar clinical and safety outcomes compared with selection for EVT using CT perfusion: hubs.la/Q03z8CSX0 #NeuroX",
        "replies": 0,
        "reposts": 11,
        "likes": 31,
        "views": 4187,
        "url": "https://x.com/GreenJournal/status/1950705243278160091"
    },
    {
        "author": "Dr Ihab Suliman",
        "handle": "@IhabFathiSulima",
        "date": "Jun 24, 2026",
        "text": "Why Stroke Code Was Activated from the CT Area?",
        "replies": 3,
        "reposts": 1,
        "likes": 5,
        "views": 1264,
        "url": "https://x.com/IhabFathiSulima/status/2069600365478031811"
    },
    {
        "author": "Haji Siyamuddin ANSARI",
        "handle": "@DrsansariOrd",
        "date": "Jun 24, 2026",
        "text": "🧠 🚨 Cardioembolic stroke secondary to a left atrial myxoma. The cardiac mass serves as the embolic source, while the brain CT demonstrates an acute large-vessel occlusion (likely the hyperdense basilar artery sign on this slice), prompting immediate stroke code activation and...",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": 52,
        "url": "https://x.com/DrsansariOrd/status/2069603282193088686"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Aug 24, 2025",
        "text": "Intra-Arterial Thrombolysis Following Endovascular Recanalization for Large Vessel Occlusion Stroke: A Systematic Review and Meta-Analysis hubs.ly/Q03DVR9c0",
        "replies": 1,
        "reposts": 4,
        "likes": 12,
        "views": 2127,
        "url": "https://x.com/GreenJournal/status/1959332503933636663"
    }
]

# Initialize database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
CREATE TABLE IF NOT EXISTS x_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    handle TEXT,
    date TEXT,
    text TEXT,
    replies INTEGER,
    reposts INTEGER,
    likes INTEGER,
    views INTEGER,
    url TEXT UNIQUE,
    search_query TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

# Insert posts from search 1
new_posts_count = 0
for post in posts_search1:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts (author, handle, date, text, replies, reposts, likes, views, url, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post["author"],
            post["handle"],
            post["date"],
            post["text"],
            post["replies"],
            post["reposts"],
            post["likes"],
            post["views"],
            post["url"],
            "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
        ))
        if cursor.rowcount > 0:
            new_posts_count += 1
    except Exception as e:
        print(f"Error inserting post: {e}")

# Insert posts from search 2
for post in posts_search2:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts (author, handle, date, text, replies, reposts, likes, views, url, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post["author"],
            post["handle"],
            post["date"],
            post["text"],
            post["replies"],
            post["reposts"],
            post["likes"],
            post["views"],
            post["url"],
            "cerebral AVM OR intracranial aneurysm OR endovascular"
        ))
        if cursor.rowcount > 0:
            new_posts_count += 1
    except Exception as e:
        print(f"Error inserting post: {e}")

conn.commit()

# Get all posts from today
cursor.execute('''
    SELECT * FROM x_posts 
    WHERE date(scraped_at) = date('now')
    ORDER BY likes DESC
''')
all_posts = cursor.fetchall()

# Get high engagement posts (>50 likes)
cursor.execute('SELECT * FROM x_posts WHERE likes > 50 ORDER BY likes DESC')
high_engagement = cursor.fetchall()

print(f"Total posts in database: {len(all_posts)}")
print(f"New posts added today: {new_posts_count}")
print(f"High engagement posts (>50 likes): {len(high_engagement)}")

# Close connection
conn.close()

print(f"\nData saved to {db_path}")