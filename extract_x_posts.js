// Extract posts from X/Twitter search results
const posts = [];

// Find all article elements
const articles = document.querySelectorAll('article[data-testid="tweet"]');

articles.forEach(article => {
  try {
    // Author name
    const authorEl = article.querySelector('[data-testid="tweetUserName"]');
    const author = authorEl ? authorEl.textContent.trim() : '';
    
    // Handle
    const handleEl = article.querySelector('[data-testid="tweetUserScreenName"]');
    const handle = handleEl ? handleEl.textContent.trim() : '';
    
    // Tweet text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent.trim() : '';
    
    // Tweet URL
    const linkEl = article.querySelector('a[href*="/status/"]');
    const url = linkEl ? linkEl.href : '';
    
    // Date
    const timeEl = article.querySelector('time');
    const date = timeEl ? timeEl.getAttribute('datetime') : '';
    const displayDate = timeEl ? timeEl.textContent.trim() : '';
    
    // Engagement metrics
    const replyButton = article.querySelector('[data-testid="reply"]');
    const replies = replyButton ? replyButton.getAttribute('aria-label') : '0';
    
    const retweetButton = article.querySelector('[data-testid="retweet"]');
    const retweets = retweetButton ? retweetButton.getAttribute('aria-label') : '0';
    
    const likeButton = article.querySelector('[data-testid="like"]');
    const likes = likeButton ? likeButton.getAttribute('aria-label') : '0';
    
    const viewEl = article.querySelector('[data-testid="tweetViews"]');
    const views = viewEl ? viewEl.textContent.trim() : '0';
    
    posts.push({
      author,
      handle,
      text,
      url,
      date,
      displayDate,
      replies,
      retweets,
      likes,
      views
    });
  } catch (e) {
    console.error('Error extracting post:', e);
  }
});

posts;