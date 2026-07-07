const articles = Array.from(document.querySelectorAll('article'));
const tweets = [];

articles.forEach(article => {
  try {
    const tweet = {};
    
    // Get all text content from the article
    const allText = article.textContent;
    
    // Extract components using simpler selectors
    const links = article.querySelectorAll('a[href*="/status/"]');
    if (links.length > 0) {
      const statusLink = links[0];
      const href = statusLink.getAttribute('href');
      tweet.url = 'https://x.com' + href;
    }
    
    // Get text content more directly
    const textNodes = [];
    const walker = document.createTreeWalker(
      article,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && text.length > 5) {
        textNodes.push(text);
      }
    }
    
    tweet.textContent = textNodes.join(' | ');
    tweet.rawText = allText;
    
    tweets.push(tweet);
  } catch (e) {
    // skip
  }
});

tweets;