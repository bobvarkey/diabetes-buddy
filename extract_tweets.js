function extractTweets() {
  const tweets = [];
  const articles = document.querySelectorAll("article");
  
  articles.forEach((article, index) => {
    try {
      const tweet = {};
      
      // Author name
      const nameEl = article.querySelector('[data-testid="User-Name"]');
      if (nameEl) {
        const nameSpan = nameEl.querySelector("span");
        tweet.author = nameSpan ? nameSpan.textContent : "";
      }
      
      // Handle
      const handleEl = article.querySelector('[data-testid="User-Names"]');
      if (handleEl) {
        const handleSpan = handleEl.querySelector("a[href^='/'] span");
        if (handleSpan) {
          tweet.handle = handleSpan.textContent;
        }
      }
      
      // Timestamp
      const timeEl = article.querySelector("time");
      if (timeEl) {
        tweet.timestamp = timeEl.getAttribute("datetime");
        tweet.displayTime = timeEl.textContent;
      }
      
      // Text content
      const textEl = article.querySelector('[data-testid="tweetText"]');
      if (textEl) {
        tweet.text = textEl.textContent;
      }
      
      // Engagement metrics
      const replyBtn = article.querySelector('[data-testid="reply"]');
      const repostBtn = article.querySelector('[data-testid="retweet"]');
      const likeBtn = article.querySelector('[data-testid="like"]');
      const viewsEl = article.querySelector('[data-testid="views"]');
      
      if (replyBtn) tweet.replies = replyBtn.getAttribute("aria-label") || "0";
      if (repostBtn) tweet.reposts = repostBtn.getAttribute("aria-label") || "0";
      if (likeBtn) tweet.likes = likeBtn.getAttribute("aria-label") || "0";
      if (viewsEl) tweet.views = viewsEl.textContent;
      
      // URL
      const linkEl = article.querySelector("time").closest("a");
      if (linkEl) {
        tweet.url = "https://x.com" + linkEl.getAttribute("href");
      }
      
      if (tweet.author || tweet.text) {
        tweets.push(tweet);
      }
    } catch (e) {
      // Skip problematic tweets
    }
  });
  
  return tweets;
}

extractTweets();