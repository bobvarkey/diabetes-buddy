const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CDP_URL = 'http://127.0.0.1:18800';
const TARGET_URL = 'https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today';
const OUT_DIR = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes';
const OUTPUT_PATH = path.join(OUT_DIR, `x-neurology-${new Date().toISOString().slice(0,10)}.md`);

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function extractPosts(page) {
  return await page.evaluate(() => {
    const posts = [];
    const articles = document.querySelectorAll('article');
    articles.forEach((article) => {
      const links = article.querySelectorAll('a');
      let authorName = '', authorHandle = '', authorUrl = '', date = '', postUrl = '', text = '';
      let engagement = { replies: 0, reposts: 0, likes: 0, views: 0, bookmarks: 0 };
      let image = '';

      const allALinks = Array.from(article.querySelectorAll('a'));
      const authorALink = allALinks.find((a) => {
        const spans = a.querySelectorAll('span');
        return Array.from(spans).some((s) => s.textContent.startsWith('@'));
      });
      if (authorALink) {
        authorUrl = 'https://x.com' + authorALink.getAttribute('href');
        const spans = Array.from(authorALink.querySelectorAll('span'));
        spans.forEach((s) => {
          if (s.textContent.startsWith('@')) authorHandle = s.textContent.trim();
          else if (!authorName && s.textContent.trim()) authorName = s.textContent.trim();
        });
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

      const parseBtn = (btn) => {
        if (!btn) return 0;
        const txt = btn.textContent.trim().replace(/,/g, '');
        const num = parseFloat(txt);
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

      const replyBtn = article.querySelector('button[data-testid="reply"]');
      const repostBtn = article.querySelector('button[data-testid="retweet"]');
      const likeBtn = article.querySelector('button[data-testid="like"]');
      const bookmarkBtn = article.querySelector('button[data-testid="bookmark"]');
      const viewLink = article.querySelector('a[href*="/analytics"]');

      engagement.replies = parseBtn(replyBtn);
      engagement.reposts = parseBtn(repostBtn);
      engagement.likes = parseBtn(likeBtn);
      engagement.bookmarks = parseBtn(bookmarkBtn);
      if (viewLink) {
        const txt = viewLink.textContent.trim().replace(/,/g, '');
        const m = txt.match(/([0-9.]+)\s*([KM]?)/i);
        if (m) {
          let n = parseFloat(m[1]);
          const s = m[2].toUpperCase();
          if (s === 'K') n *= 1000;
          if (s === 'M') n *= 1000000;
          engagement.views = n;
        }
      }

      const img = article.querySelector('img[src*="pbs.twimg.com/media"]');
      if (img) image = img.getAttribute('src');

      if (text || authorHandle || postUrl) {
        posts.push({ authorName, authorHandle, authorUrl, date, postUrl, text, engagement, image });
      }
    });
    return posts;
  });
}

async function main() {
  const browser = await chromium.connectOverCDP(CDP_URL);
  const context = browser.contexts()[0];
  let page = context.pages().find((p) => p.url().includes('q=neurology'));
  if (!page) {
    page = await context.newPage();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } else {
    await page.bringToFront();
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  await page.waitForSelector('article', { timeout: 30000 });
  await sleep(3000);

  let allPosts = [];
  let stallCount = 0;
  const maxStalls = 8;

  while (allPosts.length < 10 && stallCount < maxStalls) {
    const posts = await extractPosts(page);
    const seen = new Set(allPosts.map((p) => p.postUrl));
    let newAdded = 0;
    for (const p of posts) {
      if (p.postUrl && !seen.has(p.postUrl)) {
        allPosts.push(p);
        seen.add(p.postUrl);
        newAdded++;
      }
    }
    if (newAdded === 0) { stallCount++; } else { stallCount = 0; }
    if (allPosts.length >= 10) break;
    await page.evaluate(() => { window.scrollBy(0, 2500); });
    await sleep(3000);
  }

  const top10 = allPosts.slice(0, 10);

  const breakingKeywords = [
    'breaking', 'just published', 'new study', 'trial results', 'fda approves', 'fda approval',
    'announces', 'first', 'landmark', 'major', 'urgent', 'alert', 'breakthrough', 'emergency',
    'new guideline', 'guidelines', 'updated', 'approval', 'cleared'
  ];

  top10.forEach((p) => {
    p.flagged = false;
    p.flags = [];
    if (p.engagement.likes > 100) {
      p.flagged = true;
      p.flags.push(`>100 likes (${p.engagement.likes.toLocaleString()})`);
    }
    const lower = (p.text || '').toLowerCase();
    for (const kw of breakingKeywords) {
      if (lower.includes(kw)) {
        p.flagged = true;
        p.flags.push('breaking news keyword: ' + kw);
        break;
      }
    }
  });

  const dateStr = new Date().toISOString();
  let md = `# X/Twitter Neurology News Scrape\n\n`;
  md += `- **Source:** ${TARGET_URL}\n`;
  md += `- **Scraped at:** ${dateStr}\n`;
  md += `- **Query:** neurology OR #neurotwitter OR #NeuroX (Top, since:today)\n`;
  md += `- **Posts collected:** ${top10.length}\n\n`;
  md += `---\n\n`;

  if (top10.length === 0) {
    md += 'No posts found.\n';
  } else {
    top10.forEach((p, idx) => {
      md += `## ${idx + 1}. ${p.authorName || 'Unknown'} ${p.authorHandle || ''}\n\n`;
      md += `- **Author:** [${p.authorName || 'Unknown'} ${p.authorHandle || ''}](${p.authorUrl || '#'})\n`;
      md += `- **Date:** ${p.date || 'Unknown'}\n`;
      md += `- **URL:** ${p.postUrl || 'N/A'}\n`;
      md += `- **Text:** ${p.text || '(no text)'}\n`;
      md += `- **Engagement:** ${p.engagement.likes.toLocaleString()} likes, ${p.engagement.reposts.toLocaleString()} reposts, ${p.engagement.replies.toLocaleString()} replies, ${p.engagement.views.toLocaleString()} views, ${p.engagement.bookmarks.toLocaleString()} bookmarks\n`;
      if (p.image) md += `- **Image:** ${p.image}\n`;
      if (p.flagged) {
        md += `- **🚩 FLAGGED:** ${p.flags.join('; ')}\n`;
      }
      md += `\n`;
    });
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, md, 'utf8');

  const flagged = top10.filter((p) => p.flagged);
  console.log(`Saved ${top10.length} posts to ${OUTPUT_PATH}`);
  console.log(`Flagged posts: ${flagged.length}`);
  flagged.forEach((p) => {
    console.log(`- ${p.authorHandle}: ${p.flags.join('; ')}`);
  });

  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
