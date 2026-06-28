const articles = document.querySelectorAll("article");
const tweets = [];

for (let i = 0; i < articles.length; i++) {
  const article = articles[i];
  const tweet = {};
  
  // Get author name - improved
  const authorContainer = article.querySelector('[data-testid="User-Name"]');
  if (authorContainer) {
    const spans = authorContainer.querySelectorAll("span");
    tweet.author = spans[0] ? spans[0].textContent : "";
    
    // Get handle
    const handleLink = authorContainer.querySelector('a[href^="/"]');
    if (handleLink) {
      const handleSpan = handleLink.querySelector("span");
      tweet.handle = handleSpan ? handleSpan.textContent.replace("@", "") : "";
    }
  }
  
  // Get text
  const textEl = article.querySelector('[data-testid="tweetText"]');
  tweet.text = textEl ? textEl.textContent : "";
  
  // Get link
  const linkEl = article.querySelector("a[href*=\"/status/\"]");
  if (linkEl) {
    const href = linkEl.getAttribute("href");
    tweet.url = "https://x.com" + href.split("?")[0];
  } else {
    tweet.url = "";
  }
  
  // Get engagement metrics
  const replyBtn = article.querySelector('[data-testid="reply"]');
  const replyLabel = replyBtn ? replyBtn.getAttribute("aria-label") : "0";
  tweet.replies = replyLabel.replace(/[^\d]/g, "");
  
  const repostBtn = article.querySelector('[data-testid="unrepost"], [data-testid="repost"]');
  const repostLabel = repostBtn ? repostBtn.getAttribute("aria-label") : "0";
  // Extract number from label like "7 reposts. Repost"
  const repostMatch = repostLabel.match(/(\d+)/);
  tweet.reposts = repostMatch ? repostMatch[1] : "0";
  
  const likeBtn = article.querySelector('[data-testid="unlike"], [data-testid="like"]');
  const likeLabel = likeBtn ? likeBtn.getAttribute("aria-label") : "0";
  const likeMatch = likeLabel.match(/(\d+)/);
  tweet.likes = likeMatch ? likeMatch[1] : "0";
  
  // Get views
  const viewsEl = article.querySelector('[data-testid="views"]');
  tweet.views = viewsEl ? viewsEl.textContent : "0";
  
  // Get timestamp
  const timeEl = article.querySelector("time");
  tweet.timestamp = timeEl ? timeEl.getAttribute("datetime") || timeEl.textContent : "";
  
  tweets.push(tweet);
}

return JSON.stringify(tweets, null, 2);