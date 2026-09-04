const { chromium } = require('playwright');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const CDP_URL = 'http://127.0.0.1:9222';
const DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db';
const MD_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md';
const DATE = '2026-08-31';

const SEARCH_URLS = [
  { label: 'neurointervention-stroke', url: 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today' },
  { label: 'avm-aneurysm-endovascular', url: 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today' }
];

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function parseMetric(s) {
  if (!s) return 0;
  const t = String(s).trim().replace(/,/g, '');
  const m = t.match(/^([0-9.]+)\s*([KM]?)\s*/i);
  if (!m) return parseFloat(t) || 0;
  let v = parseFloat(m[1]);
  const u = m[2].toUpperCase();
  if (u === 'K') v *= 1000;
  if (u === 'M') v *= 1e6;
  return Math.round(v);
}

async function extractPosts(page) {
  return page.evaluate(() => {
    const posts = [];
    const articles = document.querySelectorAll('article');
    for (const a of articles) {
      try {
        let handle = '', name = '';
        const userName = a.querySelector('[data-testid="User-Name"]');
        if (userName) {
          const spans = userName.querySelectorAll('span');
          for (const s of spans) {
            const t = s.textContent.trim();
            if (t.startsWith('@') && t.length < 40) { handle = t; }
            else if (!name && !t.startsWith('@') && t.length > 0) { name = t; }
          }
        }
        let postUrl = '', timeText = '';
        const statusLink = a.querySelector('a[href*="/status/"]');
        if (statusLink) {
          postUrl = 'https://x.com' + statusLink.getAttribute('href').split('?')[0];
          const t = statusLink.querySelector('time');
          if (t) timeText = t.getAttribute('datetime') || t.textContent.trim();
        }
        let text = '';
        const tweetText = a.querySelector('[data-testid="tweetText"]');
        if (tweetText) text = tweetText.innerText.trim();
        else {
          const langDiv = a.querySelector('div[lang]');
          if (langDiv) text = langDiv.innerText.trim();
        }
        const reply = a.querySelector('[data-testid="reply"]');
        const retweet = a.querySelector('[data-testid="retweet"]');
        const like = a.querySelector('[data-testid="like"]');
        const bookmark = a.querySelector('[data-testid="bookmark"]');
        const analytics = a.querySelector('[data-testid="analyticsButton"]');
        posts.push({
          handle, name, postUrl, timeText, text,
          replies: reply ? reply.textContent.trim() : '',
          retweets: retweet ? retweet.textContent.trim() : '',
          likes: like ? like.textContent.trim() : '',
          bookmarks: bookmark ? bookmark.textContent.trim() : '',
          views: analytics ? analytics.textContent.trim() : ''
        });
      } catch (e) {}
    }
    return posts;
  });
}

async function scrapeSearch(browser, query) {
  const context = browser.contexts()[0];
  const page = await context.newPage();
  let loaded = false;
  let loginWall = false;
  for (let attempt = 0; attempt < 4 && !loaded; attempt++) {
    await page.goto(query.url, { waitUntil: 'domcontentloaded', timeout: 90000 }).catch(e => console.log('goto warn:', e.message));
    await sleep(4000);
    const state = await page.evaluate(() => ({
      url: window.location.href,
      hasArticle: !!document.querySelector('article'),
      isLogin: window.location.href.includes('login') || window.location.href.includes('onboarding'),
      bodyText: document.body ? document.body.innerText.slice(0, 400) : ''
    }));
    console.log(`[${query.label}] attempt ${attempt+1}: url=${state.url.slice(0,70)} hasArticle=${state.hasArticle} isLogin=${state.isLogin}`);
    if (state.isLogin) { loginWall = true; break; }
    if (state.hasArticle) { loaded = true; break; }
    if (state.bodyText.includes('Try reloading') || state.bodyText.includes('Retry')) {
      await page.locator('button:has-text("Retry")').first().click({ timeout: 2000 }).catch(()=>{});
      await sleep(3000);
    }
    await sleep(5000);
  }
  if (!loaded) {
    const shot = `/tmp/x-${query.label}-fail.png`;
    await page.screenshot({ path: shot }).catch(()=>{});
    await page.close();
    return { posts: [], loginWall };
  }
  await sleep(3000);
  const seen = new Set();
  const all = [];
  let emptyRounds = 0;
  while (all.length < 12 && emptyRounds < 4) {
    const posts = await extractPosts(page);
    let added = 0;
    for (const p of posts) {
      if (p.postUrl && !seen.has(p.postUrl)) {
        seen.add(p.postUrl);
        all.push({ ...p, query_label: query.label });
        added++;
      }
    }
    console.log(`[${query.label}] round: added ${added}, total ${all.length}`);
    if (added === 0) emptyRounds++; else emptyRounds = 0;
    if (all.length >= 12) break;
    await page.evaluate(() => window.scrollBy(0, 2000));
    await sleep(2500);
  }
  await page.close();
  return { posts: all, loginWall: false };
}

function initDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS x_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT,
      handle TEXT,
      date TEXT,
      text TEXT,
      replies INTEGER DEFAULT 0,
      reposts INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      bookmarks INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      url TEXT UNIQUE,
      search_query TEXT,
      scrape_date TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      search_url TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_url ON x_posts(url);
    CREATE INDEX IF NOT EXISTS idx_scrape_date ON x_posts(scrape_date);
  `);
  return db;
}

async function savePosts(db, posts) {
  const insert = db.prepare(`
    INSERT INTO x_posts (url, author, handle, date, text, replies, reposts, likes, bookmarks, views, search_query, search_url, scrape_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(url) DO UPDATE SET
      author=excluded.author,
      handle=excluded.handle,
      date=excluded.date,
      text=excluded.text,
      replies=excluded.replies,
      reposts=excluded.reposts,
      likes=excluded.likes,
      bookmarks=excluded.bookmarks,
      views=excluded.views,
      search_query=excluded.search_query,
      search_url=excluded.search_url,
      scrape_date=excluded.scrape_date
  `);
  let inserted = 0, updated = 0;
  for (const p of posts) {
    const info = insert.run(
      p.postUrl,
      p.name,
      p.handle,
      p.timeText,
      p.text,
      parseMetric(p.replies),
      parseMetric(p.retweets),
      parseMetric(p.likes),
      parseMetric(p.bookmarks),
      parseMetric(p.views),
      p.query_label,
      SEARCH_URLS.find(q => q.label === p.query_label)?.url || '',
      DATE
    );
    if (info.changes) {
      if (info.lastID && info.lastID > 0) inserted++;
      else updated++;
    }
  }
  insert.finalize();
  return { inserted, updated };
}

async function main() {
  let browser;
  try {
    browser = await chromium.connectOverCDP(CDP_URL);
  } catch (e) {
    console.error('CDP connect failed:', e.message);
    process.exit(2);
  }

  const allPosts = [];
  let loginBlocked = false;
  for (const q of SEARCH_URLS) {
    const { posts, loginWall } = await scrapeSearch(browser, q);
    if (loginWall) loginBlocked = true;
    allPosts.push(...posts);
    await sleep(2000);
  }

  const byUrl = new Map();
  for (const p of allPosts) byUrl.set(p.postUrl, p);
  const uniquePosts = Array.from(byUrl.values());

  const db = initDb();
  const { inserted, updated } = await savePosts(db, uniquePosts);

  const todayCount = await new Promise((resolve, reject) => {
    db.get("SELECT COUNT(*) AS c FROM x_posts WHERE scrape_date=?", [DATE], (err, row) => {
      if (err) reject(err); else resolve(row.c);
    });
  });
  db.close();

  const highEngagement = uniquePosts.filter(p => parseMetric(p.likes) > 50).sort((a, b) => parseMetric(b.likes) - parseMetric(a.likes));

  const lines = [];
  lines.push('');
  lines.push(`## Scrape run — ${DATE} (reference UTC 2026-08-31 12:32)`);
  lines.push('');
  lines.push(`- Queries: neurointervention/thrombectomy/#Neurointervention/#stroke; cerebral AVM/intracranial aneurysm/endovascular`);
  if (loginBlocked) {
    lines.push(`- **Status:** X login wall encountered. No posts extracted.`);
  } else {
    lines.push(`- Unique posts extracted: ${uniquePosts.length}`);
    lines.push(`- DB rows inserted/updated today: ${inserted} new, ${updated} updated (total today: ${todayCount})`);
    lines.push(`- High-engagement posts (>50 likes): ${highEngagement.length}`);
  }
  lines.push('');

  if (highEngagement.length) {
    lines.push('### High-engagement posts');
    lines.push('');
    highEngagement.forEach(p => {
      lines.push(`- **@${p.handle.replace(/^@/, '')}** (${p.name}) — ❤️ ${p.likes} · 🔄 ${p.retweets} · 💬 ${p.replies}`);
      lines.push(`  ${p.postUrl}`);
      lines.push(`  > ${p.text.slice(0, 240).replace(/\n/g, ' ')}${p.text.length > 240 ? '…' : ''}`);
      lines.push('');
    });
  }

  if (!uniquePosts.length && !loginBlocked) {
    lines.push('_No posts extracted. X markup may have changed or search returned empty._');
    lines.push('');
  }

  fs.mkdirSync(path.dirname(MD_PATH), { recursive: true });
  fs.appendFileSync(MD_PATH, lines.join('\n'), 'utf8');

  console.log(`WROTE summary to ${MD_PATH}`);
  console.log(`DB: ${inserted} inserted, ${updated} updated, ${todayCount} rows today`);
  console.log(`High engagement (>50 likes): ${highEngagement.length}`);
  console.log(`Login blocked: ${loginBlocked}`);
  uniquePosts.forEach((p, i) => {
    console.log(`${i+1}. ${p.handle} | likes=${p.likes} | ${p.text.slice(0, 80)}`);
  });

  await browser.close();
}

main().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
