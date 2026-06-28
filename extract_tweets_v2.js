// Extract all visible tweets
const tweets = [];
const seen = new Set();
const articles = Array.from(document.querySelectorAll('article'));

console.log(`Total articles found: ${articles.length}`);

for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const tweet = {};
  
  try {
    // Get tweet URL and handle
    const tweetLink = article.querySelector('a[href*="/status/"]');
    if (!tweetLink || seen.has(tweetLink.href)) continue;
    seen.add(tweetLink.href);
    tweet.url = tweetLink.href;
    
    // Extract handle from URL
    const pathParts = tweetLink.pathname.split('/');
    for (let j = 0; j < pathParts.length - 1; j++) {
      if (pathParts[j + 1] === 'status') {
        tweet.handle = '@' + pathParts[j];
        break;
      }
    }
    
    // Get author name
    const nameSpans = article.querySelectorAll('a[href^="/"] span');
    for (const span of nameSpans) {
      if (span.textContent && !span.textContent.startsWith('@')) {
        tweet.author = span.textContent.trim();
        break;
      }
    }
    
    // Get text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    tweet.text = textEl ? textEl.textContent : '';
    
    // Get engagement
    const buttons = article.querySelectorAll('button[aria-label]');
    tweet.replies = 0;
    tweet.reposts = 0;
    tweet.likes = 0;
    tweet.views = 0;
    
    buttons.forEach(btn => {
      const label = btn.getAttribute('aria-label') || '';
      const match = label.match(/(\d+,?\d*)/);
      const num = match ? parseInt(match[1].replace(',', '')) : 0;
      if (label.includes('repl')) tweet.replies = num;
      if (label.includes('repost') || label.includes('Retweet')) tweet.reposts = num;
      if (label.includes('Like')) tweet.likes = num;
      if (label.includes('view')) tweet.views = num;
    });
    
    tweets.push(tweet);
  } catch (e) {
    console.error(`Error parsing article ${i}:`, e.message);
  }
}

console.log(`Extracted ${tweets.length} unique tweets`);
console.log(JSON.stringify(tweets, null, 2));
tweets;