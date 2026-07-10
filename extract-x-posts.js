const posts = [];
const seenUrls = new Set();

function extractPosts() {
  const articles = document.querySelectorAll("article");
  
  articles.forEach((article) => {
    try {
      const authorEl = article.querySelector('[data-testid="User-Name"]');
      let author = "";
      let handle = "";
      if (authorEl) {
        const links = authorEl.querySelectorAll('a');
        if (links.length > 0) {
          author = links[0].querySelector('span')?.textContent || "";
        }
        if (links.length > 1) {
          handle = links[1].querySelector('span')?.textContent || "";
        }
      }
      
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl?.textContent || "";
      
      const replyBtn = article.querySelector('[data-testid="reply"]');
      const repostBtn = article.querySelector('[data-testid="retweet"]');
      const likeBtn = article.querySelector('[data-testid="like"]');
      const viewCount = article.querySelector('[data-testid="viewCount"]');
      
      // Better extraction of metrics
      let replies = "0", reposts = "0", likes = "0";
      
      if (replyBtn) {
        const ariaLabel = replyBtn.getAttribute("aria-label") || "";
        const match = ariaLabel.match(/(\d+)/);
        replies = match ? match[1] : "0";
      }
      
      if (repostBtn) {
        const ariaLabel = repostBtn.getAttribute("aria-label") || "";
        const match = ariaLabel.match(/(\d+)/);
        reposts = match ? match[1] : "0";
      }
      
      if (likeBtn) {
        const ariaLabel = likeBtn.getAttribute("aria-label") || "";
        const match = ariaLabel.match(/(\d+)/);
        likes = match ? match[1] : "0";
      }
      
      const views = viewCount?.textContent || "";
      
      const timeLink = article.querySelector('time')?.closest('a');
      const url = timeLink?.href || "";
      
      if (url && !seenUrls.has(url) && author) {
        seenUrls.add(url);
        posts.push({
          author,
          handle,
          text,
          replies,
          reposts,
          likes,
          views,
          url
        });
      }
    } catch (e) {}
  });
}

// Extract posts
extractPosts();

// Return result
return JSON.stringify({
  total: posts.length,
  posts: posts.slice(0, 10)
}, null, 2);