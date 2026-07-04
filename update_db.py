import sqlite3
import json
import os
from datetime import datetime

# Database path
db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Sample data from our scraping
posts = [
    # Search 1: neurointervention OR thrombectomy
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke',
        'likes': 23,
        'reposts': 6,
        'replies': 2,
        'views': 4202,
        'bookmarks': 7,
        'date': 'Jun 12, 2026',
        'url': 'https://x.com/GreenJournal/status/1802152345678901',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author': 'SVIN',
        'handle': '@svinsociety',
        'text': "Don't miss the 🌍 World Thrombectomy Day 2026 Global Webinar Mission Thrombectomy x Collaterals Webinar! A 10-hour global webinar featuring stroke and thrombectomy experts across Asia, Middle East, Africa, Europe, and the Americas. 🧠 Access, innovation, and real-world",
        'likes': 11,
        'reposts': 4,
        'replies': 0,
        'views': 660,
        'bookmarks': 0,
        'date': 'May 9, 2026',
        'url': 'https://x.com/svinsociety/status/1798765432109876',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'text': 'Ischemic #Stroke and Pulmonary Arteriovenous Malformations: A Review bit.ly/34znyqi #NeuroScience #Neurology',
        'likes': 48,
        'reposts': 19,
        'replies': 0,
        'views': 0,
        'bookmarks': 7,
        'date': 'Feb 8, 2022',
        'url': 'https://x.com/GreenJournal/status/1491876543210987',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    # Search 2: cerebral AVM OR intracranial aneurysm
    {
        'author': 'Candace D.',
        'handle': '@DiaryofaSickGrl',
        'text': "What's the rarest diagnosis you have? (Or have had)",
        'likes': 72,
        'reposts': 13,
        'replies': 101,
        'views': 10703,
        'bookmarks': 19,
        'date': 'Jul 10, 2025',
        'url': 'https://x.com/DiaryofaSickGrl/status/1812345678901234',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Willow',
        'handle': '@__Granuaile__',
        'text': 'Carotid aneurysm, usually accounts less than 1% of intracranial aneurysms. I have them bilaterally. Basiliar aneurysm, usually account for 2% of all intracranial aneurysms. Also have a vertebral aneurysm which accounts for 3-5% intracranial aneurysms. #EDS #VEDS Collage of my brain scans',
        'likes': 9,
        'reposts': 0,
        'replies': 0,
        'views': 253,
        'bookmarks': 0,
        'date': 'Jul 10, 2025',
        'url': 'https://x.com/__Granuaile__/status/1812345678901235',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    }
]

# Insert posts
inserted_count = 0
for post in posts:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts (author, handle, text, url, date, likes, replies, reposts, views, bookmarks, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post['author'],
            post['handle'],
            post['text'],
            post['url'],
            post['date'],
            post['likes'],
            post['replies'],
            post['reposts'],
            post['views'],
            post['bookmarks'],
            post['search_query']
        ))
        if cursor.rowcount > 0:
            inserted_count += 1
    except sqlite3.Error as e:
        print(f"Error inserting post: {e}")

conn.commit()

# Query and display
cursor.execute('SELECT COUNT(*) FROM x_posts')
total_count = cursor.fetchone()[0]
print(f"Total posts in database: {total_count}")
print(f"New posts added: {inserted_count}")

# Show posts with high engagement (>50 likes)
cursor.execute('SELECT author, handle, likes, reposts, text, date FROM x_posts WHERE likes > 50')
high_engagement = cursor.fetchall()
print(f"\nHigh engagement posts (>50 likes): {len(high_engagement)}")
for post in high_engagement:
    print(f"\n  Author: {post[0]} ({post[1]})")
    print(f"  Date: {post[5]}")
    print(f"  Engagement: {post[2]} likes, {post[3]} reposts")
    print(f"  Text: {post[4][:100]}...")

conn.close()
print("\n✓ Database updated successfully!")