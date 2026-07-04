-- SQLite database for X/Twitter neurointervention posts
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT,
    handle TEXT,
    post_date TEXT,
    text_content TEXT,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    url TEXT,
    hashtags TEXT,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_query TEXT
);

CREATE INDEX IF NOT EXISTS idx_handle ON posts(handle);
CREATE INDEX IF NOT EXISTS idx_date ON posts(post_date);
CREATE INDEX IF NOT EXISTS idx_scraped_at ON posts(scraped_at);