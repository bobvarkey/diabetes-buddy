const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const CDP_URL = 'http://127.0.0.1:18800';
const REPORT_PATH = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-scrape-2026-05-22.md';
const DB_PATH = '/Users/bobvarkey/.openclaw/workspace/memory_x_posts.db';

const QUERIES = [
  {
    name: 'neurointervention-stroke',
    url: 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today',
  },
  {
    name: 'avm-aneurysm-endovascular',
    url: 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEngagementText(txt) {
  if (!txt) return 0;
  const t = txt.trim().replace(/,/g, '');
  const num = parseFloat(t);
  if (!isNaN(num)) return num;
  const match = t.match(/([0-9.]+)\s*([KM]?)/i);
  if (match) {
    let n = parseFloat(match[1]);
    const suffix = match[2].toUpperCase();
    if (suffix === 'K') n *= 1000;
    if (suffix === 'M') n *= 1000000;
    return n;
  }
  return 0;
}

async function extractPosts(page) {
  return await page.evaluate(() => {
    const parseBtn = (btn) => {
      if (!btn) return 0;
      const txt = btn.textContent.trim();
      const num = parseFloat(txt.replace(/,/g, ''));
      if (!isNaN(num)) return num;
      const m = txt.match(/([0-9.]+)\s*([KM]?)/i);
      if (m) {
        let n = parseFloat(m[1]);
        const s = m[2].toUpperCase();
        if (s === 'K') n *= 1000;
        if (s === 'M') n *= 1000000;
        return n;
      }
      return 0;
    };

    const posts = [];
    const articles = document.querySelectorAll('article');
    for (const article of articles) {
      let authorName = '';
      let authorHandle = '';
      let authorUrl = '';
      let date = '';
      let postUrl = '';
      let text = '';
      let replies = 0;
      let reposts = 0;
      let likes = 0;
      let bookmarks = 0;
      let views = 0;
      let image = '';

      const links = Array.from(article.querySelectorAll('a'));
      const authorALink = links.find((a) => {
        const spans = a.querySelectorAll('span');
        return Array.from(spans).some((s) => s.textContent.trim().startsWith('@'));
      });
      if (authorALink) {
        authorUrl = 'https://x.com' + authorALink.getAttribute('href');
        const spans = Array.from(authorALink.querySelectorAll('span'));
        for (const s of spans) {
          const st = s.textContent.trim();
          if (st.startsWith('@')) authorHandle = st;
          else if (!authorName && st) authorName = st;
        }
      }

      const timeLink = article.querySelector('a time');
      if (timeLink && timeLink.closest('a')) {
        const a = timeLink.closest('a');
        postUrl = 'https://x.com' + a.getAttribute('href');
        date = timeLink.textContent.trim();
      }

      const textDiv = article.querySelector('div[data-testid="tweetText"]');
      if (textDiv) {
        text = textDiv.textContent.trim().replace(/\s+/g, ' ');
      } else {
        const tweetDiv = article.querySelector('div[lang]');
        if (tweetDiv) text = tweetDiv.textContent.trim().replace(/\s+/g, ' ');
      }

      replies = parseBtn(article.querySelector('button[data-testid="reply"]'));
      reposts = parseBtn(article.querySelector('button[data-testid="retweet"]'));
      likes = parseBtn(article.querySelector('button[data-testid="like"]'));
      bookmarks = parseBtn(article.querySelector('button[data-testid="bookmark"]'));

      const viewLink = article.querySelector('a[href*="/analytics"]');
      if (viewLink) {
        const txt = viewLink.textContent.trim();
        const m = txt.match(/([0-9.]+)\s*([KM]?)/i);
        if (m) {
          let n = parseFloat(m[1]);
          const s = m[2].toUpperCase();
          if (s === 'K') n *= 1000;
          if (s === 'M') n *= 1000000;
          views = n;
        }
      }

      const img = article.querySelector('img[src*="pbs.twimg.com/media"]');
      if (img) image = img.getAttribute('src');

      if (text || authorHandle || postUrl) {
        posts.push({
          authorName,
          authorHandle,
          authorUrl,
          date,
          postUrl,
          text,
          replies,
          reposts,
          likes,
          bookmarks,
          views,
          image,
        });
      }
    }
    return posts;
  });
}

async function scrapeQuery(browserCtx, query) {
  const page = await browserCtx.newPage();
  try {
    await page.goto(query.url, { waitUntil: 'domcontentloaded', timeout: 120000 });
    await page.waitForSelector('article', { timeout: 120000 });
    await sleep(5000);

    let allPosts = [];
    let stallCount = 0;
    const maxStalls = 10;
    const seen = new Set();

    let scrollAttempts = 0;
    while (allPosts.length < 12 && stallCount < maxStalls && scrollAttempts < 25) {
      const posts = await extractPosts(page);
      let newAdded = 0;
      for (const p of posts) {
        if (p.postUrl && !seen.has(p.postUrl)) {
          seen.add(p.postUrl);
          allPosts.push(p);
          newAdded++;
        }
      }
      if (newAdded === 0) {
        stallCount++;
      } else {
        stallCount = 0;
      }
      if (allPosts.length >= 12) break;
      await page.evaluate(() => window.scrollBy(0, 2000));
      await sleep(4000);
      scrollAttempts++;
    }

    await page.close();
    return allPosts.slice(0, 12);
  } catch (err) {
    try { await page.close(); } catch (e) {}
    throw new Error(`Scrape failed for ${query.name}: ${err.message}`);
  }
}

async function saveToDb(posts, batchLabel) {
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const db = new sqlite3.Database(DB_PATH);

  // Ensure the expected table/columns exist (migrate existing schema if needed)
  await new Promise((resolve, reject) => {
    db.get(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='posts'`,
      (err, row) => {
        if (err) return reject(err);
        if (!row) {
          // Create the canonical table if it doesn't exist
          return db.run(
            `CREATE TABLE posts (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              url TEXT UNIQUE,
              author_name TEXT,
              handle TEXT,
              date TEXT,
              display_date TEXT,
              text TEXT,
              replies INTEGER,
              retweets INTEGER,
              likes INTEGER,
              bookmarks INTEGER,
              query TEXT,
              scraped_at TEXT
            )`,
            (e) => (e ? reject(e) : resolve())
          );
        }
        // If existing table is from a newer scrape script, it may have postUrl etc.
        const existing = row.sql || '';
        const hasUrl = /\burl\b/.test(existing);
        const hasPostUrl = /\bpostUrl\b/.test(existing);
        if (!hasUrl && !hasPostUrl) {
          return reject(new Error('posts table exists but has neither url nor postUrl column'));
        }
        resolve();
      }
    );
  });

  const scrapedAt = new Date().toISOString();

  // Detect schema shape by trying a harmless INSERT
  const testInsert = `INSERT OR IGNORE INTO posts
    (url, author_name, handle, date, display_date, text, replies, retweets, likes, bookmarks, query, scraped_at)
    VALUES ('__test__', '', '', '', '', '', 0, 0, 0, 0, '', '')`;
  const isLegacySchema = await new Promise((resolve) => {
    db.run(testInsert, function (err) {
      if (err) return resolve(false);
      resolve(true);
    });
  });

  if (isLegacySchema) {
    // Remove the placeholder test row
    await new Promise((resolve) => db.run(`DELETE FROM posts WHERE url='__test__'`, () => resolve()));
  }

  const insert = isLegacySchema
    ? db.prepare(`
        INSERT OR IGNORE INTO posts
        (url, author_name, handle, date, display_date, text, replies, retweets, likes, bookmarks, query, scraped_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
    : db.prepare(`
        INSERT OR IGNORE INTO posts
        (postUrl, authorName, authorHandle, authorUrl, date, text, replies, reposts, likes, bookmarks, views, image, queryName, scrapedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

  let inserted = 0;
  for (const p of posts) {
    await new Promise((resolve, reject) => {
      if (isLegacySchema) {
        insert.run(
          p.postUrl,
          p.authorName,
          p.authorHandle,
          p.date,
          p.date,
          p.text,
          p.replies,
          p.reposts,
          p.likes,
          p.bookmarks,
          batchLabel,
          scrapedAt,
          function (err) {
            if (err) reject(err);
            else {
              if (this.changes > 0) inserted++;
              resolve();
            }
          }
        );
      } else {
        insert.run(
          p.postUrl,
          batchLabel,
          p.authorName,
          p.authorHandle,
          p.authorUrl,
          p.date,
          p.text,
          p.replies,
          p.reposts,
          p.likes,
          p.bookmarks,
          p.views,
          p.image,
          scrapedAt,
          function (err) {
            if (err) reject(err);
            else {
              if (this.changes > 0) inserted++;
              resolve();
            }
          }
        );
      }
    });
  }
  insert.finalize();
  db.close();
  return inserted;
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0] || browser;
  const allPosts = [];
  let totalNew = 0;
  const startTime = new Date().toISOString();

  for (const q of QUERIES) {
    console.log(`\nScraping query: ${q.name}`);
    const posts = await scrapeQuery(context, q);
    for (const p of posts) p.queryName = q.name;
    const inserted = await saveToDb(posts, q.name);
    totalNew += inserted;
    allPosts.push(...posts);
    console.log(`  Found ${posts.length} posts, ${inserted} new to DB`);
  }

  const mdDir = path.dirname(REPORT_PATH);
  if (!fs.existsSync(mdDir)) fs.mkdirSync(mdDir, { recursive: true });

  let report = `\n---\n\n`;
  report += `# Neurointervention X/Twitter Scrape\n\n`;
  report += `- **Scraped at:** ${startTime}\n`;
  report += `- **Batch queries:** ${QUERIES.map((q) => q.name).join(', ')}\n`;
  report += `- **Total posts collected this run:** ${allPosts.length}\n`;
  report += `- **New posts saved to DB:** ${totalNew}\n\n`;

  for (const q of QUERIES) {
    const qPosts = allPosts.filter((p) => p.queryName === q.name);
    report += `## Query: ${q.name}\n\n`;
    report += `- **URL:** ${q.url}\n`;
    report += `- **Posts found:** ${qPosts.length}\n\n`;
    if (qPosts.length === 0) {
      report += 'No posts found.\n\n';
      continue;
    }
    qPosts.forEach((p, idx) => {
      report += `### ${idx + 1}. ${p.authorName || 'Unknown'} ${p.authorHandle || ''}\n\n`;
      report += `- **Author:** [${p.authorName || 'Unknown'} ${p.authorHandle || ''}](${p.authorUrl || '#'})\n`;
      report += `- **Date:** ${p.date || 'Unknown'}\n`;
      report += `- **URL:** ${p.postUrl || 'N/A'}\n`;
      report += `- **Text:** ${p.text || '(no text)'}\n`;
      report += `- **Engagement:** ${p.likes.toLocaleString()} likes, ${p.reposts.toLocaleString()} reposts, ${p.replies.toLocaleString()} replies, ${p.views.toLocaleString()} views, ${p.bookmarks.toLocaleString()} bookmarks\n`;
      if (p.image) report += `- **Image:** ${p.image}\n`;
      report += `\n`;
    });
  }

  const highEngagement = allPosts.filter((p) => p.likes > 50);
  report += `## Summary\n\n`;
  report += `- **Posts with >50 likes:** ${highEngagement.length}\n`;
  if (highEngagement.length > 0) {
    report += `- **High-engagement posts:**\n`;
    highEngagement.forEach((p) => {
      report += `  - ${p.authorHandle}: ${p.likes.toLocaleString()} likes — ${p.postUrl}\n`;
    });
  } else {
    report += `- No posts exceeded 50 likes in this scrape.\n`;
  }
  report += `\n`;

  fs.appendFileSync(REPORT_PATH, report, 'utf8');

  console.log(`\nTotal posts collected: ${allPosts.length}`);
  console.log(`New posts saved to DB: ${totalNew}`);
  console.log(`Posts >50 likes: ${highEngagement.length}`);
  console.log(`Report appended to: ${REPORT_PATH}`);

  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
