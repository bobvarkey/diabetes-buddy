#!/usr/bin/env python3
import sqlite3
import json
from datetime import datetime
import os

# Create output directory
os.makedirs("/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes", exist_ok=True)

# Initialize database
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create table if not exists
cursor.execute('''
CREATE TABLE IF NOT EXISTS x_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    handle TEXT,
    date TEXT,
    text TEXT,
    url TEXT UNIQUE,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    search_query TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
''')

conn.commit()
conn.close()

print("Database initialized at:", db_path)
print("Ready to receive post data from browser")