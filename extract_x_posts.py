#!/usr/bin/env python3
import re
import json
import sqlite3
from datetime import datetime

# Posts from first search (neurointervention OR thrombectomy OR #Neurointervention OR #stroke)
posts_search1 = [
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "Jun 12",
        "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
        "likes": 23,
        "reposts": 6,
        "replies": 2,
        "views": 4195,
        "url": "https://x.com/GreenJournal/status/2065190115090042937"
    },
    {
        "author": "Transcatheter Academy",
        "handle": "@Transcatheter",
        "date": "Jul 1",
        "text": "Pulmonary Embolism: evolving strategies in care Prof Stavros Konstantinides, Dr José Montero-Cabezas, Dr Mario Iannaccone and Dr Sylwia Sławek-Szmyt discuss risk stratification, trial evidence and interventional approaches shaping modern PE management, including Computer",
        "likes": 2,
        "reposts": 0,
        "replies": 0,
        "views": 46,
        "url": "https://x.com/Transcatheter/status/2072349644282122581"
    },
    {
        "author": "Craig E Brown",
        "handle": "@CraigEdBrown",
        "date": "6h",
        "text": "Pleased to share our latest (now published), from star student Kamal Narayana. Lowering (not increasing) peri-infarct blood flow beyond 24h period, improved #stroke recovery by lessening blood brain barrier disruption and #neuroinflammation. See paper at: nature.com Knockdown of endothelial Serpine1 improves stroke recovery by attenuating peri-infarct blood flow...",
        "likes": 4,
        "reposts": 1,
        "replies": 0,
        "views": 159,
        "url": "https://x.com/CraigEdBrown/status/2072840478937264212"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "date": "11h",
        "text": "Teaching Video NeuroImage: Vertebral Artery Occlusion Presenting With Peripheral Facial Palsy and Bruns Nystagmus hubs.la/Q04nkJVQ0 #NeurologyRF",
        "likes": 44,
        "reposts": 13,
        "replies": 0,
        "views": 2400,
        "url": "https://x.com/GreenJournal/status/2072759028401213780"
    },
    {
        "author": "AHA Science",
        "handle": "@AHAScience",
        "date": "Jul 2",
        "text": "Left ventricular systolic dysfunction is not uncommon in the ischemic stroke population with some studies showing between 5%- 25% with ischemic stroke in persons with a lower left ventricular ejection fraction (LVEF). professional.heart.org/en/science-new... This scientific statement summarizes",
        "likes": 72,
        "reposts": 31,
        "replies": 1,
        "views": 4826,
        "url": "https://x.com/AHAScience/status/2072606262366212544"
    },
    {
        "author": "MiniCardiac",
        "handle": "@MiniCardiacLtd",
        "date": "Jul 2",
        "text": "Replying to @AHAScience A good reminder that the heart and the brain rarely act in isolation. A lot of these patients sit between cardiology and stroke care, so guidance that helps those teams line up matters. Good to see it shared. #Cardiology #Stroke",
        "likes": 0,
        "reposts": 0,
        "replies": 0,
        "views": 33,
        "url": "https://x.com/MiniCardiacLtd/status/2072723682762338459"
    },
    {
        "author": "Nick Clarke",
        "handle": "@69Clarkey",
        "date": "Jun 28",
        "text": "#Stroke",
        "likes": 3,
        "reposts": 0,
        "replies": 0,
        "views": 72,
        "url": "https://x.com/69Clarkey/status/2071208561770738065"
    },
    {
        "author": "Keeway Medical",
        "handle": "@KeewayMedical",
        "date": "5h",
        "text": "Microcirculation Improvement Portfolio: Thrombectomy Catheters and Arterfusion® Infusion Catheters from Keeway Medical. #MedTech #Cardiology #InterventionalOncology #MedicalDevices",
        "likes": 0,
        "reposts": 0,
        "replies": 0,
        "views": 1,
        "url": "https://x.com/KeewayMedical/status/2073029109387788309"
    },
    {
        "author": "KMCH Hospitals",
        "handle": "@KMCHcoimbatore",
        "date": "5h",
        "text": "🩸 A breakthrough in vascular care has arrived at KMCH. Introducing Rotarex Thrombectomy an advanced minimally invasive treatment designed to remove blood clots from blocked arteries and restore blood flow quickly. #RotarexThrombectomy #KMCH #VascularCare",
        "likes": 0,
        "reposts": 0,
        "replies": 0,
        "views": 7,
        "url": "https://x.com/KMCHcoimbatore/status/2073032831027089810"
    }
]

# Connect to database
conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
cursor = conn.cursor()

# Insert posts
search_query = "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
scraped_at = datetime.now().isoformat()

inserted_count = 0
for post in posts_search1:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO posts (author_name, handle, datetime, text, likes, reposts, replies, views, url, search_query, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (post['author'], post['handle'], post['date'], post['text'], 
              str(post['likes']), str(post['reposts']), str(post['replies']), str(post['views']),
              post['url'], search_query, scraped_at))
        if cursor.rowcount > 0:
            inserted_count += 1
    except Exception as e:
        print(f"Error inserting {post['url']}: {e}")

conn.commit()
conn.close()

print(f"Inserted {inserted_count} new posts from search 1")