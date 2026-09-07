const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const dbPath = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db';
const postsPath = '/Users/bobvarkey/.openclaw/workspace/posts-merged-2026-09-05.json';
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));
const db = new sqlite3.Database(dbPath);
db.serialize(() => {
  // ensure columns for new fields exist
  db.run(`ALTER TABLE posts ADD COLUMN tweet_datetime TEXT`, (err) => {});
  db.run(`ALTER TABLE posts ADD COLUMN profile_url TEXT`, (err) => {});
  db.run(`CREATE INDEX IF NOT EXISTS idx_posts_scraped_at ON posts(scraped_at)`);
  const stmt = db.prepare(`INSERT OR IGNORE INTO posts
    (url, author_name, handle, date, display_date, text, replies, retweets, likes, bookmarks, views, query, scraped_at, tweet_datetime, profile_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const now = new Date().toISOString();
  let pending = posts.length;
  let inserted = 0;
  for (const p of posts) {
    stmt.run(
      p.tweetUrl || '', p.author || '', p.handle || '', p.date || '', p.datetime || '',
      p.text || '', p.replies || 0, p.reposts || 0, p.likes || 0, p.bookmarks || 0, p.views || 0,
      'neurointervention-stroke-avm-aneurysm-endovascular', now, p.datetime || '', p.profileUrl || '',
      function(err) {
        pending--;
        if (err) { console.error('insert error', err.message); }
        else if (this.changes > 0) inserted++;
        if (pending === 0) {
          stmt.finalize((err) => {
            db.get(`SELECT COUNT(*) as total FROM posts`, (err, row) => {
              db.get(`SELECT COUNT(*) as recent FROM posts WHERE scraped_at > datetime('now', '-1 hour')`, (err2, row2) => {
                console.log(JSON.stringify({ inserted, total: row ? row.total : null, recent: row2 ? row2.recent : null }));
                db.close();
              });
            });
          });
        }
      }
    );
  }
  if (posts.length === 0) {
    stmt.finalize();
    db.close();
    console.log(JSON.stringify({ inserted:0, total:0, recent:0 }));
  }
});
