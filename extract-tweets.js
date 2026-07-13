const posts = [];
const articles = document.querySelectorAll("article");
for (let idx = 0; idx < Math.min(10, articles.length); idx++) {
  const article = articles[idx];
  
  let author = "", handle = "", text = "", url = "";
  let replies = 0, reposts = 0, likes = 0, views = 0;
  
  // Author name - try multiple selectors
  const authorEl = article.querySelector('a[href*="/status/"] span') || 
                   article.querySelector('[data-testid="User-Name"] span');
  if (authorEl) author = authorEl.textContent || "";
  
  // Handle
  const handleMatch = article.textContent.match(/@[a-zA-Z0-9_]+/);
  if (handleMatch) handle = handleMatch[0];
  
  // Text
  const textEl = article.querySelector('[data-testid="tweetText"]');
  if (textEl) text = textEl.textContent || "";
  
  // URL
  const timeEl = article.querySelector("time");
  const linkEl = timeEl?.closest("a");
  if (linkEl) {
    url = linkEl.href;
  }
  
  // Engagement metrics from aria-label
  const metricsGroup = article.querySelector('[role="group"]');
  if (metricsGroup) {
    const metricsText = metricsGroup.getAttribute("aria-label") || "";
    const replyMatch = metricsText.match(/(\d+)\s*repl/i);
    const repostMatch = metricsText.match(/(\d+)\s*repost/i);
    const likeMatch = metricsText.match(/(\d+)\s*like/i);
    const viewMatch = metricsText.match(/(\d+\.?\d*[KM]?)\s*view/i);
    
    if (replyMatch) replies = parseInt(replyMatch[1]);
    if (repostMatch) reposts = parseInt(repostMatch[1]);
    if (likeMatch) likes = parseInt(likeMatch[1]);
    if (viewMatch) {
      const v = viewMatch[1];
      if (v.includes("K")) views = parseFloat(v) * 1000;
      else if (v.includes("M")) views = parseFloat(v) * 1000000;
      else views = parseInt(v);
    }
  }
  
  // Get timestamp
  const timestamp = timeEl?.getAttribute("datetime") || "";
  
  posts.push({
    author,
    handle,
    text: text.substring(0, 500),
    url,
    timestamp,
    engagement: { replies, reposts, likes, views }
  });
}

return JSON.stringify(posts, null, 2);