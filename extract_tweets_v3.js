function extractTweets() {
  const tweets = [];
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  
  articles.forEach(article => {
    try {
      // Extract author name
      const authorNameEl = article.querySelector('div[data-testid="User-Name"]');
      const authorName = authorNameEl ? authorNameEl.querySelector('span')?.textContent : '';
      
      // Extract handle
      const handleEl = article.querySelector('a[href^="/"] span');
      const handle = handleEl ? handleEl.textContent : '';
      
      // Extract tweet text
      const textEl = article.querySelector('div[data-testid="tweetText"]');
      const text = textEl ? textEl.textContent : '';
      
      // Extract engagement metrics
      const replyBtn = article.querySelector('button[data-testid="reply"]');
      const repliesMatch = replyBtn?.getAttribute('aria-label')?.match(/(\d+)/);
      const replies = repliesMatch ? repliesMatch[1] : '0';
      
      const repostBtn = article.querySelector('button[data-testid="unretweet"], button[data-testid="retweet"]');
      const repostsMatch = repostBtn?.getAttribute('aria-label')?.match(/(\d+)/);
      const reposts = repostsMatch ? repostsMatch[1] : '0';
      
      const likeBtn = article.querySelector('button[data-testid="unlike"], button[data-testid="like"]');
      const likesMatch = likeBtn?.getAttribute('aria-label')?.match(/(\d+)/);
      const likes = likesMatch ? likesMatch[1] : '0';
      
      const viewEl = article.querySelector('a[href*="/analytics"]');
      const views = viewEl ? viewEl.textContent.trim() : '0';
      
      // Extract timestamp
      const timeEl = article.querySelector('time');
      const datetime = timeEl ? timeEl.getAttribute('datetime') : '';
      const displayTime = timeEl ? timeEl.textContent : '';
      
      // Extract URL
      const linkEl = article.querySelector('a[href*="/status/"]');
      const url = linkEl ? 'https://x.com' + linkEl.getAttribute('href') : '';
      
      if (text && url) {
        tweets.push({
          author: authorName || 'Unknown',
          handle: handle || 'Unknown',
          text: text,
          replies: replies,
          reposts: reposts,
          likes: likes,
          views: views,
          datetime: datetime,
          displayTime: displayTime,
          url: url
        });
      }
    } catch (e) {
      // Skip errors
    }
  });
  
  return tweets;
}

JSON.stringify(extractTweets(), null, 2);