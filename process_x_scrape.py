#!/usr/bin/env python3
"""
Process X/Twitter scraped data and save to database
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
MARKDOWN_PATH = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")

# Posts from first search query (neurointervention OR thrombectomy OR #Neurointervention OR #stroke)
posts_query1 = [
    {
        "author": "Neurology Journal",
        "handle": "GreenJournal",
        "date": "Jun 12",
        "text": "Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke",
        "replies": 2,
        "reposts": 6,
        "likes": 23,
        "bookmarks": 7,
        "views": 4179,
        "url": "https://x.com/GreenJournal/status/2065190115090042937"
    },
    {
        "author": "Iatrogenic Awareness",
        "handle": "iatrogenicaware",
        "date": "51 minutes ago",
        "text": "If thousands of anecdotes appear in the exact same way and present the exact same symptoms, yes they do mean something. The symptoms are neurological, and rapidly onset with starting and stopping SSRIs. Reducing this long observed and formally medically recognized (in Europe)",
        "replies": 1,
        "reposts": 1,
        "likes": 2,
        "bookmarks": 0,
        "views": 44,
        "url": "https://x.com/iatrogenicaware/status/2072103594505953368"
    },
    {
        "author": "LadyBossert",
        "handle": "bossert_l",
        "date": "24 minutes ago",
        "text": "Then provide the European research? You really don't understand how ridiculous you sound. There is no long lasting permanent neurological injury. You know that and yet you can't grasp that all long term medications require tapering to avoid abstinence syndromes.",
        "replies": 1,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 31,
        "url": "https://x.com/bossert_l/status/2072110377463411000"
    },
    {
        "author": "Forest Mommy 🌲 🗡 💪 🏹 🌲 🌲",
        "handle": "ForestMommy",
        "date": "5 hours ago",
        "text": "Probably doesn't matter and it's all corrupt but oh well. Post tooth extraction and I'm still dropping it off",
        "replies": 43,
        "reposts": 7,
        "likes": 477,
        "bookmarks": 4,
        "views": 4521,
        "url": "https://x.com/ForestMommy/status/2072032293993214039"
    },
    {
        "author": "THE Old Dirty Bay of Pigs Seasoning",
        "handle": "siecz2",
        "date": "24 minutes ago",
        "text": "Tooth extraction or tooth ex-stroke-tion….because it looks like you had a stroke.",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 5,
        "url": "https://x.com/siecz2/status/2072110595315241168"
    },
    {
        "author": "Sean",
        "handle": "sean_from_earth",
        "date": "5 hours ago",
        "text": "What if we only get the cyberpunk corporate hegemon future and not the augments?",
        "replies": 4,
        "reposts": 0,
        "likes": 8,
        "bookmarks": 0,
        "views": 384,
        "url": "https://x.com/sean_from_earth/status/2072031606639124957"
    },
    {
        "author": "Sean",
        "handle": "sean_from_earth",
        "date": "8 minutes ago",
        "text": "Yeah, I've seen no indication we are anywhere close to figuring out biology enough for this but I will accept immortality through replaceable vat-grown organs as a substitute.",
        "replies": 1,
        "reposts": 0,
        "likes": 1,
        "bookmarks": 0,
        "views": 5,
        "url": "https://x.com/sean_from_earth/status/2072114784859009485"
    },
    {
        "author": "Shannon Sands",
        "handle": "max_paperclips",
        "date": "5 minutes ago",
        "text": "yep. full tilt invasive implants (apart from neuralink) seem a ways off I'm more of a fan of non-invasive solutions anyway, can always take off a headset more easily than remove a faulty BCI wired into your nervous system",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 5,
        "url": "https://x.com/max_paperclips/status/2072115566601719843"
    },
    {
        "author": "nervemed",
        "handle": "nervemed",
        "date": "12 hours ago",
        "text": "Periorbital edema is a classical feature due failure of which organ system ❓ A. Liver B. Heart C. Kidney D. Lymph",
        "replies": 35,
        "reposts": 15,
        "likes": 144,
        "bookmarks": 55,
        "views": 30826,
        "url": "https://x.com/nervemed/status/2071930235910856963"
    },
    {
        "author": "SonicNurse",
        "handle": "washoutatfolly",
        "date": "20 minutes ago",
        "text": "C) Kidney. Literally had this case today along with rapid BLE bullous edema and plumonary edema",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 25,
        "url": "https://x.com/washoutatfolly/status/2072112044602503519"
    },
    {
        "author": "LadyBossert",
        "handle": "bossert_l",
        "date": "Jun 23",
        "text": "This is such nonsense. She's more special & terminally unique than people going through heroin withdrawal. Even as she admits that SSRI w/d 'only produces physical dependence' & opiates involve psychological addiction too. Willing to bet she didn't sell her soul for SSRIs tho 🤔",
        "replies": 2,
        "reposts": 2,
        "likes": 1,
        "bookmarks": 0,
        "views": 5941,
        "url": "https://x.com/bossert_l/status/2069250720671613053"
    },
    {
        "author": "Iatrogenic Awareness",
        "handle": "iatrogenicaware",
        "date": "21 minutes ago",
        "text": "@grok can SSRIs cause potentially permanent neurological injuries such as PSSD and Protracted Withdrawal, and is PSSD formally medically recognized by the EMA?",
        "replies": 2,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 36,
        "url": "https://x.com/iatrogenicaware/status/2072111734525972639"
    },
    {
        "author": "LadyBossert",
        "handle": "bossert_l",
        "date": "13 minutes ago",
        "text": "Stop. If you can't produce evidence on your own and have to resort to a bad ai, you clearly have zero comprehension of the topic. PS: even grok keeps saying there is no long lasting permanent neurological injury.",
        "replies": 1,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 13,
        "url": "https://x.com/bossert_l/status/2072113908962533474"
    },
    {
        "author": "Ritwik Pavan",
        "handle": "ritwikpavan",
        "date": "6 hours ago",
        "text": "NEW: Dephy launched a wearable that gives your ankle a powered boost. Sidekick is bionic footwear built to help people walk farther, faster, and with less effort in everyday life. • Works like an e-bike for walking • Adds a boost at the heel with every step • Delivers 100+",
        "replies": 14,
        "reposts": 24,
        "likes": 252,
        "bookmarks": 235,
        "views": 56639,
        "url": "https://x.com/ritwikpavan/status/2072023829849997735"
    },
    {
        "author": "Bradley Clonan",
        "handle": "ClonanBradley",
        "date": "37 minutes ago",
        "text": "Might need one of these. It's either this or ablation.",
        "replies": 0,
        "reposts": 0,
        "likes": 0,
        "bookmarks": 0,
        "views": 56,
        "url": "https://x.com/ClonanBradley/status/2072107871974596723"
    }
]

# Posts from second search query (cerebral AVM OR intracranial aneurysm OR endovascular)
posts_query2 = [
    {
        "author": "Marcus Pinto, MD, MS",
        "handle": "MarcusVPinto",
        "date": "Mar 13, 2025",
        "text": "The lumbosacral plexus plays a vital role in motor, sensory, and autonomic innervation of the lower limbs and pelvic region. Lumbosacral plexopathies are not easy to diagnose, and below, I try to simplify how to approach them. The main focus of this post is clinical feature",
        "replies": 9,
        "reposts": 79,
        "likes": 296,
        "bookmarks": 275,
        "views": 31298,
        "url": "https://x.com/MarcusVPinto/status/1899924485891121336"
    },
    {
        "author": "Marcus Pinto, MD, MS",
        "handle": "MarcusVPinto",
        "date": "Mar 13, 2025",
        "text": "Lumbar spine MRI with and without IV contrast should be part of the evaluation of the lumbosacral plexopathies to exclude structural radiculopathies or other pathologies. Lumbar puncture is recommended in acute/subacute or chronic cases. CSF analysis is important to rule out",
        "replies": 1,
        "reposts": 0,
        "likes": 8,
        "bookmarks": 1,
        "views": 1054,
        "url": "https://x.com/MarcusVPinto/status/1899924509827678554"
    },
    {
        "author": "Marcus Pinto, MD, MS",
        "handle": "MarcusVPinto",
        "date": "Mar 13, 2025",
        "text": "Causes • Trauma: High-energy injuries, such as pelvic fractures from car accidents, can directly damage the plexus. Pelvic or hip surgeries may also lead to plexopathy due to nerve compression or stretching. A less common cause is intrapartum plexopathy, where prolonged labor",
        "replies": 3,
        "reposts": 0,
        "likes": 10,
        "bookmarks": 2,
        "views": 1180,
        "url": "https://x.com/MarcusVPinto/status/1899924513279639721"
    }
]

def init_database():
    """Initialize SQLite database"""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT NOT NULL,
            handle TEXT NOT NULL,
            date TEXT,
            text TEXT NOT NULL,
            replies INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            likes INTEGER DEFAULT 0,
            bookmarks INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT,
            search_query TEXT,
            scraped_at TEXT,
            UNIQUE(handle, date, text)
        )
    ''')
    conn.commit()
    return conn

def add_post(conn, post, search_query):
    """Add a post to the database"""
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO posts (author, handle, date, text, replies, reposts, likes, bookmarks, views, url, search_query, scraped_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post['author'],
            post['handle'],
            post['date'],
            post['text'],
            post['replies'],
            post['reposts'],
            post['likes'],
            post['bookmarks'],
            post['views'],
            post['url'],
            search_query,
            datetime.now().isoformat()
        ))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def get_all_posts(conn):
    """Get all posts from database"""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT author, handle, date, text, replies, reposts, likes, bookmarks, views, url
        FROM posts
        ORDER BY likes DESC
    ''')
    return cursor.fetchall()

def get_high_engagement_posts(conn, min_likes=50):
    """Get posts with more than min_likes likes"""
    cursor = conn.cursor()
    cursor.execute('''
        SELECT author, handle, date, text, replies, reposts, likes, bookmarks, views, url
        FROM posts
        WHERE likes >= ?
        ORDER BY likes DESC
    ''', (min_likes,))
    return cursor.fetchall()

def generate_markdown_report(conn, search_queries):
    """Generate markdown report"""
    report_date = datetime.now().strftime("%Y-%m-%d")
    report_path = MARKDOWN_PATH / f"x-scrape-{report_date}.md"
    MARKDOWN_PATH.mkdir(parents=True, exist_ok=True)
    
    all_posts = get_all_posts(conn)
    high_engagement = get_high_engagement_posts(conn, min_likes=50)
    
    with open(report_path, 'w') as f:
        f.write(f"# X/Twitter Scrape Report - {report_date}\n\n")
        f.write(f"**Scraped at:** {datetime.now().isoformat()}\n\n")
        f.write(f"**Search Queries:**\n")
        for query in search_queries:
            f.write(f"- {query}\n")
        f.write(f"\n---\n\n")
        
        f.write(f"## Summary\n\n")
        f.write(f"**Total posts scraped:** {len(all_posts)}\n\n")
        f.write(f"**High-engagement posts (>50 likes):** {len(high_engagement)}\n\n")
        
        if high_engagement:
            f.write(f"## High-Engagement Posts (>50 likes)\n\n")
            for post in high_engagement:
                author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
                f.write(f"### {author} (@{handle})\n\n")
                f.write(f"**Date:** {date}\n\n")
                f.write(f"**Text:**\n{text}\n\n")
                f.write(f"**Engagement:**\n")
                f.write(f"- 💬 {replies} replies\n")
                f.write(f"- 🔄 {reposts} reposts\n")
                f.write(f"- ❤️ {likes} likes\n")
                f.write(f"- 🔖 {bookmarks} bookmarks\n")
                f.write(f"- 👁 {views} views\n\n")
                f.write(f"**URL:** {url}\n\n")
                f.write(f"---\n\n")
        
        f.write(f"## All Posts\n\n")
        f.write(f"### Query 1: {search_queries[0]}\n\n")
        query1_posts = [p for p in all_posts if 'stroke' in p[9] or 'neurointervention' in p[9] or 'thrombectomy' in p[9]]
        for post in query1_posts:
            author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
            f.write(f"- **{author} (@{handle})** - {date}\n")
            f.write(f"  {text[:150]}{'...' if len(text) > 150 else ''}\n")
            f.write(f"  💬 {replies} 🔄 {reposts} ❤️ {likes} 👁 {views}\n\n")
        
        f.write(f"\n### Query 2: {search_queries[1]}\n\n")
        query2_posts = [p for p in all_posts if 'AVM' in p[9] or 'aneurysm' in p[9] or 'endovascular' in p[9]]
        for post in query2_posts:
            author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
            f.write(f"- **{author} (@{handle})** - {date}\n")
            f.write(f"  {text[:150]}{'...' if len(text) > 150 else ''}\n")
            f.write(f"  💬 {replies} 🔄 {reposts} ❤️ {likes} 👁 {views}\n\n")
    
    return report_path

def main():
    print("Initializing database...")
    conn = init_database()
    
    search_queries = [
        "neurointervention OR thrombectomy OR #Neurointervention OR #stroke",
        "cerebral AVM OR intracranial aneurysm OR endovascular"
    ]
    
    print("Adding posts from query 1...")
    for post in posts_query1:
        success = add_post(conn, post, search_queries[0])
        if success:
            print(f"  ✓ Added: {post['author']} (@{post['handle']})")
        else:
            print(f"  ⊘ Duplicate: {post['author']} (@{post['handle']})")
    
    print("Adding posts from query 2...")
    for post in posts_query2:
        success = add_post(conn, post, search_queries[1])
        if success:
            print(f"  ✓ Added: {post['author']} (@{post['handle']})")
        else:
            print(f"  ⊘ Duplicate: {post['author']} (@{post['handle']})")
    
    print("\nGenerating markdown report...")
    report_path = generate_markdown_report(conn, search_queries)
    print(f"✓ Report saved to: {report_path}")
    
    print("\nDatabase summary:")
    all_posts = get_all_posts(conn)
    high_engagement = get_high_engagement_posts(conn, min_likes=50)
    print(f"  Total posts: {len(all_posts)}")
    print(f"  High-engagement posts (>50 likes): {len(high_engagement)}")
    
    print("\nHigh-engagement posts:")
    for post in high_engagement:
        author, handle, date, text, replies, reposts, likes, bookmarks, views, url = post
        print(f"  - {author} (@{handle}): {likes} likes")
    
    conn.close()
    print("\n✓ Done!")

if __name__ == "__main__":
    main()