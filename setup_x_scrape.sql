-- Schema for memory_x_posts.db used by the X neurointervention scrape job
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  author TEXT,
  handle TEXT,
  post_date TEXT,
  text TEXT,
  likes INTEGER,
  reposts INTEGER,
  replies INTEGER,
  views INTEGER,
  url TEXT UNIQUE,
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_posts_query ON posts(query);
CREATE INDEX IF NOT EXISTS idx_posts_scraped_at ON posts(scraped_at);
