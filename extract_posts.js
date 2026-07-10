(() => {
  const posts = [];
  const articles = document.querySelectorAll("article");
  
  articles.forEach(article => {
    try {
      // Author name
      const authorEl = article.querySelector('[data-testid="User-Name"]');
      const author = authorEl ? authorEl.innerText.split("\n")[0] : "";
      
      // Handle
      const handleEl = article.querySelector('a[href^="/"][href*="/status/"]') || article.querySelector('a[href^="/@"]');
      const handle = handleEl ? (handleEl.href.match(/x\.com\/(.+)\/status/) || handleEl.href.match(/x\.com\/(.+)/) || ["", ""])[1] : "";
      
      // Date
      const timeEl = article.querySelector("time");
      const date = timeEl ? timeEl.getAttribute("datetime") : "";
      
      // Text content
      const textEl = article.querySelector('[data-testid="tweetText"]');
      const text = textEl ? textEl.innerText : "";
      
      // Engagement metrics
      const replyBtn = article.querySelector('[data-testid="reply"]');
      const replies = replyBtn ? (replyBtn.getAttribute("aria-label") || "").match(/[\d,]+/) || ["0"] : ["0"];
      
      const repostBtn = article.querySelector('[data-testid="retweet"]') || article.querySelector('[data-testid="unretweet"]');
      const reposts = repostBtn ? (repostBtn.getAttribute("aria-label") || "").match(/[\d,]+/) || ["0"] : ["0"];
      
      const likeBtn = article.querySelector('[data-testid="like"]') || article.querySelector('[data-testid="unlike"]');
      const likes = likeBtn ? (likeBtn.getAttribute("aria-label") || "").match(/[\d,]+/) || ["0"] : ["0"];
      
      const viewBtn = article.querySelector('[data-testid="views"]');
      const views = viewBtn ? (viewBtn.getAttribute("aria-label") || "").match(/[\d,K]+/) || ["0"] : ["0"];
      
      // URL
      const linkEl = article.querySelector('a[href*="/status/"]');
      const url = linkEl ? linkEl.href : "";
      
      if (text && url) {
        posts.push({
          author,
          handle: handle.startsWith("@") ? handle : "@" + handle,
          date,
          text,
          replies: replies[0],
          reposts: reposts[0],
          likes: likes[0],
          views: views[0],
          url
        });
      }
    } catch (e) {
      // Skip malformed articles
    }
  });
  
  return posts;
})()