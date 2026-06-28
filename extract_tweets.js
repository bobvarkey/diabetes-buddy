// Extract tweet data from X/Twitter search results
const tweets = [];
const articles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));

console.log(`Found ${articles.length} articles`);

articles.forEach((article, index) => {
  if (index >= 10) return;
  
  try {
    const tweet = {};
    
    // Get tweet URL and handle
    const tweetLink = article.querySelector('a[href*="/status/"]');
    if (tweetLink) {
      tweet.url = tweetLink.href;
      const pathParts = tweetLink.pathname.split('/');
      // Find the handle (usually in the second position)
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (pathParts[i + 1] === 'status') {
          tweet.handle = '@' + pathParts[i];
          break;
        }
      }
    }
    
    // Get author name
    const nameEl = article.querySelector('a[href^="/"] span');
    if (nameEl && !tweet.handle) {
      const link = nameEl.closest('a');
      if (link) tweet.handle = '@' + link.pathname.replace('/', '');
    }
    tweet.author = nameEl ? nameEl.textContent.trim() : 'Unknown';
    
    // Get text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    tweet.text = textEl ? textEl.textContent : '';
    
    // Get engagement
    const getNumberFromAria = (selector) => {
      const btn = article.querySelector(selector);
      if (!btn) return 0;
      const aria = btn.getAttribute('aria-label') || '';
      const match = aria.match(/(\d+,?\d*)/);
      return match ? parseInt(match[1].replace(',', '')) : 0;
    };
    
    tweet.replies = getNumberFromAria('[data-testid="reply"]');
    tweet.reposts = getNumberFromAria('[data-testid="retweet"], [data-testid="unretweet"]');
    tweet.likes = getNumberFromAria('[data-testid="like"], [data-testid="unlike"]');
    tweet.views = getNumberFromAria('[data-testid="Views"]');
    
    tweets.push(tweet);
  } catch (e) {
    console.error('Error parsing tweet:', e.message);
  }
});

console.log(JSON.stringify(tweets, null, 2));
tweets;