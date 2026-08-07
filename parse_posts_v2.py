#!/usr/bin/env python3
import sqlite3
import json
import codecs
import sys

# Connect to database
conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
cursor = conn.cursor()

def parse_and_insert(filepath, search_term):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the JSON array line
    lines = content.split('\n')
    json_line = None
    for line in lines:
        if line.strip().startswith('"['):
            json_line = line
            break

    if not json_line:
        print(f"No JSON found in {filepath}")
        return 0

    # Remove surrounding quotes and unescape
    unquoted = json_line.strip()
    if unquoted.startswith('"') and unquoted.endswith('"'):
        unquoted = unquoted[1:-1]

    # Decode escape sequences
    decoded = codecs.decode(unquoted, 'unicode_escape')

    # Parse as JSON
    posts = json.loads(decoded)

    inserted = 0
    for post in posts:
        try:
            cursor.execute('''
                INSERT INTO x_posts (author, handle, text, date, likes, reposts, replies, url, search_term)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                post['author'],
                post['handle'],
                post['text'],
                post['date'],
                post['likes'],
                post['reposts'],
                post['replies'],
                post['url'],
                search_term
            ))
            inserted += 1
        except sqlite3.IntegrityError:
            pass

    return inserted

# Process both files
count1 = parse_and_insert('/Users/bobvarkey/.openclaw/workspace/posts_search1.json',
                         'neurointervention OR thrombectomy OR #Neurointervention OR #stroke')
count2 = parse_and_insert('/Users/bobvarkey/.openclaw/workspace/posts_search2.json',
                         'cerebral AVM OR intracranial aneurysm OR endovascular')

conn.commit()

# Get totals
total = cursor.execute('SELECT COUNT(*) FROM x_posts').fetchone()[0]
high_engagement = cursor.execute('SELECT COUNT(*) FROM x_posts WHERE likes > 50').fetchone()[0]

print(f"Inserted from search 1: {count1}")
print(f"Inserted from search 2: {count2}")
print(f"Total posts in database: {total}")
print(f"Posts with >50 likes: {high_engagement}")

# Get high engagement posts
high_posts = cursor.execute('''
    SELECT author, handle, text, likes, url
    FROM x_posts
    WHERE likes > 50
    ORDER BY likes DESC
''').fetchall()

if high_posts:
    print("\n=== HIGH ENGAGEMENT POSTS (>50 likes) ===")
    for post in high_posts:
        author, handle, text, likes, url = post
        print(f"\n{author} {handle}")
        print(f"Likes: {likes}")
        print(f"Text: {text[:150]}...")
        print(f"URL: {url}")

conn.close()