#!/usr/bin/env python3
"""
X/Twitter Post Scraper Database Initialization
Creates SQLite database for storing scraped posts
"""

import sqlite3
from datetime import datetime
from pathlib import Path

# Database path
db_path = Path("/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db")

# Create database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create posts table
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
    views INTEGER DEFAULT 0,
    url TEXT,
    scraped_at TEXT,
    search_query TEXT,
    source TEXT DEFAULT 'x.com',
    UNIQUE(url, scraped_at)
)
''')

# Create index for faster queries
cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON posts(date)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_author ON posts(author)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_likes ON posts(likes)')

conn.commit()

print(f"Database created at: {db_path}")
print(f"Database size: {db_path.stat().st_size} bytes")

conn.close()