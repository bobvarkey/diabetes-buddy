#!/usr/bin/env python3
"""
Process X/Twitter posts from browser snapshots and save to database.
"""

import sqlite3
from datetime import datetime
from pathlib import Path
import re
import json

# Posts extracted from first search query (neurointervention/thrombectomy/stroke)
posts_query1 = [
    {
        "author": "Girişimsel Nöroloji",
        "handle": "intrventneurotr",
        "text": "🧠 1st WINNC ilk gün oturum başlıkları: -Neuroimaging in Acute Stroke in the Thrombectomy Era -Tandem ICA Occlusion in the Acute Setting -Large Core Infarct & Gray Zone Thrombectomies -Acute Basilar Occlusion #WINNC #Stroke #Neurointervention",
        "date": "Oct 1, 2025",
        "likes": 7,
        "reposts": 4,
        "replies": 1,
        "views": 278,
        "url": "https://x.com/intrventneurotr/status/1973349930883489965"
    },
    {
        "author": "Practical Neurology",
        "handle": "PracticalNeuro",
        "text": "The @US_FDA granted #510(k) clearance for the #PoNS System, a noninvasive #neuromodulation device applied to the tongue, to treat dynamic gait deficit due to chronic #stroke symptoms.",
        "date": "Jul 4",
        "likes": 2,
        "reposts": 0,
        "replies": 0,
        "views": 625,
        "url": "https://x.com/PracticalNeuro/status/2073406967591194769"
    },
    {
        "author": "Akhtar Sherin",
        "handle": "academia_kmu",
        "text": "Honored to chair a session on #Stroke at the 32nd Annual #Neurology #Conference of the #PakistanSocietyOfNeurology! 🧠 What an insightful experience.",
        "date": "Jul 3",
        "likes": 10,
        "reposts": 2,
        "replies": 0,
        "views": 345,
        "url": "https://x.com/academia_kmu/status/2073069839158321184"
    },
    {
        "author": "JNIS",
        "handle": "JNIS_BMJ",
        "text": "Mechanical thrombectomy for DMVOs is gaining traction! In a multicenter study of 102 patients, the RED 43 catheter was found to be safe and effective for distal aspiration. #Stroke #DMVO #Thrombectomy #EndovascularTherapy #NeuroIR",
        "date": "Apr 27, 2025",
        "likes": 47,
        "reposts": 18,
        "replies": 0,
        "views": 5716,
        "url": "https://x.com/JNIS_BMJ/status/1916411768399671578"
    },
    {
        "author": "IFUMSA Quiz and Debate Club OAU",
        "handle": "Ifumsaquizclub",
        "text": "🔥 FEBRILE STUFF: BCI WEDNESDAY 🧠 📚 Topic: Ring-Enhancing Lesions What does a \"ring\" on a brain scan actually mean?",
        "date": "8 minutes ago",
        "likes": 0,
        "reposts": 0,
        "replies": 1,
        "views": 15,
        "url": "https://x.com/Ifumsaquizclub/status/2074832087488626717"
    },
    {
        "author": "Mark Kaplan",
        "handle": "markkaplan20",
        "text": "I want to clarify something important. When I say heart disease can be cured, I do not mean the scars disappear. Calcified plaque does not reverse. A CAC score does not go down. What I mean is the active disease process stops.",
        "date": "23 hours ago",
        "likes": 42,
        "reposts": 2,
        "replies": 13,
        "views": 4841,
        "url": "https://x.com/markkaplan20/status/2074478371606503441"
    },
    {
        "author": "Kurt sonnenberg",
        "handle": "Harborjack",
        "text": "There are 2 types of plaque-hard(calcified) and soft(largely inflammatory cells). The soft plaque is prone to embolize causing stroke or sudden blockage and ischemia.",
        "date": "12 hours ago",
        "likes": 0,
        "reposts": 0,
        "replies": 1,
        "views": 25,
        "url": "https://x.com/Harborjack/status/2074644422206337084"
    },
    {
        "author": "Ruslan Rust",
        "handle": "rust_ruslan",
        "text": "Blood-Brain Barrier Disruption Before Interhospital Transfer for Thrombectomy and Clinical Outcome",
        "date": "12 hours ago",
        "likes": 5,
        "reposts": 2,
        "replies": 0,
        "views": 388,
        "url": "https://x.com/rust_ruslan/status/2074640545771884688"
    }
]

# Posts extracted from second search query (cerebral AVM/intracranial aneurysm/endovascular)
posts_query2 = [
    {
        "author": "Neurology Journal",
        "handle": "GreenJournal",
        "text": "Association Between Time to Treatment and Outcomes of Endovascular Therapy vs Medical Management in Patients With Large Ischemic Stroke #NeuroTwitter #NeuroX",
        "date": "Dec 25, 2024",
        "likes": 12,
        "reposts": 5,
        "replies": 1,
        "views": 2961,
        "url": "https://x.com/GreenJournal/status/1871925639206306170"
    },
    {
        "author": "Endovascular Expert",
        "handle": "EndovascularEx",
        "text": "When a doctor chooses a specialist for his own treatment, trust speaks for itself. Watch Dr. Rajesh Acharya share his personal experience after Advanced Laser Treatment for Varicose Veins.",
        "date": "Jun 29",
        "likes": 1,
        "reposts": 0,
        "replies": 0,
        "views": 60,
        "url": "https://x.com/EndovascularEx/status/2071466781127135541"
    },
    {
        "author": "Whitfield Lewis, MD",
        "handle": "whitfieldlewis6",
        "text": "This is a CT scan of the brain, axial view. This is a patient who presented with a 1-day history of stroke-like symptoms. What vascular distribution is affected here? #FOAMed",
        "date": "Jul 4",
        "likes": 46,
        "reposts": 9,
        "replies": 4,
        "views": 4329,
        "url": "https://x.com/whitfieldlewis6/status/2073146134957056413"
    },
    {
        "author": "Medical Sphere",
        "handle": "MedicalSphereAI",
        "text": "All models agree the CT is most consistent with an ACA territory infarct involving the medial frontal/parietal parasagittal cortex, with an acute/subacute ischemic appearance and the classic expectation of contralateral leg-predominant weakness/sensory loss plus possible abulia",
        "date": "Jul 4",
        "likes": 1,
        "reposts": 0,
        "replies": 0,
        "views": 257,
        "url": "https://x.com/MedicalSphereAI/status/2073160690878321115"
    }
]

def save_posts_to_db(posts, search_query, db_path):
    """Save posts to SQLite database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    added = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO x_posts 
                (author, handle, date, dateDisplay, text, likes, reposts, replies, views, url, scrape_date)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post.get('author', ''),
                post.get('handle', ''),
                post.get('date', ''),
                post.get('date', ''),
                post.get('text', ''),
                post.get('likes', 0),
                post.get('reposts', 0),
                post.get('replies', 0),
                post.get('views', 0),
                post.get('url', ''),
                datetime.now().isoformat()
            ))
            if cursor.rowcount > 0:
                added += 1
        except Exception as e:
            print(f"Error inserting post: {e}")
    
    conn.commit()
    conn.close()
    return added

def generate_markdown_report(posts1, posts2, output_path):
    """Generate markdown report."""
    report = f"""# X/Twitter Scrape Report - {datetime.now().strftime('%Y-%m-%d %H:%M')}

## Summary

**Scrape Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} (Asia/Calcutta)

### Query 1: neurointervention OR thrombectomy OR #Neurointervention OR #stroke

**Posts Found:** {len(posts1)}

"""
    
    for i, post in enumerate(posts1, 1):
        report += f"""#### {i}. {post['author']} (@{post['handle']})

{post['text']}

- **Date:** {post['date']}
- **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views
- **URL:** {post['url']}

"""
    
    report += f"""
### Query 2: cerebral AVM OR intracranial aneurysm OR endovascular

**Posts Found:** {len(posts2)}

"""
    
    for i, post in enumerate(posts2, 1):
        report += f"""#### {i}. {post['author']} (@{post['handle']})

{post['text']}

- **Date:** {post['date']}
- **Engagement:** {post['likes']} likes, {post['reposts']} reposts, {post['replies']} replies, {post['views']} views
- **URL:** {post['url']}

"""

    report += f"""
## High-Engagement Posts (>50 likes)

"""
    
    all_posts = posts1 + posts2
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    
    if high_engagement:
        for post in high_engagement:
            report += f"- **{post['author']} (@{post['handle']})** - {post['likes']} likes\n"
    else:
        report += "No posts with >50 likes found in this scrape.\n"
    
    report += f"""
## Statistics

- **Total Posts:** {len(posts1) + len(posts2)}
- **Query 1 Posts:** {len(posts1)}
- **Query 2 Posts:** {len(posts2)}
- **High-Engagement Posts (>50 likes):** {len(high_engagement)}

---
*Generated automatically by OpenClaw X/Twitter scraper*
"""
    
    with open(output_path, 'w') as f:
        f.write(report)
    
    return report

def main():
    db_path = Path('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    output_path = Path('/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md')
    
    # Save to database
    added1 = save_posts_to_db(posts_query1, "neurointervention OR thrombectomy OR #Neurointervention OR #stroke", db_path)
    added2 = save_posts_to_db(posts_query2, "cerebral AVM OR intracranial aneurysm OR endovascular", db_path)
    
    print(f"Added {added1} new posts from query 1")
    print(f"Added {added2} new posts from query 2")
    
    # Generate markdown report
    report = generate_markdown_report(posts_query1, posts_query2, output_path)
    print(f"\nReport saved to {output_path}")
    
    # Summary
    total_posts = len(posts_query1) + len(posts_query2)
    high_engagement = len([p for p in posts_query1 + posts_query2 if p.get('likes', 0) > 50])
    
    print(f"\n=== SUMMARY ===")
    print(f"Total posts found: {total_posts}")
    print(f"New posts added to database: {added1 + added2}")
    print(f"High-engagement posts (>50 likes): {high_engagement}")

if __name__ == '__main__':
    main()