const posts = [];
const articles = document.querySelectorAll('article[data-testid="tweet"]');
articles.forEach((article, index) => {
  try {
    const authorName = article.querySelector('[data-testid="User-Name"] span')?.textContent || "";
    const handleEl = article.querySelector('a[href^="/"]');
    const handle = handleEl?.href?.split('/')[1] || "";
    const time = article.querySelector('time')?.getAttribute('datetime') || "";
    const text = article.querySelector('[data-testid="tweetText"]')?.textContent || "";
    const link = article.querySelector('a[href*="/status/"]')?.href || "";
    
    const metrics = {};
    article.querySelectorAll('[role="group"] button').forEach(btn => {
      const ariaLabel = btn.getAttribute('aria-label') || "";
      const match = ariaLabel.match(/(\d+)\s*(replies?|reposts?|likes?|bookmarks?|views?)/i);
      if (match) {
        const count = parseInt(match[1]);
        const type = match[2].toLowerCase();
        if (type.includes('repl')) metrics.replies = count;
        else if (type.includes('repost')) metrics.reposts = count;
        else if (type.includes('like')) metrics.likes = count;
        else if (type.includes('bookmark')) metrics.bookmarks = count;
        else if (type.includes('view')) metrics.views = count;
      }
    });
    
    posts.push({ authorName, handle, time, text, link, metrics });
  } catch (e) {}
});
JSON.stringify(posts, null, 2);