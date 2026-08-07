#!/usr/bin/env python3
import re
import sqlite3
from datetime import datetime
import os

# Raw data from browser
raw_posts = """Neurology Journal
@GreenJournal
·
Aug 14, 2024
Neurology Podcast: Drs. Dan Ackerman & Luciano Sposato discuss the topic of embolic #stroke of undetermined source & the controversies surrounding cardiac monitoring & anticoagulation. Listen now:
https://
bit.ly/3SNKTep
Article:
https://
bit.ly/3yFykeb

@SposatoL
@DrDanAckerman
1
8
22
7K|||POST_END|||Brain Surgery Hospital
@bshrwp
·
Jul 12
Dr. Hamid Shareef (MBBS, FCPS, Neuro Intervention Fellow – USA) at Brain Surgery  Hospital provides expert care in cardiology and neuro-interventional   procedures.
#Cardiology #NeuroIntervention #DrHamidShareef #HeartCare #BrainCare #StrokeTreatment   #MedicalExpert #Healthcare
15|||POST_END|||Neurology Journal
@GreenJournal
·
Mar 1
New evidence suggests patients with #stroke due to anterior circulation large vessel occlusion, IV tenecteplase plus thrombectomy is associated with better functional outcomes at 3 months compared with thrombectomy alone:
https://
hubs.la/Q0451Cg20

#NeuroTwitter
1
9
33
2.8K|||POST_END|||Neurology Journal
@GreenJournal
·
Jul 27, 2023
In patients with nonvalvular atrial fibrillation who develop ischemic #stroke despite taking direct oral anticoagulants (DOACs), switching to warfarin or an alternate DOAC may increase the risk of recurrence. Learn more:
https://
bit.ly/43ItKWb

#NeuroTwitter
1
99
259
50K"""

# Parse posts
post_texts = raw_posts.split('|||POST_END|||')
posts = []

for post_text in post_texts:
    if not post_text.strip():
        continue

    post = {}

    # Extract author and handle
    lines = post_text.strip().split('\n')
    if len(lines) >= 2:
        post['author'] = lines[0].strip()
        post['handle'] = lines[1].strip()

        # Find date (after the ·)
        for i, line in enumerate(lines):
            if line.strip() == '·' and i + 1 < len(lines):
                post['date'] = lines[i + 1].strip()
                break

    # Extract text (between date and metrics)
    # Find where metrics start (numbers at the end)
    text_lines = []
    in_text = False
    for line in lines:
        stripped = line.strip()
        if stripped == '·':
            in_text = True
            continue
        if in_text:
            # Check if this line is just numbers or URLs
            if re.match(r'^[\d.KkMm\s]+$', stripped) or stripped.startswith('https://') or stripped.startswith('http'):
                continue
            # Check if this is a handle (@username)
            if stripped.startswith('@') and stripped != post.get('handle', ''):
                continue
            text_lines.append(stripped)

    post['text'] = ' '.join(text_lines)

    # Extract metrics (last few lines that are just numbers)
    metric_lines = []
    for line in reversed(lines):
        stripped = line.strip()
        if re.match(r'^[\d.KkMm]+$', stripped):
            metric_lines.insert(0, stripped)
        elif metric_lines:  # Stop once we've found metrics and hit non-metric
            break

    # Parse metrics
    if len(metric_lines) >= 4:
        post['replies'] = int(metric_lines[0]) if metric_lines[0].isdigit() else 0

        # Handle reposts
        if 'K' in metric_lines[1] or 'k' in metric_lines[1]:
            post['reposts'] = int(float(metric_lines[1].replace('K', '').replace('k', '')) * 1000)
        else:
            post['reposts'] = int(metric_lines[1]) if metric_lines[1].isdigit() else 0

        # Handle likes
        if 'K' in metric_lines[2] or 'k' in metric_lines[2]:
            post['likes'] = int(float(metric_lines[2].replace('K', '').replace('k', '')) * 1000)
        else:
            post['likes'] = int(metric_lines[2]) if metric_lines[2].isdigit() else 0

        # Handle views
        if 'K' in metric_lines[3] or 'k' in metric_lines[3]:
            post['views'] = int(float(metric_lines[3].replace('K', '').replace('k', '')) * 1000)
        elif 'M' in metric_lines[3] or 'm' in metric_lines[3]:
            post['views'] = int(float(metric_lines[3].replace('M', '').replace('m', '')) * 1000000)
        else:
            post['views'] = int(metric_lines[3]) if metric_lines[3].isdigit() else 0

    # Generate URL
    if 'handle' in post:
        post['url'] = f"https://x.com/{post['handle'].lstrip('@')}"

    posts.append(post)

print(f"Parsed {len(posts)} posts:")
for i, post in enumerate(posts, 1):
    print(f"\n{i}. {post.get('author', 'Unknown')} ({post.get('handle', '@unknown')})")
    print(f"   Date: {post.get('date', 'Unknown')}")
    print(f"   Text: {post.get('text', 'No text')[:150]}...")
    print(f"   Metrics: {post.get('likes', 0)} likes, {post.get('reposts', 0)} reposts, {post.get('views', 0)} views")

# Save to database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

for post in posts:
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO x_posts
            (author, handle, date, text, url, replies, reposts, likes, views, search_query)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            post.get('author', ''),
            post.get('handle', ''),
            post.get('date', ''),
            post.get('text', ''),
            post.get('url', ''),
            post.get('replies', 0),
            post.get('reposts', 0),
            post.get('likes', 0),
            post.get('views', 0),
            'neurointervention OR thrombectomy OR #Neurointervention OR #stroke'
        ))
    except Exception as e:
        print(f"Error: {e}")

conn.commit()
conn.close()

print(f"\n✓ Saved {len(posts)} posts to database")