#!/bin/bash
set -e

# Create directories if needed
mkdir -p /Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes

# SQLite database setup
DB="/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db"

# Create table if not exists
sqlite3 "$DB" "CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT,
  handle TEXT,
  datetime TEXT,
  text TEXT,
  url TEXT UNIQUE,
  replies INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
  search_query TEXT
);"

# Function to extract posts from current page
extract_posts() {
  local query="$1"
  openclaw browser evaluate --fn "
const posts = [];
const articles = document.querySelectorAll('article');

articles.forEach(article => {
  try {
    const authorEl = article.querySelector('[data-testid=\"User-Name\"] span');
    const author = authorEl ? authorEl.textContent : '';
    
    const handleLink = article.querySelector('a[href^=\"/\"].css-175oi2r');
    const handle = handleLink ? handleLink.href.split('/').filter(s => s).pop().split('?')[0] : '';
    
    const timeEl = article.querySelector('time');
    const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
    
    const textEl = article.querySelector('[data-testid=\"tweetText\"]');
    const text = textEl ? textEl.textContent : '';
    
    const statusLink = article.querySelector('a[href*=\"/status/\"]');
    const url = statusLink ? statusLink.href : '';
    
    const metrics = { replies: 0, reposts: 0, likes: 0, views: 0 };
    
    const replyBtn = article.querySelector('[data-testid=\"reply\"]');
    if (replyBtn) {
      const aria = replyBtn.getAttribute('aria-label') || '';
      const match = aria.match(/(\d+)/);
      if (match) metrics.replies = parseInt(match[1]);
    }
    
    const repostBtn = article.querySelector('[data-testid=\"retweet\"], [data-testid=\"unretweet\"]');
    if (repostBtn) {
      const aria = repostBtn.getAttribute('aria-label') || '';
      const match = aria.match(/(\d+)/);
      if (match) metrics.reposts = parseInt(match[1]);
    }
    
    const likeBtn = article.querySelector('[data-testid=\"like\"], [data-testid=\"unlike\"]');
    if (likeBtn) {
      const aria = likeBtn.getAttribute('aria-label') || '';
      const match = aria.match(/(\d+)/);
      if (match) metrics.likes = parseInt(match[1]);
    }
    
    const viewsEl = article.querySelector('[data-testid=\"views\"] span');
    if (viewsEl) {
      const t = viewsEl.textContent || '';
      const n = parseFloat(t.replace(/[^0-9.K]/g, ''));
      if (t.includes('K')) metrics.views = Math.round(n * 1000);
      else metrics.views = Math.round(n);
    }
    
    if (author && text && url) {
      posts.push({ author, handle, datetime, text, url, metrics, query: '$query' });
    }
  } catch (e) {}
});

JSON.stringify(posts);
"
}

# Function to insert posts into database
insert_posts() {
  local posts_json="$1"
  local query="$2"
  
  echo "$posts_json" | jq -c '.[]' 2>/dev/null | while read -r post; do
    author=$(echo "$post" | jq -r '.author' | sed "s/'/''/g")
    handle=$(echo "$post" | jq -r '.handle' | sed "s/'/''/g")
    datetime=$(echo "$post" | jq -r '.datetime')
    text=$(echo "$post" | jq -r '.text' | sed "s/'/''/g")
    url=$(echo "$post" | jq -r '.url')
    replies=$(echo "$post" | jq -r '.metrics.replies // 0')
    reposts=$(echo "$post" | jq -r '.metrics.reposts // 0')
    likes=$(echo "$post" | jq -r '.metrics.likes // 0')
    views=$(echo "$post" | jq -r '.metrics.views // 0')
    
    sqlite3 "$DB" "INSERT OR IGNORE INTO posts (author, handle, datetime, text, url, replies, reposts, likes, views, search_query) VALUES ('$author', '$handle', '$datetime', '$text', '$url', $replies, $reposts, $likes, $views, '$query');" 2>/dev/null || true
  done
}

# Scrape first search query
echo "Scraping neurointervention/thrombectomy posts..."
openclaw browser navigate 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today'
openclaw browser wait --time 3000

POSTS=$(extract_posts "neurointervention")
echo "$POSTS" | jq '.' > /tmp/posts1.json
insert_posts "$POSTS" "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"

# Scroll to load more
for i in {1..3}; do
  openclaw browser press End
  openclaw browser wait --time 2000
  POSTS=$(extract_posts "neurointervention")
  insert_posts "$POSTS" "neurointervention OR thrombectomy OR #Neurointervention OR #stroke"
done

# Scrape second search query
echo "Scraping cerebral AVM/aneurysm posts..."
openclaw browser navigate 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today'
openclaw browser wait --time 3000

POSTS=$(extract_posts "avm")
echo "$POSTS" | jq '.' > /tmp/posts2.json
insert_posts "$POSTS" "cerebral AVM OR intracranial aneurysm OR endovascular"

# Scroll to load more
for i in {1..3}; do
  openclaw browser press End
  openclaw browser wait --time 2000
  POSTS=$(extract_posts "avm")
  insert_posts "$POSTS" "cerebral AVM OR intracranial aneurysm OR endovascular"
done

# Generate report
echo "Generating report..."
TODAY=$(date +%Y-%m-%d)
REPORT="/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-$TODAY.md"

COUNT=$(sqlite3 "$DB" "SELECT COUNT(*) FROM posts WHERE date(scraped_at) = date('now');")
HIGH_ENGAGEMENT=$(sqlite3 "$DB" "SELECT COUNT(*) FROM posts WHERE likes >= 50 AND date(scraped_at) = date('now');")

cat > "$REPORT" << EOF
# X/Twitter Neurointervention Scrape Report - $TODAY

**Scrape Time:** $(date)

## Summary

- **Total posts collected today:** $COUNT
- **High-engagement posts (≥50 likes):** $HIGH_ENGAGEMENT

## Search Queries

1. neurointervention OR thrombectomy OR #Neurointervention OR #stroke
2. cerebral AVM OR intracranial aneurysm OR endovascular

---

EOF

# Add posts to report
sqlite3 "$DB" "SELECT '## ' || author || ' (@' || handle || ')', '', '**Date:** ' || datetime, '**URL:** ' || url, '**Engagement:** ' || likes || ' likes, ' || reposts || ' reposts, ' || views || ' views', '', text FROM posts WHERE date(scraped_at) = date('now') ORDER BY likes DESC;" -separator $'\n' >> "$REPORT"

# Add high-engagement section
if [ "$HIGH_ENGAGEMENT" -gt 0 ]; then
  echo "" >> "$REPORT"
  echo "---" >> "$REPORT"
  echo "" >> "$REPORT"
  echo "## High-Engagement Posts (≥50 Likes)" >> "$REPORT"
  echo "" >> "$REPORT"
  sqlite3 "$DB" "SELECT '- **' || author || '**: ' || text || ' (' || likes || ' likes)' FROM posts WHERE likes >= 50 AND date(scraped_at) = date('now') ORDER BY likes DESC;" >> "$REPORT"
fi

echo "Report saved to: $REPORT"
echo "Total posts: $COUNT"
echo "High engagement: $HIGH_ENGAGEMENT"