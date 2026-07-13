// Extract all tweet articles from the timeline
const articles = Array.from(document.querySelectorAll("article"));
const posts = articles.map(article => {
  try {
    // Get author info
    const authorLink = article.querySelector('a[href^="/"]');
    const authorName = authorLink?.querySelector('span')?.textContent || "";
    const handle = article.querySelector('a[href^="/"] span')?.textContent || "";
    
    // Get the tweet text
    const tweetText = Array.from(article.querySelectorAll('[data-testid="tweetText"]'))
      .map(el => el.textContent)
      .join(" ");
    
    // Get engagement metrics
    const replies = article.querySelector('[data-testid="reply"]')?.textContent || "0";
    const reposts = article.querySelector('[data-testid="repost"]')?.textContent || "0";
    const likes = article.querySelector('[data-testid="like"]')?.textContent || "0";
    const views = article.querySelector('[data-testid="viewCount"]')?.textContent || "0";
    
    // Get timestamp
    const time = article.querySelector('time');
    const datetime = time?.getAttribute('datetime') || "";
    const dateText = time?.textContent || "";
    
    // Get URL
    const tweetLink = article.querySelector('a[href*="/status/"]');
    const url = tweetLink ? `https://x.com${tweetLink.getAttribute("href")}` : "";
    
    return {
      author: authorName,
      handle: handle,
      text: tweetText,
      replies: replies,
      reposts: reposts,
      likes: likes,
      views: views,
      date: dateText,
      datetime: datetime,
      url: url
    };
  } catch (e) {
    return null;
  }
}).filter(p => p && p.text);

return JSON.stringify(posts, null, 2);