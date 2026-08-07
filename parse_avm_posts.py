#!/usr/bin/env python3
import re
import sqlite3
from datetime import datetime
import os

# Raw data from second search
raw_posts = """Mohammed Y. Alateeq | محمد بن يوسف العتيق
@IR_Tech96
·
Jul 12
A highly complex dissecting distal right anterior cerebral artery (ACA) mycotic aneurysm causing intracerebral hemorrhage (ICH) in a 40-year-old patient with infective endocarditis was successfully treated with endovascular glue embolization under the leadership of Dr. Areej
Show more
2
1
5
762|||POST_END|||Neurology Journal
@GreenJournal
·
Jul 12, 2025
This study provides Class II evidence that in patients presenting within 24 hours with large vessel occlusion strokes undergoing endovascular thrombectomy, the 90-day modified Rankin Scale score is comparable in those with or without general anesthesia:
https://
hubs.la/Q03wXjJZ0
1
3
14
2.5K|||POST_END|||Sean Frank
@Seanfrank
·
20h
Replying to
@TwoRulesOfWar
my dad had this. I drove him to the hospital thinking it was a heart attack. 14 hours of surgery later, and he survived.
a year recovery. they said he might last 5 years.
he is at 15.
not quite as bad as a brain aneurysm, but 9/10 dont survive getting to the hospital
1
14
2.4K|||POST_END|||Neurology Journal
@GreenJournal
·
Jun 5, 2024
Neurology Podcast: Dr. Dan Ackerman and Dr. Silja Räty discuss the outcomes of patients with BAO treated with IVT only and compares IVT with endovascular thrombectomy. Listen now:
https://
bit.ly/3Vs1FBo Article:
https://
bit.ly/45gTtHC
#NeuroTwitter
@DrDanAckerman
3
16
3.4K|||POST_END|||Ezequiel Córdova
@E_Cordova79
·
Jul 10
Replying to
@E_Cordova79
@DiorIzzy
and 3 others
I doubt 2–3 fewer days of antibiotics make a difference in SAB. The cornerstone is correctly identifying patients with endovascular infection, occult complications, or metastatic foci to guide treatment duration.
1
41|||POST_END|||Fernando Biguria
@FernandoBiguria
·
Jul 12
Endovascular ASD repair (botched ).  Open up and fix as it should have been fixed from the beginning.
Quote
Dr Akhil Sharma
@Drakhil_cardio
·
Jul 12
# Sharing for learning
Case Challenge
Which procedure was performed?
What went wrong?
How should it be managed?
159"""

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
            # Skip "Show more" and "Quote" lines
            if stripped in ['Show more', 'Quote', 'Replying to']:
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
    if len(metric_lines) >= 3:
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

        # Handle views (if present)
        if len(metric_lines) >= 4:
            if 'K' in metric_lines[3] or 'k' in metric_lines[3]:
                post['views'] = int(float(metric_lines[3].replace('K', '').replace('k', '')) * 1000)
            elif 'M' in metric_lines[3] or 'm' in metric_lines[3]:
                post['views'] = int(float(metric_lines[3].replace('M', '').replace('m', '')) * 1000000)
            else:
                post['views'] = int(metric_lines[3]) if metric_lines[3].isdigit() else 0
        else:
            post['views'] = 0

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
            'cerebral AVM OR intracranial aneurysm OR endovascular'
        ))
    except Exception as e:
        print(f"Error: {e}")

conn.commit()
conn.close()

print(f"\n✓ Saved {len(posts)} posts to database")