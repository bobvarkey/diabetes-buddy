-- Create table for X posts
CREATE TABLE IF NOT EXISTS x_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author TEXT NOT NULL,
    handle TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    reposts INTEGER DEFAULT 0,
    replies INTEGER DEFAULT 0,
    url TEXT NOT NULL UNIQUE,
    search_term TEXT NOT NULL,
    scraped_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_date ON x_posts(date);
CREATE INDEX IF NOT EXISTS idx_likes ON x_posts(likes);
CREATE INDEX IF NOT EXISTS idx_search_term ON x_posts(search_term);