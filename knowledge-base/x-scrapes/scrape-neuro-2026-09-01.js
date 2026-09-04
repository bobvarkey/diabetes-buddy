const { chromium } = require('playwright');
const fs = require('fs');

const SEARCH_URL = 'https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today';
const OUT = '/Users/bobvarkey/.openclaw/workspace/knowledge-base/x-scrapes/x-neurology-2026-09-01.md';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const parseBtn = (btn) => {
  if (!btn) return 0;
  const txt = (btn.textContent || '').trim().replace(/,/g, '');
  const m = txt.match(/^([0-9.]+)\s*([KM]?)$/i);
  if (m) { let v = parseFloat(m[1]); const s = m[2].toUpperCase();
           if (s==='K') v*=1000; if (s==='M') v*=1e6; return Math.round(v); }
  const n = parseFloat(txt);
  if (!isNaN(n)) return Math.round(n);
  return 0;
};

async function extractPosts(page) {
  return page.evaluate(() => {
    const posts = [];
    const articles = document.querySelectorAll('article');
    for (const art of articles) {
      try {
        // URL + handle
        const authorA = art.querySelector('a[href*="/"]');
        let handle = '', display = '', postUrl = '', tsText = '';
        const timeA = art.querySelector('a[aria-label*="time"]') || art.querySelector('time');
        const timeNode = art.querySelector('time');
        if (timeNode) {
          tsText = (timeNode.getAttribute('datetime') || '').trim();
          const ta = timeNode.closest('a');
          if (ta) { postUrl = 'https://x.com' + (ta.getAttribute('href') || ''); }
        }
        // author handle from any span starting with @
        const spans = art.querySelectorAll('span');
        for (const s of spans) {
          const t = (s.textContent || '').trim();
          if (t.startsWith('@')) { handle = t; break; }
        }
        // display name
        const disp = art.querySelector('div[dir="ltr"] > span');
        // text
        const textEl = art.querySelector('div[data-testid="tweetText"]');
        const text = textEl ? textEl.innerText.trim() : '';

        const replyB = art.querySelector('button[data-testid="reply"]');
        const retweetB = art.querySelector('button[data-testid="retweet"]');
        const likeB = art.querySelector('button[data-testid="like"]');
        const bookmarkB = art.querySelector('button[data-testid="bookmark"]');
        const viewA = art.querySelector('a[href*="/analytics"]');

        posts.push({
          handle,
          display: disp ? disp.textContent.trim() : '',
          postUrl,
          tsText,
          text,
          replies: parseBtn(replyB),
          retweets: parseBtn(retweetB),
          likes: parseBtn(likeB),
          bookmarks: parseBtn(bookmarkB),
          views: viewA ? (viewA.textContent || '').trim() : ''
        });
      } catch (e) {}
    }
    return posts;
  });
}

(async () => {
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
    const context = browser.contexts()[0];
    let page = context.pages().find(p => p.url().includes('q=neurology'));
    if (!page) {
      page = await context.newPage();
      await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
    } else {
      await page.bringToFront();
      await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded' });
    }

    // Retry loop for X's transient "Something went wrong"
    let collected = [];
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await page.waitForSelector('article', { timeout: 30000 });
      } catch (e) {}
      await sleep(3000);
      // check for reloading state
      const bodyText = await page.evaluate(() => document.body ? document.body.innerText.slice(0, 2000) : '');
      if (bodyText.includes('Something went wrong') || bodyText.includes('Try reloading')) {
        const retry = page.locator('text=Retry').first();
        if (await retry.count()) { await retry.click().catch(()=>{}); }
        await sleep(4000);
        continue;
      }
      // scroll and collect
      for (let i = 0; i < 8; i++) {
        const posts = await extractPosts(page);
        const seen = new Set(all_urls(collected));
        for (const p of posts) {
          if (!seen.has(p.postUrl)) collected.push(p);
          seen.add(p.postUrl);
        }
        if (collected.length >= 12) break;
        await page.evaluate(() => window.scrollBy(0, 2500));
        await sleep(2500);
      }
      if (collected.length >= 5) break;
      await sleep(5000);
    }

    function all_urls(arr) { return arr.map(p => p.postUrl).filter(Boolean); }

    // dedupe by postUrl
    const uniq = [];
    const seenSet = new Set();
    for (const p of collected) {
      if (!p.postUrl) continue;
      if (!seenSet.has(p.postUrl)) { seenSet.add(p.postUrl); uniq.push(p); }
      if (uniq.length >= 10) break;
    }

    // Build markdown
    const today = '2026-09-01';
    let md = `# X/News Neurology Scrape - ${today}\n`;
    md += `\n> Source: CDP-connected logged-in Chrome (real engagement data)\n`;
    md += `> Query: \`neurology OR #neurotwitter OR #NeuroX\` (f=top, since:today)\n`;
    md += `> Top ${uniq.length} posts extracted\n\n`;
    md += `## Posts Found (${uniq.length})\n\n`;

    const flagged = [];
    uniq.forEach((p, i) => {
      const handle = (p.handle && p.handle.startsWith('@')) ? p.handle : '@' + p.handle;
      const likes = p.likes || 0;
      const ts = p.tsText ? ` | ${p.tsText}` : '';
      md += `### ${i+1}. ${p.text.slice(0, 140)}${p.text.length>140?'...':''}\n`;
      md += `- **Author:** ${p.display} ${handle}\n`;
      md += `- **Likes:** ${p.likes} | **Retweets:** ${p.retweets} | **Replies:** ${p.replies} | **Views:** ${p.views}${ts}\n`;
      md += `- **URL:** ${p.postUrl}\n\n`;
      if (likes > 100) flagged.push({ ...p, handle });
    });
    md += `## Flagged Items (>100 likes)\n\n`;
    if (flagged.length === 0) { md += `_None flagged._\n`; }
    else { flagged.forEach((f, i) => {
      md += `${i+1}. **${f.likes} likes** — ${f.handle}: ${f.text.slice(0,120)}... (${f.postUrl})\n`;
    }); }

    fs.writeFileSync(OUT, md);
    console.log(JSON.stringify({ saved: OUT, count: uniq.length, flagged: flagged.length, posts: uniq }, null, 2));
  } finally {
    if (browser) { await browser.close().catch(()=>{}); }
  }
})();
