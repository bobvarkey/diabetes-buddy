const playwright = require('playwright');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db';
const REPORT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md';
const SCREENSHOT_DIR = '/Users/bobvarkey/.openclaw/workspace/x-screenshots';
const TODAY = new Date().toISOString().split('T')[0];

const QUERIES = [
  'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today',
  'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function ensureDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id TEXT UNIQUE,
      author_name TEXT,
      handle TEXT,
      post_date TEXT,
      text TEXT,
      likes INTEGER,
      replies INTEGER,
      reposts INTEGER,
      bookmarks INTEGER,
      views INTEGER,
      url TEXT,
      query_group TEXT,
      scraped_at TEXT
    )
  `);
  db.close();
}

async function scrapePage(page, url, groupLabel) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await sleep(4000);
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await sleep(2000);
  }
  await sleep(3000);

  const screenshotPath = path.join(SCREENSHOT_DIR, `x-${groupLabel}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const posts = await page.evaluate(() => {
    const results = [];
    const articles = document.querySelectorAll('article[data-testid="tweet"]');
    articles.forEach(article => {
      try {
        const links = article.querySelectorAll('a[href*="/status/"]');
        let statusLink = '';
        let postId = '';
        for (const a of links) {
          const m = a.getAttribute('href').match(/\/status\/(\d+)/);
          if (m) { statusLink = 'https://x.com' + a.getAttribute('href'); postId = m[1]; break; }
        }
        if (!postId) return;

        const userLink = article.querySelector('a[href^="/"]');
        const handle = userLink ? userLink.getAttribute('href').replace(/^\//, '').split('/')[0] : '';

        const nameEl = article.querySelector('[data-testid="User-Name"]');
        const author = nameEl ? nameEl.innerText.split('\n')[0].trim() : '';

        const timeEl = article.querySelector('time');
        const date = timeEl ? timeEl.getAttribute('datetime') : '';

        const textEl = article.querySelector('[data-testid="tweetText"]');
        const text = textEl ? textEl.innerText : '';

        const getMetric = (label) => {
          const el = article.querySelector(`[data-testid="${label}"]`);
          if (!el) return 0;
          const txt = el.innerText || '';
          const num = txt.replace(/[^0-9.]/g, '');
          if (!num) return 0;
          const mult = /K/i.test(txt) ? 1000 : /M/i.test(txt) ? 1000000 : 1;
          return Math.round(parseFloat(num) * mult);
        };

        results.push({
          post_id: postId,
          author_name: author,
          handle: handle,
          post_date: date,
          text: text,
          likes: getMetric('like'),
          replies: getMetric('reply'),
          reposts: getMetric('retweet'),
          bookmarks: 0,
          views: 0,
          url: statusLink
        });
      } catch (e) {}
    });
    return results;
  });

  return { posts, screenshotPath };
}

async function saveToDb(posts, groupLabel) {
  const db = new sqlite3.Database(DB_PATH);
  const insert = db.prepare(`
    INSERT OR IGNORE INTO posts
    (post_id, author_name, handle, post_date, text, likes, replies, reposts, bookmarks, views, url, query_group, scraped_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const now = new Date().toISOString();
  let added = 0;
  for (const p of posts) {
    insert.run(
      p.post_id, p.author_name, p.handle, p.post_date, p.text,
      p.likes, p.replies, p.reposts, p.bookmarks, p.views, p.url, groupLabel, now,
      function(err) { if (!err && this.changes) added++; }
    );
  }
  insert.finalize();
  await new Promise(resolve => db.close(resolve));
  return added;
}

function appendReport(allPosts, groupLabel, added) {
  const timestamp = new Date().toISOString();
  const lines = [
    `## X Scrape — ${groupLabel} — ${timestamp}`,
    `Query: ${QUERIES[groupLabel === 'query1' ? 0 : 1]}`,
    `New posts inserted: ${added}`,
    `Total posts collected this run: ${allPosts.length}`,
    '',
    '| Author | Handle | Date | Likes | Reposts | Replies | URL | Text |',
    '| --- | --- | --- | --- | --- | --- | --- | --- |'
  ];
  for (const p of allPosts) {
    const textSnippet = (p.text || '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 120);
    lines.push(`| ${p.author_name || ''} | @${p.handle || ''} | ${p.post_date || ''} | ${p.likes || 0} | ${p.reposts || 0} | ${p.replies || 0} | ${p.url || ''} | ${textSnippet} |`);
  }
  lines.push('', '---', '');
  fs.appendFileSync(REPORT_PATH, lines.join('\n') + '\n');
}

async function main() {
  ensureDb();
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

  const browser = await playwright.chromium.launchPersistentContext('/Users/bobvarkey/Library/Application Support/Google/Chrome/openclaw', {
    headless: true,
    viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await browser.newPage();

  let totalAdded = 0;
  let allPosts = [];
  let highEngagement = [];
  for (let i = 0; i < QUERIES.length; i++) {
    const groupLabel = `query${i + 1}`;
    const { posts, screenshotPath } = await scrapePage(page, QUERIES[i], groupLabel);
    const added = await saveToDb(posts, groupLabel);
    totalAdded += added;
    allPosts = allPosts.concat(posts);
    appendReport(posts, groupLabel, added);
    console.log(`Group ${groupLabel}: ${posts.length} posts, ${added} new, screenshot: ${screenshotPath}`);
  }

  highEngagement = allPosts.filter(p => p.likes > 50);

  await browser.close();
  console.log('TOTAL_ADDED=' + totalAdded);
  console.log('TOTAL_POSTS=' + allPosts.length);
  console.log('HIGH_ENGAGEMENT=' + highEngagement.length);
  if (highEngagement.length) {
    console.log('HIGH_ENGAGEMENT_POSTS=' + JSON.stringify(highEngagement));
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
