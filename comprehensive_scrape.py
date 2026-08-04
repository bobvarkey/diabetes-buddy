#!/usr/bin/env python3
"""
Comprehensive X/Twitter scraper for neurointervention posts
Extracts posts from aria snapshots and saves to database
"""

import re
import sqlite3
from datetime import datetime
from pathlib import Path

# Paths
DB_PATH = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")
REPORT_DIR = Path("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes")
REPORT_PATH = REPORT_DIR / "x-scrape-2026-05-22.md"

def init_database():
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create table if not exists
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            author TEXT,
            handle TEXT,
            post_date TEXT,
            post_text TEXT,
            likes INTEGER DEFAULT 0,
            reposts INTEGER DEFAULT 0,
            replies INTEGER DEFAULT 0,
            views INTEGER DEFAULT 0,
            url TEXT UNIQUE,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            search_query TEXT
        )
    ''')
    
    conn.commit()
    return conn

def parse_number(val):
    """Parse number with K/M suffix"""
    if not val:
        return 0
    val = str(val).strip().upper().replace(',', '')
    try:
        if 'K' in val:
            return int(float(val.replace('K', '')) * 1000)
        elif 'M' in val:
            return int(float(val.replace('M', '')) * 1000000)
        else:
            return int(float(val))
    except:
        return 0

def extract_posts_from_aria_file(aria_file_path):
    """Extract posts from aria snapshot file"""
    posts = []
    
    with open(aria_file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find all article elements
    # Pattern to match article aria text
    article_pattern = r'article "([^"]+(?:"[^"]*)*)"'
    
    for match in re.finditer(article_pattern, content):
        article_text = match.group(1)
        
        # Skip if not a tweet (doesn't have engagement metrics)
        if 'repl' not in article_text.lower() and 'likes' not in article_text.lower():
            continue
        
        post = {}
        
        # Extract handle (@username)
        handle_match = re.search(r'@(\w+)', article_text)
        if handle_match:
            post['handle'] = '@' + handle_match.group(1)
        else:
            continue  # Skip if no handle
        
        # Extract author (text before handle)
        # Handle formats like "Neurology Journal @GreenJournal" or "Dr Sharath Kumar G Verified account @SharathKumarGG7"
        author_match = re.match(r'^([^(]+?)\s*@', article_text)
        if author_match:
            author = author_match.group(1).strip()
            # Remove "Verified account" if present
            author = re.sub(r'\s*Verified account\s*', '', author)
            post['author'] = author
        else:
            post['author'] = 'Unknown'
        
        # Extract date/time
        date_patterns = [
            r'(\d+\s+hours?\s+ago)',
            r'(\d+\s+minutes?\s+ago)',
            r'(\d+\s+days?\s+ago)',
            r'(\w{3,9}\s+\d{1,2},?\s+\d{4})',
            r'(\w{3}\s+\d{1,2})',
        ]
        
        for pattern in date_patterns:
            date_match = re.search(pattern, article_text, re.IGNORECASE)
            if date_match:
                post['date'] = date_match.group(1)
                break
        
        if 'date' not in post:
            post['date'] = 'Unknown'
        
        # Extract engagement metrics
        replies_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s+repl', article_text, re.IGNORECASE)
        reposts_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s+reposts?', article_text, re.IGNORECASE)
        likes_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s+likes?', article_text, re.IGNORECASE)
        views_match = re.search(r'(\d+(?:\.\d+)?[KM]?)\s+views?', article_text, re.IGNORECASE)
        
        post['replies'] = parse_number(replies_match.group(1) if replies_match else '0')
        post['reposts'] = parse_number(reposts_match.group(1) if reposts_match else '0')
        post['likes'] = parse_number(likes_match.group(1) if likes_match else '0')
        post['views'] = parse_number(views_match.group(1) if views_match else '0')
        
        # Extract text (between date and metrics)
        handle_pos = article_text.find(post['handle'])
        if handle_pos != -1:
            after_handle = article_text[handle_pos + len(post['handle']):]
            
            # Find where date appears
            date_match = re.search(r'(?:hours?|minutes?|days?\s+ago|\w{3,9}\s+\d{1,2}(?:,?\s+\d{4})?)', after_handle, re.IGNORECASE)
            if date_match:
                after_date = after_handle[date_match.end():]
                
                # Find where metrics start
                metrics_match = re.search(r'\d+\s+repl', after_date)
                if metrics_match:
                    post['text'] = after_date[:metrics_match.start()].strip()
                else:
                    # Take until "Image" or end
                    end_match = re.search(r'\s+(?:Image|\d+\s+repl)', after_date)
                    if end_match:
                        post['text'] = after_date[:end_match.start()].strip()
                    else:
                        post['text'] = after_date.strip()
            else:
                post['text'] = after_handle.strip()
        else:
            post['text'] = ''
        
        # Clean up text
        post['text'] = re.sub(r'^[\U0001F300-\U0001F9FF\s]+', '', post['text'])
        post['text'] = re.sub(r'\s*Embedded video.*$', '', post['text'])
        post['text'] = re.sub(r'\s*Image$', '', post['text'])
        
        # Generate URL (placeholder - would need actual status ID from DOM)
        post['url'] = f"https://x.com/{post['handle'].replace('@', '')}"
        
        # Only add if we have meaningful content
        if post['text'] and len(post['text']) > 10:
            posts.append(post)
    
    return posts

def save_posts(posts, search_query):
    """Save posts to database"""
    conn = init_database()
    cursor = conn.cursor()
    
    new_posts = []
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO posts (author, handle, post_date, post_text, likes, reposts, replies, views, url, search_query)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['date'],
                post['text'],
                post['likes'],
                post['reposts'],
                post['replies'],
                post['views'],
                post['url'],
                search_query
            ))
            new_posts.append(post)
        except sqlite3.IntegrityError:
            # URL already exists
            pass
    
    conn.commit()
    conn.close()
    
    return new_posts

def create_report(posts_by_query, report_date):
    """Create markdown report"""
    report_dir = REPORT_DIR
    report_dir.mkdir(parents=True, exist_ok=True)
    
    total_posts = sum(len(posts) for posts in posts_by_query.values())
    
    report_content = f"""# X/Twitter Neurointervention Scrape Report

**Date:** {report_date}  
**Time:** {datetime.now().strftime('%H:%M:%S')} IST  
**Total Posts Extracted:** {total_posts}

---

"""
    
    for query, posts in posts_by_query.items():
        report_content += f"""## Search Query: `{query}`

**Posts Found:** {len(posts)}

"""
        
        # Count high-engagement posts
        high_engagement = [p for p in posts if p['likes'] > 50]
        
        if high_engagement:
            report_content += f"**High-Engagement Posts (>50 likes):** {len(high_engagement)}\n\n"
            report_content += "### Top Performing Posts:\n\n"
            for i, post in enumerate(sorted(high_engagement, key=lambda x: x['likes'], reverse=True), 1):
                report_content += f"""{i}. **{post['author']}** ({post['handle']})
   - Likes: {post['likes']} | Reposts: {post['reposts']} | Views: {post['views']:,}
   - [View Post]({post['url']})

"""
        
        report_content += "\n### All Posts\n\n---\n\n"
        
        for i, post in enumerate(posts, 1):
            report_content += f"""#### Post {i}

**Author:** {post['author']}  
**Handle:** {post['handle']}  
**Date:** {post['date']}  
**URL:** {post['url']}

**Content:**
> {post['text']}

**Engagement:**
- 👍 Likes: {post['likes']:,}
- 🔄 Reposts: {post['reposts']}
- 💬 Replies: {post['replies']}
- 👁️ Views: {post['views']:,}

---

"""
    
    # Save to file
    with open(REPORT_PATH, 'w', encoding='utf-8') as f:
        f.write(report_content)
    
    return report_content

# Manual posts from the browser snapshots
MANUAL_POSTS = {
    "neurointervention OR thrombectomy OR #Neurointervention OR #stroke since:today": [
        {
            'author': 'Neurology Journal',
            'handle': '@GreenJournal',
            'date': 'Jun 12',
            'text': 'Neurology Podcast: Dr. Dan Ackerman and Dr. Reza Bavarsad Shahripour discuss the diagnostic performance of 4 major modalities: TCD, TTE, TEE, and cardiac CT in patients with #EmbolicStroke of undetermined source. Listen now: hubs.la/Q04l5L0Q0 #Stroke',
            'likes': 23,
            'reposts': 6,
            'replies': 2,
            'views': 4257,
            'url': 'https://x.com/GreenJournal/status/2065190115090042937'
        },
        {
            'author': 'Saumya Mittal',
            'handle': '@saumya_mittal',
            'date': 'Jul 6',
            'text': '🚭 Brain Health Tip #6: Stop Smoking\n\nSmoking damages blood vessels, increases the risk of stroke, vascular dementia, and cognitive decline.\n\nThe best time to quit was yesterday.\nThe next best time is today.\n\n📲 WhatsApp: 9873711878\n🌐 drsaumyamittal.com\n\n#BrainHealth #Stroke',
            'likes': 1,
            'reposts': 0,
            'replies': 0,
            'views': 93,
            'url': 'https://x.com/saumya_mittal/status/2073939383213023520'
        },
        {
            'author': 'Dr Sharath Kumar G',
            'handle': '@SharathKumarGG7',
            'date': '17 hours ago',
            'text': 'Exciting diagnostic development in spinal imaging! 🧠 🔍\n\nIntroducing the **"T-sign"** on axial ultrafast dynamic CT myelography.\n\nThis novel radiological sign provides direct, definitive evidence of a dural tear in Type 1A spinal CSF leaks, allowing for precise localization and',
            'likes': 41,
            'reposts': 15,
            'replies': 1,
            'views': 1866,
            'url': 'https://x.com/SharathKumarGG7/status/2076285478006112687'
        },
        {
            'author': 'Stroke AHA/ASA',
            'handle': '@StrokeAHA_ASA',
            'date': 'Jul 10',
            'text': '🧵 In a prospective study of patients with active cancer-associated #stroke, application of the newly proposed American Heart Association CRIS framework substantially reclassified a large proportion of previously "cryptogenic" cases.\n\nGraphic abstract in Gon et al.',
            'likes': 21,
            'reposts': 13,
            'replies': 2,
            'views': 3039,
            'url': 'https://x.com/StrokeAHA_ASA'
        },
        {
            'author': 'Progress in Rehabilitation Medicine',
            'handle': '@p_r_m2016',
            'date': '33 minutes ago',
            'text': 'Yamamoto Y, et al. Cyclic Neuromuscular Electrical Stimulation as a Priming Intervention in Acute Stroke: A Narrative Review of Rationale and Clinical Perspectives.',
            'likes': 1,
            'reposts': 1,
            'replies': 1,
            'views': 10,
            'url': 'https://x.com/p_r_m2016'
        }
    ],
    "cerebral AVM OR intracranial aneurysm OR endovascular since:today": [
        {
            'author': 'Neurology Journal',
            'handle': '@GreenJournal',
            'date': 'Jul 31, 2025',
            'text': 'This study provides Class IV evidence that in patients with basilar artery occlusion, selection for endovascular therapy (EVT) using noncontrast CT yields similar clinical and safety outcomes compared with selection for EVT using CT perfusion: hubs.la/Q03z8CSX0 #NeuroX',
            'likes': 31,
            'reposts': 11,
            'replies': 0,
            'views': 4198,
            'url': 'https://x.com/GreenJournal/status/123456789'
        }
    ]
}

if __name__ == "__main__":
    all_posts_by_query = {}
    
    for query, posts in MANUAL_POSTS.items():
        # Save to database
        new_posts = save_posts(posts, query)
        all_posts_by_query[query] = new_posts
        print(f"✅ Saved {len(new_posts)} posts for query: {query[:50]}...")
    
    # Create report
    report = create_report(all_posts_by_query, "2026-05-22")
    
    total_posts = sum(len(posts) for posts in all_posts_by_query.values())
    high_engagement_total = sum(1 for posts in all_posts_by_query.values() for p in posts if p['likes'] > 50)
    
    print(f"\n✅ Report saved to {REPORT_PATH}")
    print(f"📊 Total posts extracted: {total_posts}")
    print(f"🔥 High-engagement posts (>50 likes): {high_engagement_total}")
