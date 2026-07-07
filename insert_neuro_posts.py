#!/usr/bin/env python3
"""Insert neurointervention X posts into database and generate report."""

import sqlite3
from datetime import datetime
import os

DB_PATH = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
REPORT_PATH = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"

# Posts extracted from neurointervention/stroke search
NEUROINTERVENTION_POSTS = [
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "timestamp": "Jun 12",
        "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
        "replies": 2,
        "reposts": 6,
        "likes": 23,
        "views": 4214,
        "bookmarks": 7,
        "url": "https://x.com/GreenJournal/status/2065190115090042937",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Neurology Journal",
        "handle": "@GreenJournal",
        "timestamp": "2 hours ago",
        "text": "This study investigated the effectiveness of immediate angioplasty or stenting on functional outcomes in acute ischemic stroke patients with severe intracranial stenosis without occlusion. Read more: hubs.la/Q04n68QG0",
        "replies": 1,
        "reposts": 4,
        "likes": 8,
        "views": 977,
        "bookmarks": 1,
        "url": "https://x.com/GreenJournal/status/2073800678087029179",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "Shane Smith Law",
        "handle": "@ShaneSmithLaw",
        "timestamp": "3 hours ago",
        "text": "Neuro ICU Nurse's Urgent Plea: Life-Saving Protocol She knew something was terribly wrong, but she couldn't tell anyone. 🧠 As the pain intensified, she found herself fighting just to stay conscious, unable to communicate the severity of what was happening. From a neuro ICU",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "views": 14,
        "bookmarks": 0,
        "url": "https://x.com/ShaneSmithLaw/status/2073785519591322019",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "TheVitaDoc",
        "handle": "@MCotterMD",
        "timestamp": "36 minutes ago",
        "text": "🔑 —THE MASTER MOLECULE: NITRIC OXIDE 🟦 One of the endothelium's greatest discoveries came in the 1980s. 🔷 Scientists found that endothelial cells continuously manufacture a tiny gas called nitric oxide (NO). 🔵 This groundbreaking work earned the 1998 Nobel Prize in",
        "replies": 1,
        "reposts": 0,
        "likes": 0,
        "views": 11,
        "bookmarks": 0,
        "url": "https://x.com/MCotterMD/status/2073828642778439942",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "korbinhaycockmd",
        "handle": "@khaycock2",
        "timestamp": "17 hours ago",
        "text": "1/ A case of a 56 yom with Hx of cirrhosis, UGIB, delerium tremens & normal recent echo comes to the ED with hypotension BP 82/53(61) mmHg. HR 70s. There is 1+ edema in the legs & normal cap refill.",
        "replies": 2,
        "reposts": 17,
        "likes": 44,
        "views": 12915,
        "bookmarks": 29,
        "url": "https://x.com/khaycock2/status/2073579318266265796",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "#MenAtWork",
        "handle": "@MenAtWork_MC",
        "timestamp": "19 minutes ago",
        "text": "I had a stroke (carotid dissection) about 14 yrs ago. A tough few months, almost entirely recovered. Just met an ex colleague in the pub who told me about 3 other youngish (50's) colleagues who've had one recently. Varying outcomes but worse than mine. Living 'for now' seems wise",
        "replies": 0,
        "reposts": 0,
        "likes": 5,
        "views": 159,
        "bookmarks": 0,
        "url": "https://x.com/MenAtWork_MC/status/2073832790144000367",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    },
    {
        "author": "TheVitaDoc",
        "handle": "@MCotterMD",
        "timestamp": "27 minutes ago",
        "text": "⚡ TheVitaDoc Physiology Series Volume III 🩸 THE CIRCULATION PARADOX ⭕️ Why Blood Flow Matters More Than Blood Pressure 🔵 How the Endothelium, Glycocalyx, Nitric Oxide & Microcirculation Determine Whether Oxygen Actually Reaches Your Cells 🛡️ Root-Cause Medicine |",
        "replies": 1,
        "reposts": 0,
        "likes": 0,
        "views": 19,
        "bookmarks": 0,
        "url": "https://x.com/MCotterMD/status/2073830690727072025",
        "search_query": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
    }
]

# Posts extracted from AVM/aneurysm/endovascular search
AVM_ANEURYSM_POSTS = [
    {
        "author": "ODESSA",
        "handle": "@LouiseOdessa",
        "timestamp": "1 hour ago",
        "text": "#TocTocDoc Depuis 2 jours : - je fais tomber des objets, - j'ai un trouble de la vision, - je cherche souvent mes mots. - engourdissements épisodiques du bras gauche. Je me dirige vers les urgences de la Pitié Salpêtrière juste à côté de chez moi vers 23h parceque lorsque je",
        "replies": 4,
        "reposts": 1,
        "likes": 17,
        "views": 1436,
        "bookmarks": 0,
        "url": "https://x.com/LouiseOdessa/status/2073811757093532099",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Venkat Tummala MD MBA",
        "handle": "@t_intheleadcoat",
        "timestamp": "1 hour ago",
        "text": "Gluteal #pseudoaneursym S/p fall on blood thinner What vessel you suspect is \"culprit\" based on #CTA? ApproachEndo vs perc? Embolic agent?",
        "replies": 2,
        "reposts": 1,
        "likes": 2,
        "views": 348,
        "bookmarks": 0,
        "url": "https://x.com/t_intheleadcoat/status/2073820233207333205",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "USMLE Daily Rounds",
        "handle": "@USMLERounds",
        "timestamp": "Jul 4",
        "text": "#USMLE Classic 🧠 38yo male. Hypertension since age 30. Recurrent flank pain and hematuria. Father died of a stroke. Exam reveals bilateral flank masses. Serum creatinine rising. What's the most feared complication that killed his father? 🗳️ Drop your answer 👇",
        "replies": 4,
        "reposts": 2,
        "likes": 11,
        "views": 871,
        "bookmarks": 2,
        "url": "https://x.com/USMLERounds/status/2073456337212547240",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Dr. Suraj Baidya",
        "handle": "@OPDDiaries",
        "timestamp": "13 hours ago",
        "text": "It's ADPKD Most feared complication is berry aneurysm that can rupture and cause SAH.",
        "replies": 1,
        "reposts": 0,
        "likes": 1,
        "views": 136,
        "bookmarks": 0,
        "url": "https://x.com/OPDDiaries/status/2073632039233094063",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    },
    {
        "author": "Ashley Miller",
        "handle": "@icmteaching",
        "timestamp": "13 hours ago",
        "text": "Nice example of cirrhotic haemodynamics here from Korbin with a very thorough work-up. It illustrates these type of patients beautifully: This patient has decompensated cirrhotic vasodilatory physiology. Chronic arterial and venous vasodilation are usually compensated by renal",
        "replies": 3,
        "reposts": 5,
        "likes": 63,
        "views": 7006,
        "bookmarks": 50,
        "url": "https://x.com/icmteaching/status/2073637514515030254",
        "search_query": "cerebral AVM OR intracranial aneurysm OR endovascular"
    }
]

def insert_posts(conn, posts):
    """Insert posts into database, skipping duplicates."""
    cursor = conn.cursor()
    inserted = 0
    skipped = 0
    
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, timestamp, text, replies, reposts, likes, views, bookmarks, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post["author"], post["handle"], post["timestamp"], post["text"],
                post["replies"], post["reposts"], post["likes"], post["views"],
                post["bookmarks"], post["url"], post["search_query"]
            ))
            if cursor.rowcount > 0:
                inserted += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
            skipped += 1
    
    conn.commit()
    return inserted, skipped

def generate_report(neuro_posts, avm_posts, new_posts_count):
    """Generate markdown report."""
    report_date = "2026-05-22"
    report = f"""# X Scrape Report - {report_date}

**Scrape Time:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Summary

- **Total posts scraped:** {len(neuro_posts) + len(avm_posts)}
- **New posts added to database:** {new_posts_count}
- **Search queries:**
  1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
  2. `cerebral AVM OR intracranial aneurysm OR endovascular`

---

## Search 1: Neurointervention/Stroke

**Query:** `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`

### Posts Found ({len(neuro_posts)})

"""
    
    for post in neuro_posts:
        high_engagement = "🔥" if post["likes"] >= 50 else ""
        report += f"""#### {post['author']} {post['handle']}

- **Posted:** {post['timestamp']}
- **URL:** [{post['url']}]({post['url']})
- **Text:** {post['text'][:200]}{'...' if len(post['text']) > 200 else ''}
- **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views {high_engagement}

"""

    report += f"""---

## Search 2: Cerebral AVM/Intracranial Aneurysm/Endovascular

**Query:** `cerebral AVM OR intracranial aneurysm OR endovascular`

### Posts Found ({len(avm_posts)})

"""
    
    for post in avm_posts:
        high_engagement = "🔥" if post["likes"] >= 50 else ""
        report += f"""#### {post['author']} {post['handle']}

- **Posted:** {post['timestamp']}
- **URL:** [{post['url']}]({post['url']})
- **Text:** {post['text'][:200]}{'...' if len(post['text']) > 200 else ''}
- **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views {high_engagement}

"""

    # High engagement posts section
    all_posts = neuro_posts + avm_posts
    high_engagement_posts = [p for p in all_posts if p["likes"] >= 50]
    
    if high_engagement_posts:
        report += """---

## 🔥 High Engagement Posts (>50 Likes)

"""
        for post in high_engagement_posts:
            report += f"""### {post['author']} {post['handle']}

- **Likes:** {post['likes']}
- **Posted:** {post['timestamp']}
- **URL:** [{post['url']}]({post['url']})
- **Text:** {post['text'][:300]}{'...' if len(post['text']) > 300 else ''}

"""

    report += """---

## Notes

- Posts are scraped from X/Twitter using browser automation
- Database: `memory_x_posts.db`
- Duplicates are automatically skipped based on (handle, text) uniqueness
- High engagement posts (≥50 likes) are marked with 🔥

*Generated by OpenClaw Neurointervention Scrape Task*
"""
    
    return report

def main():
    # Ensure directory exists
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    
    # Insert posts
    neuro_inserted, neuro_skipped = insert_posts(conn, NEUROINTERVENTION_POSTS)
    avm_inserted, avm_skipped = insert_posts(conn, AVM_ANEURYSM_POSTS)
    
    total_new = neuro_inserted + avm_inserted
    total_skipped = neuro_skipped + avm_skipped
    
    print(f"Inserted {total_new} new posts, skipped {total_skipped} duplicates")
    
    # Generate report
    report = generate_report(NEUROINTERVENTION_POSTS, AVM_ANEURYSM_POSTS, total_new)
    
    # Write report
    with open(REPORT_PATH, 'w') as f:
        f.write(report)
    
    print(f"Report written to {REPORT_PATH}")
    
    # Summary
    all_posts = NEUROINTERVENTION_POSTS + AVM_ANEURYSM_POSTS
    high_engagement = [p for p in all_posts if p["likes"] >= 50]
    
    print(f"\n=== Summary ===")
    print(f"Total posts found: {len(all_posts)}")
    print(f"New posts added: {total_new}")
    print(f"High engagement posts (>50 likes): {len(high_engagement)}")
    
    if high_engagement:
        print("\nHigh engagement posts:")
        for p in high_engagement:
            print(f"  - {p['author']} ({p['likes']} likes): {p['text'][:80]}...")
    
    conn.close()

if __name__ == "__main__":
    main()