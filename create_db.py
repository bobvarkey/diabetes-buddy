import sqlite3
import json
from datetime import datetime

# Create database
conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
c = conn.cursor()

# Create table
c.execute('''CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_name TEXT,
    handle TEXT,
    timestamp TEXT,
    text TEXT,
    replies INTEGER,
    reposts INTEGER,
    likes INTEGER,
    views TEXT,
    media_type TEXT,
    post_url TEXT,
    search_query TEXT,
    scrape_date TEXT,
    created_at TEXT
)''')

# Posts extracted from neurointervention search
posts = [
    {
        "author_name": "London Medical Communication",
        "handle": "@LondonMedComm",
        "timestamp": "30s ago",
        "text": "Spanish guidelines highlight retinal artery occlusion as an ocular stroke requiring urgent multidisciplinary assessment. No therapy can restore vision, but referral and vascular evaluation may reduce cerebrovascular events. #LondonMedComm @KargerPublisher",
        "replies": 0,
        "reposts": 0,
        "likes": 1,
        "views": "2",
        "media_type": "link",
        "post_url": "https://x.com/LondonMedComm/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "Neurology Journal",
        "handle": "@GreenJournal",
        "timestamp": "Jun 12",
        "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
        "replies": 2,
        "reposts": 6,
        "likes": 23,
        "views": "4.2K",
        "media_type": "video",
        "post_url": "https://x.com/GreenJournal/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "Gladiator Therapeutics",
        "handle": "@GladiatorFIR",
        "timestamp": "33m ago",
        "text": "Recovery after a stroke is often a gradual process that requires patience, support, and consistency.",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "0",
        "media_type": "text",
        "post_url": "https://x.com/GladiatorFIR/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "Jason Jones",
        "handle": "@jonesville",
        "timestamp": "Feb 20, 2024",
        "text": "In 1988, Joe Biden had to have surgery on his brain to correct an intracranial hemorrhage from a cerebral aneurysm. Did you know a brain hemorrhage can lead to brain damage that can cause issues with cognition, speech, and movement? Who the hell made this guy president?",
        "replies": 65,
        "reposts": 169,
        "likes": 391,
        "views": "32K",
        "media_type": "video",
        "post_url": "https://x.com/jonesville/status/unknown",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author_name": "ALBERTO ALFIE",
        "handle": "@ALFEEP1",
        "timestamp": "1m ago",
        "text": "Thx! WPW w/recurrent syncope w/o prodromes & high-risk AP (250 ms under GA). AAD was an option in 3rd trimester, but given our experience w/O-fluoro RFA, a definitive cure seemed the best strategy. This is exactly the type of case where extensive O-XR expertise should be applied",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "10",
        "media_type": "text",
        "post_url": "https://x.com/ALFEEP1/status/unknown",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author_name": "TheBrainMaze TBM",
        "handle": "@thebrainmaze",
        "timestamp": "Jun 11",
        "text": "Abdominal Aortic Aneurysm Explained – Could your largest artery silently be putting your life at risk? What really happens when an abdominal aortic aneurysm grows—and could it happen to you?",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "0",
        "media_type": "image",
        "post_url": "https://x.com/thebrainmaze/status/unknown",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author_name": "Bob Pockrass",
        "handle": "@bobpockrass",
        "timestamp": "3h ago",
        "text": "INDYCAR penalizes Dixon for qualifying interference on Grosjean.",
        "replies": 2,
        "reposts": 8,
        "likes": 76,
        "views": "50K",
        "media_type": "text",
        "post_url": "https://x.com/bobpockrass/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "SimonBarSoros",
        "handle": "@Jeff_the_Bird",
        "timestamp": "2h ago",
        "text": "That boy done bumped his noggin. #Stroke",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "0",
        "media_type": "text",
        "post_url": "https://x.com/Jeff_the_Bird/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "Nurses Against Dick Pics",
        "handle": "@ClaudetteGGibs1",
        "timestamp": "Jul 3",
        "text": "McConnell, an 84 year suffered an out of hospital Cardiac event. The trauma of the resuscitation itself was absolutely hell on the body. My biggest question is how long he was down because that determines the outcome of his treatment. IMO, for him to be still in hospital after...",
        "replies": 12,
        "reposts": 141,
        "likes": 1100,
        "views": "15K",
        "media_type": "text",
        "post_url": "https://x.com/ClaudetteGGibs1/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author_name": "Máté",
        "handle": "@LatvanyM",
        "timestamp": "15m ago",
        "text": "Ohh they can put him on a cardiopulmonary bypass machine, or in his case more probably: ECMO (Extracorporeal Membrane Oxygenation). I watched The Pitt :D After the cardiac arrest his brain was probably without oxygen for too long anyway.",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": "0",
        "media_type": "image",
        "post_url": "https://x.com/LatvanyM/status/unknown",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    }
]

# Insert posts
current_time = datetime.now().isoformat()
scrape_date = "2026-07-05"

for post in posts:
    c.execute('''INSERT INTO posts 
        (author_name, handle, timestamp, text, replies, reposts, likes, views, media_type, post_url, search_query, scrape_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
        (post['author_name'], post['handle'], post['timestamp'], post['text'],
         post['replies'], post['reposts'], post['likes'], post['views'],
         post['media_type'], post['post_url'], post['search_query'],
         scrape_date, current_time))

conn.commit()

# Query statistics
c.execute('SELECT COUNT(*) FROM posts')
total_posts = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM posts WHERE likes > 50')
high_engagement = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM posts WHERE search_query LIKE "%neurointervention%"')
neuro_posts = c.fetchone()[0]

c.execute('SELECT COUNT(*) FROM posts WHERE search_query LIKE "%AVM%"')
avm_posts = c.fetchone()[0]

print(f"Total posts scraped: {total_posts}")
print(f"High-engagement posts (>50 likes): {high_engagement}")
print(f"Posts from neurointervention search: {neuro_posts}")
print(f"Posts from AVM/aneurysm search: {avm_posts}")

conn.close()