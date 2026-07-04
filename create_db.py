import sqlite3
import json
import os
from datetime import datetime

# Database path
db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'

# Create directory if needed
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table
cursor.execute('''
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    handle TEXT,
    text TEXT,
    likes INTEGER DEFAULT 0,
    retweets INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    views INTEGER,
    date TEXT,
    url TEXT,
    hashtags TEXT,
    source_query TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(url, author, date)
)
''')

# Sample data from our scraping (manually extracted for now since evaluate isn't working)
posts = [
    # Search 1: neurointervention OR thrombectomy
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke',
        'likes': 23,
        'retweets': 6,
        'replies': 2,
        'views': 4202,
        'date': 'Jun 12, 2026',
        'url': 'https://x.com/GreenJournal/status/unknown',
        'hashtags': 'EmbolicStroke,Stroke',
        'source_query': 'neurointervention OR thrombectomy'
    },
    {
        'author': 'SVIN',
        'handle': '@svinsociety',
        'text': "Don't miss the 🌍 World Thrombectomy Day 2026 Global Webinar Mission Thrombectomy x Collaterals Webinar! A 10-hour global webinar featuring stroke and thrombectomy experts across Asia, Middle East, Africa, Europe, and the Americas. 🧠 Access, innovation, and real-world",
        'likes': 11,
        'retweets': 4,
        'replies': 0,
        'views': 660,
        'date': 'May 9, 2026',
        'url': 'https://x.com/svinsociety/status/unknown',
        'hashtags': '',
        'source_query': 'neurointervention OR thrombectomy'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'text': 'Ischemic #Stroke and Pulmonary Arteriovenous Malformations: A Review bit.ly/34znyqi #NeuroScience #Neurology',
        'likes': 48,
        'retweets': 19,
        'replies': 0,
        'views': None,
        'date': 'Feb 8, 2022',
        'url': 'https://x.com/GreenJournal/status/unknown',
        'hashtags': 'Stroke,NeuroScience,Neurology',
        'source_query': 'neurointervention OR thrombectomy'
    },
    # Search 2: cerebral AVM OR intracranial aneurysm
    {
        'author': 'Candace D.',
        'handle': '@DiaryofaSickGrl',
        'text': "What's the rarest diagnosis you have? (Or have had)",
        'likes': 72,
        'retweets': 13,
        'replies': 101,
        'views': 10703,
        'date': 'Jul 10, 2025',
        'url': 'https://x.com/DiaryofaSickGrl/status/unknown',
        'hashtags': '',
        'source_query': 'cerebral AVM OR intracranial aneurysm'
    },
    {
        'author': 'Willow',
        'handle': '@__Granuaile__',
        'text': 'Carotid aneurysm, usually accounts less than 1% of intracranial aneurysms. I have them bilaterally. Basiliar aneurysm, usually account for 2% of all intracranial aneurysms. Also have a vertebral aneurysm which accounts for 3-5% intracranial aneurysms. #EDS #VEDS Collage of my brain scans',
        'likes': 9,
        'retweets': 0,
        'replies': 0,
        'views': 253,
        'date': 'Jul 10, 2025',
        'url': 'https://x.com/__Granuaile__/status/unknown',
        'hashtags': 'EDS,VEDS',
        'source_query': 'cerebral AVM OR intracranial aneurysm'
    }
]

# Insert posts
for post in posts:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO posts (author, handle, text, likes, retweets, replies, views, date, url, hashtags, source_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post['author'],
            post['handle'],
            post['text'],
            post['likes'],
            post['retweets'],
            post['replies'],
            post['views'],
            post['date'],
            post['url'],
            post['hashtags'],
            post['source_query']
        ))
    except sqlite3.Error as e:
        print(f"Error inserting post: {e}")

conn.commit()

# Query and display
cursor.execute('SELECT COUNT(*) FROM posts')
count = cursor.fetchone()[0]
print(f"Total posts in database: {count}")

# Show posts with high engagement (>50 likes)
cursor.execute('SELECT author, handle, likes, retweets, text FROM posts WHERE likes > 50')
high_engagement = cursor.fetchall()
print(f"\nHigh engagement posts (>50 likes): {len(high_engagement)}")
for post in high_engagement:
    print(f"  - {post[0]} ({post[1]}): {post[2]} likes, {post[3]} retweets")
    print(f"    Text: {post[4][:80]}...")

conn.close()
print("\nDatabase saved successfully!")