#!/usr/bin/env python3
"""
Extract X/Twitter posts from browser snapshot and save to SQLite and Markdown.
"""
import sqlite3
from datetime import datetime

# Database setup
db_path = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

scraped_at = datetime.now().isoformat()

# Posts from first search: neurointervention OR thrombectomy OR #Neurointervention OR #stroke
posts_query1 = [
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jun 12',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke',
        'likes': 23,
        'reposts': 6,
        'replies': 2,
        'views': 4234,
        'url': 'https://x.com/GreenJournal/status/2065190115090042937',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author': 'Mary Talley Bowden MD',
        'handle': '@MaryBowdenMD',
        'post_date': '19h',
        'text': 'BPPV is the most common cause of vertigo, and one of the most common things I see misdiagnosed. It can be diagnosed and treated in the office - but if you go to the hospital with "dizziness," you\'ll get a CT scan and a prescription for meclizine. Every ER doctor, neurologist and...',
        'likes': 7835,
        'reposts': 1408,
        'replies': 595,
        'views': 420494,
        'url': 'https://x.com/MaryBowdenMD/status/2075269449125363991',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author': 'Sony Thomas',
        'handle': '@s18thomas',
        'post_date': '34m',
        'text': 'The idea behind no thrombolysis for 120 minutes is because mortality is higher for those given thrombolysis within that time frame versus those that weren\'t, Isn\'t it? It baffles me that for acute stroke, even if thrombectomy is available in the same hospital, the patient is...',
        'likes': 0,
        'reposts': 0,
        'replies': 1,
        'views': 11,
        'url': 'https://x.com/s18thomas/status/2075550595474178514',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    },
    {
        'author': 'Gregg Fonarow MD',
        'handle': '@gcfmd',
        'post_date': '9m',
        'text': '🧠 🩸 New in JAMA NO: P2Y12 inhibitors (clopidogrel, prasugrel, ticagrelor) & ICH 📊 252,691 w/ spontaneous ICH ⚠️ Prior P2Y12 use (alone or +aspirin) linked to: 🔴 More severe strokes (~40-43% ↑ odds) 💀 Higher in-hospital ☠️ (55-61% ↑ odds) 🏠 Less likely to go home',
        'likes': 0,
        'reposts': 0,
        'replies': 1,
        'views': 15,
        'url': 'https://x.com/gcfmd/status/2075556875215766005',
        'search_query': 'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
    }
]

# Posts from second search: cerebral AVM OR intracranial aneurysm OR endovascular
posts_query2 = [
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Oct 24, 2025',
        'text': 'Cost-Effectiveness of Endovascular Thrombectomy in Large Vessel Occlusion Stroke for the Very Elderly: hubs.la/Q03Q1ctk0',
        'likes': 16,
        'reposts': 6,
        'replies': 0,
        'views': 1991,
        'url': 'https://x.com/GreenJournal/status/1981732297100370173',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jul 12, 2025',
        'text': 'This study provides Class II evidence that in patients presenting within 24 hours with large vessel occlusion strokes undergoing endovascular thrombectomy, the 90-day modified Rankin Scale score is comparable in those with or without general anesthesia: hubs.la/Q03wXjJZ0',
        'likes': 14,
        'reposts': 3,
        'replies': 1,
        'views': 2589,
        'url': 'https://x.com/GreenJournal/status/1944036273724719341',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jul 31, 2025',
        'text': 'This study provides Class IV evidence that in patients with basilar artery occlusion, selection for endovascular therapy (EVT) using noncontrast CT yields similar clinical and safety outcomes compared with selection for EVT using CT perfusion: hubs.la/Q03z8CSX0 #NeuroX',
        'likes': 31,
        'reposts': 11,
        'replies': 0,
        'views': 4197,
        'url': 'https://x.com/GreenJournal/status/1950705243278160091',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jun 5, 2024',
        'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Silja Räty discuss the outcomes of patients with BAO treated with IVT only and compares IVT with endovascular thrombectomy. Listen now: bit.ly/3Vs1FBo Article: bit.ly/45gTtHC #NeuroTwitter @DrDanAckerman',
        'likes': 16,
        'reposts': 3,
        'replies': 0,
        'views': 3449,
        'url': 'https://x.com/GreenJournal/status/1798083350953119907',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jan 13',
        'text': 'Class II evidence that in patients with #stroke due to anterior circulation tandem lesions, emergent carotid stenting during endovascular thrombectomy (EVT) improves 90-day functional outcomes compared with EVT alone: hubs.ly/Q03-nPPH0 @micheleromoli @ZiniAndrea',
        'likes': 20,
        'reposts': 11,
        'replies': 1,
        'views': 1635,
        'url': 'https://x.com/GreenJournal/status/2011088563245371511',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'Jan 4, 2025',
        'text': 'This #NeurologyRF case shows intracranial cerebral aneurysms caused by epithelioid hemangioendothelioma can be irregular or fusiform and prone to rupture, leading to hemorrhage. This rare imaging pattern may indicate a neoplastic cerebral aneurysm: bit.ly/4fKmSxs',
        'likes': 89,
        'reposts': 30,
        'replies': 2,
        'views': 7380,
        'url': 'https://x.com/GreenJournal/status/1875302640935936492',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'post_date': 'May 5, 2025',
        'text': 'Endovascular Thrombectomy for Large Ischemic Core Stroke: A Systematic Review and Meta-Analysis of Randomized Controlled Trials hubs.la/Q03kXKJv0',
        'likes': 32,
        'reposts': 14,
        'replies': 2,
        'views': 3721,
        'url': 'https://x.com/GreenJournal/status/1919394130108559480',
        'search_query': 'cerebral AVM OR intracranial aneurysm OR endovascular'
    }
]

all_posts = posts_query1 + posts_query2

# Insert posts
for post in all_posts:
    cursor.execute('''
        INSERT OR REPLACE INTO posts (author, handle, post_date, text, likes, reposts, replies, views, url, scrape_date, search_query)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        post['author'], post['handle'], post['post_date'], post['text'],
        post['likes'], post['reposts'], post['replies'], post['views'],
        post['url'], scraped_at, post['search_query']
    ))

conn.commit()
print(f"Inserted {len(all_posts)} posts into database")

# Query for posts with >50 likes
cursor.execute('SELECT * FROM posts WHERE likes > 50 ORDER BY likes DESC')
high_engagement_posts = cursor.fetchall()
print(f"\nPosts with >50 likes: {len(high_engagement_posts)}")

# Generate markdown report
md_content = f"""# X/Twitter Scrape Report - Neurointervention & Stroke
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**Timezone:** Asia/Calcutta

---

## Summary

**Total Posts Scraped:** {len(all_posts)}
**Posts with >50 Likes:** {len(high_engagement_posts)}

---

## Search Queries

### Query 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke

**Posts Found:** {len(posts_query1)}

"""

for post in posts_query1:
    md_content += f"""### {post['author']} {post['handle']}
**Date:** {post['post_date']}
**URL:** [{post['url']}]({post['url']})

{post['text']}

📊 **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views
{'🔥 **HIGH ENGAGEMENT (>50 likes)**' if post['likes'] > 50 else ''}

---

"""

md_content += f"""
### Query 2: cerebral AVM OR intracranial aneurysm OR endovascular

**Posts Found:** {len(posts_query2)}

"""

for post in posts_query2:
    md_content += f"""### {post['author']} {post['handle']}
**Date:** {post['post_date']}
**URL:** [{post['url']}]({post['url']})

{post['text']}

📊 **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views
{'🔥 **HIGH ENGAGEMENT (>50 likes)**' if post['likes'] > 50 else ''}

---

"""

md_content += """
---

## High Engagement Posts (>50 likes)

"""

for post in high_engagement_posts:
    md_content += f"""- **{post[1]}** {post[2]} - {post[4]} likes
  {post[3][:100]}...
  URL: {post[8]}

"""

# Write markdown file
md_path = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md'
with open(md_path, 'w') as f:
    f.write(md_content)

print(f"Created report at {md_path}")

conn.close()