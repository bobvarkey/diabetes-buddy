const { chromium } = require('playwright');

const SEARCH_URL = 'https://x.com/search?q=neurology%20OR%20%23neurotwitter%20OR%20%23NeuroX&src=typed_query&f=top&since:today';
const OUT = process.argv[2] || '/tmp/x-neurology-out.md';
const DATE = '2026-08-30';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const parseBtn = (btn) => {
  if (!btn) return 0;
  const txt = btn.textContent.trim().replace(/,/g, '');
  const m = txt.match(/^([0-9.]+)\s*([KM]?)$/i);
  if (m) { let v = parseFloat(m[1]); const s = m[2].toUpperCase();
           if (s==='K') v*=1000; if (s==='M') v*=1e6; return v; }
  const n = parseFloat(txt);
  if (!isNaN(n)) return n;
  return 0;
};

async function extractPosts(page) {
  return page.evaluate(() => {
    const posts = [];
    const articles = document.querySelectorAll('article');
    articles.forEach((a) => {
      try {
        let handle = '', name = '', profileUrl = '';
        const authorLink = a.querySelector('a[href^="/"]');
        const spans = a.querySelectorAll('span');
        for (const s of spans) {
          const t = s.textContent.trim();
          if (t.startsWith('@') && t.length < 40) { handle = t; break; }
        }
        if (authorLink) {
          profileUrl = 'https://x.com' + authorLink.getAttribute('href');
          const firstSpan = authorLink.querySelector('span');
          if (firstSpan) name = firstSpan.textContent.trim();
        }
        let postUrl = '', timeText = '';
        const timeLink = a.querySelector('a[href*="/status/"]');
        if (timeLink) {
          postUrl = 'https://x.com' + timeLink.getAttribute('href');
          const t = timeLink.querySelector('time');
          if (t) timeText = t.getAttribute('datetime') || t.textContent.trim();
        }
        let text = '';
        const tweetText = a.querySelector('div[data-testid="tweetText"]');
        if (tweetText) text = tweetText.textContent.trim();
        else {
          const langDiv = a.querySelector('div[lang]');
          if (langDiv) text = langDiv.textContent.trim();
        }
        const reply = a.querySelector('button[data-testid="reply"]');
        const retweet = a.querySelector('button[data-testid="retweet"]');
        const like = a.querySelector('button[data-testid="like"]');
        const bookmark = a.querySelector('button[data-testid="bookmark"]');
        const views = a.querySelector('a[href*="/analytics"]');
        posts.push({
          handle, name, profileUrl, postUrl, timeText, text,
          replies: reply ? reply.textContent.trim() : '',
          retweets: retweet ? retweet.textContent.trim() : '',
          likes: like ? like.textContent.trim() : '',
          bookmarks: bookmark ? bookmark.textContent.trim() : '',
          views: views ? views.textContent.trim() : ''
        });
      } catch (e) {}
    });
    return posts;
  });
}

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:18800');
  const context = browser.contexts()[0];
  let page = context.pages().find(p => p.url().includes('q=neurology'));
  if (!page) { page = await context.newPage(); }
  await page.bringToFront();

  // Robust load: retry goto + wait for article, detect login wall / transient error
  let loaded = false;
  for (let attempt = 0; attempt < 4 && !loaded; attempt++) {
    await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('goto warn: ' + e.message));
    await sleep(3000);
    try {
      const seeNew = page.locator('button:has-text("See new posts")').first();
      if (await seeNew.isVisible({ timeout: 2000 }).catch(()=>false)) { await seeNew.click().catch(()=>{}); await sleep(2000); }
    } catch (e) {}
    await page.evaluate(() => window.scrollBy(0, 800)).catch(()=>{});
    await sleep(2000);
    const state = await page.evaluate(() => ({
      url: window.location.href,
      title: document.title,
      hasArticle: !!document.querySelector('article'),
      bodyText: document.body ? document.body.innerText.slice(0, 300) : '',
      isLogin: window.location.href.includes('login') || window.location.href.includes('onboarding')
    })).catch(e => ({ url: 'ERR', title: e.message, hasArticle: false, bodyText: '', isLogin: false }));
    console.log(`attempt ${attempt+1}: url=${state.url.slice(0,60)} hasArticle=${state.hasArticle} isLogin=${state.isLogin}`);
    if (state.isLogin) { console.log('LOGIN WALL - cannot scrape'); break; }
    if (state.hasArticle) { loaded = true; break; }
    // Transient "Something went wrong. Try reloading." — click Retry if present
    if (state.bodyText.includes('Try reloading') || state.bodyText.includes('Retry')) {
      try { await page.locator('button:has-text("Retry")').first().click({ timeout: 2000 }).catch(()=>{}); await sleep(3000); } catch (e) {}
    }
    await sleep(5000);
  }
  if (!loaded) {
    await page.screenshot({ path: '/tmp/x-neurology-fail.png' }).catch(()=>{});
    console.log('FAILED to load articles');
    await browser.close();
    process.exit(2);
  }
  await sleep(4000);

  const seen = new Set();
  const all = [];
  let emptyRounds = 0;
  while (all.length < 10 && emptyRounds < 4) {
    const posts = await extractPosts(page);
    let added = 0;
    for (const p of posts) {
      if (p.postUrl && !seen.has(p.postUrl)) {
        seen.add(p.postUrl);
        all.push(p);
        added++;
      }
    }
    if (added === 0) emptyRounds++; else emptyRounds = 0;
    if (all.length >= 10) break;
    await page.evaluate(() => window.scrollBy(0, 2500));
    await sleep(3000);
  }

  const top = all.slice(0, 10);
  let md = `# X/Twitter Neurology Scrape - ${DATE}\n\n> Source: CDP-connected logged-in Chrome (real engagement data)\n> Query: neurology OR #neurotwitter OR #NeuroX (f=top, since:today)\n\n## Top 10 Posts\n\n`;
  top.forEach((p, i) => {
    const likes = parseBtn({ textContent: p.likes });
    const flag = likes > 100 ? ' ⚡ (>100 likes)' : '';
    const h = p.handle.startsWith('@') ? p.handle : '@' + p.handle;
    md += `### ${i+1}. ${p.name} (${h})${flag}\n`;
    md += `- **Text:** ${p.text}\n`;
    md += `- **Likes:** ${p.likes} | **Retweets:** ${p.retweets} | **Replies:** ${p.replies} | **Views:** ${p.views}\n`;
    md += `- **Time:** ${p.timeText}\n`;
    md += `- **URL:** ${p.postUrl}\n\n`;
  });

  const breakingKw = /breaking|just published|new study|trial results|fda approves|fda approval|announces|first|landmark|major|urgent|alert|breakthrough|emergency|new guideline|updated|cleared/i;
  md += `## Flags\n\n`;
  let flagged = 0;
  top.forEach((p, i) => {
    const likes = parseBtn({ textContent: p.likes });
    const reasons = [];
    if (likes > 100) reasons.push(`>100 likes (${p.likes})`);
    if (breakingKw.test(p.text)) reasons.push('breaking keyword');
    if (reasons.length) { md += `- **#${i+1}** ${p.handle}: ${reasons.join(', ')}\n`; flagged++; }
  });
  if (!flagged) md += `- None flagged today.\n`;

  const fs = require('fs');
  fs.writeFileSync(OUT, md);
  console.log('WROTE ' + OUT);
  console.log('posts=' + top.length + ' flagged=' + flagged);
  top.forEach((p, i) => {
    const likes = parseBtn({ textContent: p.likes });
    console.log(`${i+1}. @${p.handle} | likes=${p.likes} | ${p.text.slice(0,90)}`);
  });
  await browser.close();
})().catch(e => { console.error('FATAL: ' + e.message); process.exit(1); });
