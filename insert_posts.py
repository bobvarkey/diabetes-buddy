#!/usr/bin/env python3
import sqlite3
import json
import sys
from datetime import datetime

def insert_posts(posts_file, search_term):
    # Read posts from JSON file
    with open(posts_file, 'r') as f:
        posts = json.load(f)

    # Connect to database
    conn = sqlite3.connect('/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db')
    cursor = conn.cursor()

    # Insert posts
    inserted = 0
    duplicates = 0
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
            duplicates += 1

    conn.commit()
    conn.close()

    return inserted, duplicates

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python insert_posts.py <posts_file> <search_term>")
        sys.exit(1)

    posts_file = sys.argv[1]
    search_term = sys.argv[2]

    inserted, duplicates = insert_posts(posts_file, search_term)
    print(f"Inserted: {inserted}, Duplicates: {duplicates}")