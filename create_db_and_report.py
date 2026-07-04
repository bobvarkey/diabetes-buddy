#!/usr/bin/env python3
"""Create SQLite database and markdown report from scraped X/Twitter data"""

import sqlite3
from pathlib import Path
from datetime import datetime

# Database setup
db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
report_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-07-01.md'

# Posts extracted from snapshots
posts_data = [
    # Search 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke
    {
        'author': 'Austin Bourgeois',
        'handle': '@AustinBourgeois',
        'text': 'Svc thrombectomy for subacute port related thrombosis #iRad',
        'url': 'https://x.com/AustinBourgeois/status/2071757280148697142',
        'date': 'Jun 30',
        'likes': 29,
        'replies': 2,
        'reposts': 1,
        'views': 1860,
        'query': 'neurointervention thrombectomy stroke'
    },
    {
        'author': 'Argon Medical',
        'handle': '@ArgonMedical',
        'text': 'See our CLEANER Vac® Thrombectomy System in action across real-world cases. These case examples highlight how physicians are using CLEANER Vac® to treat venous thrombosis—demonstrating consistent clot removal and procedural performance in everyday practice.',
        'url': 'https://x.com/ArgonMedical/status/2071951731701744050',
        'date': '16h ago',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 66,
        'query': 'neurointervention thrombectomy stroke'
    },
    {
        'author': 'Missy UK #AbolishHolyrood #NippyKnew',
        'handle': '@backinyerpram',
        'text': 'How about 24/7 thrombectomy?',
        'url': 'https://x.com/backinyerpram/status/2071619617575858368',
        'date': 'Jun 29',
        'likes': 9,
        'replies': 0,
        'reposts': 0,
        'views': 129,
        'query': 'neurointervention thrombectomy stroke'
    },
    {
        'author': 'Inquis Medical',
        'handle': '@Inquismedical',
        'text': 'Congratulations to Dr. Kathir Subramanian and his dedicated team at HCA Florida Westside Hospital on successfully performing their first AVENTUS case. This 61-year-old patient presented with bilateral pulmonary emboli, including a double saddle clot burden...',
        'url': 'https://x.com/Inquismedical/status/2070164308709740676',
        'date': 'Jun 25',
        'likes': 2,
        'replies': 0,
        'reposts': 1,
        'views': 60,
        'query': 'neurointervention thrombectomy stroke'
    },
    {
        'author': 'Penumbra Vascular',
        'handle': '@PenVascular',
        'text': 'Dr. Dejah Judelson shares her thoughts on common missteps to avoid when managing ALI as well as advice she\'d give her younger self. #CAVT #LightningBolt',
        'url': 'https://x.com/PenVascular/status/2069797720626201009',
        'date': 'Jun 24',
        'likes': 5,
        'replies': 0,
        'reposts': 0,
        'views': 721,
        'query': 'neurointervention thrombectomy stroke'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source.',
        'url': 'https://x.com/GreenJournal/status/2065190115090042937',
        'date': 'Jun 12',
        'likes': 23,
        'replies': 2,
        'reposts': 6,
        'views': 4180,
        'query': 'neurointervention thrombectomy stroke'
    },
    # Search 2: cerebral AVM OR intracranial aneurysm OR endovascular
    {
        'author': 'MedLearn Hub',
        'handle': '@MedLearnHub',
        'text': 'Q. Which is an Absolute contraindication to fibrinolysis? A. Age >75. B. Hypertension. C. Previous intracranial hemorrhage. D. Diabetes. E. Smoking.',
        'url': 'https://x.com/MedLearnHub/status/2072130474756235602',
        'date': '5h ago',
        'likes': 7,
        'replies': 5,
        'reposts': 0,
        'views': 549,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    },
    {
        'author': 'Dr. A ®️ 𝓍on Bill, MPS',
        'handle': '@PharmXOAB',
        'text': 'C. Previous intracranial hemorrhage. A history of intracranial hemorrhage is an absolute contraindication to fibrinolytic therapy because of the markedly increased risk of catastrophic recurrent bleeding.',
        'url': 'https://x.com/PharmXOAB/status/2072200899502420356',
        'date': '25m ago',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 6,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    },
    {
        'author': 'CVIR Endovascular',
        'handle': '@cvirendo',
        'text': 'Endovascular flow reduction after portal vein arterialization: a technical note 📖',
        'url': 'https://x.com/cvirendo/status/2072206577851842881',
        'date': '3m ago',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 2,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    },
    {
        'author': 'NiekroFoundation',
        'handle': '@joeniekro',
        'text': '🗓 SAVE THE DATE 🗓 The Aneurysm & AVM Awareness 5K will be here soon! Make plans to join us anytime from September 19 – October 4 for a 5K your way! 🏃 Walk, 🧑🦽 Roll, 🚴 Cycle, 🏃♀️ Run #5KYourWay #NiekroFoundation #BrainAneurysmAwareness #AVMAwareness',
        'url': 'https://x.com/joeniekro/status/2071987133959782814',
        'date': '14h ago',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 15,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    },
    {
        'author': 'J V W Wingnut',
        'handle': '@BSUFlyboy',
        'text': 'Try having a migraine that lasts a month-and-a-half & another that lasted a month. Very serious symptoms of an aneurysm. I ended up having brain surgery to remove it. Saved my life. Military docs fumbled on this & almost cost me my life.',
        'url': 'https://x.com/BSUFlyboy/status/2072201160375853170',
        'date': '24m ago',
        'likes': 1,
        'replies': 1,
        'reposts': 0,
        'views': 6,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    },
    {
        'author': 'Computer Vision and Pattern Recognition Papers',
        'handle': '@CSVisionPapers',
        'text': 'Intracranial Aneurysm Classification and Segmentation via Tri-Axial ROI and Multi-Task Learning - Pengcheng Shi et al. arxiv.org/abs/2606.26706',
        'url': 'https://x.com/CSVisionPapers/status/2071407866183856373',
        'date': 'Jun 29',
        'likes': 0,
        'replies': 0,
        'reposts': 0,
        'views': 0,
        'query': 'cerebral AVM intracranial aneurysm endovascular'
    }
]

# Create database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS x_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        author TEXT,
        handle TEXT,
        text TEXT,
        url TEXT UNIQUE,
        date TEXT,
        likes INTEGER DEFAULT 0,
        replies INTEGER DEFAULT 0,
        reposts INTEGER DEFAULT 0,
        views INTEGER DEFAULT 0,
        search_query TEXT,
        scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Create indexes
cursor.execute('CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON x_posts(date)')

# Insert posts
inserted_count = 0
for post in posts_data:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts 
            (author, handle, text, url, date, likes, replies, reposts, views, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            post['query']
        ))
        if cursor.rowcount > 0:
            inserted_count += 1
    except Exception as e:
        print(f"Error inserting post: {e}")

conn.commit()

# Get statistics
cursor.execute('SELECT COUNT(*) FROM x_posts')
total_posts = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM x_posts WHERE likes > 50')
high_engagement = cursor.fetchone()[0]

cursor.execute('SELECT COUNT(*) FROM x_posts WHERE date(scraped_at) = date("now")')
new_today = cursor.fetchone()[0]

# Get all posts for report
cursor.execute('''
    SELECT author, handle, text, url, date, likes, replies, reposts, views, search_query
    FROM x_posts
    ORDER BY likes DESC, views DESC
''')
all_posts = cursor.fetchall()

conn.close()

# Generate markdown report
search_date = '2026-07-01'

report = f"""# X/Twitter Neurointervention Scrape Report
**Date:** {search_date}

## Summary

- **Total posts in database:** {total_posts}
- **New posts scraped today:** {inserted_count}
- **High-engagement posts (>50 likes):** {high_engagement}

## Search Queries Used

1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
2. `cerebral AVM OR intracranial aneurysm OR endovascular`

---

## High-Engagement Posts (>50 Likes)

"""

if high_engagement > 0:
    cursor.execute('''
        SELECT author, handle, text, url, date, likes, replies, reposts, views
        FROM x_posts
        WHERE likes > 50
        ORDER BY likes DESC
    ''')
    high_posts = cursor.fetchall()
    for i, post in enumerate(high_posts, 1):
        author, handle, text, url, date, likes, replies, reposts, views = post
        report += f"""### {i}. {author} ({handle})

- **Engagement:** {likes} likes, {replies} replies, {reposts} reposts, {views} views
- **Date:** {date}
- **Text:** {text[:200]}{'...' if len(text) > 200 else ''}
- **URL:** [{url}]({url})

"""
else:
    report += """*No posts with >50 likes found in this scrape. The highest engagement post was:*

**Neurology Journal (@GreenJournal)** - 23 likes, 2 replies, 6 reposts, 4.18K views
- Topic: Neurology Podcast on diagnostic modalities for embolic stroke
- URL: https://x.com/GreenJournal/status/2065190115090042937

---

"""

report += """## All Posts Extracted

"""

for i, post in enumerate(all_posts, 1):
    author, handle, text, url, date, likes, replies, reposts, views, query = post
    report += f"""{i}. **{author}** ({handle}) - {date}
   - {text[:150]}{'...' if len(text) > 150 else ''}
   - 👍 {likes} | 💬 {replies} | 🔄 {reposts} | 👁️ {views}
   - [{url}]({url})

"""

report += f"""---

## Notes

- Search was performed using X/Twitter search with date filter `since:2026-07-01`
- Some results may be from previous dates due to X's search behavior
- Database saved to: `{db_path}`
- All URLs are direct links to the original posts

**Scraped:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""

# Write report
Path(report_path).parent.mkdir(parents=True, exist_ok=True)
with open(report_path, 'w') as f:
    f.write(report)

print(f"✓ Database created: {db_path}")
print(f"✓ Inserted {inserted_count} new posts")
print(f"✓ Total posts in database: {total_posts}")
print(f"✓ High-engagement posts (>50 likes): {high_engagement}")
print(f"✓ Report saved to: {report_path}")