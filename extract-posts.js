const articles = document.querySelectorAll("article");
const posts = [];
articles.forEach((article, idx) => {
  if (idx >= 15) return;
  try {
    const authorEl = article.querySelector('[data-testid="User-Name"] a');
    const authorName = authorEl ? authorEl.querySelector("span")?.textContent || "" : "";
    const authorHandle = authorEl ? authorEl.href.split("/").pop() || "" : "";
    
    const textEl = article.querySelector('[data-testid="tweetText"]');
    const text = textEl ? textEl.textContent : "";
    
    const timeEl = article.querySelector("time");
    const datetime = timeEl ? timeEl.getAttribute("datetime") : "";
    const displayTime = timeEl ? timeEl.textContent : "";
    
    const linkEl = article.querySelector('a[href*="/status/"]');
    const postUrl = linkEl ? linkEl.href : "";
    
    const likesEl = article.querySelector('[data-testid="like"]');
    const likesText = likesEl ? likesEl.getAttribute("aria-label") || "0" : "0";
    const likesMatch = likesText.match(/(\d+)/);
    const likes = likesMatch ? parseInt(likesMatch[1]) : 0;
    
    posts.push({
      authorName,
      authorHandle: "@" + authorHandle,
      text,
      datetime,
      displayTime,
      postUrl,
      likes,
      likesText
    });
  } catch (e) {}
});
return JSON.stringify(posts, null, 2);