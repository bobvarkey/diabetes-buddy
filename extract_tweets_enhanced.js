// Extract tweets from current page
const tweets = [];

document.querySelectorAll('article').forEach(article => {
  try {
    const tweet = {};
    
    // Get all links
    const links = article.querySelectorAll('a');
    
    // Find author link (usually first link with /username pattern)
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      if (href.match(/^\/\w+$/) && !href.includes('status')) {
        tweet.handle = href.substring(1);
        tweet.url = 'https://x.com' + href;
        break;
      }
    }
    
    // Get author name
    const nameElements = article.querySelectorAll('span');
    for (const span of nameElements) {
      const text = span.textContent;
      if (text && text.length < 50 && !text.startsWith('@') && !text.includes('ago')) {
        // First non-handle, non-timestamp text is likely the author name
        tweet.author = text;
        break;
      }
    }
    
    // Get timestamp
    const timeElement = article.querySelector('time');
    if (timeElement) {
      tweet.timestamp = timeElement.getAttribute('datetime') || timeElement.textContent;
      tweet.displayTime = timeElement.textContent;
    }
    
    // Get tweet text - look for elements with lang attribute or data-testid
    const textElement = article.querySelector('[data-testid="tweetText"]') || 
                        article.querySelector('[lang]');
    if (textElement) {
      tweet.text = textElement.textContent;
    }
    
    // Get engagement metrics
    const buttons = article.querySelectorAll('button');
    buttons.forEach(btn => {
      const label = btn.getAttribute('aria-label') || '';
      const text = btn.textContent || '';
      
      if (label.includes('repl')) {
        tweet.replies = parseInt(label.match(/\d+/)?.[0] || '0');
      }
      if (label.includes('repost') || label.includes('Retweet')) {
        tweet.reposts = parseInt(label.match(/\d+/)?.[0] || '0');
      }
      if (label.includes('Like')) {
        tweet.likes = parseInt(label.match(/\d+/)?.[0] || '0');
      }
      if (text.includes('views')) {
        tweet.views = parseInt(text.match(/\d+/)?.[0] || '0');
      }
    });
    
    // Get status URL from time link
    const timeLink = timeElement?.closest('a');
    if (timeLink) {
      const href = timeLink.getAttribute('href');
      if (href && href.includes('/status/')) {
        tweet.url = 'https://x.com' + href;
      }
    }
    
    if (tweet.handle || tweet.text) {
      tweets.push(tweet);
    }
  } catch (e) {
    // Skip errors
  }
});

// Return as JSON string
JSON.stringify(tweets, null, 2);