#!/usr/bin/env python3
"""
Manually insert X posts extracted from browser
"""
import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

# Posts extracted from browser
posts_search1 = [
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'date': '2026-03-01',
        'text': 'New evidence suggests patients with #stroke due to anterior circulation large vessel occlusion, IV tenecteplase plus thrombectomy is associated with better functional outcomes at 3 months compared with thrombectomy alone: https://hubs.la/Q0451Cg20 #NeuroTwitter',
        'replies': 1,
        'reposts': 9,
        'likes': 33,
        'views': 2800,
        'url': 'https://x.com/GreenJournal/status/unknown1'
    },
    {
        'author': 'MedPark Healthcare',
        'handle': '@medpark_health',
        'date': '2026-07-11',
        'text': "Don't ignore persistent headaches, weakness, seizures, or numbness. Trust the neurology experts at MedPark Hospital for advanced diagnosis and personalized treatment. +91 9876769966 http://medparkhealthcare.com #neurology #brainhealth #stroke #epilepsy #medparkhospital",
        'replies': 1,
        'reposts': 0,
        'likes': 42,
        'views': 0,
        'url': 'https://x.com/medpark_health/status/unknown2'
    },
    {
        'author': 'Will Thiel',
        'handle': '@willthiel',
        'date': '2026-07-12',
        'text': "Lindsey Graham appears to be spawning some weird conspiracy shit already, so let me just say: 71 year old man dies of a heart attack at home after taking two long haul flights in under a week. The KISS answer here folks is a DVT that broke off and caused a heart attack. Move on",
        'replies': 290,
        'reposts': 260,
        'likes': 7800,
        'views': 1100000,
        'url': 'https://x.com/willthiel/status/unknown3'
    },
    {
        'author': 'Douglas Hall',
        'handle': '@MrDouglasHall',
        'date': '2026-07-12',
        'text': 'Replying to @willthiel Although I agree with the sentiment of your message, DVTs cause pulmonary embolisms, not heart attacks.',
        'replies': 7,
        'reposts': 1,
        'likes': 125,
        'views': 59000,
        'url': 'https://x.com/MrDouglasHall/status/unknown4'
    },
    {
        'author': 'Will Thiel',
        'handle': '@willthiel',
        'date': '2026-07-12',
        'text': 'Replying to @MrDouglasHall Incorrect. Check your physicians desk reference. A throbole (or clot) can break off and go to the brain (stroke), lungs (pulmonary embolism) or heart (heart attack)',
        'replies': 27,
        'reposts': 2,
        'likes': 149,
        'views': 49000,
        'url': 'https://x.com/willthiel/status/unknown5'
    },
    {
        'author': 'Neurology Journal',
        'handle': '@GreenJournal',
        'date': '2025-11-21',
        'text': 'Paradoxical Ipsilateral Hemiparesis With Thrombectomy Recanalization: DTI Reveals Uncrossed Corticospinal Tract in Adult Schizencephaly https://hubs.la/Q03VhGhz0',
        'replies': 1,
        'reposts': 7,
        'likes': 41,
        'views': 3100,
        'url': 'https://x.com/GreenJournal/status/unknown6'
    }
]

posts_search2 = [
    {
        'author': 'Hospital Dr. Francisco E. Moscoso Puello',
        'handle': '@MoscosoPuello',
        'date': '2026-07-13',
        'text': 'Hospital Moscoso Puello gradúa 82 nuevos especialistas y promueve a 206 médicos residentes. El Hospital Dr. Francisco E. Moscoso Puello celebró su XLVII Ceremonia de Graduación y Promoción de Médicos Residentes 2026.',
        'replies': 1,
        'reposts': 3,
        'likes': 140,
        'views': 0,
        'url': 'https://x.com/MoscosoPuello/status/unknown7'
    },
    {
        'author': 'Benny Johnson',
        'handle': '@bennyjohnson',
        'date': '2026-07-13',
        'text': "JUST IN: Medical examiner's preliminary report on Lindsey Graham's cause of death indicates ruptured aorta via chronic heart disease: 'Sen. Lindsey Graham died of a ruptured aorta brought on by chronic heart disease, according to the preliminary findings of the DC medical",
        'replies': 508,
        'reposts': 709,
        'likes': 3100,
        'views': 324000,
        'url': 'https://x.com/bennyjohnson/status/unknown8'
    },
    {
        'author': 'RangerRob',
        'handle': '@RangerRob12',
        'date': '2026-07-13',
        'text': 'Replying to @bennyjohnson At his age, he could have had a AAA, but medical screening should have detected that. Pfizer BioNTech Covid Vaccine and Aortic aneurysm rupture, a phase IV clinical study of CDC and FDA data - eHealthMe https://ehealthme.com/vs/pfizer-biontech-covid-vaccine/aortic-aneurysm-rupture/',
        'replies': 2,
        'reposts': 1,
        'likes': 210,
        'views': 0,
        'url': 'https://x.com/RangerRob12/status/unknown9'
    },
    {
        'author': 'RangerRob',
        'handle': '@RangerRob12',
        'date': '2026-07-13',
        'text': 'Replying to @RangerRob12 and @bennyjohnson SARS-CoV-2 spike protein induces endothelial inflammation via ACE2 independently of viral replication | Scientific Reports https://nature.com/articles/s41598-023-41115-3 Intracranial aneurysm rupture within 3d after receiving mRNA anti-COVID-19 vax; 3 cases: https://pubmed.ncbi.nlm.nih.gov/35509565/',
        'replies': 1,
        'reposts': 0,
        'likes': 26,
        'views': 0,
        'url': 'https://x.com/RangerRob12/status/unknown10'
    },
    {
        'author': 'Dr Nikhil Bansal Endovascular Expert',
        'handle': '@EndovascularEx',
        'date': '2026-07-14',
        'text': '15 साल Varicose Veins से परेशान रहने के बाद सही इलाज से मिली राहत। समय पर जांच और Advanced Laser Treatment बेहतर परिणाम देने में मदद कर सकता है। +91 9782415566 #VaricoseVeins #LaserTreatment #PatientStory',
        'replies': 1,
        'reposts': 0,
        'likes': 0,
        'views': 0,
        'url': 'https://x.com/EndovascularEx/status/unknown11'
    }
]

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            date TEXT,
            text TEXT,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            views INTEGER,
            url TEXT,
            search_query TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_posts_to_db(posts, search_query):
    """Save posts to database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO posts 
                (author, handle, date, text, replies, reposts, likes, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['replies'],
                post['reposts'],
                post['likes'],
                post['views'],
                post['url'],
                search_query
            ))
            if cursor.rowcount > 0:
                inserted += 1
        except Exception as e:
            print(f"Error inserting: {e}")
    
    conn.commit()
    conn.close()
    return inserted

def generate_report(posts1, posts2, high_engagement):
    """Generate markdown report"""
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    
    with open(REPORT_PATH, 'w') as f:
        f.write(f"# X/Twitter Neurointervention Scrape Report\n\n")
        f.write(f"**Date:** Tuesday, July 14th, 2026 - 18:02 (Asia/Calcutta)\n\n")
        f.write(f"**Reference UTC:** 2026-07-14 12:32 UTC\n\n")
        
        f.write(f"## Summary\n\n")
        f.write(f"- **Search 1 (Neurointervention/Stroke):** {len(posts1)} posts\n")
        f.write(f"- **Search 2 (AVM/Aneurysm/Endovascular):** {len(posts2)} posts\n")
        f.write(f"- **Total posts:** {len(posts1) + len(posts2)}\n")
        f.write(f"- **High-engagement posts (>50 likes):** {len(high_engagement)}\n\n")
        
        if high_engagement:
            f.write(f"## High-Engagement Posts (>50 likes)\n\n")
            for post in high_engagement:
                f.write(f"### {post['author']} {post['handle']}\n\n")
                if post['date']:
                    f.write(f"**Date:** {post['date']}\n\n")
                f.write(f"{post['text']}\n\n")
                f.write(f"**Engagement:** {post['likes']:,} likes, {post['reposts']:,} reposts, {post['replies']:,} replies")
                if post['views']:
                    f.write(f", {post['views']:,} views")
                f.write(f"\n\n---\n\n")
        
        f.write(f"## All Posts - Search 1 (Neurointervention/Stroke)\n\n")
        f.write(f"*Query: neurointervention OR thrombectomy OR #Neurointervention OR #stroke*\n\n")
        for post in posts1:
            f.write(f"### {post['author']} {post['handle']}")
            if post['date']:
                f.write(f" · {post['date']}")
            f.write(f"\n\n{post['text']}\n\n")
            f.write(f"_{post['likes']:,} likes, {post['reposts']:,} reposts, {post['replies']:,} replies")
            if post['views']:
                f.write(f", {post['views']:,} views")
            f.write(f"_\n\n---\n\n")
        
        f.write(f"\n## All Posts - Search 2 (AVM/Aneurysm/Endovascular)\n\n")
        f.write(f"*Query: cerebral AVM OR intracranial aneurysm OR endovascular*\n\n")
        for post in posts2:
            f.write(f"### {post['author']} {post['handle']}")
            if post['date']:
                f.write(f" · {post['date']}")
            f.write(f"\n\n{post['text']}\n\n")
            f.write(f"_{post['likes']:,} likes, {post['reposts']:,} reposts, {post['replies']:,} replies")
            if post['views']:
                f.write(f", {post['views']:,} views")
            f.write(f"_\n\n---\n\n")

def main():
    print("Initializing database...")
    init_database()
    
    print("\n" + "="*60)
    print("Saving posts from Search 1 (Neurointervention/Stroke)")
    print("="*60)
    inserted1 = save_posts_to_db(posts_search1, "neurointervention")
    print(f"Inserted {inserted1} new posts to database")
    
    print("\n" + "="*60)
    print("Saving posts from Search 2 (AVM/Aneurysm/Endovascular)")
    print("="*60)
    inserted2 = save_posts_to_db(posts_search2, "avm_aneurysm")
    print(f"Inserted {inserted2} new posts to database")
    
    # Find high engagement posts
    all_posts = posts_search1 + posts_search2
    high_engagement = [p for p in all_posts if p.get('likes', 0) > 50]
    high_engagement.sort(key=lambda x: x.get('likes', 0), reverse=True)
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    print(f"Search 1: {len(posts_search1)} posts")
    print(f"Search 2: {len(posts_search2)} posts")
    print(f"Total: {len(all_posts)} posts")
    print(f"High-engagement (>50 likes): {len(high_engagement)} posts")
    
    # Generate report
    print("\nGenerating report...")
    generate_report(posts_search1, posts_search2, high_engagement)
    print(f"Report saved to: {REPORT_PATH}")
    
    # Print high engagement posts
    if high_engagement:
        print("\n" + "="*60)
        print("HIGH-ENGAGEMENT POSTS (>50 likes)")
        print("="*60)
        for post in high_engagement[:5]:
            print(f"\n- {post['author']} ({post['likes']:,} likes)")
            print(f"  {post['text'][:100]}...")

if __name__ == "__main__":
    main()