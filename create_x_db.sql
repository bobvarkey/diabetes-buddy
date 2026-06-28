-- Create table for X posts
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    handle TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    date TEXT,
    text TEXT,
    replies INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    views TEXT,
    search_query TEXT,
    scraped_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_date ON posts(date);
CREATE INDEX IF NOT EXISTS idx_posts_handle ON posts(handle);
CREATE INDEX IF NOT EXISTS idx_posts_likes ON posts(likes);