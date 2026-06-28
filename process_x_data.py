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
        "date": "Jun 12",
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
        "date": "3 hours ago",
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
        "date": "1 hour ago",
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
        "date": "Mar 1",
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
        "date": "4 hours ago",
        "text": "🚨 Stroke Case A 64-year-old patient arrives with facial droop, slurred speech, and right-sided weakness. Symptoms began 45 minutes ago. Most doctors know the diagnosis. What is the first investigation you would order? 🧠 👇 #stroke #acutestroke #neurology #neurologycase",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": 1,
        "url": "https://x.com/MGA_Courses/status/2070152535558512644"
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

# Insert posts
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

conn.commit()

# Get high engagement posts (>50 likes)
cursor.execute('SELECT * FROM x_posts WHERE likes > 50 ORDER BY likes DESC')
high_engagement = cursor.fetchall()

print(f"New posts added: {new_posts_count}")
print(f"High engagement posts (>50 likes): {len(high_engagement)}")

# Close connection
conn.close()

print(f"Data saved to {db_path}")