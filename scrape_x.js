const { chromium } = require('playwright');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

async function scrapeXSearch() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Navigate to the first search
  await page.goto('https://x.com/search?q=neurointervention%20OR%20thrombectomy%20OR%20%23Neurointervention%20OR%20%23stroke&src=typed_query&f=top&since:today', {
    waitUntil: 'networkidle'
  });
  
  // Wait for tweets to load
  await page.waitForSelector('article[data-testid="tweet"]', { timeout: 30000 });
  
  // Extract tweets
  const tweets = await page.evaluate(() => {
    const tweetElements = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    return tweetElements.map(tweet => {
      try {
        const authorName = tweet.querySelector('[data-testid="User-Name"] span')?.textContent || "";
        const handleEl = tweet.querySelector('a[href^="/"]');
        const href = handleEl?.href || "";
        let handle = "";
        if (href && href.includes("/")) {
          const parts = href.split("/");
          if (parts.length > 3) {
            handle = parts[3].split("?")[0].replace("@", "");
          }
        }
        const text = tweet.querySelector('[data-testid="tweetText"]')?.textContent || "";
        const likes = tweet.querySelector('[data-testid="like"]')?.textContent || "0";
        const retweets = tweet.querySelector('[data-testid="retweet"]')?.textContent || "0";
        const replies = tweet.querySelector('[data-testid="reply"]')?.textContent || "0";
        const views = tweet.querySelector('[data-testid="viewCount"]')?.textContent || "";
        const timeEl = tweet.querySelector('time');
        const date = timeEl?.getAttribute("datetime") || "";
        const url = timeEl?.closest("a")?.href || "";
        
        return {
          author: authorName,
          handle: handle,
          text: text,
          likes: likes,
          retweets: retweets,
          replies: replies,
          views: views,
          date: date,
          url: url
        };
      } catch (e) {
        return null;
      }
    }).filter(t => t !== null);
  });
  
  await browser.close();
  return tweets;
}

scrapeXSearch().then(tweets => {
  console.log(JSON.stringify(tweets, null, 2));
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});