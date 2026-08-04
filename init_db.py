#!/usr/bin/env python3
import sqlite3

# Initialize database with correct schema
db_path = "/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Drop old table and recreate
cursor.execute('DROP TABLE IF EXISTS x_posts')

# Create table with correct columns
cursor.execute('''
CREATE TABLE x_posts (
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

print("Database schema updated successfully")