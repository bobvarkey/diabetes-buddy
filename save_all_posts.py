#!/usr/bin/env python3
import json
import sqlite3
import os
from datetime import datetime

# All posts from both searches
all_posts = {
    "neurointervention_stroke": [
        {
            "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/2065190115090042937",
            "date": "Jun 12",
            "likes": "23",
            "reposts": "6",
            "replies": "2",
            "views": "4104",
            "bookmarks": "7"
        },
        {
            "text": "This study used data from nationwide prospective #stroke cohorts to develop and validate a prognostic score to predict the poor outcome for patients with posterior circulation ischemic stroke: bit.ly/3yw9cGi",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1794579736284275033",
            "date": "May 26, 2024",
            "likes": "28",
            "reposts": "5",
            "replies": "1",
            "views": "4958",
            "bookmarks": "3"
        },
        {
            "text": "Endovascular Thrombectomy for Large Ischemic Core Stroke: A Systematic Review and Meta-Analysis of Randomized Controlled Trials hubs.la/Q03kXKJv0",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1919394130108559480",
            "date": "May 5, 2025",
            "likes": "32",
            "reposts": "14",
            "replies": "2",
            "views": "3710",
            "bookmarks": "10"
        },
        {
            "text": "New insights from the PEARL Trial! A post hoc analysis shows that adjunctive intra-arterial (IA) alteplase (0.225 mg/kg) is associated with improved 90-day functional outcomes for acute ischemic stroke patients who achieved near-complete or complete reperfusion (eTICI 2c/3)",
            "author": "Dr Sharath Kumar G",
            "handle": "@SharathKumarGG7",
            "url": "https://x.com/SharathKumarGG7/status/2066337854134128735",
            "date": "Jun 15",
            "likes": "8",
            "reposts": "4",
            "replies": "0",
            "views": "566",
            "bookmarks": "5"
        },
        {
            "text": "Neurology Podcast: Drs. Dan Ackerman & Luciano Sposato discuss the topic of embolic #stroke of undetermined source & the controversies surrounding cardiac monitoring & anticoagulation. Listen now: bit.ly/3SNKTep Article: bit.ly/3yFykeb @SposatoL @DrDanAckerman",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1823455255310295316",
            "date": "Aug 14, 2024",
            "likes": "22",
            "reposts": "8",
            "replies": "1",
            "views": "7014",
            "bookmarks": "8"
        },
        {
            "text": "According to this study, neuroimaging markers hold prognostic value in the identification of patients with #stroke who are at an increased risk of persistent poststroke cognitive impairment. Learn more: https://bit.ly/476FbJ6 #NeuroTwitter",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1717653603689656829",
            "date": "Oct 27, 2023",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Prevent Stroke Before It Happens!\n Control your blood pressure\n Exercise regularly\n Eat healthy foods\n Avoid smoking\n Limit alcohol\n Manage diabetes and cholesterol\n Prevention is better than cure.\n#Stroke #StrokePrevention #HealthTips #HealthyLifestyle",
            "author": "INDEKWE Health tips account",
            "handle": "@SINDIKUBWA68601",
            "url": "https://x.com/SINDIKUBWA68601/status/2066809495028740112",
            "date": "Jun 16",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Penumbra's THUNDERBOLT receives FDA clearance - bringing computer assisted vacuum thrombectomy technology to neuro intervention. Read more here: https://bit.ly/4uqFXMl. \n\n#NeuroIntervention #CAVT #MedDevice #MedTech",
            "author": "thrombectomy",
            "handle": "@penumbrainc",
            "url": "https://x.com/penumbrainc/status/2065165151112671403",
            "date": "Jun 12",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "In the latest from the Neurology DEI section, Drs. Foad Taghdiri and Amy Yu discuss their article recently published in Neurology journal on socioeconomic barriers in ischemic #stroke treatment access. Read the post now: https://bit.ly/3tFIbOC\n\n#NeuroTwitter @amyyu_md @Ftaghdiri",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1743441272348512677",
            "date": "Jan 6, 2024",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "This meta-analysis indicates that switching to warfarin after a #stroke while on direct oral anticoagulants (DOACs) seems less effective and safe in stroke recurrence prevention, intracranial hemorrhage, and mortality compared with DOAC-based strategies: https://hubs.la/Q03CfBQk0",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1955765782186496311",
            "date": "Aug 14, 2025",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        }
    ],
    "avm_aneurysm_endovascular": [
        {
            "text": "In 1988, Joe Biden had to have surgery on his brain to correct an intracranial hemorrhage from a cerebral aneurysm.\n\nDid you know a brain hemorrhage can lead to brain damage that can cause issues with cognition, speech, and movement?\n\nWho the heII made this guy president?",
            "author": "Jason Jones",
            "handle": "@jonesville",
            "url": "https://x.com/jonesville/status/1759778416231055396",
            "date": "Feb 20, 2024",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Open AC",
            "author": "AVM",
            "handle": "@AvmNews7",
            "url": "https://x.com/AvmNews7/status/2067596121199804662",
            "date": "Jun 18",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Variants of cerebral amyloid angiopathy (CAA) have been increasingly reported. This study reports on a case series of patients with iatrogenic CAA who developed clinical and radiologic features of CAA-related inflammation: https://hubs.la/Q03Pbnr20",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1984322473358164394",
            "date": "Oct 31, 2025",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Study on #LongCovid headache & brain fog (av age 37) finds high rates of Cerebral Arteriopathy (abnormality/narrowing of brain arteries).\n\n-Brain fog presence correlated with front of head CA\n-Brain fog severity correlated with back of head CA\n\nhttps://link.springer.com/article/10.1007/s00406-026-02276-0…",
            "author": "Hannah Davis",
            "handle": "@ahandvanish",
            "url": "https://x.com/ahandvanish/status/2067315688608338005",
            "date": "Jun 18",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "Endovascular Aneurysm Repair (EVAR) options based on anatomy.\n\nLearn more about cardiovascuar procedure and treatments only on http://hcp.medicalvisual.com!\n\n#Cardiology #VascularSurgery #EVAR #FEVAR #Endovascular #AorticAneurysm #AAA #InterventionalRadiology #VascularMedicine",
            "author": "Endovascular",
            "handle": "@CardioVisualApp",
            "url": "https://x.com/CardioVisualApp/status/2068801134194569583",
            "date": "Jun 22",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        },
        {
            "text": "A 36-year-old man presented with dysphagia and hoarseness for 15 days.Neurologic examination revealed no proptosis, ophthalmoplegia, or asymmetric soft palate rise. MR angiography, cerebral angiography, and CT of the brain are shown. #NeurologyRF",
            "author": "Neurology Journal",
            "handle": "@GreenJournal",
            "url": "https://x.com/GreenJournal/status/1851686809626898834",
            "date": "Oct 30, 2024",
            "likes": "0",
            "reposts": "0",
            "replies": "0",
            "views": "0",
            "bookmarks": "0"
        }
    ]
}

def parse_engagement(value_str):
    """Convert engagement string to integer"""
    if not value_str:
        return 0
    value_str = str(value_str)
    value_str = value_str.replace('K', '000').replace(',', '')
    if 'M' in value_str:
        return int(float(value_str.replace('M', '')) * 1000000)
    try:
        return int(value_str)
    except:
        return 0

def save_to_database(posts, db_path):
    """Save posts to SQLite database"""
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    # Create table if not exists
    c.execute('''CREATE TABLE IF NOT EXISTS x_posts
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  url TEXT UNIQUE,
                  author TEXT,
                  handle TEXT,
                  date TEXT,
                  text TEXT,
                  likes INTEGER DEFAULT 0,
                  reposts INTEGER DEFAULT 0,
                  replies INTEGER DEFAULT 0,
                  views INTEGER DEFAULT 0,
                  bookmarks INTEGER DEFAULT 0,
                  search_query TEXT,
                  scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Insert posts
    for query_name, posts_list in posts.items():
        for post in posts_list:
            try:
                likes = parse_engagement(post.get('likes', '0'))
                reposts = parse_engagement(post.get('reposts', '0'))
                replies = parse_engagement(post.get('replies', '0'))
                views = parse_engagement(post.get('views', '0'))
                bookmarks = parse_engagement(post.get('bookmarks', '0'))
                
                query_map = {
                    "neurointervention_stroke": "neurointervention OR thrombectomy OR #Neurointervention OR #stroke",
                    "avm_aneurysm_endovascular": "cerebral AVM OR intracranial aneurysm OR endovascular"
                }
                
                c.execute('''INSERT OR REPLACE INTO x_posts 
                             (url, author, handle, date, text, likes, reposts, replies, views, bookmarks, search_query)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                          (post['url'], post.get('author', ''), post.get('handle', ''), 
                           post.get('date', ''), post.get('text', ''), likes, reposts, 
                           replies, views, bookmarks, query_map.get(query_name, query_name)))
            except Exception as e:
                print(f"Error inserting post: {e}")
    
    conn.commit()
    
    # Get count
    c.execute("SELECT COUNT(*) FROM x_posts")
    count = c.fetchone()[0]
    
    conn.close()
    return count

def create_markdown_report(posts, output_path):
    """Create markdown report"""
    today = datetime.now().strftime('%Y-%m-%d')
    report_date = datetime.now().strftime('%B %d, %Y')
    
    # Flatten all posts
    all_posts_flat = []
    for query_name, posts_list in posts.items():
        for post in posts_list:
            post['query'] = query_name
            all_posts_flat.append(post)
    
    # Calculate stats
    total_posts = len(all_posts_flat)
    high_engagement_posts = [p for p in all_posts_flat if parse_engagement(p.get('likes', '0')) > 50]
    
    md_content = f"""# X/Twitter Neurointervention & Stroke Posts Scrape
**Date:** Tuesday, June 23rd, 2026 - 12:02 (Asia/Calcutta)
**Reference UTC:** 2026-06-23 06:32 UTC

---

## Summary

- **Total Posts Scraped:** {total_posts}
- **High-Engagement Posts (>50 likes):** {len(high_engagement_posts)}
- **Search Queries:**
  1. `neurointervention OR thrombectomy OR #Neurointervention OR #stroke`
  2. `cerebral AVM OR intracranial aneurysm OR endovascular`

---

## Search Query 1: Neurointervention / Thrombectomy / Stroke

**Posts Found:** {len(posts['neurointervention_stroke'])}

"""
    
    for i, post in enumerate(posts['neurointervention_stroke'], 1):
        md_content += f"""### {i}. {post.get('author', 'Unknown')}
**Handle:** {post.get('handle', 'N/A')}  
**Date:** {post.get('date', 'N/A')}  
**URL:** [{post.get('url', 'N/A')}]({post.get('url', '#')})

**Text:**
{post.get('text', 'No text available')}

**Engagement:**
- 👍 Likes: {post.get('likes', '0')}
- 🔄 Reposts: {post.get('reposts', '0')}
- 💬 Replies: {post.get('replies', '0')}
- 👁️ Views: {post.get('views', '0')}
- 🔖 Bookmarks: {post.get('bookmarks', '0')}

---

"""
    
    md_content += f"""## Search Query 2: Cerebral AVM / Intracranial Aneurysm / Endovascular

**Posts Found:** {len(posts['avm_aneurysm_endovascular'])}

"""
    
    for i, post in enumerate(posts['avm_aneurysm_endovascular'], 1):
        md_content += f"""### {i}. {post.get('author', 'Unknown')}
**Handle:** {post.get('handle', 'N/A')}  
**Date:** {post.get('date', 'N/A')}  
**URL:** [{post.get('url', 'N/A')}]({post.get('url', '#')})

**Text:**
{post.get('text', 'No text available')}

**Engagement:**
- 👍 Likes: {post.get('likes', '0')}
- 🔄 Reposts: {post.get('reposts', '0')}
- 💬 Replies: {post.get('replies', '0')}
- 👁️ Views: {post.get('views', '0')}
- 🔖 Bookmarks: {post.get('bookmarks', '0')}

---

"""
    
    if high_engagement_posts:
        md_content += """## High-Engagement Posts (>50 Likes)

"""
        for post in high_engagement_posts:
            md_content += f"""- **{post.get('author')}** ({post.get('handle')}) - {post.get('likes')} likes
  - {post.get('text')[:100]}...
  
"""
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        f.write(md_content)

if __name__ == "__main__":
    db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
    md_path = "/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md"
    
    # Save to database
    count = save_to_database(all_posts, db_path)
    print(f"✓ Saved {count} posts to database at {db_path}")
    
    # Create markdown report
    create_markdown_report(all_posts, md_path)
    print(f"✓ Created markdown report at {md_path}")
    
    # Summary
    all_posts_flat = []
    for posts_list in all_posts.values():
        all_posts_flat.extend(posts_list)
    
    high_engagement = [p for p in all_posts_flat if parse_engagement(p.get('likes', '0')) > 50]
    print(f"\n📊 Summary:")
    print(f"  Total posts scraped: {len(all_posts_flat)}")
    print(f"  High-engagement posts (>50 likes): {len(high_engagement)}")
    
    if high_engagement:
        print(f"\n🔥 High-engagement posts:")
        for p in high_engagement:
            print(f"  - {p.get('author')} (@{p.get('handle').replace('@', '')}): {p.get('likes')} likes")