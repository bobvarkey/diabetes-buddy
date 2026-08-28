const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CDP_URL = 'http://127.0.0.1:18800';
const OUT_DIR = '/Users/bobvarkey/.openclaw/workspace';

const searches = [
  {
    label: 'neuro_search',
    url: 'https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today',
  },
  {
    label: 'neuro2',
    url: 'https://x.com/search?q=cerebral%20AVM%20OR%20intracranial%20aneurysm%20OR%20endovascular&src=typed_query&f=top&since:today',
  },
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function extractPosts(page) {
  return await page.evaluate(() => {
    const posts = [];
    document.querySelectorAll('article').forEach(article => {
      try {
        let handle = '';
        const avatar = article.querySelector('[data-testid="Tweet-User-Avatar"] [data-testid^="UserAvatar-Container-"]');
        if (avatar) {
          const m = avatar.getAttribute('data-testid').match(/UserAvatar-Container-(.+)/);
          if (m) handle = '@' + m[1];
        }
        let author = '';
        const links = Array.from(article.querySelectorAll('a[href^="/"]'));
        for (const a of links) {
          const t = a.textContent.trim();
          if (t && !t.startsWith('@') && !t.startsWith('#') && t !== 'Image' && !a.href.includes('/status/') && !a.href.includes('/hashtag/')) {
            author = t; break;
          }
        }
        let dateText = '';
        let postUrl = '';
        for (const a of links) {
          const href = a.getAttribute('href') || '';
          const t = a.textContent.trim();
          if (href.includes('/status/') && !href.includes('/analytics') && !href.includes('/photo')) {
            postUrl = 'https://x.com' + href.split('?')[0];
            dateText = t;
            break;
          }
        }
        let text = '';
        const tweetText = article.querySelector('[data-testid="tweetText"]');
        if (tweetText) text = tweetText.textContent.trim();
        const metrics = {};
        const metricNames = { reply: 'replies', like: 'likes', retweet: 'reposts', bookmark: 'bookmarks' };
        for (const [testid, key] of Object.entries(metricNames)) {
          const b = article.querySelector(`[data-testid="${testid}"]`);
          if (b) metrics[key] = b.textContent.trim();
        }
        const analytics = article.querySelector('a[href*="/analytics"]');
        if (analytics) metrics.views = analytics.textContent.trim();
        posts.push({ author, handle, dateText, text: text.slice(0, 2000), metrics, postUrl });
      } catch (e) {}
    });
    return posts;
  });
}

async function scrollAndCollect(page, maxScrolls = 5) {
  const all = [];
  for (let i = 0; i < maxScrolls; i++) {
    const posts = await extractPosts(page);
    for (const p of posts) {
      if (!all.some(x => x.postUrl === p.postUrl)) all.push(p);
    }
    const before = await page.evaluate(() => document.querySelectorAll('article').length);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(2000);
    const after = await page.evaluate(() => document.querySelectorAll('article').length);
    if (after <= before) break;
  }
  return all;
}

(async () => {
  const browser = await chromium.connectOverCDP(CDP_URL);
  try {
    const contexts = browser.contexts();
    const context = contexts[0] || await browser.newContext();
    const allResults = [];
    for (const { label, url } of searches) {
      console.log('Searching:', label);
      let page;
      // Try to reuse existing page with matching URL, otherwise open new
      const pages = context.pages();
      page = pages.find(p => p.url().includes(url.split('q=')[1].split('&')[0]));
      if (!page) {
        page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      } else {
        await page.bringToFront();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      }
      await sleep(4000);
      // Retry if error state
      let hasError = await page.evaluate(() => /Something went wrong/i.test(document.body.innerText));
      if (hasError) {
        const retryBtn = page.locator('button:has-text("Retry")');
        if (await retryBtn.count()) await retryBtn.click();
        await sleep(4000);
      }
      const posts = await scrollAndCollect(page, 5);
      for (const p of posts) {
        p.search_label = label;
        p.scraped_at = new Date().toISOString();
        allResults.push(p);
      }
      console.log('Found', posts.length, 'posts for', label);
    }
    const outPath = path.join(OUT_DIR, 'x_neuro_all_posts.json');
    fs.writeFileSync(outPath, JSON.stringify(allResults, null, 2));
    console.log('Saved', allResults.length, 'posts to', outPath);
  } finally {
    await browser.close();
  }
})();
