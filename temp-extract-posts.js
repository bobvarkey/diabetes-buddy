const posts = [];
const articles = document.querySelectorAll("article");

articles.forEach((article, index) => {
  if (index >= 10) return;
  
  try {
    // Get author name
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
    
    // Get post text
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl?.textContent || "";
    
    // Get engagement metrics
    const replyBtn = article.querySelector('[data-testid="reply"]');
    const repostBtn = article.querySelector('[data-testid="retweet"]');
    const likeBtn = article.querySelector('[data-testid="like"]');
    const viewCount = article.querySelector('[data-testid="viewCount"]');
    
    const replies = replyBtn?.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0";
    const reposts = repostBtn?.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0";
    const likes = likeBtn?.getAttribute("aria-label")?.match(/\d+/)?.[0] || "0";
    const views = viewCount?.textContent || "";
    
    // Get URL
    const timeLink = article.querySelector('time')?.closest('a');
    const url = timeLink?.href || "";
    
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
  } catch (e) {
    console.error("Error parsing post:", e);
  }
});

return JSON.stringify(posts, null, 2);