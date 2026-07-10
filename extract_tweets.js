const posts = [];
const articles = document.querySelectorAll("article");

articles.forEach(article => {
  try {
    // Extract author name
    const authorNameEl = article.querySelector('[data-testid="User-Name"]');
    const authorName = authorNameEl ? authorNameEl.textContent.split("@")[0].trim() : "";
    
    // Extract handle
    const handleEl = article.querySelector('a[href^="/"][role="link"]');
    let handle = "";
    if (handleEl) {
      const match = handleEl.href.match(/x\.com\/([^\/]+)/);
      handle = match ? "@" + match[1] : "";
    }
    
    // Extract post text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent : "";
    
    // Extract date
    const timeEl = article.querySelector("time");
    const dateStr = timeEl ? timeEl.getAttribute("datetime") : "";
    
    // Extract post URL
    const linkEl = article.querySelector('a[href*="/status/"]');
    const postUrl = linkEl ? linkEl.href : "";
    
    // Extract engagement metrics from aria-labels
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const repostBtn = article.querySelector('[data-testid="repost"]');
    const likeBtn = article.querySelector('[data-testid="like"]');
    
    let replies = "0";
    let reposts = "0";
    let likes = "0";
    
    if (replyBtn) {
      const replyMatch = replyBtn.getAttribute("aria-label").match(/\d+/);
      replies = replyMatch ? replyMatch[0] : "0";
    }
    
    if (repostBtn) {
      const repostMatch = repostBtn.getAttribute("aria-label").match(/\d+/);
      reposts = repostMatch ? repostMatch[0] : "0";
    }
    
    if (likeBtn) {
      const likeMatch = likeBtn.getAttribute("aria-label").match(/[\d,]+/);
      likes = likeMatch ? likeMatch[0].replace(/,/g, "") : "0";
    }
    
    // Extract views
    const viewsEl = article.querySelector('[data-testid="views"]');
    const views = viewsEl ? viewsEl.textContent : "";
    
    posts.push({
      author: authorName.substring(0, 100),
      handle: handle,
      text: text.substring(0, 500),
      date: dateStr,
      url: postUrl,
      replies: replies,
      reposts: reposts,
      likes: likes,
      views: views
    });
  } catch (e) {
    // Skip malformed articles
  }
});

JSON.stringify(posts);