const posts = [];
const articles = document.querySelectorAll("article");
articles.forEach(article => {
  try {
    const post = {};
    
    // Author and handle
    const authorElement = article.querySelector('[data-testid="User-Name"]');
    if (authorElement) {
      const nameSpan = authorElement.querySelector('span');
      const handleLink = authorElement.querySelector('a[href^="/"]');
      post.author = nameSpan ? nameSpan.textContent : "";
      post.handle = handleLink ? handleLink.href.split("/").pop() : "";
    }
    
    // Date
    const timeElement = article.querySelector('time');
    post.date = timeElement ? (timeElement.getAttribute('datetime') || timeElement.textContent) : "";
    
    // Text content
    const textElement = article.querySelector('[data-testid="tweetText"]');
    post.text = textElement ? textElement.textContent : "";
    
    // Engagement metrics
    const replyButton = article.querySelector('[data-testid="reply"]');
    const repostButton = article.querySelector('[data-testid="retweet"] ~ span, [data-testid="unretweet"] ~ span');
    const likeButton = article.querySelector('[data-testid="like"] ~ span, [data-testid="unlike"] ~ span');
    const viewCount = article.querySelector('[data-testid="analytics"] span');
    
    post.replies = replyButton ? (replyButton.getAttribute("aria-label") || "0") : "0";
    post.reposts = repostButton ? repostButton.textContent : "0";
    post.likes = likeButton ? likeButton.textContent : "0";
    post.views = viewCount ? viewCount.textContent : "0";
    
    // URL
    const linkElement = article.querySelector('a[href*="/status/"]');
    post.url = linkElement ? linkElement.href : "";
    
    if (post.text || post.author) {
      posts.push(post);
    }
  } catch (e) {
    // Skip if error
  }
});
JSON.stringify(posts, null, 2);